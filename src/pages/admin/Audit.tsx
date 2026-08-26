import { useState, useEffect } from "react";
import type { AuditLog } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { formatDateTime } from "@/utils/format";

export function AdminAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured] = useState(isSupabaseConfigured());

  useEffect(() => {
    if (!configured || !supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (!error && data) {
          setLogs(data as AuditLog[]);
        }
        setLoading(false);
      });
  }, [configured]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-miyuki-600" />
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Auditoría</h1>
          <p className="mt-1 text-sm text-gray-500">Registro de acciones en el sistema</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Sin conexión a Supabase</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Conecta Supabase para ver el registro de auditoría. Configura las credenciales en tu archivo .env
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Auditoría</h1>
        <p className="mt-1 text-sm text-gray-500">Registro de acciones en el sistema</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500" scope="col">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500" scope="col">Usuario</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500" scope="col">Acción</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell" scope="col">Entidad</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell" scope="col">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    <p className="mt-3 text-sm text-gray-500">No hay registros de auditoría</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-gray-500 whitespace-nowrap">{formatDateTime(log.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600 font-mono text-xs" title={log.user_id}>
                        {log.user_id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-gray-600">
                        {log.entity_type}
                        {log.entity_id && (
                          <span className="text-gray-400 ml-1 font-mono text-xs">
                            ({log.entity_id.slice(0, 8)}...)
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-gray-500 text-xs max-w-[200px] truncate block">
                        {log.metadata ? JSON.stringify(log.metadata) : "—"}
                      </span>
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
