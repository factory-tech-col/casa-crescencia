// NOTE: Environment variables are also read directly in supabase.ts and constants.ts
export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  paymentMode: (import.meta.env.VITE_PAYMENT_MODE as string) || "mock",
  baseUrl: (import.meta.env.VITE_BASE_URL as string) || "https://USUARIO.github.io/Miyuki",
} as const;
