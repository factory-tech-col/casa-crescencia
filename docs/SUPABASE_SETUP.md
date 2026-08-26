# Supabase Setup Guide for MIYUKI

Step-by-step instructions to set up Supabase for the MIYUKI e-commerce project.

## Prerequisites

- Supabase account at https://app.supabase.com
- Supabase CLI (optional but recommended)

## Step 1: Create Project

1. Go to [app.supabase.com](https://app.supabase.com) and click **New Project**
2. Choose a region closest to Colombia (**us-east-1** recommended)
3. Set a strong database password (save it securely)
4. Wait for project initialization to complete

## Step 2: Configure Environment

1. Copy `.env.example` to `.env`
2. Go to **Settings → API** in your Supabase dashboard
3. Copy the **Project URL** and paste as `VITE_SUPABASE_URL`
4. Copy the **anon/public key** and paste as `VITE_SUPABASE_ANON_KEY`

## Step 3: Run Migrations

### Option A: Via Supabase Dashboard SQL Editor

1. Go to **SQL Editor** in the Supabase dashboard
2. Run each migration in order:

   ```sql
   -- 1. Initial schema
   -- Paste contents of supabase/migrations/001_initial_schema.sql
   ```

   ```sql
   -- 2. RLS policies
   -- Paste contents of supabase/migrations/002_rls_policies.sql
   ```

   ```sql
   -- 3. Functions
   -- Paste contents of supabase/migrations/003_functions.sql
   ```

   ```sql
   -- 4. Seed data
   -- Paste contents of supabase/migrations/004_seed.sql
   ```

   ```sql
   -- 5. Storage
   -- Paste contents of supabase/migrations/005_storage.sql
   ```

### Option B: Via Supabase CLI

```bash
supabase init          # if not already initialized
supabase db push
```

## Step 4: Configure Auth

1. Go to **Authentication → Providers**
2. Enable **Email/Password** (enabled by default)
3. Configure redirect URLs:
   - `http://localhost:5173/Miyuki/iniciar-sesion`
4. (Optional) Disable email confirmations for development:
   - Go to **Authentication → Providers → Email**
   - Toggle off **Confirm email**

## Step 5: Configure Storage

Storage buckets are created automatically by migration `005_storage.sql`. Verify:

1. Go to **Storage** in the dashboard
2. Confirm `product-images` bucket exists and is **public**
3. Confirm `avatars` bucket exists and is **private**

## Step 6: Create Admin User

1. Go to **Authentication → Users → Add user**
2. Create the first user with email/password
3. After user creation, go to **SQL Editor** and run:

   ```sql
   UPDATE public.profiles
   SET role = 'ADMIN'
   WHERE user_id = (
     SELECT id FROM auth.users WHERE email = 'your-email@example.com'
   );
   ```

## Step 7: Deploy Edge Functions

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy create-order
supabase functions deploy process-payment
supabase functions deploy webhook-handler

# Set secrets
supabase secrets set PAYMENT_MODE=mock
```

## Step 8: Verify

1. Run `npm run dev`
2. Open `http://localhost:5173/Miyuki`
3. Verify products load from Supabase
4. Register a new user
5. Add items to cart
6. Complete checkout flow
7. Verify order appears in admin panel
