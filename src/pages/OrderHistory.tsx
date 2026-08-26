import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Order } from "@/types";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { useAuth } from "@/features/auth/AuthProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { formatPrice, formatDate } from "@/utils/format";
import { SEO } from "@/components/seo/SEO";

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pago pendiente",
  PAYMENT_PROCESSING: "Procesando",
  PAID: "Pagado",
  PAYMENT_FAILED: "Pago fallido",
  PAYMENT_EXPIRED: "Pago expirado",
  CANCELLED: "Cancelado",
  PROCESSING: "En proceso",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  REFUNDED: "Reembolsado",
};

const STATUS_COLORS: Record<string, string> = {
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

type OrderWithItems = Order & { items?: Array<Record<string, unknown>> };

function OrderHistoryContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured] = useState(isSupabaseConfigured());

  useEffect(() => {
    if (!configured || !supabase || !user) {
      setLoading(false);
      return;
    }

    supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setOrders(data as OrderWithItems[]);
        }
        setLoading(false);
      });
  }, [configured, user]);

  if (loading) {
    return (
      <div className="container-custom py-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Mis Pedidos</h1>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-miyuki-600" />
        </div>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="container-custom py-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Mis Pedidos</h1>
        <div className="text-center py-16">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Conecta Supabase para ver tu historial</h2>
          <p className="text-gray-500 mb-8">
            Configura las credenciales de Supabase en tu archivo .env para ver tus pedidos.
          </p>
          <Link to="/productos" className="btn-primary">
            Explorar productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Mis Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Aún no tienes pedidos</h2>
          <p className="text-gray-500 mb-8">
            Cuando realices tu primera compra, aparecerá aquí.
          </p>
          <Link to="/productos" className="btn-primary">
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/pedidos/${order.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-miyuki-300 hover:shadow-sm transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-gray-900">
                      Pedido #{order.id.slice(0, 8)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatDate(order.created_at)}</span>
                    <span>{order.items?.length ?? 0} {(order.items?.length ?? 0) === 1 ? "artículo" : "artículos"}</span>
                  </div>
                </div>
                <div className="text-right sm:ml-4">
                  <span className="text-lg font-semibold text-gray-900">{formatPrice(order.total)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrderHistory() {
  return (
    <ProtectedRoute>
      <SEO title="Mis Pedidos" description="Historial de pedidos en MIYUKI" />
      <OrderHistoryContent />
    </ProtectedRoute>
  );
}
