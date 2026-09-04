-- ============================================================================
-- 016: Reiniciar transacciones de prueba (E2E fixture reset)
-- ============================================================================
-- Vacía todas las tablas transaccionales (órdenes, pagos, comprobantes y sus
-- dependientes) SIN tocar el catálogo de productos ni la estructura, y
-- restablece el inventario a 999 para las pruebas E2E.
--
-- Nota de compatibilidad con el esquema:
--  - `orders`/`order_items`/`payments` usan PK uuid (gen_random_uuid), por lo
--    que no hay secuencias; RESTART IDENTITY se mantiene por robustez (no-op).
--  - `TRUNCATE ... CASCADE` arrastra por FK a order_items, payments y
--    payment_events. `audit_log` no tiene FK a estas tablas, así que se lista
--    explícitamente.
--  - products NO tiene columna `stock` (el stock vive en `inventory`); el
--    UPDATE se aplica a `inventory`, no a `products`.
-- ============================================================================

-- ---------------------
-- 1. Vaciar las tablas de transacciones (integridad referencial automática)
-- ---------------------
TRUNCATE TABLE
  payments,
  order_items,
  orders,
  payment_events,
  audit_log
RESTART IDENTITY CASCADE;

-- ---------------------
-- 2. Limpiar los comprobantes almacenados en Storage (buckets de receipts)
-- ---------------------
DELETE FROM storage.objects WHERE bucket_id = 'receipts';
DELETE FROM storage.objects WHERE bucket_id = 'payment-receipts';

-- ---------------------
-- 3. Restablecer el inventario disponible a 999 para la prueba E2E
-- ---------------------
UPDATE inventory SET stock = 999, reserved = 0 WHERE stock IS NOT NULL;
