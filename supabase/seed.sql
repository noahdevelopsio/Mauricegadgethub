-- Seed data for categories
insert into public.categories (id, name, slug, description, sort_order, is_active)
values 
  ('11111111-1111-1111-1111-111111111111', 'Phones', 'phones', 'Premium smartphones including iPhones and Samsung Galaxy devices', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'Earpods & Audio', 'audio', 'True wireless earbuds, headphones, and Bluetooth speakers', 2, true),
  ('33333333-3333-3333-3333-333333333333', 'Accessories', 'accessories', 'Chargers, cables, cases, and other essential device accessories', 3, true),
  ('44444444-4444-4444-4444-444444444444', 'Gaming & PlayStation', 'gaming', 'PlayStation consoles, controllers, and VR equipment', 4, true),
  ('55555555-5555-5555-5555-555555555555', 'Games', 'games', 'Physical disc games for PS4, PS5, and Xbox', 5, true),
  ('66666666-6666-6666-6666-666666666666', 'Laptops', 'laptops', 'Premium laptops and notebooks for work and gaming', 6, true)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- Seed data for brands
insert into public.brands (id, name, slug, logo_url)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Apple', 'apple', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=200&auto=format&fit=crop'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Samsung', 'samsung', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=200&auto=format&fit=crop'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Sony', 'sony', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=200&auto=format&fit=crop'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Anker', 'anker', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=200&auto=format&fit=crop')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  logo_url = excluded.logo_url;

-- Seed data for products
insert into public.products (id, name, slug, description, category_id, brand_id, base_price, sale_price, sku, stock_quantity, has_variants, specifications, status, is_featured, meta_title, meta_description)
values
  (
    '00000000-0000-0000-0000-000000000001', 
    'iPhone 15 Pro Max', 
    'iphone-15-pro-max', 
    'The iPhone 15 Pro Max has a strong and light titanium design. It features a groundbreaking 48MP main camera, an A17 Pro chip for next-level gaming performance, and a USB-C connector with USB 3 speeds. Perfect for creators and power users alike.', 
    '11111111-1111-1111-1111-111111111111', 
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
    1600000.00, 
    1550000.00, 
    'AP-IP15PM-256', 
    25, 
    true, 
    '{"RAM": "8GB", "Storage": "256GB", "Battery": "4441 mAh", "Screen": "6.7 inches Super Retina XDR", "Processor": "A17 Pro"}', 
    'published', 
    true, 
    'Buy iPhone 15 Pro Max in Lagos, Nigeria - Maurice Gadgets Hub', 
    'Get the titanium iPhone 15 Pro Max with A17 Pro chip and upgraded camera. Best price in Ikeja, Lagos, Nigeria.'
  ),
  (
    '00000000-0000-0000-0000-000000000002', 
    'Samsung Galaxy S24 Ultra', 
    'samsung-galaxy-s24-ultra', 
    'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity, and possibility. Featuring a titanium exterior, built-in S Pen, and a 200MP camera system.', 
    '11111111-1111-1111-1111-111111111111', 
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
    1550000.00, 
    null, 
    'SS-GALS24U-256', 
    15, 
    true, 
    '{"RAM": "12GB", "Storage": "256GB", "Battery": "5000 mAh", "Screen": "6.8 inches Dynamic AMOLED 2X", "Processor": "Snapdragon 8 Gen 3"}', 
    'published', 
    true, 
    'Samsung Galaxy S24 Ultra Price in Nigeria - Maurice Gadgets Hub', 
    'Buy the Samsung Galaxy S24 Ultra with Galaxy AI and S-Pen. Authorized Samsung retailer in Ikeja, Lagos.'
  ),
  (
    '00000000-0000-0000-0000-000000000003', 
    'Sony WF-1000XM5 Noise Canceling Earpods', 
    'sony-wf-1000xm5', 
    'The WF-1000XM5 features cutting-edge technology to deliver premium sound quality and the best truly wireless noise-canceling performance on the market. With real-time audio processors and high-performance mics, you get deep immersion like never before.', 
    '22222222-2222-2222-2222-222222222222', 
    'cccccccc-cccc-cccc-cccc-cccccccccccc', 
    350000.00, 
    null, 
    'SN-WF1000XM5', 
    40, 
    false, 
    '{"Bluetooth": "5.3", "Battery Life": "8 hours (24 hours with case)", "Water Resistance": "IPX4", "Driver Unit": "8.4 mm"}', 
    'published', 
    true, 
    'Sony WF-1000XM5 Wireless Earbuds - Maurice Gadgets Hub', 
    'Experience the best noise-canceling audio with Sony WF-1000XM5 earbuds in Nigeria. Order online today.'
  ),
  (
    '00000000-0000-0000-0000-000000000004', 
    'PlayStation 5 Slim Console', 
    'playstation-5-slim-console', 
    'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio, and an all-new generation of incredible PlayStation games. Slimmer profile with 1TB of storage.', 
    '44444444-4444-4444-4444-444444444444', 
    'cccccccc-cccc-cccc-cccc-cccccccccccc', 
    780000.00, 
    null, 
    'SN-PS5-SLIM', 
    10, 
    false, 
    '{"Storage": "1TB SSD", "Resolution": "4K UHD @ 120Hz", "HDR Support": "Yes", "CPU": "AMD Ryzen Zen 2"}', 
    'published', 
    true, 
    'PlayStation 5 Slim Price in Nigeria - Maurice Gadgets Hub', 
    'Get the new PS5 Slim console with 1TB SSD. Fast delivery within Lagos and pickup available in Ikeja.'
  ),
  (
    '00000000-0000-0000-0000-000000000005', 
    'EA Sports FC 24 (PS5 Game)', 
    'ea-sports-fc-24-ps5', 
    'EA Sports FC 24 is a new era for The Worlds Game: 19,000+ fully licensed players, 700+ teams, and 30+ leagues playing together in the most authentic football experience ever created on PlayStation 5.', 
    '55555555-5555-5555-5555-555555555555', 
    'cccccccc-cccc-cccc-cccc-cccccccccccc', 
    75000.00, 
    68000.00, 
    'SN-FC24-PS5', 
    50, 
    false, 
    '{"Platform": "PlayStation 5", "Genre": "Sports", "Publisher": "EA Sports", "Multiplayer": "Yes (up to 4)"}', 
    'published', 
    false, 
    'EA Sports FC 24 PS5 Disc Game - Maurice Gadgets Hub', 
    'Buy EA Sports FC 24 for PlayStation 5. Physical disc in stock. Immediate pickup in Ikeja.'
  ),
  (
    '00000000-0000-0000-0000-000000000006', 
    'Anker Prime 100W GaN Wall Charger', 
    'anker-prime-100w-gan-charger', 
    'Equipped with 3 charging ports, GaNPrime technology, and ActiveShield 2.0 temperature monitoring, the Anker Prime 100W charger lets you fast charge your phone, laptop, and earbuds simultaneously from a single compact adapter.', 
    '33333333-3333-3333-3333-333333333333', 
    'dddddddd-dddd-dddd-dddd-dddddddddddd', 
    95000.00, 
    null, 
    'AK-PR100W-CHG', 
    30, 
    false, 
    '{"Ports": "2x USB-C, 1x USB-A", "Total Output": "100W max", "Technology": "GaNPrime", "Dimensions": "1.7 x 1.5 x 2.4 in"}', 
    'published', 
    false, 
    'Anker Prime 100W GaN Charger - Maurice Gadgets Hub', 
    'Charge your MacBook, iPhone, and accessories together with the Anker Prime 100W Wall Charger.'
  )
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  category_id = excluded.category_id,
  brand_id = excluded.brand_id,
  base_price = excluded.base_price,
  sale_price = excluded.sale_price,
  sku = excluded.sku,
  stock_quantity = excluded.stock_quantity,
  has_variants = excluded.has_variants,
  specifications = excluded.specifications,
  status = excluded.status,
  is_featured = excluded.is_featured,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description;

