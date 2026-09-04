-- ============================================================================
-- 009: Fix real catalog (30 products) - Aretes 1-17 @ 35.000 && Pulseras 18-30 @ 70.000
-- ============================================================================
-- NON-DESTRUCTIVE: no rows are deleted. Out-of-catalog products are only
-- deactivated (is_active = false).
--
-- Real mapping (slot = image number):
--   ARETES  (1-17): 1 Terra, 2 Pollitos, 3 Conejos, 4 Monitos, 5 Sullivan,
--                    6 Vaquitas, 7 Trebol de 4 hojas, 8 El Principito,
--                    9 Fridas, 10 Piñas, 11 Mariposas, 12 Mafaldas, 13 Gatos,
--                    14 Pensamientos, 15 Pokemón Espeon, 16 Pokemón Charmander,
--                    17 Colombia
--   PULSERAS (18-30): 18 Ángel, 19 Harry Potter, 20 Alpaca, 21 Acordeón,
--                    22 Vírgen, 23 HelloKitty, 24 Sagrado Corazón, 25 Tobby,
--                    26 Basketball, 27 Camiseta Selección Colombia,
--                    28 San José, 29 Nombre de tu Hijo-a, 30 Vírgen de Guadalupe
-- Category UUIDs (from 007): aretes=a0000000-...-000000000005, pulseras=a0000000-...-000000000006
-- ============================================================================

-- ---------------------
-- 1. Ensure categories
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

