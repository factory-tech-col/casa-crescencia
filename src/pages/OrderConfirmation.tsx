import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SITE_NAME } from "@/lib/constants";

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

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
            ¡Pedido confirmado!
          </h1>
          <p className="text-gray-600 mb-2">
            Tu pedido ha sido recibido correctamente.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mb-8">
              Referencia: <span className="font-mono">{orderId}</span>
            </p>
          )}
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
