import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Profile, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_NOT_CONFIGURED_MSG =
  "Supabase no está configurado. Crea un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (consulta .env.example).";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured()) {
      setProfile(null);
      return;
    }
    try {
      const { data, error } = await supabase!.from("profiles").select("*").eq("user_id", userId).single();
      if (error) throw error;
      setProfile(data as Profile);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    supabase!.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) return { error: AUTH_NOT_CONFIGURED_MSG };
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured()) return { error: AUTH_NOT_CONFIGURED_MSG };
    const { error } = await supabase!.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error?.message || null };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    await supabase!.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured()) return { error: AUTH_NOT_CONFIGURED_MSG };
    const { error } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/Miyuki/iniciar-sesion`,
    });
    return { error: error?.message || null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!isSupabaseConfigured()) return { error: AUTH_NOT_CONFIGURED_MSG };
    const { error } = await supabase!.auth.updateUser({ password: newPassword });
    return { error: error?.message || null };
  }, []);

  const hasRole = useCallback(
    (role: UserRole) => {
      if (!profile) return false;
      if (role === "CUSTOMER") return true;
      if (role === "ADMIN") return profile.role === "ADMIN" || profile.role === "SUPER_ADMIN";
      if (role === "SUPER_ADMIN") return profile.role === "SUPER_ADMIN";
      return false;
    },
    [profile],
  );

  const isAdmin = hasRole("ADMIN");
  const isSuperAdmin = hasRole("SUPER_ADMIN");

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        hasRole,
        isAdmin,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
