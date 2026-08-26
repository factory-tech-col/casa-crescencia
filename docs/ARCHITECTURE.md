# Architecture

## Tech Stack

| Layer         | Technology              | Version |
|---------------|-------------------------|---------|
| UI            | React                   | 18.3    |
| Language      | TypeScript              | 5.5     |
| Bundler       | Vite                    | 5.4     |
| Styling       | Tailwind CSS            | 3.4     |
| Routing       | React Router            | 6.x     |
| Forms         | React Hook Form + Zod   | 7.x / 3.x |
| SEO           | react-helmet-async      | 2.x     |
| Backend       | Supabase (hosted)       | 2.45 JS |
| Database      | PostgreSQL              | 15      |
| Edge Runtime  | Deno (Supabase Edge)    | —       |
| Unit Tests    | Vitest + Testing Library| 2.x / 16.x |
| E2E Tests     | Playwright              | 1.x     |
| CI/CD         | GitHub Actions          | —       |

## Project Structure

```
Miyuki/
├── .github/workflows/    # CI/CD (deploy.yml)
├── docs/                 # Architecture, security, payment docs
├── e2e/                  # Playwright end-to-end tests
├── public/               # Static assets served by Vite
│   ├── favicon.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── productos/        # Product images (copied by script)
├── scripts/
│   └── copy-products.js  # Copies PNGs to public/
├── src/
│   ├── components/
│   │   ├── layout/       # Header, Footer, Layout
│   │   ├── seo/          # <Helmet> wrappers
│   │   └── ui/           # Reusable primitives (Loading, ProductCard)
│   ├── config/
│   │   ├── env.ts        # Environment variable access
│   │   └── routes.ts     # Route definitions
│   ├── features/
│   │   ├── auth/         # AuthProvider, ProtectedRoute
│   │   ├── cart/         # CartProvider (localStorage)
│   │   └── products/     # ProductsProvider (Supabase / fallback)
│   ├── hooks/            # useLocalStorage, useDebounce
│   ├── lib/
│   │   ├── constants.ts  # Site-wide constants
│   │   ├── products-data.ts  # Fallback product data
│   │   └── supabase.ts   # Supabase client singleton
│   ├── pages/            # Route-level components
│   │   └── admin/        # Admin panel pages
│   ├── styles/
│   │   └── globals.css   # Tailwind directives + base styles
│   ├── types/            # TypeScript interfaces and types
│   └── utils/            # format.ts, validation.ts, seo.ts
├── supabase/
│   ├── functions/        # Edge Functions (Deno)
│   │   ├── create-order/
│   │   ├── process-payment/
│   │   └── webhook-handler/
│   └── migrations/       # SQL schema + RLS policies
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       ├── 003_functions.sql
│       └── 004_seed.sql
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── setup.ts          # Test setup (jsdom)
├── index.html            # Vite entry point
├── vite.config.ts        # Vite configuration
├── vitest.config.ts      # Vitest configuration
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## Frontend Architecture

Single-page application served as static files from GitHub Pages.

```
index.html
  └─ main.tsx
       ├─ <HelmetProvider>
       ├─ <BrowserRouter basename="/Miyuki">
       │    ├─ <AuthProvider>       # Supabase auth state
       │    │    └─ <CartProvider>   # localStorage cart state
       │    │         └─ <App>       # Route definitions
       │    └─ (nested routes)
       └─ </BrowserRouter>
