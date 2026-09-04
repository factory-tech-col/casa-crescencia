import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Order, OrderStatus } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { formatPrice, formatDateTime } from "@/utils/format";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pago pendiente",
  PAYMENT_PROCESSING: "Procesando pago",
  PAID: "Pagado",
  PAYMENT_FAILED: "Pago fallido",
  PAYMENT_EXPIRED: "Pago expirado",
  CANCELLED: "Cancelado",
  PROCESSING: "En proceso",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  REFUNDED: "Reembolsado",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PAYMENT_PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  PAID: "bg-green-50 text-green-700 border-green-200",
  PAYMENT_FAILED: "bg-red-50 text-red-700 border-red-200",
  PAYMENT_EXPIRED: "bg-gray-50 text-gray-600 border-gray-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  REFUNDED: "bg-orange-50 text-orange-700 border-orange-200",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  NEQUI: "Nequi",
  DAVIPLATA: "Daviplata",
  MOCK: "Simulado",
  PSE: "PSE",
  BRE_B: "Bre-B",
  BANK_TRANSFER: "Transferencia",
};

const ALL_STATUSES: Array<{ value: OrderStatus | ""; label: string }> = [
  { value: "", label: "Todos los estados" },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({
    value: value as OrderStatus,
    label,
  })),
];

type OrderRow = Order & {
  items?: Array<Record<string, unknown>>;
  payment?: { method: string; status: string; receipt_path: string | null } | null;
  customer_name?: string;
};

type OrderWithName = OrderRow & {
  profiles?: { full_name: string | null } | null;
};

export function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [configured] = useState(isSupabaseConfigured());

  useEffect(() => {
    if (!configured || !supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from("orders")
      .select("*, items:order_items(*), payment:payments(*), profiles(full_name)")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setOrders(
            (data as OrderWithName[]).map((o) => ({
              ...o,
              customer_name: o.profiles?.full_name ?? undefined,
            })),
          );
        }
        setLoading(false);
      });
  }, [configured]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter) {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.user_id.toLowerCase().includes(q),
      );
    }
    return result;
  }, [orders, statusFilter, search]);

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
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona los pedidos de la tienda</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Sin conexión a Supabase</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Conecta Supabase para ver pedidos reales. Configura las credenciales en tu archivo .env
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="mt-1 text-sm text-gray-500">Gestiona los pedidos de la tienda</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <label htmlFor="order-search" className="sr-only">Buscar pedidos</label>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            id="order-search"
            type="text"
            placeholder="Buscar por ID o usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oro-500 focus:border-oro-500"
          />
        </div>
        <div className="sm:w-56">
          <label htmlFor="status-filter" className="sr-only">Filtrar por estado</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oro-500 focus:border-oro-500 bg-white"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500" scope="col">Pedido</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500" scope="col">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell" scope="col">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500" scope="col">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500" scope="col">Método</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500" scope="col">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                    </svg>
                    <p className="mt-3 text-sm text-gray-500">
                      {search || statusFilter
                        ? "No se encontraron pedidos con esos filtros"
                        : "No hay pedidos todavía"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/pedidos/${order.id}`}
                        className="font-medium text-oro-600 hover:text-oro-700 hover:underline"
                      >
                        {order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600 truncate max-w-[140px] block" title={order.customer_name ?? order.user_id}>
                        {order.customer_name || order.user_id.slice(0, 8) + "..."}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-gray-500">{formatDateTime(order.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600">
                        {PAYMENT_METHOD_LABELS[order.payment?.method ?? ""] ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                      {formatPrice(order.total)}
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
