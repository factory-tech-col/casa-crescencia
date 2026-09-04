import { Link } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";

export default function Privacy() {
  return (
    <>
      <SEO title="Política de Privacidad" description="Política de privacidad de Casa Crescencia" />
      <div className="container-custom py-12 max-w-3xl">
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-oro-600">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Política de Privacidad</span>
        </nav>

        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">
          Política de Privacidad
        </h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
          <p>
            <strong>Política de Privacidad - Casa Crescencia Miyuki Joyería Artesanal</strong>
          </p>
          <p>
            En Casa Crescencia respetamos y protegemos la privacidad de nuestros clientes en
            cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Recopilación de Información</h2>
            <p>
              Recopilamos datos personales (nombre, correo electrónico, teléfono, dirección de envío y
              ciudad) proporcionados en nuestros formularios de compra y contacto.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Uso de la Información</h2>
            <p>
              Los datos son utilizados únicamente para procesar compras, coordinar entregas de joyería
              artesanal, brindar atención al cliente y enviar actualizaciones relevantes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Protección de Datos</h2>
            <p>
              Contamos con medidas de seguridad para proteger tu información personal. No compartimos
              tus datos con terceros, excepto con las empresas transportadoras para la entrega de tus
              pedidos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Derechos del Titular</h2>
            <p>
              Puedes conocer, actualizar, rectificar o solicitar la eliminación de tus datos
              escribiéndonos a nuestro canal oficial de WhatsApp al 3133030681.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
