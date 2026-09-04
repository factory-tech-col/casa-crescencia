import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/features/cart/CartProvider";
import { useAuth } from "@/features/auth/AuthProvider";
import { useCheckout } from "@/features/checkout/CheckoutProvider";
import CheckoutSummaryPanel from "@/features/checkout/CheckoutSummaryPanel";
import { SEO } from "@/components/seo/SEO";
import { addressSchema, type AddressInput } from "@/utils/validation";
import { COLOMBIAN_DEPARTMENTS } from "@/lib/constants";
import { TRANSFER_METHODS, getTransferLabel } from "@/features/checkout/paymentService";

export default function Checkout() {
  const { items } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setMethod, setAddress } = useCheckout();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

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

  const onSubmit = async (data: AddressInput) => {
    if (!selectedMethod) {
      return;
    }
    setAddress({
      full_name: data.full_name,
      phone: data.phone,
      address_line1: data.address_line1,
      address_line2: data.address_line2 ?? null,
      city: data.city,
      department: data.department,
      postal_code: data.postal_code ?? null,
      instructions: data.instructions ?? null,
    });
    setMethod(selectedMethod as "NEQUI" | "DAVIPLATA");
    navigate("/checkout/pago");
  };

  return (
    <>
      <SEO title="Datos de envío y pago" description="Completa tu pedido en Casa Crescencia" />
      <div className="container-custom py-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">
          Datos de envío y pago
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Dirección de envío
              </h2>
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
                  <label htmlFor="address_line2" className="label-field">Dirección complementaria</label>
                  <input id="address_line2" {...register("address_line2")} className="input-field" placeholder="Apto, casa, torre, etc." />
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
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Método de pago
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Pago por transferencia directa desde Nequi o Daviplata. Tras crear tu
                pedido, abriremos la plataforma para que hagas la transferencia y
                subas tu comprobante.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TRANSFER_METHODS.map((m) => {
                  const selected = selectedMethod === m;
                  return (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setSelectedMethod(m)}
                      className={`p-5 rounded-xl border text-left transition-colors ${
                        selected
                          ? "border-oro-500 bg-oro-50 ring-1 ring-oro-500"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selected ? "border-oro-600" : "border-gray-300"
                          }`}
                        >
                          {selected && <span className="w-2.5 h-2.5 rounded-full bg-oro-600" />}
                        </span>
                        <span className={`text-base font-semibold ${selected ? "text-oro-700" : "text-gray-900"}`}>
                          {getTransferLabel(m)}
                        </span>
                      </span>
                      <span className="block text-xs text-gray-500 mt-2 pl-8">
                        Transferencia manual de {getTransferLabel(m)}
                      </span>
                    </button>
                  );
                })}
              </div>
              {!selectedMethod && (
                <p className="text-sm text-red-600 mt-3">
                  Selecciona Nequi o Daviplata para continuar.
                </p>
              )}
            </section>
          </div>

          <div className="lg:col-span-1 lg:sticky lg:top-24 self-start">
            <CheckoutSummaryPanel />
            <button type="submit" className="btn-primary w-full mt-4" disabled={!selectedMethod}>
              Continuar con el pago
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