-- ---------------------
-- 2. Set final names/slugs/prices/categories for the 30 real products
-- ---------------------
WITH fixes(id, name, slug, price, category_id) AS (VALUES
  -- ARETES 1-17 @ 35.000
  ('b0000000-0000-0000-0000-000000000001'::uuid, 'Terra',                    'terra',                    35000, 'a0000000-0000-0000-0000-000000000005'::uuid),
  ('b0000000-0000-0000-0000-000000000043'::uuid, 'Pollitos',                 'pollitos',                 35000, 'a0000000-0000-0000-0000-000000000005'::uuid),
  ('b0000000-0000-0000-0000-000000000003'::uuid, 'Conejos',                  'conejos',                  35000, 'a0000000-0000-0000-0000-000000000005'::uuid),
  ('b0000000-0000-0000-0000-000000000004'::uuid, 'Monitos',                  'monitos',                  35000, 'a0000000-0000-0000-0000-000000000005'::uuid),
  ('b0000000-0000-0000-0000-000000000005'::uuid, 'Sullivan',                 'sullivan',                 35000, 'a0000000-0000-0000-0000-000000000005'::uuid),
  ('b0000000-0000-0000-0000-000000000006'::uuid, 'Vaquitas',                 'vaquitas',                 35000, 'a0000000-0000-0000-0000-000000000005'::uuid),
  ('b0000000-0000-0000-0000-000000000007'::uuid, 'Trebol de 4 hojas',        'trebol-de-4-hojas',        35000, 'a0000000-0000-0000-0000-000000000005'::uuid),
  ('b0000000-0000-0000-0000-000000000008'::uuid, 'El Principito',            'el-principito',            35000, 'a0000000-0000-0000-0000-000000000005'::uuid),
  ('b0000000-0000-0000-0000-000000000009'::uuid, 'Fridas',                   'fridas',                   35000, 'a0000000-0000-0000-0000-000000000005'::uuid),
  ('b0000000-0000-0000-0000-000000000010'::uuid, 'Piñas',                    'pinas',                    50000, 'a0000000-0000-0000-0000-000000000005'::uuid),
  ('b0000000-0000-0000-0000-000000000011'::uuid, 'Mariposas',                'mariposas',                35000, 'a0000000-0000-0000-0000-000000000005'::uuid),
  ('b0000000-0000-0000-0000-000000000012'::uuid, 'Mafaldas',                 'mafaldas',                 35000, 'a0000000-0000-0000-0000-000000000005'::uuid),
  ('b0000000-0000-0000-0000-000000000013'::uuid, 'Gatos',                    'gatos',                    35000, 'a0000000-0000-0000-0000-000000000005'::uuid),
  ('b0000000-0000-0000-0000-000000000014'::uuid, 'Pensamientos',             'pensamientos',             35000, 'a0000000-0000-0000-0000-000000000005'::uuid),
  ('b0000000-0000-0000-0000-000000000042'::uuid, 'Pokemón Espeon',           'pokemon-espeon',           35000, 'a0000000-0000-0000-0000-000000000005'::uuid),
  ('b0000000-0000-0000-0000-000000000016'::uuid, 'Pokemón Charmander',       'pokemon-charmander',       35000, 'a0000000-0000-0000-0000-000000000005'::uuid),
  ('b0000000-0000-0000-0000-000000000017'::uuid, 'Colombia',                 'colombia',                 35000, 'a0000000-0000-0000-0000-000000000005'::uuid),
  -- PULSERAS 18-30 @ 70.000
  ('b0000000-0000-0000-0000-000000000018'::uuid, 'Ángel',                    'angel',                    70000, 'a0000000-0000-0000-0000-000000000006'::uuid),
  ('b0000000-0000-0000-0000-000000000019'::uuid, 'Harry Potter',             'harry-potter',             70000, 'a0000000-0000-0000-0000-000000000006'::uuid),
  ('b0000000-0000-0000-0000-000000000020'::uuid, 'Alpaca',                   'alpaca',                   70000, 'a0000000-0000-0000-0000-000000000006'::uuid),
  ('b0000000-0000-0000-0000-000000000021'::uuid, 'Acordeón',                 'acordeon',                 70000, 'a0000000-0000-0000-0000-000000000006'::uuid),
  ('b0000000-0000-0000-0000-000000000022'::uuid, 'Vírgen',                   'virgen',                   70000, 'a0000000-0000-0000-0000-000000000006'::uuid),
  ('b0000000-0000-0000-0000-000000000023'::uuid, 'HelloKitty',               'hellokitty',               70000, 'a0000000-0000-0000-0000-000000000006'::uuid),
  ('b0000000-0000-0000-0000-000000000024'::uuid, 'Sagrado Corazón',          'sagrado-corazon',          70000, 'a0000000-0000-0000-0000-000000000006'::uuid),
  ('b0000000-0000-0000-0000-000000000025'::uuid, 'Tobby',                    'tobby',                    70000, 'a0000000-0000-0000-0000-000000000006'::uuid),
  ('b0000000-0000-0000-0000-000000000026'::uuid, 'Basketball',               'basketball',               70000, 'a0000000-0000-0000-0000-000000000006'::uuid),
  ('b0000000-0000-0000-0000-000000000027'::uuid, 'Camiseta Selección Colombia', 'camiseta-seleccion-colombia', 70000, 'a0000000-0000-0000-0000-000000000006'::uuid),
  ('b0000000-0000-0000-0000-000000000028'::uuid, 'San José',                 'san-jose',                 70000, 'a0000000-0000-0000-0000-000000000006'::uuid),
  ('b0000000-0000-0000-0000-000000000029'::uuid, 'Nombre de tu Hijo-a',      'nombre-de-tu-hijo-a',      70000, 'a0000000-0000-0000-0000-000000000006'::uuid),
  ('b0000000-0000-0000-0000-000000000030'::uuid, 'Vírgen de Guadalupe',      'virgen-de-guadalupe',      70000, 'a0000000-0000-0000-0000-000000000006'::uuid)
)
UPDATE public.products p
SET name = f.name,
    slug = f.slug,
    description = CASE WHEN f.category_id = 'a0000000-0000-0000-0000-000000000005'::uuid
                       THEN 'Arete artesanal. ' || f.name
                       ELSE 'Pulsera artesanal. ' || f.name END,
    price = f.price,
    currency = 'COP',
    category_id = f.category_id,
    is_active = true
FROM fixes f
WHERE p.id = f.id;

-- ---------------------
-- 3. Assign image_url = '/productos/N.png' for the 30 products (N = 1..30)
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
SET url = '/productos/' || f.num || '.png',
    alt_text = p.name
FROM fixes f
JOIN public.products p ON p.id = f.id
WHERE pi.product_id = f.id AND pi.is_primary = true;

-- Handle products without a primary image row yet (create one)
INSERT INTO public.product_images (product_id, url, alt_text, sort_order, is_primary)
SELECT f.id, '/productos/' || f.num || '.png', p.name, 0, true
FROM (VALUES
  ('b0000000-0000-0000-0000-000000000001'::uuid, '1')  -- representative; all rows handled above
) AS f(id, num)
JOIN public.products p ON p.id = f.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_images pi WHERE pi.product_id = f.id AND pi.is_primary = true
);

-- ---------------------
-- 4. Deactivate any product NOT in the 30-product real catalog
--    (legacy / leftover cards). No rows are deleted.
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

-- ---------------------
-- 5. Deactivate any category other than aretes/pulseras so filters show only these two
-- ---------------------
UPDATE public.categories
SET is_active = false
WHERE slug NOT IN ('aretes', 'pulseras');