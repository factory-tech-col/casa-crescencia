-- ============================================================================
-- Row-Level Security Policies
-- ============================================================================

-- ---------------------
-- Enable RLS on all tables
-- ---------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;
alter table public.audit_log enable row level security;
alter table public.config enable row level security;

-- ---------------------
-- Helper: check if current user is admin or super_admin
-- ---------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and role in ('ADMIN', 'SUPER_ADMIN')
  );
$$;

-- ---------------------
-- Trigger: prevent non-admins from changing role column
-- ---------------------
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'update') then
    if (new.role is distinct from old.role) then
      if not public.is_admin() then
        raise exception 'Only administrators can change user roles';
      end if;
    end if;
  end if;
  return new;
end;
$$;

create trigger prevent_profiles_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- ============================================================================
-- CONFIG
-- ============================================================================

create policy "config_select_anon"
  on public.config for select
  using (true);

create policy "config_select_auth"
  on public.config for select
  using (auth.uid() is not null);

create policy "config_insert_admin"
  on public.config for insert
  with check (public.is_admin());

create policy "config_update_admin"
  on public.config for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "config_delete_admin"
  on public.config for delete
  using (public.is_admin());

-- ============================================================================
-- PROFILES
-- ============================================================================

-- Users can read their own profile
create policy "profiles_select_own"
  on public.profiles for select
  using (user_id = auth.uid());

-- Admins can read all profiles
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin());

-- Users can update their own profile (non-role columns only)
create policy "profiles_update_own"
  on public.profiles for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and (
      role = (select p.role from public.profiles p where p.id = profiles.id)
      or public.is_admin()
    )
  );

-- Admins can update any profile
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- CATEGORIES
-- ============================================================================

-- Public read for active categories
create policy "categories_select_public"
  on public.categories for select
  using (is_active = true);

-- Admins can read all categories (including inactive)
create policy "categories_select_admin"
  on public.categories for select
  using (public.is_admin());

-- Admins can insert
create policy "categories_insert_admin"
  on public.categories for insert
  with check (public.is_admin());

-- Admins can update
create policy "categories_update_admin"
  on public.categories for update
  using (public.is_admin())
  with check (public.is_admin());

-- Admins can delete
create policy "categories_delete_admin"
  on public.categories for delete
  using (public.is_admin());

-- ============================================================================
-- PRODUCTS
-- ============================================================================

-- Public read for active products
create policy "products_select_public"
  on public.products for select
  using (is_active = true);

-- Admins can read all products
create policy "products_select_admin"
  on public.products for select
  using (public.is_admin());

-- Admins can insert
create policy "products_insert_admin"
  on public.products for insert
  with check (public.is_admin());

-- Admins can update
create policy "products_update_admin"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());

-- Admins can delete
create policy "products_delete_admin"
  on public.products for delete
  using (public.is_admin());

-- ============================================================================
-- PRODUCT IMAGES
-- ============================================================================

-- Public read only for images of active products
create policy "product_images_select_public"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products
      where products.id = product_images.product_id
        and products.is_active = true
    )
  );

-- Admins can read all product images
create policy "product_images_select_admin"
  on public.product_images for select
  using (public.is_admin());

-- Admins can insert
create policy "product_images_insert_admin"
  on public.product_images for insert
  with check (public.is_admin());

-- Admins can update
create policy "product_images_update_admin"
  on public.product_images for update
  using (public.is_admin())
  with check (public.is_admin());

-- Admins can delete
create policy "product_images_delete_admin"
  on public.product_images for delete
  using (public.is_admin());

-- ============================================================================
-- INVENTORY
-- ============================================================================

-- Public read only for active products
create policy "inventory_select_public"
  on public.inventory for select
  using (
    exists (
      select 1 from public.products
      where products.id = inventory.product_id
        and products.is_active = true
    )
  );

-- Admins can read all inventory
create policy "inventory_select_admin"
  on public.inventory for select
  using (public.is_admin());

-- Admins can insert
create policy "inventory_insert_admin"
  on public.inventory for insert
  with check (public.is_admin());

-- Admins can update
create policy "inventory_update_admin"
  on public.inventory for update
  using (public.is_admin())
  with check (public.is_admin());

-- Customers interact with inventory only through SECURITY DEFINER functions
-- (create_order, confirm_payment, cancel_order, handle_payment_failure)

-- ============================================================================
-- ADDRESSES
-- ============================================================================

-- Users can read their own addresses
create policy "addresses_select_own"
  on public.addresses for select
  using (user_id = auth.uid());

-- Users can insert their own addresses
create policy "addresses_insert_own"
  on public.addresses for insert
  with check (user_id = auth.uid());

-- Users can update their own addresses
create policy "addresses_update_own"
  on public.addresses for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Users can delete their own addresses
create policy "addresses_delete_own"
  on public.addresses for delete
  using (user_id = auth.uid());

-- ============================================================================
-- ORDERS
-- ============================================================================

-- Users can read their own orders
create policy "orders_select_own"
  on public.orders for select
  using (user_id = auth.uid());

-- Admins can read all orders
create policy "orders_select_admin"
  on public.orders for select
  using (public.is_admin());

-- ============================================================================
-- ORDER ITEMS
-- ============================================================================

-- Users can read order items for their own orders
create policy "order_items_select_own"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

-- Admins can read all order items
create policy "order_items_select_admin"
  on public.order_items for select
  using (public.is_admin());

-- ============================================================================
-- PAYMENTS
-- ============================================================================

-- Users can read payments for their own orders
create policy "payments_select_own"
  on public.payments for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = payments.order_id
        and orders.user_id = auth.uid()
    )
  );

-- Admins can read all payments
create policy "payments_select_admin"
  on public.payments for select
  using (public.is_admin());

-- ============================================================================
-- PAYMENT EVENTS
-- ============================================================================

-- Admin read only
create policy "payment_events_select_admin"
  on public.payment_events for select
  using (public.is_admin());

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

-- Admin read only
create policy "audit_log_select_admin"
  on public.audit_log for select
  using (public.is_admin());
