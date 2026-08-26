import { Link } from "react-router-dom";
import { useProducts } from "@/features/products/ProductsProvider";
import { ProductCard } from "@/components/ui/ProductCard";
import { SEO } from "@/components/seo/SEO";

export default function Home() {
  const { products, categories, loading } = useProducts();
  const featured = products.slice(0, 8);

  return (
    <>
      <SEO title="Inicio" description="MIYUKI - Productos seleccionados para ti. Envíos a toda Colombia." />

      <section className="relative bg-gradient-to-br from-miyuki-50 via-white to-miyuki-100">
        <div className="container-custom py-20 md:py-32 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-miyuki-900 mb-4">
            MIYUKI
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto">
            Productos seleccionados para ti
          </p>
          <Link
            to="/productos"
            className="btn-primary inline-block text-lg px-8 py-4"
          >
            Explorar productos
          </Link>
        </div>
      </section>

      <section className="container-custom py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold text-gray-900">
            Destacados
          </h2>
          <Link to="/productos" className="text-miyuki-600 hover:text-miyuki-700 text-sm font-medium">
            Ver todos los productos &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-5 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-gray-50 py-16">
        <div className="container-custom">
          <h2 className="text-2xl font-display font-bold text-gray-900 text-center mb-10">
            Categorías
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/productos?categoria=${category.slug}`}
                className="card p-6 text-center hover:border-miyuki-300"
              >
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                {category.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-miyuki-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-miyuki-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">Envío seguro</h3>
            <p className="text-sm text-gray-500 mt-1">Recibe tu pedido en la puerta de tu casa</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-miyuki-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-miyuki-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">Pago protegido</h3>
            <p className="text-sm text-gray-500 mt-1">Tus datos están seguros con nosotros</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-miyuki-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-miyuki-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">Calidad garantizada</h3>
            <p className="text-sm text-gray-500 mt-1">Solo lo mejor para nuestros clientes</p>
          </div>
        </div>
      </section>
    </>
  );
}
