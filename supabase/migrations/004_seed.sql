-- ============================================================================
-- Seed Data
-- ============================================================================

-- ---------------------
-- Config
-- ---------------------
insert into public.config (key, value) values
  ('shipping_cost', '8000'::jsonb),
  ('free_shipping_threshold', '100000'::jsonb);

-- ---------------------
-- Categories (Joyería Artesanal)
-- ---------------------
insert into public.categories (id, name, slug, description, sort_order) values
  ('a0000000-0000-0000-0000-000000000001', 'Collares',   'collares',   'Collares artesanales con diseño exclusivo',  1),
  ('a0000000-0000-0000-0000-000000000002', 'Aretes',     'aretes',     'Aretes delicados para cada ocasión',         2),
  ('a0000000-0000-0000-0000-000000000003', 'Pulseras',   'pulseras',   'Pulseras tejidas y bañadas en oro',          3),
  ('a0000000-0000-0000-0000-000000000004', 'Anillos',    'anillos',    'Anillos con acabados premium',               4),
  ('a0000000-0000-0000-0000-000000000005', 'Cadenas',    'cadenas',    'Cadenas bañadas en oro 18k',                 5),
  ('a0000000-0000-0000-0000-000000000006', 'Accesorios', 'accesorios', 'Accesorios complementarios para tu estilo',  6);

-- ---------------------
-- Products (39 total, all 35000 COP)
-- ---------------------
insert into public.products (id, name, slug, description, price, currency, is_active, category_id) values
  -- Collares (9)
  ('b0000000-0000-0000-0000-000000000001', 'Collar Elegante',    'collar-elegante',    'Collar con diseño exclusivo y acabado premium.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000042', 'Collar Perlas',      'collar-perlas',      'Collar de perlas cultivadas premium.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000020', 'Collar Luno',        'collar-luno',        'Collar con dije de luna creciente.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000025', 'Collar Bohemio',     'collar-bohemio',     'Collar artesanal estilo bohemio.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000031', 'Collar Medusa',      'collar-medusa',      'Collar con dije de medusa artesanal.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000036', 'Collar Ambar',       'collar-ambar',       'Collar con colgante de ámbar.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000041', 'Collar Lotus',       'collar-lotus',       'Collar con dije de flor de loto.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000007', 'Collar Cordón',      'collar-cordon',      'Collar de cordón ajustable con dije.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000043', 'Pendiente Luna',     'pendiente-luna',     'Pendientes con forma de luna creciente.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000001'),
  -- Aretes (7)
  ('b0000000-0000-0000-0000-000000000003', 'Aretes Dorados',     'aretes-dorados',     'Aretes bañados en oro con cristales.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000008', 'Arete Lágrima',      'arete-lagrima',      'Aretes estilo lágrima con cristal.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000013', 'Arete Perla',        'arete-perla',        'Aretes con perlas cultivadas.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000021', 'Arete Crescente',    'arete-creciente',    'Aretes con forma de luna creciente.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000027', 'Arete Duna',         'arete-duna',         'Aretes con acabado mate texturizado.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000032', 'Arete Feather',      'arete-feather',      'Aretes con diseño de pluma.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000037', 'Arete Drop',         'arete-drop',         'Aretes gota bañados en oro.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000002'),
  -- Pulseras (7)
  ('b0000000-0000-0000-0000-000000000005', 'Pulsera Marina',     'pulsera-marina',     'Pulsera tejida a mano con detalles marinos.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000009', 'Pulsera Cadena',     'pulsera-cadena',     'Pulsera de cadena bañada en oro.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000016', 'Pulsera Charm',      'pulsera-charm',      'Pulsera con dijes personalizables.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000022', 'Pulsera Nudos',      'pulsera-nudos',      'Pulsera con diseño de nudos marinos.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000028', 'Pulsera Coral',      'pulsera-coral',      'Pulsera con detalles de coral.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000033', 'Pulsera Woven',      'pulsera-woven',      'Pulsera tejida con hilos dorados.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000038', 'Pulsera Wrist',      'pulsera-wrist',      'Pulsera rígida con acabado brillante.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000003'),
  -- Anillos (6)
  ('b0000000-0000-0000-0000-000000000006', 'Anillo Solitario',   'anillo-solitario',   'Anillo delicado con baño de oro.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000012', 'Anillo Romántico',   'anillo-romantico',   'Anillo delicado con diseño romántico.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000018', 'Anillo Eternity',    'anillo-eternity',    'Anillo con baño de oro y circonitas.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000023', 'Anillo Flor',        'anillo-flor',        'Anillo con diseño floral artesanal.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000029', 'Anillo Signat',      'anillo-signat',      'Anillo con grabado personalizado.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000034', 'Anillo Soleado',     'anillo-soleado',     'Anillo con rayos de sol.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000004'),
  -- Cadenas (6)
  ('b0000000-0000-0000-0000-000000000010', 'Cadena Dorada',      'cadena-dorada',      'Cadena bañada en oro 18k.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000019', 'Cadena Corazón',     'cadena-corazon',     'Cadena con dije de corazón.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000024', 'Cadena Stars',       'cadena-stars',       'Cadena con dijes de estrellas.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000030', 'Cadena Infinity',    'cadena-infinity',    'Cadena con símbolo de infinito.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000035', 'Cadena Murano',      'cadena-murano',      'Cadena con charm de vidrio murano.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000040', 'Cadena Mini',        'cadena-mini',        'Cadena corta con pequeño dije.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000005'),
  -- Accesorios (4)
  ('b0000000-0000-0000-0000-000000000017', 'Tobillera Dorada',   'tobillera-dorada',   'Tobillera delicada bañada en oro.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000006'),
  ('b0000000-0000-0000-0000-000000000039', 'Broche Floral',      'broche-floral',      'Broche con diseño floral artesanal.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000006'),
  ('b0000000-0000-0000-0000-000000000011', 'Gafas de Sol',       'gafas-de-sol',       'Gafas de sol con filtro UV y diseño elegante.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000006'),
  ('b0000000-0000-0000-0000-000000000014', 'Sombrero Bohemio',   'sombrero-bohemio',   'Sombrero de paja con cinta decorativa.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000006');

-- ---------------------
-- Inventory (stock=20 for every product)
-- ---------------------
insert into public.inventory (product_id, stock, reserved)
select id, 20, 0 from public.products;

-- ---------------------
-- Product Images
-- ---------------------
insert into public.product_images (product_id, url, alt_text, sort_order, is_primary)
select
  p.id,
  '/productos/' || p.slug || '.png',
  p.name,
  0,
  true
from public.products p;
