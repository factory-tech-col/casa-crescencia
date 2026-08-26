import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/features/cart/CartProvider";
import { useAuth } from "@/features/auth/AuthProvider";
import { SEO } from "@/components/seo/SEO";
import { addressSchema, type AddressInput } from "@/utils/validation";
import { formatPrice, generateIdempotencyKey } from "@/utils/format";
import { COLOMBIAN_DEPARTMENTS } from "@/lib/constants";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { PaymentMethod } from "@/types";

type PaymentOption = {
  id: PaymentMethod;
  label: string;
  available: boolean;
};

const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: "MOCK", label: "Pago de prueba (Mock)", available: true },
  { id: "PSE", label: "PSE", available: false },
  { id: "NEQUI", label: "Nequi", available: false },
  { id: "BRE_B", label: "Bre-B", available: false },
  { id: "BANK_TRANSFER", label: "Transferencia Bancaria", available: true },
];

export default function Checkout() {
  const { items, getSubtotal, getShippingCost, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("MOCK");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const shipping = getShippingCost();
  const total = getTotal();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || "",
    },
  });

  const onSubmit = async (data: AddressInput) => {
    setSubmitError(null);

    if (selectedPayment === "PSE" || selectedPayment === "NEQUI" || selectedPayment === "BRE_B") {
      setSubmitError("Este método de pago estará disponible próximamente.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      const address = {
        full_name: data.full_name,
        phone: data.phone,
        address_line1: data.address_line1,
        address_line2: data.address_line2 ?? null,
        city: data.city,
        department: data.department,
        postal_code: data.postal_code ?? null,
        instructions: data.instructions ?? null,
      };

      const idempotencyKey = generateIdempotencyKey();

      let orderId: string;

      if (isSupabaseConfigured() && supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (!token) {
          setSubmitError("Debes iniciar sesión para realizar un pedido.");
          setIsSubmitting(false);
          return;
        }

        const { data: orderResult, error: orderError } = await supabase.functions.invoke(
          "create-order",
          {
            body: {
              items: orderItems,
              address,
              idempotency_key: idempotencyKey,
            },
          },
        );

        if (orderError) {
          throw new Error(orderError.message || "Error al crear el pedido");
        }

        if (!orderResult?.order) {
          throw new Error("No se recibió información del pedido");
        }

        orderId = orderResult.order.id ?? orderResult.order.p_order_id ?? idempotencyKey;

        if (selectedPayment === "MOCK") {
          const { error: paymentError } = await supabase.functions.invoke(
            "process-payment",
            {
              body: {
                order_id: orderId,
                method: "MOCK",
              },
            },
          );

          if (paymentError) {
            console.error("Payment processing error:", paymentError);
          }
        }
      } else {
        // Demo mode — simulate order creation locally
        orderId = `demo-${idempotencyKey}`;
      }

      clearCart();

      if (selectedPayment === "BANK_TRANSFER") {
        navigate(`/pedido-confirmado?orderId=${orderId}&transfer=true`);
      } else {
        navigate(`/pedido-confirmado?orderId=${orderId}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ocurrió un error inesperado";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <SEO title="Checkout" />
        <div className="container-custom py-20 text-center">
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">
            No hay productos en tu carrito
          </h1>
          <p className="text-gray-500 mb-6">Agrega productos antes de continuar</p>
          <Link to="/productos" className="btn-primary">
            Ver productos
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Checkout" description="Completa tu pedido en MIYUKI" />
      <div className="container-custom py-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Dirección de envío</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="full_name" className="label-field">Nombre completo *</label>
                  <input id="full_name" {...register("full_name")} className="input-field" />
                  {errors.full_name && <p className="error-text">{errors.full_name.message}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="label-field">Teléfono *</label>
                  <input id="phone" {...register("phone")} className="input-field" placeholder="3XX1234567" />
                  {errors.phone && <p className="error-text">{errors.phone.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address_line1" className="label-field">Dirección línea 1 *</label>
                  <input id="address_line1" {...register("address_line1")} className="input-field" placeholder="Calle, número, barrio" />
                  {errors.address_line1 && <p className="error-text">{errors.address_line1.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address_line2" className="label-field">Dirección línea 2</label>
                  <input id="address_line2" {...register("address_line2")} className="input-field" />
                </div>
                <div>
                  <label htmlFor="city" className="label-field">Ciudad *</label>
                  <input id="city" {...register("city")} className="input-field" />
                  {errors.city && <p className="error-text">{errors.city.message}</p>}
                </div>
                <div>
                  <label htmlFor="department" className="label-field">Departamento *</label>
                  <select id="department" {...register("department")} className="input-field">
                    <option value="">Selecciona...</option>
                    {COLOMBIAN_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.department && <p className="error-text">{errors.department.message}</p>}
                </div>
                <div>
                  <label htmlFor="postal_code" className="label-field">Código postal</label>
                  <input id="postal_code" {...register("postal_code")} className="input-field" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="instructions" className="label-field">Instrucciones de entrega</label>
                  <textarea id="instructions" {...register("instructions")} className="input-field" rows={3} placeholder="Ej: Llamar al llegar, dejar con portería..." />
                </div>
              </div>
            </section>

            <section className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Método de pago</h2>
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPayment === opt.id
                        ? "border-miyuki-500 bg-miyuki-50"
                        : opt.available
                          ? "border-gray-200 hover:border-gray-300"
                          : "border-gray-200 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.id}
                      checked={selectedPayment === opt.id}
                      disabled={!opt.available}
                      onChange={() => setSelectedPayment(opt.id)}
                      className="text-miyuki-600 focus:ring-miyuki-500"
                    />
                    <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                    {!opt.available && (
                      <span className="text-xs text-gray-400 ml-auto">Próximamente</span>
                    )}
                  </label>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del pedido</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">
                      {item.product.name} x{item.quantity}
                    </span>
                    <span className="font-medium shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <hr className="border-gray-200 mb-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span>{shipping === 0 ? <span className="text-emerald-600">Gratis</span> : formatPrice(shipping)}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-miyuki-700">{formatPrice(total)}</span>
                </div>
              </div>
              {submitError && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {submitError}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full mt-6"
              >
                {isSubmitting ? "Procesando..." : "Confirmar pedido"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
