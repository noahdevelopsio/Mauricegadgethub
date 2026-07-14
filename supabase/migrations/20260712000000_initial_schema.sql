-- Create custom types / extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin', 'staff')),
  created_at timestamptz not null default now()
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- 2. CATEGORIES table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  parent_id uuid references public.categories(id) on delete set null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Enable RLS for categories
alter table public.categories enable row level security;

-- 3. BRANDS table
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  created_at timestamptz not null default now()
);

-- Enable RLS for brands
alter table public.brands enable row level security;

-- 4. PRODUCTS table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text not null,
  category_id uuid not null references public.categories(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete set null,
  base_price numeric(12,2) not null,
  sale_price numeric(12,2),
  sku text unique,
  stock_quantity int not null default 0,
  has_variants boolean not null default false,
  specifications jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS for products
alter table public.products enable row level security;

-- 5. PRODUCT IMAGES table
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable RLS for product_images
alter table public.product_images enable row level security;

-- 6. PRODUCT VARIANTS table
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_name text not null,
  attributes jsonb not null default '{}'::jsonb,
  price_override numeric(12,2),
  stock_quantity int not null default 0,
  sku text unique,
  created_at timestamptz not null default now()
);

-- Enable RLS for product_variants
alter table public.product_variants enable row level security;

-- 7. ORDERS table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  guest_email text,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  delivery_method text not null check (delivery_method in ('pickup', 'delivery')),
  delivery_address text,
  delivery_fee numeric(12,2) not null default 0,
  subtotal numeric(12,2) not null,
  total numeric(12,2) not null,
  status text not null default 'pending_payment' check (status in ('pending_payment', 'paid', 'payment_failed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  tx_ref text unique not null,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS for orders
alter table public.orders enable row level security;

-- 8. ORDER ITEMS table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name_snapshot text not null,
  unit_price_snapshot numeric(12,2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(12,2) not null,
  created_at timestamptz not null default now()
);

-- Enable RLS for order_items
alter table public.order_items enable row level security;

-- 9. TRANSACTIONS table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  flw_transaction_id text unique not null,
  tx_ref text not null,
  amount numeric(12,2) not null,
  currency text not null default 'NGN',
  status text not null check (status in ('successful', 'failed', 'pending')),
  payment_type text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS for transactions
alter table public.transactions enable row level security;

-- 10. STORE SETTINGS table
create table if not exists public.store_settings (
  id int primary key default 1 check (id = 1),
  store_name text not null,
  logo_url text,
  contact_phone text,
  contact_email text,
  whatsapp_number text,
  address text,
  flat_delivery_fee numeric(12,2) not null default 0,
  free_delivery_threshold numeric(12,2),
  hero_banner_url text,
  hero_banner_text text,
  social_links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS for store_settings
alter table public.store_settings enable row level security;

-- Indexes
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_transactions_order on public.transactions(order_id);
create index if not exists idx_transactions_tx_ref on public.transactions(tx_ref);
create index if not exists idx_products_specifications on public.products using gin(specifications);

-- Helper security definer function to avoid infinite recursion on public.profiles
create or replace function public.is_admin_or_staff()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
end;
$$ language plpgsql security definer;

-- Profiles Policies
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins and staff can view all profiles" on public.profiles for select using (public.is_admin_or_staff());
create policy "Admins and staff can update all profiles" on public.profiles for update using (public.is_admin_or_staff());

-- Categories Policies
create policy "Public can view active categories" on public.categories for select using (is_active = true or public.is_admin_or_staff());
create policy "Admins and staff can manage categories" on public.categories for all using (public.is_admin_or_staff());

-- Brands Policies
create policy "Public can view brands" on public.brands for select using (true);
create policy "Admins and staff can manage brands" on public.brands for all using (public.is_admin_or_staff());

-- Products Policies
create policy "Public can view published products" on public.products for select using (status = 'published' or public.is_admin_or_staff());
create policy "Admins and staff can manage products" on public.products for all using (public.is_admin_or_staff());

-- Product Images Policies
create policy "Public can view product images" on public.product_images for select using (
  exists (
    select 1 from public.products
    where products.id = product_id and (products.status = 'published' or public.is_admin_or_staff())
  )
);
create policy "Admins and staff can manage product images" on public.product_images for all using (public.is_admin_or_staff());

-- Product Variants Policies
create policy "Public can view product variants" on public.product_variants for select using (true);
create policy "Admins and staff can manage product variants" on public.product_variants for all using (public.is_admin_or_staff());

-- Orders Policies
create policy "Users can view their own orders" on public.orders for select using (
  user_id = auth.uid() or public.is_admin_or_staff()
);
create policy "Anyone can create orders" on public.orders for insert with check (true);
create policy "Admins and staff can update orders" on public.orders for update using (public.is_admin_or_staff());

-- Order Items Policies
create policy "Users can view their own order items" on public.order_items for select using (
  exists (
    select 1 from public.orders
    where orders.id = order_id and (orders.user_id = auth.uid() or public.is_admin_or_staff())
  )
);
create policy "Anyone can create order items" on public.order_items for insert with check (true);
create policy "Admins and staff can manage order items" on public.order_items for all using (public.is_admin_or_staff());

-- Transactions Policies
create policy "Admins and staff can view transactions" on public.transactions for select using (public.is_admin_or_staff());
-- Note: all transaction writes are done via the service-role client (which bypasses RLS). No public write policies exist.

-- Store Settings Policies
create policy "Public can view store settings" on public.store_settings for select using (true);
create policy "Admins can manage store settings" on public.store_settings for all using (public.is_admin_or_staff());

-- Triggers for Order Number Generation
create sequence if not exists public.orders_seq start with 1;

create or replace function public.generate_order_number()
returns trigger as $$
begin
  if new.order_number is null then
    new.order_number := 'MGH-' || lpad(nextval('public.orders_seq')::text, 6, '0');
  end if;
  return new;
end;
$$ language plpgsql;

create or replace trigger set_order_number
  before insert on public.orders
  for each row
  execute procedure public.generate_order_number();

-- Profile Trigger for Auth Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'customer'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed store_settings
insert into public.store_settings (id, store_name, flat_delivery_fee)
values (1, 'Maurice Gadgets Hub', 2500.00)
on conflict (id) do nothing;
