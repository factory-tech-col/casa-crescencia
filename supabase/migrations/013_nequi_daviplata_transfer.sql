-- ============================================================================
-- 013: NEQUI / DAVIPLATA direct transfer payment flow
-- ============================================================================
-- - Extends payment methods to explicitly include 'DAVIPLATA'.
-- - Adds receipt_path column to payments for real file storage references.
-- - Creates private 'payment-receipts' storage bucket for payment proofs.
-- - Sets up RLS policies for payment-receipts (owner read/write, admin read).
-- - Updates create_order to accept NEQUI and DAVIPLATA as payment methods.
-- Run in the Supabase SQL Editor.
-- ============================================================================

-- ---------------------
-- 1. Add DAVIPLATA to payment method check constraint
-- ---------------------
alter table public.payments drop constraint if exists payments_method_check;
alter table public.payments add constraint payments_method_check
  check (method in (
    'MOCK', 'PSE', 'NEQUI', 'DAVIPLATA', 'BRE_B', 'BANK_TRANSFER',
    'CREDIT_CARD', 'PAYMENT_BUTTON'
  ));

-- ---------------------
-- 2. Add receipt_path column to payments
-- ---------------------
alter table public.payments add column if not exists receipt_path text;

comment on column public.payments.receipt_path is
  'Storage path of the payment receipt image (private bucket payment-receipts)';

-- ---------------------
-- 3. Update create_order to accept NEQUI and DAVIPLATA
-- ---------------------
create or replace function public.create_order(
  p_user_id uuid,
  p_items jsonb,
  p_idempotency_key text,
  p_address_snapshot jsonb,
  p_payment_method text default 'MOCK',
  p_pse jsonb default null
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
  v_iva integer := 0;
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

  -- Validate payment method (NEQUI and DAVIPLATA are the primary methods for this store)
  if p_payment_method not in ('MOCK', 'PSE', 'NEQUI', 'DAVIPLATA', 'BRE_B', 'BANK_TRANSFER', 'CREDIT_CARD', 'PAYMENT_BUTTON') then
    raise exception 'Unsupported payment method %', p_payment_method;
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

    -- Check sufficient stock
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

    -- Accumulate subtotal using server-side price
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

  -- IVA 19% over the taxable base (subtotal)
  v_iva := round(v_subtotal * 0.19)::integer;

  v_total := v_subtotal + v_iva + v_shipping_cost;

  -- Create the order (status "PENDING_PAYMENT")
  insert into public.orders (
    user_id, status, subtotal, iva, shipping_cost, total,
    currency, shipping_address, idempotency_key
  ) values (
    p_user_id,
    'PENDING_PAYMENT',
    v_subtotal,
    v_iva,
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

  -- Create payment record in "PENDING" with the selected method
  insert into public.payments (
    order_id, method, status, amount, currency, metadata
  ) values (
    v_order_id,
    p_payment_method,
    'PENDING',
    v_total,
    'COP',
    jsonb_build_object(
      'iva', v_iva,
      'subtotal', v_subtotal,
      'shipping_cost', v_shipping_cost
    )
  )
  returning id into v_payment_id;

  -- Log audit
  insert into public.audit_log (user_id, action, entity_type, entity_id, metadata)
  values (
    p_user_id,
    'ORDER_CREATED',
    'order',
    v_order_id::text,
    jsonb_build_object('total', v_total, 'iva', v_iva, 'items_count', v_items_count, 'method', p_payment_method)
  );

  -- Return the complete order
  return jsonb_build_object(
    'order_id', v_order_id,
    'payment_id', v_payment_id,
    'status', 'PENDING_PAYMENT',
    'subtotal', v_subtotal,
    'iva', v_iva,
    'shipping_cost', v_shipping_cost,
    'total', v_total,
    'currency', 'COP',
    'items', v_order_items
  );
end;
$$;

comment on function public.create_order(uuid, jsonb, text, jsonb, text, jsonb) is
  'Create an order in PENDING_PAYMENT with stock reservation, IVA 19% and selected payment method (NEQUI, DAVIPLATA, MOCK, etc.)';

-- ---------------------
-- 4. Create payment-receipts storage bucket (private)
-- ---------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('payment-receipts', 'payment-receipts', false, 8388608, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 8388608,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];

-- ---------------------
-- 5. RLS policies for payment-receipts bucket
-- ---------------------

-- Owner can read their own receipts (folder: {user_id}/{order_id}/...)
CREATE POLICY "Users can view own payment receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-receipts'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.is_admin()
  )
);

-- Owner can upload receipts for their own orders
CREATE POLICY "Users can upload own payment receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Owner can update their own receipts
CREATE POLICY "Users can update own payment receipts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'payment-receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Owner can delete their own receipts
CREATE POLICY "Users can delete own payment receipts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'payment-receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
