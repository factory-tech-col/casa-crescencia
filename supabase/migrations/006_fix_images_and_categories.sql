-- ============================================================================
-- 006: Fix product image URLs and verify jewelry categories
-- ============================================================================

-- ---------------------
-- 1. Fix product_images URLs → numeric filenames (1.png … 42.png)
-- ---------------------
UPDATE public.product_images pi
SET url = '/productos/' || (
  CASE pi.product_id
    -- Collares (9)
    WHEN 'b0000000-0000-0000-0000-000000000001' THEN '1'
    WHEN 'b0000000-0000-0000-0000-000000000042' THEN '15'
    WHEN 'b0000000-0000-0000-0000-000000000020' THEN '20'
    WHEN 'b0000000-0000-0000-0000-000000000025' THEN '25'
    WHEN 'b0000000-0000-0000-0000-000000000031' THEN '31'
    WHEN 'b0000000-0000-0000-0000-000000000036' THEN '36'
    WHEN 'b0000000-0000-0000-0000-000000000041' THEN '41'
    WHEN 'b0000000-0000-0000-0000-000000000007' THEN '7'
    WHEN 'b0000000-0000-0000-0000-000000000043' THEN '2'
    -- Aretes (7)
    WHEN 'b0000000-0000-0000-0000-000000000003' THEN '3'
    WHEN 'b0000000-0000-0000-0000-000000000008' THEN '8'
    WHEN 'b0000000-0000-0000-0000-000000000013' THEN '13'
    WHEN 'b0000000-0000-0000-0000-000000000021' THEN '21'
    WHEN 'b0000000-0000-0000-0000-000000000027' THEN '27'
    WHEN 'b0000000-0000-0000-0000-000000000032' THEN '32'
    WHEN 'b0000000-0000-0000-0000-000000000037' THEN '37'
    -- Pulseras (7)
    WHEN 'b0000000-0000-0000-0000-000000000005' THEN '5'
    WHEN 'b0000000-0000-0000-0000-000000000009' THEN '9'
    WHEN 'b0000000-0000-0000-0000-000000000016' THEN '16'
    WHEN 'b0000000-0000-0000-0000-000000000022' THEN '22'
    WHEN 'b0000000-0000-0000-0000-000000000028' THEN '28'
    WHEN 'b0000000-0000-0000-0000-000000000033' THEN '33'
    WHEN 'b0000000-0000-0000-0000-000000000038' THEN '38'
    -- Anillos (6)
    WHEN 'b0000000-0000-0000-0000-000000000006' THEN '6'
    WHEN 'b0000000-0000-0000-0000-000000000012' THEN '12'
    WHEN 'b0000000-0000-0000-0000-000000000018' THEN '18'
    WHEN 'b0000000-0000-0000-0000-000000000023' THEN '23'
    WHEN 'b0000000-0000-0000-0000-000000000029' THEN '29'
    WHEN 'b0000000-0000-0000-0000-000000000034' THEN '34'
    -- Cadenas (6)
    WHEN 'b0000000-0000-0000-0000-000000000010' THEN '10'
    WHEN 'b0000000-0000-0000-0000-000000000019' THEN '19'
    WHEN 'b0000000-0000-0000-0000-000000000024' THEN '24'
    WHEN 'b0000000-0000-0000-0000-000000000030' THEN '30'
    WHEN 'b0000000-0000-0000-0000-000000000035' THEN '35'
    WHEN 'b0000000-0000-0000-0000-000000000040' THEN '40'
    -- Accesorios (4)
    WHEN 'b0000000-0000-0000-0000-000000000017' THEN '17'
    WHEN 'b0000000-0000-0000-0000-000000000039' THEN '42'
    WHEN 'b0000000-0000-0000-0000-000000000011' THEN '11'
    WHEN 'b0000000-0000-0000-0000-000000000014' THEN '14'
  END
) || '.png'
WHERE pi.is_primary = true;

-- ---------------------
-- 2. Drop old generic categories if they exist (no-op if already jewelry)
-- ---------------------
DELETE FROM public.categories
WHERE slug IN ('bolsos', 'calzado', 'prendas-de-vestir', 'hogar');

-- ---------------------
-- 3. Ensure jewelry categories exist (upsert)
-- ---------------------
INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Collares',   'collares',   'Collares artesanales con diseño exclusivo',  1, true),
  ('a0000000-0000-0000-0000-000000000002', 'Aretes',     'aretes',     'Aretes delicados para cada ocasión',         2, true),
  ('a0000000-0000-0000-0000-000000000003', 'Pulseras',   'pulseras',   'Pulseras tejidas y bañadas en oro',          3, true),
  ('a0000000-0000-0000-0000-000000000004', 'Anillos',    'anillos',    'Anillos con acabados premium',               4, true),
  ('a0000000-0000-0000-0000-000000000005', 'Cadenas',    'cadenas',    'Cadenas bañadas en oro 18k',                 5, true),
  ('a0000000-0000-0000-0000-000000000006', 'Accesorios', 'accesorios', 'Accesorios complementarios para tu estilo',  6, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;
