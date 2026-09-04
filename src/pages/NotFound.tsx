import { Link } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";

export default function NotFound() {
  return (
    <>
      <SEO title="Página no encontrada" />
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 text-center">
        <div>
          <p className="text-7xl font-bold text-oro-200 mb-4">404</p>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Página no encontrada
          </h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Lo sentimos, la página que buscas no existe o fue movida a otra ubicación.
          </p>
          <Link to="/" className="btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    </>
  );
}
