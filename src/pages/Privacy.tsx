import { Link } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";

export default function Privacy() {
  return (
    <>
      <SEO title="Política de Privacidad" description="Política de privacidad de MIYUKI" />
      <div className="container-custom py-12 max-w-3xl">
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-miyuki-600">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Política de Privacidad</span>
        </nav>

        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">
          Política de Privacidad
        </h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
          <p><strong>Última actualización:</strong> Enero 2024</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Información que recopilamos</h2>
            <p>
              Recopilamos información que usted nos proporciona directamente, como nombre,
              correo electrónico, dirección y teléfono, al realizar un pedido o crear una cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Uso de la información</h2>
            <p>
              Utilizamos su información para procesar pedidos, enviar comunicaciones relacionadas
              con su compra, mejorar nuestros servicios y, con su consentimiento, enviar
              promociones y novedades.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Protección de datos</h2>
            <p>
              En cumplimiento de la Ley Estatutaria 1581 de 2012 de Protección de Datos
              Personales de Colombia y el Decreto 1377 de 2012, implementamos medidas de
              seguridad técnicas y organizativas para proteger su información personal contra
              acceso no autorizado, alteración, divulgación o destrucción.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Derechos del titular</h2>
            <p>
              Conforme a la legislación colombiana, usted tiene derecho a acceder, actualizar,
              rectificar y suprimir sus datos personales, así como a revocar el consentimiento
              para su tratamiento. Para ejercer estos derechos, contáctenos a través de
              nuestros canales oficiales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Compartir información</h2>
            <p>
              No vendemos ni compartimos su información personal con terceros, excepto cuando
              sea necesario para procesar pagos, cumplir obligaciones legales o con su
              consentimiento expreso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies</h2>
            <p>
              Utilizamos cookies y tecnologías similares para mejorar su experiencia de
              navegación, analizar el tráfico del sitio y personalizar el contenido.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Cambios en esta política</h2>
            <p>
              Nos reservamos el derecho de actualizar esta política de privacidad.
              Los cambios serán publicados en esta página con la fecha de última actualización.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