```

### Provider Hierarchy

- **AuthProvider** — Wraps entire app. Provides user session, sign-in/out, role checks.
- **CartProvider** — Wraps entire app. Manages cart in localStorage, calculates totals with free shipping threshold.
- **ProductsProvider** — Wraps `<Routes>`. Fetches products from Supabase or falls back to local data.

### Routing

All routes use Spanish slugs (e.g., `/productos`, `/carrito`). Route constants are centralized in `src/config/routes.ts`.

Public routes: `/`, `/productos`, `/productos/:slug`, `/carrito`, `/checkout`, `/iniciar-sesion`, `/crear-cuenta`, `/olvide-contrasena`, `/contacto`, `/terminos`, `/privacidad`, `/envios`, `/cambios-devoluciones`

Protected routes: `/perfil`, `/pedidos`, `/pedidos/:id`, `/pedido-confirmado`

Admin routes: `/admin`, `/admin/productos`, `/admin/pedidos`, `/admin/usuarios`, `/admin/categorias`, `/admin/auditoria`

## Backend Architecture (Supabase)

### Authentication

Supabase Auth with email/password. Session tokens are JWTs. Client SDK handles token refresh automatically.

### Database

PostgreSQL with the following tables:

| Table            | Purpose                                      |
|------------------|----------------------------------------------|
| `profiles`       | User profiles, linked to `auth.users`         |
| `categories`     | Product categories (active/inactive)          |
| `products`       | Product catalog, price in COP minor units     |
| `product_images` | Image URLs per product                       |
| `inventory`      | Stock levels (stock, reserved)                |
| `addresses`      | User shipping addresses                      |
| `orders`         | Order headers with status transitions         |
| `order_items`    | Line items within orders                     |
| `payments`       | Payment records per order                    |
| `payment_events` | Raw webhook/callback events                  |
| `audit_log`      | Audit trail for admin actions                |

### Row-Level Security

RLS is enabled on all 11 tables. Policies enforce:

- Users can only read/update their own profile, addresses, and orders.
- Admins can read/write all data via the `is_admin()` function.
- Product and category reads are public (active items only).
- Inventory mutations go through `SECURITY DEFINER` functions (`create_order`, `confirm_payment`, `cancel_order`, `handle_payment_failure`).

### Database Functions

| Function | Purpose |
|----------|---------|
| `handle_new_user()` | Trigger: auto-create profile on new user signup |
| `create_order()` | Create order with stock reservation and idempotency |
| `confirm_payment()` | Confirm payment, update order status, decrement stock |
| `cancel_order()` | Cancel order and release reserved stock |
| `handle_payment_failure()` | Handle failed payment and release reserved stock |

### Edge Functions

Deno-based functions deployed to Supabase:

- `create-order` — Validates items, reserves stock, creates order + order_items via RPC.
- `process-payment` — Processes payment via mock or external provider.
- `webhook-handler` — Receives payment provider callbacks and updates order status.

## Data Flow

```
┌─────────────┐     HTTP/JWT      ┌──────────────────┐
│   Browser   │ ◄──────────────►  │   Supabase API   │
│  (React)    │                   │  (PostgREST +    │
│             │                   │   Auth + Edge)   │
└──────┬──────┘                   └────────┬─────────┘
       │                                   │
       │ localStorage                      │ PostgreSQL
       │ (cart data)                       │ (all data)
       │                                   │
  ┌────┴────┐                       ┌──────┴──────┐
  │  Cart   │                       │  Database   │
  └─────────┘                       └─────────────┘

Customer Flow:
  Browse → Add to Cart → Checkout → Auth → Order Created → Payment → Confirmation

Admin Flow:
  Login → Admin Panel → CRUD Products/Orders/Users → Audit Log
```

## Security Architecture

- **RLS**: All tables have Row-Level Security. Users can only access their own data.
- **JWT**: Supabase issues JWTs. The frontend sends them as `Authorization: Bearer <token>`.
- **Edge Functions**: Use `SUPABASE_SERVICE_ROLE_KEY` for elevated operations (creating orders).
- **Input Validation**: Zod schemas on the frontend, manual validation in Edge Functions.
- **Order Status Transitions**: Defined in `VALID_ORDER_TRANSITIONS`, enforced in Edge Functions.
- **Price Integrity**: Prices are fetched from the database at order creation time, not from client input.
- **Stock**: Managed via `inventory` table with stock/reserved pattern. Stock is reserved during order creation and decremented when payment is confirmed.

## Payment Architecture

Provider pattern with mock/production modes:

```
PaymentProvider (interface)
  ├── MockPaymentProvider     # Development/testing — simulates success
  ├── PSEProvider             # Requires authorized payment processor
  ├── NequiProvider           # Requires Nequi API access
  ├── Bre-BProvider           # Manual verification flow
  └── BankTransferProvider    # Admin-configurable payment info
```

Controlled by `VITE_PAYMENT_MODE` environment variable (`mock` or `production`).

See [PAYMENTS.md](./PAYMENTS.md) for details.

## Deployment

### Frontend — GitHub Pages

- Static files built by Vite (`npm run build` → `dist/`).
- Deployed via GitHub Actions on push to `main`.
- SPA routing handled by React Router (all routes fall back to `index.html`).
- `base: "/Miyuki/"` in vite.config.ts sets the correct asset paths.

### Backend — Supabase

- Hosted Supabase project (free tier available).
- Schema deployed via SQL migrations (001-004).
- Edge Functions deployed via `supabase functions deploy`.
- Environment variables stored in Supabase dashboard (for Edge Functions) and `.env` (for frontend).

### Limitations

- GitHub Pages does not support server-side rendering or custom security headers.
- No edge caching for static assets beyond GitHub's CDN.
- Supabase free tier has connection and bandwidth limits.

## Future Migration Paths

1. **Custom domain + SSL** — Required for production (payment provider compliance).
2. **Edge function hosting** — Migrate from Supabase Edge Functions to Cloudflare Workers or Railway for more control.
3. **Email service** — Integrate Resend or SendGrid for transactional emails.
4. **CDN** — Cloudflare or Bunny CDN for product images.
5. **Monitoring** — Sentry or similar for error tracking.
6. **Analytics** — Plausible or Umami for privacy-friendly analytics.
