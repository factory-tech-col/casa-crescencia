-- ============================================================================
-- Miyuki E-Commerce Database Schema
-- ============================================================================

-- ---------------------
-- updated_at trigger function
-- ---------------------
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------
-- Config
-- ---------------------
create table public.config (
  key text primary key,
  value jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.config is 'Application configuration key-value store';

create trigger set_config_updated_at
  before update on public.config
  for each row execute function public.update_updated_at();

-- ---------------------
-- Profiles
-- ---------------------
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'CUSTOMER'
    check (role in ('CUSTOMER', 'ADMIN', 'SUPER_ADMIN')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.profiles is 'User profile linked to Supabase auth.users';

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- ---------------------
-- Categories
-- ---------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.categories is 'Product categories';

create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.update_updated_at();

-- ---------------------
-- Products
-- ---------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price integer not null check (price > 0),
  currency text not null default 'COP',
  is_active boolean default true,
  category_id uuid references public.categories(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.products is 'Product catalog. Price stored in COP (integer pesos).';

create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.update_updated_at();

-- ---------------------
-- Product Images
-- ---------------------
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order integer default 0,
  is_primary boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.product_images is 'Images associated with products';

create trigger set_product_images_updated_at
  before update on public.product_images
  for each row execute function public.update_updated_at();

-- ---------------------
-- Inventory
-- ---------------------
create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid unique not null references public.products(id) on delete cascade,
  stock integer not null default 0 check (stock >= 0),
  reserved integer not null default 0 check (reserved >= 0),
  check (reserved <= stock),
  updated_at timestamptz default now()
);

comment on table public.inventory is 'Stock levels per product. reserved is held during checkout';

create trigger set_inventory_updated_at
  before update on public.inventory
  for each row execute function public.update_updated_at();

-- ---------------------
-- Addresses
-- ---------------------
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  department text not null,
  postal_code text,
  instructions text,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.addresses is 'Shipping addresses for users';

create trigger set_addresses_updated_at
  before update on public.addresses
  for each row execute function public.update_updated_at();

-- ---------------------
-- Orders
-- ---------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  status text not null default 'PENDING_PAYMENT'
    check (status in (
      'PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'PAID', 'PAYMENT_FAILED',
      'PAYMENT_EXPIRED', 'CANCELLED', 'PROCESSING', 'SHIPPED',
      'DELIVERED', 'REFUNDED'
    )),
  subtotal integer not null,
  shipping_cost integer not null default 0,
  total integer not null,
  currency text not null default 'COP',
  shipping_address jsonb not null,
  notes text,
  idempotency_key text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.orders is 'Customer orders. Amounts in COP integer pesos.';

create trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.update_updated_at();

-- ---------------------
-- Order Items
-- ---------------------
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  product_slug text not null,
  product_image_url text,
  unit_price integer not null,
  quantity integer not null check (quantity > 0),
  subtotal integer not null,
  currency text not null default 'COP',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.order_items is 'Line items within an order';

create trigger set_order_items_updated_at
  before update on public.order_items
  for each row execute function public.update_updated_at();

-- ---------------------
-- Payments
-- ---------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  method text not null
    check (method in ('MOCK', 'PSE', 'NEQUI', 'BRE_B', 'BANK_TRANSFER')),
  status text not null default 'PENDING'
    check (status in ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED')),
  amount integer not null,
  currency text not null default 'COP',
  reference text,
  provider_reference text,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.payments is 'Payment records for orders';

create trigger set_payments_updated_at
  before update on public.payments
  for each row execute function public.update_updated_at();

-- ---------------------
-- Payment Events
-- ---------------------
create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id),
  event_type text not null,
  payload jsonb not null,
  processed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.payment_events is 'Raw webhook/callback events from payment providers';

create trigger set_payment_events_updated_at
  before update on public.payment_events
  for each row execute function public.update_updated_at();

-- ---------------------
-- Audit Log
-- ---------------------
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb,
  ip_address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.audit_log is 'Audit trail for important actions';

create trigger set_audit_log_updated_at
  before update on public.audit_log
  for each row execute function public.update_updated_at();

-- ---------------------
-- Indexes
-- ---------------------
create index idx_products_category_id on public.products(category_id);
create index idx_products_is_active on public.products(is_active);
create index idx_order_items_order_id on public.order_items(order_id);
create index idx_order_items_product_id on public.order_items(product_id);
create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_payments_order_id on public.payments(order_id);
create index idx_payment_events_payment_id on public.payment_events(payment_id);
create index idx_addresses_user_id on public.addresses(user_id);
