import { Link } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";

export default function Shipping() {
  return (
    <>
      <SEO title="Política de Envíos" description="Información sobre envíos en MIYUKI" />
      <div className="container-custom py-12 max-w-3xl">
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-miyuki-600">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Política de Envíos</span>
        </nav>

        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">
          Política de Envíos
        </h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Cobertura</h2>
            <p>
              Realizamos envíos a toda Colombia. Nuestros productos llegan a todas las
              ciudades y municipios del país a través de nuestros aliados de logística.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Tiempo de entrega</h2>
            <p>
              Los tiempos de entrega varían según la ubicación:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Bogotá y áreas metropolitanas: 2-5 días hábiles</li>
              <li>Ciudades principales: 3-7 días hábiles</li>
              <li>Otras ciudades y municipios: 5-10 días hábiles</li>
            </ul>
            <p className="mt-2">
              Estos tiempos son estimados y pueden variar por circunstancias externas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Costos de envío</h2>
            <p>
              El costo de envío está Calculado al momento de la compra según la dirección
              de entrega. Ofrecemos envío gratis en compras superiores a $100.000 COP.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Seguimiento</h2>
            <p>
              Una vez despachado tu pedido, recibirás un correo electrónico con la información
              de seguimiento para que puedas rastrear tu envío en tiempo real.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Responsabilidad</h2>
            <p>
              El riesgo de pérdida o daño del producto se transfiere al cliente en el momento
              de la entrega. Si received un paquete dañado, contáctanos dentro de las 24 horas
              siguientes.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
