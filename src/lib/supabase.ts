import { createClient } from "@supabase/supabase-js";

function readEnv(key: string): string | undefined {
  const raw = import.meta.env[key];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("your-") || trimmed === "undefined") return undefined;
  return trimmed;
}

const supabaseUrl = readEnv("VITE_SUPABASE_URL");
const supabaseAnonKey = readEnv("VITE_SUPABASE_ANON_KEY");

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Casa Crescencia] Supabase no está configurado. Crea un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. Ejecutando en modo demo con datos locales.",
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export const isSupabaseConfigured = (): boolean => supabase !== null;
