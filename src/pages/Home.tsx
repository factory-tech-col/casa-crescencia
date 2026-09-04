import { Link } from "react-router-dom";
import { useProducts } from "@/features/products/ProductsProvider";
import { ProductCard } from "@/components/ui/ProductCard";
import { SEO } from "@/components/seo/SEO";

export default function Home() {
  const { products, categories, loading } = useProducts();
  const featured = products.slice(0, 8);

  return (
    <>
      <SEO title="Inicio" description="Casa Crescencia Joyería Artesanal - Piezas artesanales con alma. Envíos a toda Colombia." />

      <section className="relative bg-crema">
        <div className="container-custom py-24 md:py-36 text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-stone-400 mb-6">
            Joyería Artesanal
          </p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-medium text-gray-900 mb-6 leading-tight">
            Casa Crescencia
          </h1>
          <div className="w-12 h-px bg-oro-500 mx-auto mb-8" />
          <p className="text-base md:text-lg text-stone-500 mb-10 max-w-lg mx-auto leading-relaxed">
            Piezas artesanales seleccionadas con dedicación para ti
          </p>
          <Link
            to="/productos"
            className="inline-block border border-gray-900 bg-gray-900 px-10 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-gray-800"
          >
            Ver Colección
          </Link>
        </div>
      </section>

      <section className="container-custom py-16 md:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-2">
              Lo más elegido
            </p>
            <h2 className="text-2xl md:text-3xl font-display font-medium text-gray-900">
              Destacados
            </h2>
          </div>
          <Link
            to="/productos"
            className="text-[11px] font-medium uppercase tracking-[0.15em] text-stone-400 hover:text-gray-900 transition-colors hidden sm:inline-block"
          >
            Ver todos &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-stone-100 bg-white animate-pulse">
                <div className="aspect-square bg-stone-100" />
                <div className="p-4 space-y-3">
                  <div className="h-2 bg-stone-100 rounded w-1/3" />
                  <div className="h-3 bg-stone-100 rounded w-2/3" />
                  <div className="h-4 bg-stone-100 rounded w-1/4 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center sm:hidden">
          <Link
            to="/productos"
            className="text-[11px] font-medium uppercase tracking-[0.15em] text-stone-400 hover:text-gray-900 transition-colors"
          >
            Ver todos los productos &rarr;
          </Link>
        </div>
      </section>

      <section className="bg-crema-200 py-16 md:py-20">
        <div className="container-custom">
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-2 text-center">
            Explora por estilo
          </p>
          <h2 className="text-2xl md:text-3xl font-display font-medium text-gray-900 text-center mb-12">
            Categorías
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/productos?categoria=${category.slug}`}
                className="group border border-stone-200 bg-crema p-6 text-center transition-all duration-300 hover:border-stone-300"
              >
                <h3 className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-[11px] text-stone-400 mt-1.5 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-custom py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Envío seguro</h3>
            <p className="text-xs text-stone-400 leading-relaxed">Recibe tu pedido en la puerta de tu casa</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Pago protegido</h3>
            <p className="text-xs text-stone-400 leading-relaxed">Tus datos están seguros con nosotros</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Calidad garantizada</h3>
            <p className="text-xs text-stone-400 leading-relaxed">Solo lo mejor para nuestros clientes</p>
          </div>
        </div>
      </section>
    </>
  );
}
