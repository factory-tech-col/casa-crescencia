import { Link } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";

export default function Terms() {
  return (
    <>
      <SEO title="Términos y Condiciones" description="Términos y condiciones de uso de MIYUKI" />
      <div className="container-custom py-12 max-w-3xl">
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-miyuki-600">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Términos y Condiciones</span>
        </nav>

        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">
          Términos y Condiciones
        </h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
          <p><strong>Última actualización:</strong> Enero 2024</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceptación de los términos</h2>
            <p>
              Al acceder y utilizar el sitio web de MIYUKI, usted acepta estos términos y condiciones
              en su totalidad. Si no está de acuerdo con alguno de estos términos, no utilice nuestro sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Uso del sitio</h2>
            <p>
              Este sitio web tiene como finalidad la venta de productos a través de internet.
              Usted se compromete a utilizar el sitio de manera lícita y de conformidad con
              la legislación colombiana vigente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Precios y disponibilidad</h2>
            <p>
              Los precios están expresados en Pesos Colombianos (COP) e incluyen IGV cuando aplique.
              Nos reservamos el derecho de modificar precios sin previo aviso. La disponibilidad
              de productos está sujeta a existencias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Pedidos</h2>
            <p>
              El envío de un pedido constituye una oferta de compra. Nos reservamos el derecho
              de aceptar o rechazar cualquier pedido por motivos de disponibilidad, errores de
              precio o errores deDescripción.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Pagos</h2>
            <p>
              Aceptamos los métodos de pago disponibles en la plataforma. Los pagos se procesan
              de forma segura a través de nuestros proveedores de servicios de pago.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Propiedad intelectual</h2>
            <p>
              Todo el contenido del sitio, incluyendo textos, imágenes, logotipos y diseños,
              es propiedad de MIYUKI y está protegido por las leyes de propiedad intelectual colombianas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitación de responsabilidad</h2>
            <p>
              MIYUKI no será responsable por daños indirectos, incidentales o consecuentes
              derivados del uso de nuestros productos o servicios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Cambios en los términos</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento.
              Los cambios serán efectivos desde su publicación en el sitio.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
