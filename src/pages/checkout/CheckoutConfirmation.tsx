import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  SITE_NAME,
  CURRENCY_SYMBOL,
  NEQUI_ACCOUNT_NUMBER,
  buildWhatsAppLink,
} from "@/lib/constants";

const METHOD_LABELS: Record<string, string> = {
  NEQUI: "Nequi",
  DAVIPLATA: "Daviplata",
  PSE: "PSE",
  MOCK: "Pago simulado",
  BRE_B: "BRE-B",
  BANK_TRANSFER: "Transferencia Bancaria",
};

export default function CheckoutConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || searchParams.get("ref") || "";

  const method = (searchParams.get("method") || "NEQUI").toUpperCase();
  const montoRaw = searchParams.get("monto");

  const methodLabel = METHOD_LABELS[method] || "Pago";

  return (
    <>
      <Helmet>
        <title>Pedido confirmado | {SITE_NAME}</title>
      </Helmet>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
            ¡Pago exitoso!
          </h1>
          <p className="text-gray-600 mb-2">
            Tu pedido ha sido confirmado y tu pago fue procesado correctamente.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mb-4">
              Referencia: <span className="font-mono">{orderId}</span>
            </p>
          )}
          {montoRaw && (
            <p className="text-sm text-gray-600 mb-4">
              Total pagado:{" "}
              <span className="font-semibold text-gray-900">
                {CURRENCY_SYMBOL}{Number(montoRaw).toLocaleString("es-CO")} COP
              </span>
            </p>
          )}
          <p className="text-sm text-gray-500 mb-2">
            Medio de pago: <span className="font-medium">{methodLabel}</span>
          </p>

          <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-5 mb-8 text-left">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Tu comprobante ha sido registrado exitosamente. Como parte de
                nuestro protocolo de seguridad e integridad transaccional, los
                fondos ingresados a la cuenta receptora Nequi{" "}
                <span className="font-semibold text-gray-900">
                  ({NEQUI_ACCOUNT_NUMBER})
                </span>{" "}
                son validados directamente con la entidad financiera antes de
                autorizar el despacho. Una vez verificado el abonado en cuenta,
                nos comunicaremos contigo para confirmar la recepción del pago y
                asegurarnos de que recibas tus accesorios en perfecto estado.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Si necesitas soporte inmediato,{" "}
            <a
              href={buildWhatsAppLink("Hola, necesito ayuda con mi pedido.")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-oro-700 hover:underline"
            >
              contáctanos por WhatsApp
            </a>
            .
          </p>
          <p className="text-gray-600 mb-8">
            Recibirás un correo electrónico con los detalles de tu pedido y el seguimiento del envío.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pedidos" className="btn-primary">
              Ver mis pedidos
            </Link>
            <Link to="/productos" className="btn-secondary">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
