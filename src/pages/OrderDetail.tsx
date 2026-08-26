import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import type { Order, OrderStatus } from "@/types";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { useAuth } from "@/features/auth/AuthProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { formatPrice, formatDate } from "@/utils/format";
import { SEO } from "@/components/seo/SEO";

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

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PROCESSING: "Procesando",
  COMPLETED: "Completado",
  FAILED: "Fallido",
  REFUNDED: "Reembolsado",
  EXPIRED: "Expirado",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  MOCK: "Pago simulado",
  PSE: "PSE",
  NEQUI: "Nequi",
  BRE_B: "BRE-B",
  BANK_TRANSFER: "Transferencia",
};

type OrderWithDetails = Order & {
  items?: Array<Record<string, unknown>>;
  payment?: Record<string, unknown>;
};

type OrderItemRow = {
  product_name: string;
  product_image_url: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
};

type PaymentRow = {
  method: string;
  status: string;
  amount: number;
  reference: string | null;
  created_at: string;
};

const TIMELINE_STEPS: Array<{ key: string; label: string }> = [
  { key: "PENDING_PAYMENT", label: "Pago pendiente" },
  { key: "PAID", label: "Pagado" },
  { key: "PROCESSING", label: "En proceso" },
  { key: "SHIPPED", label: "Enviado" },
  { key: "DELIVERED", label: "Entregado" },
];

function getTimelineIndex(status: OrderStatus): number {
  if (status === "CANCELLED" || status === "PAYMENT_FAILED" || status === "REFUNDED") return -1;
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
  if (idx !== -1) return idx;
  if (status === "PAYMENT_PROCESSING") return 0;
  if (status === "PAYMENT_EXPIRED") return -1;
  return 0;
}

function OrderDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [configured] = useState(isSupabaseConfigured());

  useEffect(() => {
    if (!configured || !supabase || !user || !id) {
      setLoading(false);
      if (configured && id) setNotFound(true);
      return;
    }

    supabase
      .from("orders")
      .select("*, items:order_items(*), payment:payments(*)")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setOrder(data as OrderWithDetails);
        }
        setLoading(false);
      });
  }, [configured, user, id]);

  if (loading) {
    return (
      <div className="container-custom py-8 max-w-3xl">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-miyuki-600" />
        </div>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="container-custom py-8 max-w-3xl">
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/pedidos" className="hover:text-miyuki-600">Mis Pedidos</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Detalle</span>
        </nav>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Detalle del Pedido</h1>
        <div className="card p-8 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Conecta Supabase</h2>
          <p className="text-gray-500 mb-6">Configura las credenciales de Supabase en tu archivo .env para ver el detalle del pedido.</p>
          <Link to="/pedidos" className="btn-secondary">Volver a mis pedidos</Link>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container-custom py-8 max-w-3xl">
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/pedidos" className="hover:text-miyuki-600">Mis Pedidos</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Detalle</span>
        </nav>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Detalle del Pedido</h1>
        <div className="card p-8 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Pedido no encontrado</h2>
          <p className="text-gray-500 mb-6">El pedido que buscas no existe o no tienes acceso a él.</p>
          <Link to="/pedidos" className="btn-secondary">Volver a mis pedidos</Link>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const items = (order.items ?? []) as unknown as OrderItemRow[];
  const payment = order.payment as unknown as PaymentRow | undefined;
  const timelineIdx = getTimelineIndex(order.status);

  return (
    <div className="container-custom py-8 max-w-3xl">
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link to="/pedidos" className="hover:text-miyuki-600">Mis Pedidos</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Pedido #{order.id.slice(0, 8)}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">
          Pedido #{order.id.slice(0, 8)}
        </h1>
        <span className={`inline-flex items-center self-start px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-8">{formatDate(order.created_at)}</p>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-sm font-medium text-gray-500 mb-4">Estado del pedido</h2>
        <div className="flex items-center justify-between">
          {TIMELINE_STEPS.map((step, idx) => {
            const isCompleted = timelineIdx !== -1 && idx <= timelineIdx;
            const isCurrent = timelineIdx !== -1 && idx === timelineIdx;
            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors ${
                    isCurrent
                      ? "bg-miyuki-600 text-white border-miyuki-600"
                      : isCompleted
                        ? "bg-miyuki-100 text-miyuki-700 border-miyuki-500"
                        : "bg-gray-50 text-gray-400 border-gray-200"
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={`text-xs mt-2 text-center ${isCurrent ? "text-miyuki-700 font-medium" : "text-gray-400"}`}>
                  {step.label}
                </span>
                {idx < TIMELINE_STEPS.length - 1 && (
                  <div className={`absolute h-0.5 w-full ${isCompleted && idx < timelineIdx ? "bg-miyuki-500" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
        {timelineIdx === -1 && (
          <p className="mt-4 text-sm text-red-600 font-medium">
            {STATUS_LABELS[order.status]}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-sm font-medium text-gray-500 mb-4">Artículos</h2>
        <div className="divide-y divide-gray-100">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              {item.product_image_url ? (
                <img
                  src={item.product_image_url}
                  alt={item.product_name}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.41a2.25 2.25 0 0 1 3.182 0l2.909 2.91M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
                <p className="text-sm text-gray-500">
                  {formatPrice(item.unit_price)} x {item.quantity}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-medium text-gray-900">{formatPrice(item.subtotal)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-sm font-medium text-gray-500 mb-4">Resumen</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Envío</span>
            <span className="text-gray-900">
              {order.shipping_cost === 0 ? "Gratis" : formatPrice(order.shipping_cost)}
            </span>
          </div>
          <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-3">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      {payment && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-sm font-medium text-gray-500 mb-4">Pago</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Método</span>
              <span className="text-gray-900">{PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estado</span>
              <span className="text-gray-900">{PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Monto</span>
              <span className="text-gray-900">{formatPrice(payment.amount)}</span>
            </div>
            {payment.reference && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Referencia</span>
                <span className="text-gray-900 font-mono text-xs">{payment.reference}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-center">
        <Link to="/pedidos" className="btn-secondary">
          Volver a mis pedidos
        </Link>
      </div>
    </div>
  );
}

export default function OrderDetail() {
  return (
    <ProtectedRoute>
      <SEO title="Detalle del Pedido" />
      <OrderDetailContent />
    </ProtectedRoute>
  );
}
