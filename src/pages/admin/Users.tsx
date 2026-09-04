import { useState, useEffect, useMemo } from "react";
import type { Profile, UserRole } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { formatDate } from "@/utils/format";

const ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: "Cliente",
  ADMIN: "Administrador",
  SUPER_ADMIN: "Super Admin",
};

const ROLE_COLORS: Record<UserRole, string> = {
  CUSTOMER: "bg-gray-100 text-gray-700 border-gray-200",
  ADMIN: "bg-blue-50 text-blue-700 border-blue-200",
  SUPER_ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
};

export function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [configured] = useState(isSupabaseConfigured());

  useEffect(() => {
    if (!configured || !supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setUsers(data as Profile[]);
        }
        setLoading(false);
      });
  }, [configured]);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(q) ||
        u.user_id.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    );
  }, [users, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-oro-600" />
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona usuarios y roles del sistema</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Sin conexión a Supabase</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Conecta Supabase para ver los usuarios reales. Configura las credenciales en tu archivo .env
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="mt-1 text-sm text-gray-500">Gestiona usuarios y roles del sistema</p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <label htmlFor="user-search" className="sr-only">Buscar usuarios</label>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            id="user-search"
            type="text"
            placeholder="Buscar por nombre, ID o rol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oro-500 focus:border-oro-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500" scope="col">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500" scope="col">ID Usuario</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500" scope="col">Rol</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell" scope="col">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                    </svg>
                    <p className="mt-3 text-sm text-gray-500">
                      {search ? "No se encontraron usuarios con esos criterios" : "No hay usuarios registrados"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-oro-100 flex items-center justify-center text-oro-700 font-medium text-xs shrink-0">
                          {user.full_name?.charAt(0) ?? user.role.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 truncate max-w-[160px]">
                          {user.full_name ?? "Sin nombre"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-500 font-mono text-xs" title={user.user_id}>
                        {user.user_id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[user.role]}`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-gray-500">{formatDate(user.created_at)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
