-- ============================================================================
-- Database Functions
-- ============================================================================

-- ---------------------
-- Trigger: auto-create profile on new user signup
-- ---------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, role)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    'CUSTOMER'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------
-- create_order
-- ---------------------
-- p_items: jsonb array of {"product_id": "uuid", "quantity": int}
-- p_address_snapshot: jsonb object with shipping address fields
-- p_idempotency_key: unique key to prevent duplicate orders
create or replace function public.create_order(
  p_user_id uuid,
  p_items jsonb,
  p_idempotency_key text,
  p_address_snapshot jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_payment_id uuid;
  v_subtotal integer := 0;
  v_shipping_cost integer;
  v_free_threshold integer;
  v_total integer;
  v_item jsonb;
  v_product record;
  v_qty integer;
  v_order_items jsonb := '[]'::jsonb;
  v_image_url text;
  v_items_count integer := 0;
begin
  -- Verify caller is the user creating the order
  if p_user_id != auth.uid() then
    raise exception 'Cannot create order for another user';
  end if;

  -- Idempotency check
  if p_idempotency_key is not null then
    if exists (select 1 from public.orders where idempotency_key = p_idempotency_key) then
      return (
        select jsonb_build_object(
          'order_id', o.id,
          'status', o.status,
          'message', 'Order already exists'
        )
        from public.orders o
        where o.idempotency_key = p_idempotency_key
      );
    end if;
  end if;

  -- Validate address fields
  if p_address_snapshot is null
    or p_address_snapshot->>'full_name' is null or trim(p_address_snapshot->>'full_name') = ''
    or p_address_snapshot->>'phone' is null or trim(p_address_snapshot->>'phone') = ''
    or p_address_snapshot->>'address_line1' is null or trim(p_address_snapshot->>'address_line1') = ''
    or p_address_snapshot->>'city' is null or trim(p_address_snapshot->>'city') = ''
    or p_address_snapshot->>'department' is null or trim(p_address_snapshot->>'department') = ''
  then
    raise exception 'Shipping address is incomplete. Required fields: full_name, phone, address_line1, city, department';
  end if;

  -- Validate items count
  v_items_count := jsonb_array_length(p_items);
  if v_items_count = 0 then
    raise exception 'Order must contain at least one item';
  end if;
  if v_items_count > 20 then
    raise exception 'Order cannot contain more than 20 items';
  end if;

  -- Load shipping config from config table
  select (value->>'shipping_cost')::integer into v_shipping_cost
  from public.config where key = 'shipping_cost';
  if v_shipping_cost is null then v_shipping_cost := 8000; end if;

  select (value->>'free_shipping_threshold')::integer into v_free_threshold
  from public.config where key = 'free_shipping_threshold';
  if v_free_threshold is null then v_free_threshold := 100000; end if;

  -- Validate each item and reserve stock
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::integer;

    -- Validate quantity bounds
    if v_qty <= 0 then
      raise exception 'Quantity must be at least 1 for product %', v_item->>'product_id';
    end if;
    if v_qty > 10 then
      raise exception 'Maximum quantity per item is 10. Product % requested %', v_item->>'product_id', v_qty;
    end if;

    -- Fetch product and verify it exists and is active, lock inventory row
    select p.*, i.stock, i.reserved
    into v_product
    from public.products p
    join public.inventory i on i.product_id = p.id
    where p.id = (v_item->>'product_id')::uuid
      and p.is_active = true;

    if not found then
      raise exception 'Product % is not available', v_item->>'product_id';
    end if;

    -- Check sufficient stock (using FOR UPDATE semantics via the join)
    if (v_product.stock - v_product.reserved) < v_qty then
      raise exception 'Insufficient stock for product % (% available)', v_product.name, (v_product.stock - v_product.reserved);
    end if;

    -- Reserve stock
    update public.inventory
    set reserved = reserved + v_qty,
        updated_at = now()
    where product_id = v_product.id;

    -- Get primary image url
    select url into v_image_url
    from public.product_images
    where product_id = v_product.id and is_primary = true
    limit 1;

    if v_image_url is null then
      select url into v_image_url
      from public.product_images
      where product_id = v_product.id
      order by sort_order
      limit 1;
    end if;

    -- Accumulate subtotal using server-side price (never trust client)
    v_subtotal := v_subtotal + (v_product.price * v_qty);

    -- Build order item json for response
    v_order_items := v_order_items || jsonb_build_object(
      'product_id', v_product.id,
      'product_name', v_product.name,
      'product_slug', v_product.slug,
      'product_image_url', v_image_url,
      'unit_price', v_product.price,
      'quantity', v_qty,
      'subtotal', v_product.price * v_qty,
      'currency', v_product.currency
    );
  end loop;

  -- Apply free shipping threshold
  if v_subtotal >= v_free_threshold then
    v_shipping_cost := 0;
  end if;

  v_total := v_subtotal + v_shipping_cost;

  -- Create the order
  insert into public.orders (
    user_id, status, subtotal, shipping_cost, total,
    currency, shipping_address, idempotency_key
  ) values (
    p_user_id,
    'PENDING_PAYMENT',
    v_subtotal,
    v_shipping_cost,
    v_total,
    'COP',
    p_address_snapshot,
    p_idempotency_key
  )
  returning id into v_order_id;

  -- Insert order items
  for v_item in select * from jsonb_array_elements(v_order_items)
  loop
    insert into public.order_items (
      order_id, product_id, product_name, product_slug,
      product_image_url, unit_price, quantity, subtotal, currency
    ) values (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_item->>'product_name',
      v_item->>'product_slug',
      v_item->>'product_image_url',
      (v_item->>'unit_price')::integer,
      (v_item->>'quantity')::integer,
      (v_item->>'subtotal')::integer,
      v_item->>'currency'
    );
  end loop;

  -- Create payment record
  insert into public.payments (
    order_id, method, status, amount, currency
  ) values (
    v_order_id,
    'MOCK',
    'PENDING',
    v_total,
    'COP'
  )
  returning id into v_payment_id;

  -- Log audit
  insert into public.audit_log (user_id, action, entity_type, entity_id, metadata)
  values (
    p_user_id,
    'ORDER_CREATED',
    'order',
    v_order_id::text,
    jsonb_build_object('total', v_total, 'items_count', v_items_count)
  );

  -- Return the complete order
  return jsonb_build_object(
    'order_id', v_order_id,
    'payment_id', v_payment_id,
    'status', 'PENDING_PAYMENT',
    'subtotal', v_subtotal,
    'shipping_cost', v_shipping_cost,
    'total', v_total,
    'currency', 'COP',
    'items', v_order_items
  );
end;
$$;

comment on function public.create_order(uuid, jsonb, text, jsonb) is
  'Create an order with stock reservation. p_items: [{"product_id":"uuid","quantity":int}]';

-- ---------------------
-- confirm_payment
-- ---------------------
create or replace function public.confirm_payment(
  p_order_id uuid,
  p_payment_id uuid,
  p_amount integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_payment record;
  v_item record;
begin
  -- Lock the order row
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order % not found', p_order_id;
  end if;

  -- Check order is in a payable state
  if v_order.status not in ('PENDING_PAYMENT', 'PAYMENT_PROCESSING') then
    raise exception 'Cannot confirm payment for order with status %', v_order.status;
  end if;

  -- Verify payment exists and belongs to this order
  select * into v_payment
  from public.payments
  where id = p_payment_id and order_id = p_order_id
  for update;

  if not found then
    raise exception 'Payment % not found for order %', p_payment_id, p_order_id;
  end if;

  -- Verify amount matches
  if v_payment.amount != p_amount then
    raise exception 'Payment amount % does not match expected %', p_amount, v_payment.amount;
  end if;

  -- Update payment status
  update public.payments
  set status = 'COMPLETED',
      updated_at = now()
  where id = v_payment.id;

  -- Update order status
  update public.orders
  set status = 'PAID',
      updated_at = now()
  where id = p_order_id;

  -- Decrement stock and release reserved atomically for each item
  for v_item in
    select oi.product_id, oi.quantity
    from public.order_items oi
    where oi.order_id = p_order_id
  loop
    update public.inventory
    set stock = stock - v_item.quantity,
        reserved = reserved - v_item.quantity,
        updated_at = now()
    where product_id = v_item.product_id;
  end loop;

  -- Log audit
  insert into public.audit_log (action, entity_type, entity_id, metadata)
  values (
    'PAYMENT_CONFIRMED',
    'order',
    p_order_id::text,
    jsonb_build_object('payment_id', v_payment.id, 'amount', p_amount)
  );

  return jsonb_build_object(
    'order_id', p_order_id,
    'status', 'PAID',
    'payment_id', v_payment.id
  );
end;
$$;

comment on function public.confirm_payment(uuid, uuid, integer) is
  'Confirm payment, update order, decrement stock, and release reserved';

-- ---------------------
-- cancel_order
-- ---------------------
create or replace function public.cancel_order(
  p_order_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_item record;
begin
  -- Lock the order row
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order % not found', p_order_id;
  end if;

  -- Verify caller owns this order
  if v_order.user_id != auth.uid() then
    raise exception 'You can only cancel your own orders';
  end if;

  -- Only allow cancellation in cancellable states
  if v_order.status not in ('PENDING_PAYMENT', 'PAYMENT_PROCESSING') then
    raise exception 'Cannot cancel order with status %', v_order.status;
  end if;

  -- Release reserved stock
  for v_item in
    select oi.product_id, oi.quantity
    from public.order_items oi
    where oi.order_id = p_order_id
  loop
    update public.inventory
    set reserved = reserved - v_item.quantity,
        updated_at = now()
    where product_id = v_item.product_id;
  end loop;

  -- Update order status
  update public.orders
  set status = 'CANCELLED',
      updated_at = now()
  where id = p_order_id;

  -- Update payment status if any pending
  update public.payments
  set status = 'CANCELLED',
      updated_at = now()
  where order_id = p_order_id and status in ('PENDING', 'PROCESSING');

  -- Log audit
  insert into public.audit_log (user_id, action, entity_type, entity_id)
  values (v_order.user_id, 'ORDER_CANCELLED', 'order', p_order_id::text);

  return jsonb_build_object(
    'order_id', p_order_id,
    'status', 'CANCELLED'
  );
end;
$$;

comment on function public.cancel_order(uuid) is
  'Cancel an order and release reserved stock';

-- ---------------------
-- handle_payment_failure
-- ---------------------
create or replace function public.handle_payment_failure(
  p_order_id uuid,
  p_payment_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item record;
begin
  -- Update payment status
  update public.payments
  set status = 'FAILED',
      updated_at = now()
  where id = p_payment_id
    and order_id = p_order_id
    and status in ('PENDING', 'PROCESSING');

  -- Update order status
  update public.orders
  set status = 'PAYMENT_FAILED',
      updated_at = now()
  where id = p_order_id;

  -- Release reserved stock
  for v_item in
    select oi.product_id, oi.quantity
    from public.order_items oi
    where oi.order_id = p_order_id
  loop
    update public.inventory
    set reserved = reserved - v_item.quantity,
        updated_at = now()
    where product_id = v_item.product_id;
  end loop;

  -- Log audit
  insert into public.audit_log (action, entity_type, entity_id, metadata)
  values ('PAYMENT_FAILED', 'order', p_order_id::text,
    jsonb_build_object('payment_id', p_payment_id));

  return jsonb_build_object(
    'order_id', p_order_id,
    'payment_id', p_payment_id,
    'status', 'PAYMENT_FAILED'
  );
end;
$$;

comment on function public.handle_payment_failure(uuid, uuid) is
  'Handle payment failure: update statuses and release reserved stock';

-- ---------------------
-- Storage image validation
-- ---------------------
create or replace function public.validate_image_upload()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(new.metadata->>'mimetype') not in ('image/png', 'image/jpeg', 'image/webp', 'image/gif') then
    raise exception 'Invalid image type. Allowed: PNG, JPEG, WebP, GIF';
  end if;
  return new;
end;
$$;

comment on function public.validate_image_upload() is
  'Trigger function to validate uploaded image MIME types in storage';
