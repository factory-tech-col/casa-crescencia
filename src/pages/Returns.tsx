import { Link } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";

export default function Returns() {
  return (
    <>
      <SEO title="Cambios y Devoluciones" description="Política de cambios y devoluciones de Casa Crescencia" />
      <div className="container-custom py-12 max-w-3xl">
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-oro-600">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Cambios y Devoluciones</span>
        </nav>

        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">
          Cambios y Devoluciones
        </h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Política de cambios</h2>
            <p>
              Tienes hasta 30 días calendario después de recibir tu pedido para solicitar
              un cambio. El producto debe estar en perfectas condiciones, sin usar y con
              su empaque original.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Condiciones para cambios</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>El producto debe estar sin usar y en su estado original</li>
              <li>Debe incluir todas las etiquetas y empaque original</li>
              <li>No se aceptan cambios de productos personalizados o en oferta</li>
              <li>El cliente asume los costos de envío para devoluciones</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Proceso de cambio</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Contáctanos a través de nuestro correo o formulario de contacto</li>
              <li>Indica el motivo del cambio y el número de pedido</li>
              <li>Recibirás las instrucciones para devolver el producto</li>
              <li>Una vez recibido y verificado, procesaremos el cambio</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Reembolsos</h2>
            <p>
              En caso de devolución aprobada, el reembolso se realizará dentro de los 10 días
              hábiles siguientes a la recepción del producto, usando el mismo método de pago
              original.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Producto defectuoso</h2>
            <p>
              Si recibes un producto defectuoso o dañado, contáctanos dentro de las 48 horas
              siguientes a la recepción. En estos casos, cubrimos los costos de envío para la devolución.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
