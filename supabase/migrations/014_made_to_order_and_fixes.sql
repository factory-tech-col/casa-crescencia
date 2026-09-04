-- ============================================================================
-- 014: Made-to-order model + stock/parsing fixes
-- ============================================================================
-- - Removes stock validation and reservation from create_order (made-to-order).
-- - Drops the CHECK (reserved <= stock) constraint that blocked orders.
-- - Drops the inventory join (no longer needed for order creation).
-- - Seeds all inventory to stock=999 to prevent catalog-level blocks.
-- - Keeps response shape identical: { order_id, payment_id, subtotal, ... }
-- ============================================================================

-- ---------------------
-- 1. Drop the (reserved <= stock) constraint that blocks reservations
-- ---------------------
ALTER TABLE public.inventory
  DROP CONSTRAINT IF EXISTS inventory_reserved_stock_check;

-- ---------------------
-- 2. Seed all products to high stock so catalog views never block
-- ---------------------
UPDATE public.inventory
SET stock = 999, reserved = 0, updated_at = now()
WHERE stock IS NULL OR stock <= 0;

-- ---------------------
-- 3. Replace create_order: made-to-order, no stock validation
-- ---------------------
CREATE OR REPLACE FUNCTION public.create_order(
  p_user_id uuid,
  p_items jsonb,
  p_idempotency_key text,
  p_address_snapshot jsonb,
  p_payment_method text DEFAULT 'MOCK',
  p_pse jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
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
BEGIN
  -- Verify caller is the user creating the order
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot create order for another user';
  END IF;

  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.orders WHERE idempotency_key = p_idempotency_key) THEN
      RETURN (
        SELECT jsonb_build_object(
          'order_id', o.id,
          'status', o.status,
          'message', 'Order already exists'
        )
        FROM public.orders o
        WHERE o.idempotency_key = p_idempotency_key
      );
    END IF;
  END IF;

  -- Validate address fields
  IF p_address_snapshot IS NULL
    OR p_address_snapshot->>'full_name' IS NULL OR trim(p_address_snapshot->>'full_name') = ''
    OR p_address_snapshot->>'phone' IS NULL OR trim(p_address_snapshot->>'phone') = ''
    OR p_address_snapshot->>'address_line1' IS NULL OR trim(p_address_snapshot->>'address_line1') = ''
    OR p_address_snapshot->>'city' IS NULL OR trim(p_address_snapshot->>'city') = ''
    OR p_address_snapshot->>'department' IS NULL OR trim(p_address_snapshot->>'department') = ''
  THEN
    RAISE EXCEPTION 'Shipping address is incomplete. Required fields: full_name, phone, address_line1, city, department';
  END IF;

  -- Validate payment method
  IF p_payment_method NOT IN ('MOCK', 'PSE', 'NEQUI', 'DAVIPLATA', 'BRE_B', 'BANK_TRANSFER', 'CREDIT_CARD', 'PAYMENT_BUTTON') THEN
    RAISE EXCEPTION 'Unsupported payment method %', p_payment_method;
  END IF;

  -- Validate items count
  v_items_count := jsonb_array_length(p_items);
  IF v_items_count = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;
  IF v_items_count > 20 THEN
    RAISE EXCEPTION 'Order cannot contain more than 20 items';
  END IF;

  -- Load shipping config from config table
  SELECT (value->>'shipping_cost')::integer INTO v_shipping_cost
  FROM public.config WHERE key = 'shipping_cost';
  IF v_shipping_cost IS NULL THEN v_shipping_cost := 13900; END IF;

  SELECT (value->>'free_shipping_threshold')::integer INTO v_free_threshold
  FROM public.config WHERE key = 'free_shipping_threshold';
  IF v_free_threshold IS NULL THEN v_free_threshold := 100000; END IF;

  -- Validate each item and accumulate subtotal (no stock check, made-to-order)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::integer;

    -- Validate quantity bounds
    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'Quantity must be at least 1 for product %', v_item->>'product_id';
    END IF;
    IF v_qty > 10 THEN
      RAISE EXCEPTION 'Maximum quantity per item is 10. Product % requested %', v_item->>'product_id', v_qty;
    END IF;

    -- Fetch product and verify it exists and is active
    SELECT p.*
    INTO v_product
    FROM public.products p
    WHERE p.id = (v_item->>'product_id')::uuid
      AND p.is_active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % is not available', v_item->>'product_id';
    END IF;

    -- Get primary image url
    SELECT url INTO v_image_url
    FROM public.product_images
    WHERE product_id = v_product.id AND is_primary = true
    LIMIT 1;

    IF v_image_url IS NULL THEN
      SELECT url INTO v_image_url
      FROM public.product_images
      WHERE product_id = v_product.id
      ORDER BY sort_order
      LIMIT 1;
    END IF;

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
  END LOOP;

  -- Apply free shipping threshold
  IF v_subtotal >= v_free_threshold THEN
    v_shipping_cost := 0;
  END IF;

  -- IVA 19% over the taxable base (subtotal) — kept for DB consistency;
  -- frontend overrides total to subtotal + shipping for display.
  v_iva := round(v_subtotal * 0.19)::integer;

  v_total := v_subtotal + v_iva + v_shipping_cost;

  -- Create the order (status "PENDING_PAYMENT")
  INSERT INTO public.orders (
    user_id, status, subtotal, iva, shipping_cost, total,
    currency, shipping_address, idempotency_key
  ) VALUES (
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
  RETURNING id INTO v_order_id;

  -- Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_order_items)
  LOOP
    INSERT INTO public.order_items (
      order_id, product_id, product_name, product_slug,
      product_image_url, unit_price, quantity, subtotal, currency
    ) VALUES (
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
  END LOOP;

  -- Create payment record in "PENDING" with the selected method
  INSERT INTO public.payments (
    order_id, method, status, amount, currency, metadata
  ) VALUES (
    v_order_id,
    p_payment_method,
    'PENDING',
    v_total,
    'COP',
    jsonb_build_object(
      'iva', v_iva,
      'subtotal', v_subtotal,
      'shipping_cost', v_shipping_cost,
      'pse', p_pse
    )
  )
  RETURNING id INTO v_payment_id;

  -- Log audit
  INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_user_id,
    'ORDER_CREATED',
    'order',
    v_order_id::text,
    jsonb_build_object('total', v_total, 'iva', v_iva, 'items_count', v_items_count, 'method', p_payment_method)
  );

  -- Return the complete order
  RETURN jsonb_build_object(
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
END;
$$;

COMMENT ON FUNCTION public.create_order(uuid, jsonb, text, jsonb, text, jsonb) IS
  'Create an order (made-to-order). No stock validation. Returns JSONB with order_id, payment_id, subtotal, iva, shipping_cost, total.';