-- Seed data for product_images
insert into public.product_images (id, product_id, url, alt_text, sort_order, is_primary)
values
  -- iPhone 15 Pro Max
  ('90000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop', 'iPhone 15 Pro Max Natural Titanium front view', 1, true),
  ('90000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop', 'iPhone side angle preview', 2, false),
  
  -- S24 Ultra
  ('90000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop', 'Samsung Galaxy S24 Ultra showcase view', 1, true),
  
  -- WF-1000XM5
  ('90000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop', 'Sony WF-1000XM5 earpods in black charging case', 1, true),
  
  -- PS5 Slim
  ('90000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=600&auto=format&fit=crop', 'PlayStation 5 console console standing setup', 1, true),
  
  -- FC 24
  ('90000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600&auto=format&fit=crop', 'Video game case render art preview', 1, true),
  
  -- Anker Charger
  ('90000000-0000-0000-0000-000000000061', '00000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop', 'Anker GaN wall charger showing multi-ports', 1, true)
on conflict (id) do update set
  product_id = excluded.product_id,
  url = excluded.url,
  alt_text = excluded.alt_text,
  sort_order = excluded.sort_order,
  is_primary = excluded.is_primary;

-- Seed data for product_variants (only for products with has_variants = true)
insert into public.product_variants (id, product_id, variant_name, attributes, price_override, stock_quantity, sku)
values
  -- iPhone 15 Pro Max
  ('80000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '256GB / Natural Titanium', '{"storage": "256GB", "color": "Natural Titanium"}', null, 10, 'AP-IP15PM-256-NT'),
  ('80000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', '512GB / Natural Titanium', '{"storage": "512GB", "color": "Natural Titanium"}', 1850000.00, 5, 'AP-IP15PM-512-NT'),
  ('80000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', '256GB / Space Black', '{"storage": "256GB", "color": "Space Black"}', null, 10, 'AP-IP15PM-256-SB'),
  
  -- Samsung S24 Ultra
  ('80000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000002', '256GB / Titanium Yellow', '{"storage": "256GB", "color": "Titanium Yellow"}', null, 8, 'SS-GALS24U-256-TY'),
  ('80000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000002', '512GB / Titanium Gray', '{"storage": "512GB", "color": "Titanium Gray"}', 1750000.00, 7, 'SS-GALS24U-512-TG')
on conflict (id) do update set
  product_id = excluded.product_id,
  variant_name = excluded.variant_name,
  attributes = excluded.attributes,
  price_override = excluded.price_override,
  stock_quantity = excluded.stock_quantity,
  sku = excluded.sku;
