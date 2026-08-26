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
-- Categories
-- ---------------------
insert into public.categories (id, name, slug, description, sort_order) values
  ('a0000000-0000-0000-0000-000000000001', 'Accesorios',       'accesorios',       'Accesorios de moda y estilo',      1),
  ('a0000000-0000-0000-0000-000000000002', 'Bolsos',           'bolsos',           'Bolsos y carteras para toda ocasión', 2),
  ('a0000000-0000-0000-0000-000000000003', 'Calzado',          'calzado',          'Zapatos y calzado variado',        3),
  ('a0000000-0000-0000-0000-000000000004', 'Prendas de Vestir', 'prendas-de-vestir', 'Ropa para hombre y mujer',        4),
  ('a0000000-0000-0000-0000-000000000005', 'Joyería',          'joyeria',          'Joyería y bisutería',             5),
  ('a0000000-0000-0000-0000-000000000006', 'Hogar',            'hogar',            'Artículos para el hogar',         6);

-- ---------------------
-- Products (39 total, all 35000 COP)
-- ---------------------
insert into public.products (id, name, slug, description, price, currency, is_active, category_id) values
  -- Joyería (9)
  ('b0000000-0000-0000-0000-000000000001', 'Collar Elegante',    'collar-elegante',    'Collar con diseño exclusivo y acabado premium, ideal para complementar cualquier look elegante.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000003', 'Aretes Dorados',     'aretes-dorados',     'Aretes bañados en oro con cristales que aportan brillo y distinción a tu estilo.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000018', 'Anillo Romántico',   'anillo-romantico',   'Anillo delicado con diseño romántico, perfecto para regalar o consentirte.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000019', 'Cadena Dorada',      'cadena-dorada',      'Cadena bañada en oro 18k con cierre de seguridad, duradera y elegante.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000027', 'Arete Perla',        'arete-perla',        'Aretes con perlas cultivadas, clásicos y atemporales para toda ocasión.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000034', 'Tobillera Dorada',   'tobillera-dorada',   'Tobillera delicada bañada en oro, perfecta para el verano.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000039', 'Broche Floral',      'broche-floral',      'Broche con diseño floral artesanal, pieza única para dar un toque especial.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000042', 'Collar Perlas',      'collar-perlas',      'Collar de perlas cultivadas premium, símbolo de elegancia y distinción.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000043', 'Pendiente Luna',     'pendiente-luna',     'Pendientes con forma de luna creciente, diseño delicado para un look sofisticado.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000005'),
  -- Bolsos (7)
  ('b0000000-0000-0000-0000-000000000002', 'Bolso Clásico',      'bolso-clasico',      'Bolso de cuero sintético con acabados elegantes, amplio espacio interior.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000008', 'Cartera Minimalista', 'cartera-minimalista', 'Cartera delgada con organizador interior, práctica y sofisticada.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000015', 'Bolso Bandolera',    'bolso-bandolera',    'Bolso bandolera compacto y versátil, ideal para el día a día.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000020', 'Mochila Urbana',     'mochila-urbana',     'Mochila resistente al agua con múltiples compartimentos, diseño urbano.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000024', 'Cartera Cuero',      'cartera-cuero',      'Cartera premium de cuero genuino, acabados artesanales de calidad.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000032', 'Bolso Shopper',      'bolso-shopper',      'Bolso tipo shopper amplio y funcional, perfecto para compras y salidas.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000040', 'Bolso Mini',         'bolso-mini',         'Bolso miniatura para llevar solo lo esencial con estilo.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000002'),
  -- Calzado (6)
  ('b0000000-0000-0000-0000-000000000006', 'Sandalias Verano',   'sandalias-verano',   'Sandalias cómodas y frescas para disfrutar del verano con estilo.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000012', 'Botas Urbanas',      'botas-urbanas',      'Botas de cuero para uso urbano, resistentes y con diseño moderno.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000017', 'Tenis Deportivos',   'tenis-deportivos',   'Tenis deportivos con suela amortiguada, cómodos para el día a día.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000022', 'Tacón Clásico',      'talon-clasico',      'Zapatos de tacón para ocasiones especiales, elegantes y cómodos.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000030', 'Mocasín Clásico',    'mocasin-clasico',    'Mocasín de cuero para look casual-elegante, versátil y clásico.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000038', 'Ojotas Verano',      'ojotas-verano',      'Ojotas cómodas para temporada de verano, diseño fresco y ligero.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000003'),
  -- Prendas de Vestir (9)
  ('b0000000-0000-0000-0000-000000000007', 'Vestido Floral',     'vestido-floral',     'Vestido con estampado floral primaveral, ligero y femenino.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000010', 'Chaqueta Denim',     'chaqueta-denim',     'Chaqueta clásica de mezclilla, prenda atemporal para cualquier outfit.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000016', 'Conjunto Casual',    'conjunto-casual',    'Conjunto de dos piezas casual y cómodo, perfecto para el día a día.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000021', 'Blusa Elegante',     'blusa-elegante',     'Blusa de tela ligera con diseño elegante, ideal para oficina o casual.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000025', 'Falda Midi',         'falda-midi',         'Falda midi con caída elegante, versátil para múltiples ocasiones.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000029', 'Chaqueta Seda',      'chaqueta-seda',      'Chaqueta ligera de seda sintética, perfecta para noches frescas.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000033', 'Pantalón Cargo',     'pantalon-cargo',     'Pantalón cargo con múltiples bolsillos, estilo urbano y funcional.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000037', 'Vestido Noche',      'vestido-noche',      'Vestido elegante para eventos nocturnos, diseño sofisticado.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000041', 'Enterizo Floral',    'enterizo-floral',    'Enterizo con estampado floral vibrante, prendedor único y llamativo.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000004'),
  -- Accesorios (8)
  ('b0000000-0000-0000-0000-000000000005', 'Pulsera Marina',     'pulsera-marina',     'Pulsera tejida a mano con detalles marinos, pieza artesanal única.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000009', 'Gafas de Sol',       'gafas-de-sol',       'Gafas de sol protectores con filtro UV, diseño moderno y elegante.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000013', 'Sombrero Bohemio',   'sombrero-bohemio',   'Sombrero de paja con cinta decorativa, estilo bohemio y fresco.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000023', 'Bufanda Primavera',  'bufanda-primavera',  'Bufanda ligera de colores vibrantes, complemento perfecto para primavera.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000028', 'Neceser Viaje',      'neceser-viaje',      'Neceser organizador para viajes, práctica y con múltiples compartimentos.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000031', 'Llavero Premium',    'llavero-premium',    'Llavero con diseño personalizado y acabado premium.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000035', 'Visera Deportiva',   'visera-deportiva',   'Visera ajustable para deporte, ligera y transpirable.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000036', 'Cinto Premium',      'cinto-premium',      'Cinto de cuero con hebilla metálica, clásico y duradero.', 35000, 'COP', true, 'a0000000-0000-0000-0000-000000000001');

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
