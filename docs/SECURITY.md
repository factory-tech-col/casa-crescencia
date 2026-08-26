# Security

## OWASP Considerations

This application addresses OWASP Top 10 risks through:

| Risk | Mitigation |
|------|-----------|
| A01 Broken Access Control | RLS on all 11 tables, role-based policies |
| A02 Cryptographic Failures | Supabase handles TLS, password hashing (bcrypt) |
| A03 Injection | Supabase parameterized queries, Zod input validation |
| A04 Insecure Design | SECURITY DEFINER functions for stock mutations |
| A05 Security Misconfiguration | Environment variables for secrets, no hardcoded keys |
| A07 XSS | React escapes output by default, CSP limited on GitHub Pages |
| A09 Security Logging | `audit_log` table for admin actions |

## Authentication Flow

```
User → Login Page → supabase.auth.signInWithPassword()
       ↓
Supabase returns JWT (access_token + refresh_token)
       ↓
Auth state persisted in browser (supabase-js handles this)
       ↓
All API calls include Authorization: Bearer <token>
       ↓
On auth state change → AuthProvider re-fetches profile from profiles table
```

- Password reset: `supabase.auth.resetPasswordForEmail()` sends email via Supabase.
- Session refresh: Automatic via supabase-js SDK.
- Sign out: Clears local session, resets React state.

### Account Security Notes

- Supabase enforces password minimum length (default 6 characters).
- There is no brute-force protection beyond Supabase defaults.
- No email verification enforcement is configured by default (Supabase can enable this).

## Authorization (RLS + Roles)

### Roles

Defined in `profiles.role` with CHECK constraint:

- **CUSTOMER** — Default. Can browse, purchase, view own orders.
- **ADMIN** — Can manage products, orders, users, categories.
- **SUPER_ADMIN** — Can manage all data including other admins.

Role hierarchy: `CUSTOMER < ADMIN < SUPER_ADMIN`

### RLS Policies

Every table has RLS enabled. Policies are additive (OR logic).

**User-level policies:**
- `profiles`: Users read/update own profile only.
- `addresses`: Full CRUD on own addresses.
- `orders`: Read own orders.
- `order_items`: Read items belonging to own orders.
- `payments`: Read payments for own orders.

**Public read policies:**
- `categories`: Active categories visible to all.
- `products`: Active products visible to all.
- `product_images`: All images visible.
- `inventory`: Stock levels visible.

**Admin policies:**
- Full CRUD on: categories, products, product_images, inventory.
- Read on: all orders, payments, payment_events, audit_log, profiles.

**Restricted:**
- `payment_events`: Admin read only.
- `audit_log`: Admin read only.
- Inventory mutations: Via SECURITY DEFINER functions only.

### `is_admin()` Function

```sql
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and role in ('ADMIN', 'SUPER_ADMIN')
  );
$$;
```

Runs with elevated privileges. Used in RLS policies to check admin status.

## Input Validation

### Frontend (Zod)

All user-facing forms use Zod schemas via `@hookform/resolvers`:

- Registration: email format, password length (8+ chars), full name required.
- Login: email format, password minimum 6 characters.
- Checkout: shipping address fields validated, Colombian phone format (+57/57 prefix), department from whitelist.
- Product forms (admin): name required, price > 0, category selection.

### Edge Functions

Manual validation of:
- Authorization header present.
- Request body structure (items array, address object).
- Item quantities ≥ 1.
- Product IDs validated against database.

## Price Manipulation Prevention

1. **Client-side prices are display-only.** The frontend reads prices from the database/products context.
2. **Order creation** calls the `create_order` RPC function via Edge Function with `service_role` key.
3. The `create_order` function fetches prices from the database — it does not trust client-provided prices.
4. **Order items store `unit_price`** as a snapshot at time of purchase (for historical accuracy).

## Stock Manipulation Prevention

1. Direct UPDATE on `inventory` is blocked for non-admin users via RLS.
2. All stock mutations go through SECURITY DEFINER functions:
   - `create_order`: Reserves stock during order creation.
   - `confirm_payment`: Decrements stock and releases reserved amount.
   - `cancel_order`: Releases reserved stock.
   - `handle_payment_failure`: Releases reserved stock.
3. The `inventory` table tracks both `stock` (total) and `reserved` (held during checkout).
4. Stock is decremented when payment is confirmed (not at order creation).

## File Upload Security

Product images are stored in Supabase Storage or served from `public/productos/`.

- **GitHub Pages path:** Images are copied via `scripts/copy-products.js` from `productos/` to `public/productos/`. Only PNG files are copied.
- **Supabase Storage path:** If used, Supabase Storage policies control access.
- **No user-uploaded content** is currently supported (admin-managed products only).
- **Future:** If user uploads are added, validate MIME types (PNG, JPG, WEBP), enforce file size limits, serve via CDN with signed URLs.

## Webhook Security

Payment provider webhooks require:

1. **Signature verification** — Each provider sends a signature header. The webhook handler must verify it against a shared secret.
   - PayU: HMAC-SHA256 with merchant API key
   - ePayco: MD5 or SHA256 of concatenated secret + trxId + amount
   - Placetopay: SHA256 with integration secret
2. **Idempotency** — Webhook events are stored in `payment_events` with `processed` flag to prevent duplicate processing.
3. **Order status validation** — The handler checks that the transition is valid per `VALID_ORDER_TRANSITIONS`.

> **Current status:** Signature validation is placeholder only. Each provider's signing mechanism is documented but not yet implemented.

## Environment Variables

### Frontend (VITE_ prefix — visible in browser)

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes (or demo mode) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes (or demo mode) |
| `VITE_PAYMENT_MODE` | `mock` or `production` | No (defaults to `mock`) |
| `VITE_BASE_URL` | Site URL for SEO/redirects | No (defaults to GitHub Pages URL) |

### Edge Functions (server-side — never exposed)

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Auto-set by Supabase |
| `SUPABASE_ANON_KEY` | Auto-set by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Elevated DB access (for order creation) |

### Security Rules

- Never commit `.env` files (listed in `.gitignore`).
- `VITE_` variables are embedded in the browser bundle — do not store secrets in them.
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — only use in trusted Edge Functions.
- Rotate keys if they are accidentally exposed.

## Rate Limiting

**Current status:** Not implemented.

Rate limiting should be added for:
- Login attempts (prevent brute-force).
- Order creation (prevent abuse).
- Edge Function calls (cost protection).

Options:
- Supabase Edge Functions have built-in rate limits (100 requests per 10 seconds per user).
- For stricter limits, integrate Upstash Redis or Cloudflare Rate Limiting.

## Security Headers Limitations (GitHub Pages)

GitHub Pages does not support custom HTTP headers. The following headers **cannot** be set:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`

### Mitigations

- React escapes all rendered output (XSS prevention).
- All traffic is HTTPS by default on GitHub Pages.
- If stricter headers are needed, deploy behind Cloudflare or a custom domain with Cloudflare Pages.

## Incident Response

### Key Compromise

1. Rotate Supabase API keys via the Supabase dashboard.
2. All existing sessions will be invalidated.
3. Deploy updated `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the frontend.

### Data Breach

1. Enable Supabase point-in-time recovery (requires paid plan).
2. Review `audit_log` table for unauthorized access.
3. Check `payment_events` for unauthorized webhook calls.
4. Notify affected users as required by Colombian law (Ley 1581 de 2012).

### Unauthorized Admin Access

1. Immediately change the compromised account's role to `CUSTOMER` via Supabase dashboard.
2. Review audit logs for actions taken.
3. Review `SUPER_ADMIN` account security (2FA recommended for Supabase dashboard access).
