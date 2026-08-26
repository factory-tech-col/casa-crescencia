# MIYUKI Security Model

Overview of the security architecture enforced at the database level via Supabase.

## Row Level Security (RLS)

All 11+ tables have RLS enabled. Access is controlled by database policies:

| Role | Access |
|------|--------|
| Anonymous | Read-only access to active products and categories |
| Authenticated (CUSTOMER) | Read/write own profile, orders, addresses |
| Admin (ADMIN / SUPER_ADMIN) | Full CRUD on products, categories, inventory, users |

## Role Hierarchy

- **CUSTOMER** — default role for all new users
- **ADMIN** — can manage products, categories, orders, users
- **SUPER_ADMIN** — can manage other admins (reserved for founders)

## Privilege Escalation Prevention

- Database trigger prevents non-admins from changing the `role` column on `profiles`
- RLS policies check role server-side via `is_admin()` — a `SECURITY DEFINER` function
- Frontend role checks are display-only, not security controls
- Admin operations use the anon key, protected entirely by RLS

## Order Security

- `create_order` recalculates all prices server-side (client prices are ignored)
- Stock reservation uses `SELECT FOR UPDATE` to prevent race conditions
- Maximum quantity per item: 10
- Maximum items per order: 20
- Idempotency keys prevent duplicate orders

## Payment Security

- Payment amounts are verified against order totals
- Mock payment mode only in development (`VITE_PAYMENT_MODE=mock`)
- Webhook signature validation (placeholder, to be implemented)
- All payment events logged in `payment_events` audit trail

## Threats Considered

| Threat | Mitigation |
|--------|------------|
| Price manipulation from client | Server-side price recalculation in `create_order` |
| Overselling (race condition) | `SELECT FOR UPDATE` row-level locking |
| Role escalation | Database trigger blocks non-admin role changes |
| Unauthorized admin access | RLS policies enforce role checks server-side |
| Duplicate payments | Idempotency key checks before order creation |
| Race conditions on stock | `FOR UPDATE` locking on inventory rows |
