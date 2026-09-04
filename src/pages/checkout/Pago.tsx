import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCheckout } from "@/features/checkout/CheckoutProvider";
import { createCheckoutOrder, getTransferLabel } from "@/features/checkout/paymentService";
import PaymentStepLayout from "@/features/checkout/PaymentStepLayout";
import { SEO } from "@/components/seo/SEO";
import { generateIdempotencyKey, formatCOP } from "@/utils/format";

export default function Pago() {
  const { summary, address, method, reset } = useCheckout();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!summary || !address || (method !== "NEQUI" && method !== "DAVIPLATA")) {
    return <Navigate to="/checkout" replace />;
  }

  const handleConfirm = async () => {
    setError(null);
    if (isProcessing) return;
    setIsProcessing(true);

    let orderId: string | undefined;

    try {
      const idempotencyKey = generateIdempotencyKey();
      const payload = {
        items: summary.items,
        address,
        method,
        idempotencyKey,
      };
      console.debug("[Pago] create-order payload:", {
        itemCount: payload.items.length,
        method: payload.method,
        city: payload.address.city,
        idempotencyKey: payload.idempotencyKey,
      });

      const order = await createCheckoutOrder(payload);
      orderId = order.orderId;
      if (!orderId) {
        throw new Error("No se pudo crear el pedido. Verifica tus datos e inténtalo de nuevo.");
      }
      console.debug("[Pago] order created:", { orderId, total: order.total, mode: order.mode });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error("[Pago] create-order failed:", {
        error: detail,
        method,
        itemCount: summary.items.length,
        total: summary.total,
        fullError: err,
      });
      // Surface the specific error from paymentService instead of a generic message.
      setError(detail || "No se pudo crear el pedido. Intenta de nuevo.");
      setIsProcessing(false);
      return;
    }

    reset();
    navigate(`/checkout/procesando?orderId=${encodeURIComponent(orderId!)}`);
  };

  return (
    <>
      <SEO title="Confirmar pedido" description="Confirma tu pedido en Casa Crescencia" />
      <PaymentStepLayout
        title="Confirmar pedido"
        subtitle={`Pago por transferencia directa con ${getTransferLabel(method)}`}
        step={2}
      >
        <div className="card p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Vas a pagar con {getTransferLabel(method)}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                El valor total de tu pedido será transferido de forma manual. Al
                confirmar, podrás completar la transferencia y subir tu comprobante.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">Total a transferir</span>
            <span className="text-xl font-bold text-oro-700">{formatCOP(summary.total)}</span>
          </div>

          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-800 mb-1">Entrega a:</p>
            <p>{address.full_name}</p>
            <p>{address.address_line1}</p>
            <p>
              {address.city}, {address.department}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          className="btn-primary w-full"
          onClick={handleConfirm}
          disabled={isProcessing}
        >
          {isProcessing ? "Creando tu pedido..." : "CONFIRMAR PEDIDO E IR A PAGAR"}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Tu pedido se creará con estado "Pago pendiente" hasta que confirmemos el comprobante.
        </p>
      </PaymentStepLayout>
    </>
  );
}
