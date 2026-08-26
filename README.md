# MIYUKI

Tienda e-commerce profesional para productos seleccionados con envíos a toda Colombia.

## Screenshots

<!-- TODO: Add screenshots here -->
<!-- ![Home](screenshots/home.png) -->
<!-- ![Catalog](screenshots/catalog.png) -->
<!-- ![Checkout](screenshots/checkout.png) -->
<!-- ![Admin](screenshots/admin.png) -->

## Tech Stack

- **Frontend:** React 18.3, TypeScript 5.5, Vite 5.4, Tailwind CSS 3.4
- **Routing:** React Router 6.x
- **Forms:** React Hook Form 7.x + Zod 3.x
- **Backend:** Supabase (Auth, PostgreSQL, Edge Functions, Storage)
- **Testing:** Vitest 2.x, Testing Library 16.x, Playwright 1.x (E2E)
- **Deployment:** GitHub Pages (static) + Supabase (backend)

## Prerequisites

- Node.js 20+
- npm 9+
- A Supabase project ([create one here](https://app.supabase.com))

## Installation

```bash
git clone https://github.com/USUARIO/Miyuki.git
cd Miyuki
npm install
```

## Environment Variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

```env
# Supabase (from https://app.supabase.com > Project Settings > API)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Payment mode: "mock" for development, "production" for real payments
VITE_PAYMENT_MODE=mock

# Base URL for SEO and redirects
VITE_BASE_URL=https://USUARIO.github.io/Miyuki
```

The app runs in **demo mode** with local fallback data if Supabase is not configured.

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com) and create a new project.
2. Note your project URL and anon key from Settings > API.

### 2. Run Database Migrations

In the Supabase SQL Editor, run the migrations in order:

1. Go to SQL Editor in the Supabase dashboard.
2. Run `supabase/migrations/001_initial_schema.sql` — creates all tables.
3. Run `supabase/migrations/002_rls_policies.sql` — enables Row-Level Security.
4. Run `supabase/migrations/003_functions.sql` — creates database functions.
5. Run `supabase/migrations/004_seed.sql` — seeds initial product data.

### 3. Create an Admin User

1. Sign up a user through the app (or Supabase dashboard Auth).
2. In SQL Editor, promote the user:

```sql
UPDATE public.profiles
SET role = 'ADMIN'
WHERE user_id = 'your-user-uuid';
```

### 4. Deploy Edge Functions (Optional)

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy create-order
supabase functions deploy process-payment
supabase functions deploy webhook-handler
```

## Running Locally

```bash
npm run dev
```

The app starts at `http://localhost:5173/Miyuki/`.

## Build and Deploy

### Build

```bash
npm run build
```

Output goes to `dist/`.

### Preview Build

```bash
npm run preview
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | TypeScript compile + Vite build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run Playwright E2E tests with UI |
| `npm run format` | Format code with Prettier |
| `npm run copy-products` | Copy product PNGs to public/ |

## GitHub Pages Setup

1. Push to a GitHub repository.
2. Go to Settings > Pages.
3. Set Source to **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` will build and deploy on every push to `main`.

### GitHub Actions Workflow

The CI/CD pipeline:

1. **build-and-test** — Checkout, install, lint, typecheck, test, build, upload artifact.
2. **deploy** — Download artifact, deploy to GitHub Pages.

Requires these repository secrets (none needed for basic deployment — Supabase keys are in `.env` at build time via VITE_ prefix, or can be set as GitHub Actions secrets if preferred).

## Payment Configuration

See [docs/PAYMENTS.md](docs/PAYMENTS.md) for full details.

**Development:** Uses mock payment provider (no real money).

**Production** requires:
- Custom domain with SSL
- Payment processor account (PayU, ePayco, etc.)
- Supabase production project

```env
VITE_PAYMENT_MODE=mock        # Development
VITE_PAYMENT_MODE=production   # Production (requires provider setup)
```

## Admin Setup

1. Create a user account.
2. Promote to ADMIN via SQL:

```sql
UPDATE public.profiles
SET role = 'ADMIN'
WHERE user_id = '<user-id>';
```

3. Navigate to `/admin` to access the admin panel.

Admin features:
- Dashboard with overview
- Product management (CRUD)
- Order management with status transitions
- User management
- Category management
- Audit log

## Project Structure

```
src/
├── components/      # Reusable UI components
│   ├── layout/      # Header, Footer, Layout
│   ├── seo/         # Meta tag components
│   └── ui/          # Generic UI primitives
├── config/          # Environment, routes
├── features/        # Feature modules
│   ├── auth/        # Authentication (AuthProvider, ProtectedRoute)
│   ├── cart/        # Shopping cart (CartProvider, localStorage)
│   └── products/    # Products (ProductsProvider)
├── hooks/           # Custom React hooks
├── lib/             # Supabase client, constants, fallback data
├── pages/           # Route-level components
│   └── admin/       # Admin panel pages
├── styles/          # Global CSS
├── types/           # TypeScript types
└── utils/           # Helpers (format, validation, SEO)

supabase/
├── functions/       # Edge Functions (Deno)
│   ├── create-order/
│   ├── process-payment/
│   └── webhook-handler/
└── migrations/      # SQL schema, RLS, functions, seed data

tests/
├── unit/            # Unit tests
├── integration/     # Integration tests
└── setup.ts         # Test setup
```

## Testing

The project has 130 tests across unit and integration suites:

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
npm run test:e2e          # Playwright E2E
```

## Contributing

1. Create a feature branch from `main`.
2. Make your changes.
3. Run lint, typecheck, and tests:

```bash
npm run lint
npm run typecheck
npm run test
```

4. Commit with a clear message.
5. Open a pull request against `main`.

### Code Standards

- TypeScript strict mode — no `any` types.
- ESLint with zero warnings allowed.
- All forms validated with Zod schemas.
- Component files use PascalCase.
- Utility/hook files use camelCase.
- No comments in code unless specifically requested.

## License

MIT
