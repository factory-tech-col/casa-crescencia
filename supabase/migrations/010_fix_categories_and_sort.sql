-- ============================================================================
-- 010: Strict category separation + explicit ordering for the 30-product catalog
-- ============================================================================
-- Ensures:
--   - products 1.png..17.png are assigned ONLY to category slug 'aretes'
--   - products 18.png..30.png are assigned ONLY to category slug 'pulseras'
--   - adds an explicit `order_index` column so the general catalog renders
--     Aretes (1-17) first, then Pulseras (18-30)
-- Non-destructive: only UPDATE is_active/order_index/category_id and ADD COLUMN.
-- ============================================================================

-- ---------------------
-- 1. Ensure the two categories exist with the right slugs
-- ---------------------
INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
VALUES
  ('a0000000-0000-0000-0000-000000000005', 'Aretes',   'aretes',   'Aretes artesanales',   1, true),
  ('a0000000-0000-0000-0000-000000000006', 'Pulseras', 'pulseras', 'Pulseras artesanales', 2, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- Deactivate any other category so filters only show Aretes / Pulseras
UPDATE public.categories SET is_active = false WHERE slug NOT IN ('aretes', 'pulseras');

-- ---------------------
-- 2. Add explicit ordering column (idempotent)
-- ---------------------
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS order_index integer;
CREATE INDEX IF NOT EXISTS idx_products_order_index ON public.products(order_index);

-- ---------------------
-- 3. Assign order_index (1-17 Aretes, 18-30 Pulseras) and category_id by slug
--    while keeping product names/slugs/images from the real catalog.
-- ---------------------
WITH fixes(id, order_index, category_id, arete_name, pulsera_name) AS (VALUES
  -- ARETES 1-17 -> category 'aretes'
  ('b0000000-0000-0000-0000-000000000001'::uuid, 1,  'a0000000-0000-0000-0000-000000000005'::uuid, 'Terra',                 NULL),
  ('b0000000-0000-0000-0000-000000000043'::uuid, 2,  'a0000000-0000-0000-0000-000000000005'::uuid, 'Pollitos',              NULL),
  ('b0000000-0000-0000-0000-000000000003'::uuid, 3,  'a0000000-0000-0000-0000-000000000005'::uuid, 'Conejos',               NULL),
  ('b0000000-0000-0000-0000-000000000004'::uuid, 4,  'a0000000-0000-0000-0000-000000000005'::uuid, 'Monitos',               NULL),
  ('b0000000-0000-0000-0000-000000000005'::uuid, 5,  'a0000000-0000-0000-0000-000000000005'::uuid, 'Sullivan',              NULL),
  ('b0000000-0000-0000-0000-000000000006'::uuid, 6,  'a0000000-0000-0000-0000-000000000005'::uuid, 'Vaquitas',              NULL),
  ('b0000000-0000-0000-0000-000000000007'::uuid, 7,  'a0000000-0000-0000-0000-000000000005'::uuid, 'Trebol de 4 hojas',     NULL),
  ('b0000000-0000-0000-0000-000000000008'::uuid, 8,  'a0000000-0000-0000-0000-000000000005'::uuid, 'El Principito',         NULL),
  ('b0000000-0000-0000-0000-000000000009'::uuid, 9,  'a0000000-0000-0000-0000-000000000005'::uuid, 'Fridas',                NULL),
  ('b0000000-0000-0000-0000-000000000010'::uuid, 10, 'a0000000-0000-0000-0000-000000000005'::uuid, 'Piñas',                 NULL),
  ('b0000000-0000-0000-0000-000000000011'::uuid, 11, 'a0000000-0000-0000-0000-000000000005'::uuid, 'Mariposas',             NULL),
  ('b0000000-0000-0000-0000-000000000012'::uuid, 12, 'a0000000-0000-0000-0000-000000000005'::uuid, 'Mafaldas',              NULL),
  ('b0000000-0000-0000-0000-000000000013'::uuid, 13, 'a0000000-0000-0000-0000-000000000005'::uuid, 'Gatos',                 NULL),
  ('b0000000-0000-0000-0000-000000000014'::uuid, 14, 'a0000000-0000-0000-0000-000000000005'::uuid, 'Pensamientos',          NULL),
  ('b0000000-0000-0000-0000-000000000042'::uuid, 15, 'a0000000-0000-0000-0000-000000000005'::uuid, 'Pokemón Espeon',        NULL),
  ('b0000000-0000-0000-0000-000000000016'::uuid, 16, 'a0000000-0000-0000-0000-000000000005'::uuid, 'Pokemón Charmander',    NULL),
  ('b0000000-0000-0000-0000-000000000017'::uuid, 17, 'a0000000-0000-0000-0000-000000000005'::uuid, 'Colombia',              NULL),
  -- PULSERAS 18-30 -> category 'pulseras'
  ('b0000000-0000-0000-0000-000000000018'::uuid, 18, 'a0000000-0000-0000-0000-000000000006'::uuid, NULL, 'Ángel'),
  ('b0000000-0000-0000-0000-000000000019'::uuid, 19, 'a0000000-0000-0000-0000-000000000006'::uuid, NULL, 'Harry Potter'),
  ('b0000000-0000-0000-0000-000000000020'::uuid, 20, 'a0000000-0000-0000-0000-000000000006'::uuid, NULL, 'Alpaca'),
  ('b0000000-0000-0000-0000-000000000021'::uuid, 21, 'a0000000-0000-0000-0000-000000000006'::uuid, NULL, 'Acordeón'),
  ('b0000000-0000-0000-0000-000000000022'::uuid, 22, 'a0000000-0000-0000-0000-000000000006'::uuid, NULL, 'Vírgen'),
  ('b0000000-0000-0000-0000-000000000023'::uuid, 23, 'a0000000-0000-0000-0000-000000000006'::uuid, NULL, 'HelloKitty'),
  ('b0000000-0000-0000-0000-000000000024'::uuid, 24, 'a0000000-0000-0000-0000-000000000006'::uuid, NULL, 'Sagrado Corazón'),
  ('b0000000-0000-0000-0000-000000000025'::uuid, 25, 'a0000000-0000-0000-0000-000000000006'::uuid, NULL, 'Tobby'),
  ('b0000000-0000-0000-0000-000000000026'::uuid, 26, 'a0000000-0000-0000-0000-000000000006'::uuid, NULL, 'Basketball'),
  ('b0000000-0000-0000-0000-000000000027'::uuid, 27, 'a0000000-0000-0000-0000-000000000006'::uuid, NULL, 'Camiseta Selección Colombia'),
  ('b0000000-0000-0000-0000-000000000028'::uuid, 28, 'a0000000-0000-0000-0000-000000000006'::uuid, NULL, 'San José'),
  ('b0000000-0000-0000-0000-000000000029'::uuid, 29, 'a0000000-0000-0000-0000-000000000006'::uuid, NULL, 'Nombre de tu Hijo-a'),
  ('b0000000-0000-0000-0000-000000000030'::uuid, 30, 'a0000000-0000-0000-0000-000000000006'::uuid, NULL, 'Vírgen de Guadalupe')
)
UPDATE public.products p
SET order_index = f.order_index,
    category_id = f.category_id,
    is_active = true
FROM fixes f
WHERE p.id = f.id;

-- ---------------------
-- 4. Enforce exact product names/slugs/descriptions for the 30 references
-- ---------------------
WITH fixes(id, name, slug) AS (VALUES
  ('b0000000-0000-0000-0000-000000000001'::uuid, 'Terra',                    'terra'),
  ('b0000000-0000-0000-0000-000000000043'::uuid, 'Pollitos',                 'pollitos'),
  ('b0000000-0000-0000-0000-000000000003'::uuid, 'Conejos',                  'conejos'),
  ('b0000000-0000-0000-0000-000000000004'::uuid, 'Monitos',                  'monitos'),
  ('b0000000-0000-0000-0000-000000000005'::uuid, 'Sullivan',                 'sullivan'),
  ('b0000000-0000-0000-0000-000000000006'::uuid, 'Vaquitas',                 'vaquitas'),
  ('b0000000-0000-0000-0000-000000000007'::uuid, 'Trebol de 4 hojas',        'trebol-de-4-hojas'),
  ('b0000000-0000-0000-0000-000000000008'::uuid, 'El Principito',            'el-principito'),
  ('b0000000-0000-0000-0000-000000000009'::uuid, 'Fridas',                   'fridas'),
  ('b0000000-0000-0000-0000-000000000010'::uuid, 'Piñas',                    'pinas'),
  ('b0000000-0000-0000-0000-000000000011'::uuid, 'Mariposas',                'mariposas'),
  ('b0000000-0000-0000-0000-000000000012'::uuid, 'Mafaldas',                 'mafaldas'),
  ('b0000000-0000-0000-0000-000000000013'::uuid, 'Gatos',                    'gatos'),
  ('b0000000-0000-0000-0000-000000000014'::uuid, 'Pensamientos',             'pensamientos'),
  ('b0000000-0000-0000-0000-000000000042'::uuid, 'Pokemón Espeon',           'pokemon-espeon'),
  ('b0000000-0000-0000-0000-000000000016'::uuid, 'Pokemón Charmander',       'pokemon-charmander'),
  ('b0000000-0000-0000-0000-000000000017'::uuid, 'Colombia',                 'colombia'),
  ('b0000000-0000-0000-0000-000000000018'::uuid, 'Ángel',                    'angel'),
  ('b0000000-0000-0000-0000-000000000019'::uuid, 'Harry Potter',             'harry-potter'),
  ('b0000000-0000-0000-0000-000000000020'::uuid, 'Alpaca',                   'alpaca'),
  ('b0000000-0000-0000-0000-000000000021'::uuid, 'Acordeón',                 'acordeon'),
  ('b0000000-0000-0000-0000-000000000022'::uuid, 'Vírgen',                   'virgen'),
  ('b0000000-0000-0000-0000-000000000023'::uuid, 'HelloKitty',               'hellokitty'),
  ('b0000000-0000-0000-0000-000000000024'::uuid, 'Sagrado Corazón',          'sagrado-corazon'),
  ('b0000000-0000-0000-0000-000000000025'::uuid, 'Tobby',                    'tobby'),
  ('b0000000-0000-0000-0000-000000000026'::uuid, 'Basketball',               'basketball'),
  ('b0000000-0000-0000-0000-000000000027'::uuid, 'Camiseta Selección Colombia', 'camiseta-seleccion-colombia'),
  ('b0000000-0000-0000-0000-000000000028'::uuid, 'San José',                 'san-jose'),
  ('b0000000-0000-0000-0000-000000000029'::uuid, 'Nombre de tu Hijo-a',      'nombre-de-tu-hijo-a'),
  ('b0000000-0000-0000-0000-000000000030'::uuid, 'Vírgen de Guadalupe',      'virgen-de-guadalupe')
)
UPDATE public.products p
SET name = f.name,
    slug = f.slug,
    description = CASE WHEN p.category_id = 'a0000000-0000-0000-0000-000000000005'
                       THEN 'Arete artesanal. ' || f.name
                       ELSE 'Pulsera artesanal. ' || f.name END
FROM fixes f
WHERE p.id = f.id;

-- ---------------------
-- 5. Point image_url to /productos/N.png for the 30 products (N = 1..30)
-- ---------------------
WITH fixes(id, num) AS (VALUES
  ('b0000000-0000-0000-0000-000000000001'::uuid, '1'),
  ('b0000000-0000-0000-0000-000000000043'::uuid, '2'),
  ('b0000000-0000-0000-0000-000000000003'::uuid, '3'),
  ('b0000000-0000-0000-0000-000000000004'::uuid, '4'),
  ('b0000000-0000-0000-0000-000000000005'::uuid, '5'),
  ('b0000000-0000-0000-0000-000000000006'::uuid, '6'),
  ('b0000000-0000-0000-0000-000000000007'::uuid, '7'),
  ('b0000000-0000-0000-0000-000000000008'::uuid, '8'),
  ('b0000000-0000-0000-0000-000000000009'::uuid, '9'),
  ('b0000000-0000-0000-0000-000000000010'::uuid, '10'),
  ('b0000000-0000-0000-0000-000000000011'::uuid, '11'),
  ('b0000000-0000-0000-0000-000000000012'::uuid, '12'),
  ('b0000000-0000-0000-0000-000000000013'::uuid, '13'),
  ('b0000000-0000-0000-0000-000000000014'::uuid, '14'),
  ('b0000000-0000-0000-0000-000000000042'::uuid, '15'),
  ('b0000000-0000-0000-0000-000000000016'::uuid, '16'),
  ('b0000000-0000-0000-0000-000000000017'::uuid, '17'),
  ('b0000000-0000-0000-0000-000000000018'::uuid, '18'),
  ('b0000000-0000-0000-0000-000000000019'::uuid, '19'),
  ('b0000000-0000-0000-0000-000000000020'::uuid, '20'),
  ('b0000000-0000-0000-0000-000000000021'::uuid, '21'),
  ('b0000000-0000-0000-0000-000000000022'::uuid, '22'),
  ('b0000000-0000-0000-0000-000000000023'::uuid, '23'),
  ('b0000000-0000-0000-0000-000000000024'::uuid, '24'),
  ('b0000000-0000-0000-0000-000000000025'::uuid, '25'),
  ('b0000000-0000-0000-0000-000000000026'::uuid, '26'),
  ('b0000000-0000-0000-0000-000000000027'::uuid, '27'),
  ('b0000000-0000-0000-0000-000000000028'::uuid, '28'),
  ('b0000000-0000-0000-0000-000000000029'::uuid, '29'),
  ('b0000000-0000-0000-0000-000000000030'::uuid, '30')
)
UPDATE public.product_images pi
SET url = '/productos/' || f.num || '.png'
FROM fixes f
WHERE pi.product_id = f.id AND pi.is_primary = true;

-- ---------------------
-- 6. Deactivate any product NOT among the 30 real references
-- ---------------------
UPDATE public.products
SET is_active = false
WHERE id NOT IN (
  'b0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000005',
  'b0000000-0000-0000-0000-000000000006',
  'b0000000-0000-0000-0000-000000000007',
  'b0000000-0000-0000-0000-000000000008',
  'b0000000-0000-0000-0000-000000000009',
  'b0000000-0000-0000-0000-000000000010',
  'b0000000-0000-0000-0000-000000000011',
  'b0000000-0000-0000-0000-000000000012',
  'b0000000-0000-0000-0000-000000000013',
  'b0000000-0000-0000-0000-000000000014',
  'b0000000-0000-0000-0000-000000000016',
  'b0000000-0000-0000-0000-000000000017',
  'b0000000-0000-0000-0000-000000000018',
  'b0000000-0000-0000-0000-000000000019',
  'b0000000-0000-0000-0000-000000000020',
  'b0000000-0000-0000-0000-000000000021',
  'b0000000-0000-0000-0000-000000000022',
  'b0000000-0000-0000-0000-000000000023',
  'b0000000-0000-0000-0000-000000000024',
  'b0000000-0000-0000-0000-000000000025',
  'b0000000-0000-0000-0000-000000000026',
  'b0000000-0000-0000-0000-000000000027',
  'b0000000-0000-0000-0000-000000000028',
  'b0000000-0000-0000-0000-000000000029',
  'b0000000-0000-0000-0000-000000000030',
  'b0000000-0000-0000-0000-000000000042',
  'b0000000-0000-0000-0000-000000000043'
);