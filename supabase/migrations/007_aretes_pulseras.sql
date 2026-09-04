-- ============================================================================
-- 007: Reorganize catalog into Aretes (1-21) @ $35.000 and Pulseras (22-35) @ $70.000
-- ============================================================================
-- Applies to the existing deployment whose categories are the legacy set
-- (accesorios, bolsos, calzado, prendas-de-vestir, joyeria, hogar).
-- Products are identified by their numeric product/image number via the
-- b0000000-....-00000000000NN UUID mapping, then renamed to "Arete N" /
-- "Pulsera N", re-priced and re-pointed to the Aretes / Pulseras categories.

-- ---------------------
-- 1. Only Aretes and Pulseras remain active in the public catalog
-- ---------------------
UPDATE public.categories SET is_active = false WHERE slug IN (
  'accesorios', 'bolsos', 'calzado', 'prendas-de-vestir', 'joyeria', 'hogar'
);

-- ---------------------
-- 2. Ensure Aretes & Pulseras categories exist.
--    Reuses the existing "joyeria"/"hogar" rows where present so the SDK
--    (anon key, which cannot INSERT) can converge to the same state; inserts
--    a fresh row if the id is not already present (full-privilege runs).
-- ---------------------
INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
VALUES
  ('a0000000-0000-0000-0000-000000000005', 'Aretes',   'aretes',   'Aretes delicados para cada ocasión',    1, true),
  ('a0000000-0000-0000-0000-000000000006', 'Pulseras', 'pulseras', 'Pulseras tejidas y bañadas en oro',     2, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- ---------------------
-- 3. Products 1-21 -> Aretes @ $35.000 COP
-- ---------------------
WITH aretes AS (SELECT id FROM public.categories WHERE slug = 'aretes')
UPDATE public.products p
SET name = x.name,
    slug = x.slug,
    description = 'Arete artesanal con acabado exclusivo',
    price = 35000,
    currency = 'COP',
    category_id = (SELECT id FROM aretes),
    is_active = true
FROM (VALUES
  ('b0000000-0000-0000-0000-000000000001'::uuid, 'Arete 1',  'arete-1'),
  ('b0000000-0000-0000-0000-000000000043'::uuid, 'Arete 2',  'arete-2'),
  ('b0000000-0000-0000-0000-000000000003'::uuid, 'Arete 3',  'arete-3'),
  ('b0000000-0000-0000-0000-000000000005'::uuid, 'Arete 5',  'arete-5'),
  ('b0000000-0000-0000-0000-000000000006'::uuid, 'Arete 6',  'arete-6'),
  ('b0000000-0000-0000-0000-000000000007'::uuid, 'Arete 7',  'arete-7'),
  ('b0000000-0000-0000-0000-000000000008'::uuid, 'Arete 8',  'arete-8'),
  ('b0000000-0000-0000-0000-000000000009'::uuid, 'Arete 9',  'arete-9'),
  ('b0000000-0000-0000-0000-000000000010'::uuid, 'Arete 10', 'arete-10'),
  ('b0000000-0000-0000-0000-000000000012'::uuid, 'Arete 12', 'arete-12'),
  ('b0000000-0000-0000-0000-000000000013'::uuid, 'Arete 13', 'arete-13'),
  ('b0000000-0000-0000-0000-000000000042'::uuid, 'Arete 15', 'arete-15'),
  ('b0000000-0000-0000-0000-000000000016'::uuid, 'Arete 16', 'arete-16'),
  ('b0000000-0000-0000-0000-000000000017'::uuid, 'Arete 17', 'arete-17'),
  ('b0000000-0000-0000-0000-000000000018'::uuid, 'Arete 18', 'arete-18'),
  ('b0000000-0000-0000-0000-000000000019'::uuid, 'Arete 19', 'arete-19'),
  ('b0000000-0000-0000-0000-000000000020'::uuid, 'Arete 20', 'arete-20'),
  ('b0000000-0000-0000-0000-000000000021'::uuid, 'Arete 21', 'arete-21')
) AS x(id, name, slug)
WHERE p.id = x.id;

-- ---------------------
-- 4. Products 22-35 -> Pulseras @ $70.000 COP
-- ---------------------
WITH pulseras AS (SELECT id FROM public.categories WHERE slug = 'pulseras')
UPDATE public.products p
SET name = x.name,
    slug = x.slug,
    description = 'Pulsera artesanal con acabado premium',
    price = 70000,
    currency = 'COP',
    category_id = (SELECT id FROM pulseras),
    is_active = true
FROM (VALUES
  ('b0000000-0000-0000-0000-000000000022'::uuid, 'Pulsera 22', 'pulsera-22'),
  ('b0000000-0000-0000-0000-000000000023'::uuid, 'Pulsera 23', 'pulsera-23'),
  ('b0000000-0000-0000-0000-000000000024'::uuid, 'Pulsera 24', 'pulsera-24'),
  ('b0000000-0000-0000-0000-000000000025'::uuid, 'Pulsera 25', 'pulsera-25'),
  ('b0000000-0000-0000-0000-000000000027'::uuid, 'Pulsera 27', 'pulsera-27'),
  ('b0000000-0000-0000-0000-000000000028'::uuid, 'Pulsera 28', 'pulsera-28'),
  ('b0000000-0000-0000-0000-000000000029'::uuid, 'Pulsera 29', 'pulsera-29'),
  ('b0000000-0000-0000-0000-000000000030'::uuid, 'Pulsera 30', 'pulsera-30'),
  ('b0000000-0000-0000-0000-000000000031'::uuid, 'Pulsera 31', 'pulsera-31'),
  ('b0000000-0000-0000-0000-000000000032'::uuid, 'Pulsera 32', 'pulsera-32'),
  ('b0000000-0000-0000-0000-000000000033'::uuid, 'Pulsera 33', 'pulsera-33'),
  ('b0000000-0000-0000-0000-000000000034'::uuid, 'Pulsera 34', 'pulsera-34'),
  ('b0000000-0000-0000-0000-000000000035'::uuid, 'Pulsera 35', 'pulsera-35')
) AS x(id, name, slug)
WHERE p.id = x.id;

-- ---------------------
-- 5. Point primary images to numeric filenames and refresh alt_text
-- ---------------------
WITH imgmap(id, num) AS (
  VALUES
  ('b0000000-0000-0000-0000-000000000001'::uuid, '1'),
  ('b0000000-0000-0000-0000-000000000043'::uuid, '2'),
  ('b0000000-0000-0000-0000-000000000003'::uuid, '3'),
  ('b0000000-0000-0000-0000-000000000005'::uuid, '5'),
  ('b0000000-0000-0000-0000-000000000006'::uuid, '6'),
  ('b0000000-0000-0000-0000-000000000007'::uuid, '7'),
  ('b0000000-0000-0000-0000-000000000008'::uuid, '8'),
  ('b0000000-0000-0000-0000-000000000009'::uuid, '9'),
  ('b0000000-0000-0000-0000-000000000010'::uuid, '10'),
  ('b0000000-0000-0000-0000-000000000012'::uuid, '12'),
  ('b0000000-0000-0000-0000-000000000013'::uuid, '13'),
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
  ('b0000000-0000-0000-0000-000000000027'::uuid, '27'),
  ('b0000000-0000-0000-0000-000000000028'::uuid, '28'),
  ('b0000000-0000-0000-0000-000000000029'::uuid, '29'),
  ('b0000000-0000-0000-0000-000000000030'::uuid, '30'),
  ('b0000000-0000-0000-0000-000000000031'::uuid, '31'),
  ('b0000000-0000-0000-0000-000000000032'::uuid, '32'),
  ('b0000000-0000-0000-0000-000000000033'::uuid, '33'),
  ('b0000000-0000-0000-0000-000000000034'::uuid, '34'),
  ('b0000000-0000-0000-0000-000000000035'::uuid, '35')
)
UPDATE public.product_images pi
SET url = '/productos/' || m.num || '.png',
    alt_text = p.name
FROM imgmap m
JOIN public.products p ON p.id = m.id
WHERE pi.product_id = m.id AND pi.is_primary = true;
