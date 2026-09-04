import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  SITE_NAME,
  NEQUI_ACCOUNT_NUMBER,
  buildWhatsAppLink,
  buildPaymentWhatsAppMessage,
} from "@/lib/constants";
import {
  confirmReceiptPayment,
  fetchOrderWithPayment,
  uploadReceipt,
  validateReceiptFile,
  getTransferLabel,
  type ReceiptInfo,
  type OrderWithPayment,
} from "@/features/checkout/paymentService";
import { useCart } from "@/features/cart/CartProvider";
import { formatCOP } from "@/utils/format";

const METHOD_LABELS: Record<string, string> = {
  NEQUI: "Nequi",
  DAVIPLATA: "Daviplata",
  PSE: "PSE",
  MOCK: "Pago simulado",
};

type UIState =
  | "idle"
  | "loading_order"
  | "opening_wallet"
  | "waiting_receipt"
  | "uploading_receipt"
  | "confirming_payment"
  | "success"
  | "error";

export default function Procesando() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const orderId = searchParams.get("orderId") || searchParams.get("ref") || "";
  const urlMethod = (searchParams.get("billetera") || searchParams.get("method") || "NEQUI").toUpperCase();
  const urlMonto = Number(searchParams.get("monto") || 0);

  const [state, setState] = useState<UIState>(orderId ? "loading_order" : "idle");
  const [order, setOrder] = useState<OrderWithPayment | null>(null);
  const [method, setMethod] = useState<string>(urlMethod);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [receiptInfo, setReceiptInfo] = useState<ReceiptInfo | null>(null);
  const [wmSent, setWmSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const total = order ? order.subtotal + order.shipping_cost : urlMonto;
  const walletLabel = METHOD_LABELS[method] || getTransferLabel(method) || "Tu billetera";

  // Build the list of purchased products for the WhatsApp message.
  const productsList = useCallback(() => {
    const items = order?.items;
    if (!items || items.length === 0) return "";
    return items.map((i) => `${i.product_name} (x${i.quantity})`).join(", ");
  }, [order]);

  // --- Load real order from Supabase (source of truth). Rebuilds on reload. ---
  useEffect(() => {
    if (!orderId) {
      setState("error");
      setError("No encontramos este pedido.");
      return;
    }

    let cancelled = false;
    setState("loading_order");
    fetchOrderWithPayment(orderId).then((data) => {
      if (cancelled) return;
      if (!data) {
        setState("error");
        setError("No tienes permiso para acceder a este pedido.");
        return;
      }
      if (data.status !== "PENDING_PAYMENT" && data.status !== "PAYMENT_PROCESSING") {
        setOrder(data);
        if (data.status === "PAID") {
          setState("success");
          return;
        }
        setState("error");
        setError(
          `Este pedido no está pendiente de pago (estado actual: ${data.status}).`,
        );
        return;
      }
      const pm = data.payment?.method || urlMethod;
      const m = pm === "DAVIPLATA" ? "DAVIPLATA" : pm === "NEQUI" ? "NEQUI" : pm;
      setMethod(m);
      setOrder(data);
      setState("waiting_receipt");
    });

    return () => {
      cancelled = true;
    };
  }, [orderId, urlMethod]);

  const openNequi = useCallback(() => {
    window.open("https://www.nequi.com.co/", "_blank");
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setError(null);
    if (!selected) return;

    const validationError = validateReceiptFile(selected);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selected);
    setReceiptInfo({
      file_name: selected.name,
      mime: selected.type,
      size: selected.size,
    });

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(selected);
    setState("waiting_receipt");
  };

  const handleFinalize = async () => {
    if (state === "confirming_payment") return;
    setError(null);

    if (!file || !receiptInfo) {
      setError("Selecciona un comprobante de pago primero.");
      return;
    }
    if (!orderId) {
      setError("No encontramos este pedido.");
      return;
    }

    setState("uploading_receipt");

    // 1. Upload the receipt (Storage with Base64 fallback).
    let receiptPath: string | null = null;
    let receiptData: string | null = null;
    try {
      const upload = await uploadReceipt({ orderId, file });
      receiptPath = upload.path;
      receiptData = upload.data;
    } catch (uploadErr) {
      console.error("Error al subir comprobante:", uploadErr);
      setError("No se pudo subir el comprobante. Intenta de nuevo.");
      setState("waiting_receipt");
      return;
    }

    // 2. Confirm via the confirm-receipt edge function (server-side authority).
    setState("confirming_payment");
    try {
      const result = await confirmReceiptPayment({
        orderId,
        paymentMethod: method,
        receipt: {
          ...receiptInfo,
          storage_path: receiptPath,
          data: receiptData,
        },
      });

      if (!result || result.status !== "PAID") {
        throw new Error("No se pudo confirmar el pago.");
      }

      // 3. Clear the cart ONLY after successful confirmation.
      try {
        clearCart();
      } catch {
        /* cart clear errors are non-blocking */
      }

      // 4. Open WhatsApp with the store's message template (total + products).
      if (!wmSent) {
        try {
          setWmSent(true);
          const msg = buildPaymentWhatsAppMessage({
            total: result.total || total,
            productsList: productsList() || "mi compra",
          });
          window.open(buildWhatsAppLink(msg), "_blank");
        } catch {
          /* WhatsApp popup may be blocked; the order is already PAID */
        }
      }

      // 5. Redirect to the confirmation view.
      navigate(
        `/checkout/confirmacion?orderId=${encodeURIComponent(
          orderId || result.orderId || "",
        )}&method=${encodeURIComponent(method)}&monto=${encodeURIComponent(
          String(total || result.total || 0),
        )}`,
      );
    } catch (confirmErr) {
      console.error("Error al confirmar el comprobante:", confirmErr);
      setError("No se pudo confirmar el comprobante. Intenta de nuevo.");
      setState("waiting_receipt");
    }
  };

  const goToConfirmation = () => {
    const params = new URLSearchParams();
    if (orderId) params.set("orderId", orderId);
    params.set("method", method);
    params.set("monto", String(total || 0));
    navigate(`/checkout/confirmacion?${params.toString()}`, { replace: true });
  };

  // --- Rendering ---
  if (state === "loading_order") {
    return (
      <>
        <Helmet><title>Comprobante de pago | {SITE_NAME}</title></Helmet>
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-oro-200 border-t-oro-600 animate-spin" />
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-4">
              Cargando tu pedido...
            </h1>
          </div>
        </div>
      </>
    );
  }

  if (state === "error") {
    return (
      <>
        <Helmet><title>Comprobante de pago | {SITE_NAME}</title></Helmet>
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-4">
              No podemos continuar
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate("/pedidos")} className="btn-primary">
                Ver mis pedidos
              </button>
              <button onClick={() => goToConfirmation()} className="btn-secondary">
                Continuar de todos modos
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (state === "success") {
    return (
      <>
        <Helmet><title>Pago confirmado | {SITE_NAME}</title></Helmet>
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-4">
              ¡Pago confirmado!
            </h1>
            <p className="text-gray-600 mb-2">
              Tu pedido fue pagado correctamente con {walletLabel}.
            </p>
            {total > 0 && (
              <p className="text-gray-700 mb-4">
                Valor pagado:{" "}
                <span className="font-semibold text-gray-900">{formatCOP(total)}</span>
              </p>
            )}
            <button onClick={goToConfirmation} className="btn-primary w-full">
              Ver confirmación
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Comprobante de pago | {SITE_NAME}</title>
      </Helmet>
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {orderId && (
            <p className="text-center text-xs text-gray-500 mb-4">
              Pedido #<span className="font-mono">{orderId}</span> · {walletLabel}
            </p>
          )}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-1 mb-6">
              {["Transferencia", "Comprobante", "Confirmación"].map((label, i) => (
                <div key={label} className="flex items-center gap-1">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      state !== "waiting_receipt" || i === 0
                        ? "bg-oro-600 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {i + 1}. {label}
                  </span>
                  {i < 2 && <span className="text-gray-300">›</span>}
                </div>
              ))}
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-oro-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-oro-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
                </svg>
              </div>

              <h1 className="text-xl font-display font-bold text-gray-900 mb-1">
                Realiza tu transferencia
              </h1>
              <p className="text-gray-600 mb-2">
                por <span className="font-semibold text-oro-700">{formatCOP(total)} COP</span> a la
                cuenta Nequi:{" "}
                <span className="font-semibold text-gray-900">{NEQUI_ACCOUNT_NUMBER}</span>
              </p>

              <button
                type="button"
                onClick={openNequi}
                className="btn-secondary w-full mb-6"
              >
                Abrir Nequi en el navegador
              </button>

              <p className="text-sm text-gray-600 mb-4">
                Después de realizar la transferencia, sube el comprobante para finalizar.
              </p>

              {previewUrl && (
                <div className="mx-auto mb-4 w-full max-w-xs">
                  <img
                    src={previewUrl}
                    alt="Comprobante de pago"
                    className="rounded-lg border border-gray-200 object-cover max-h-48 w-full"
                  />
                  {receiptInfo?.file_name && (
                    <p className="mt-1 text-xs text-gray-500">
                      {receiptInfo.file_name} ·{" "}
                      {(receiptInfo.size ?? 0) > 0
                        ? `${(receiptInfo.size! / 1024).toFixed(0)} KB`
                        : ""}
                    </p>
                  )}
                </div>
              )}

              {!previewUrl && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary w-full mb-4"
                >
                  Subir comprobante
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {previewUrl && file && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  className="text-xs text-gray-500 hover:underline mb-2"
                >
                  Cambiar comprobante
                </button>
              )}

              {(state === "uploading_receipt" || state === "confirming_payment") && (
                <p className="text-sm text-gray-500 my-3 flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-oro-300 border-t-oro-600 rounded-full animate-spin" />
                  {state === "uploading_receipt"
                    ? "Subiendo comprobante..."
                    : "Confirmando tu pago..."}
                </p>
              )}

              {error && (
                <p className="text-sm text-red-600 mt-3">{error}</p>
              )}

              {file && previewUrl && state === "waiting_receipt" && (
                <button
                  type="button"
                  onClick={handleFinalize}
                  className="btn-primary w-full mt-4"
                >
                  ENVIAR COMPROBANTE Y FINALIZAR
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
