import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useProducts } from "@/features/products/ProductsProvider";
import { useCart } from "@/features/cart/CartProvider";
import { SEO } from "@/components/seo/SEO";
import { formatPrice } from "@/utils/format";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [data]);
  return null;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { getProductBySlug } = useProducts();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = slug ? getProductBySlug(slug) : undefined;

  if (!product) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
          Producto no encontrado
        </h1>
        <p className="text-gray-500 mb-8">
          El producto que buscas no existe o fue removido.
        </p>
        <Link to="/productos" className="btn-primary">
          Ver productos
        </Link>
      </div>
    );
  }

  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
  const stock = product.inventory?.stock ?? 0;
  const available = stock - (product.inventory?.reserved ?? 0);

  const stockLabel =
    available <= 0
      ? { text: "Agotado", color: "text-red-600 bg-red-50" }
      : available <= 5
        ? { text: `Solo ${available} disponibles`, color: "text-amber-600 bg-amber-50" }
        : { text: "Disponible", color: "text-emerald-600 bg-emerald-50" };

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <SEO
        title={product.name}
        description={product.description || `Compra ${product.name} en Casa Crescencia`}
        image={primaryImage?.url}
        url={`/productos/${product.slug}`}
        type="product"
      />

      {product.inventory && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description || "",
            image: primaryImage?.url,
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: product.currency,
              availability: available > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              url: `${window.location.origin}${import.meta.env.BASE_URL}productos/${product.slug}`,
            },
          }}
        />
      )}

      <div className="container-custom py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-oro-600">Inicio</Link>
          <span className="mx-2">/</span>
          <Link to="/productos" className="hover:text-oro-600">Productos</Link>
          {product.category && (
            <>
              <span className="mx-2">/</span>
              <Link
                to={`/productos?categoria=${product.category.slug}`}
                className="hover:text-oro-600"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
            {primaryImage ? (
              <img
                src={primaryImage.url}
                alt={primaryImage.alt_text || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <div>
            {product.category && (
              <p className="text-sm text-oro-600 uppercase tracking-wide mb-2">
                {product.category.name}
              </p>
            )}
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <p className="text-3xl font-semibold text-oro-700 mb-6">
              {formatPrice(product.price)}
            </p>

            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${stockLabel.color}`}>
              {stockLabel.text}
            </span>

            {product.description && (
              <p className="text-gray-600 mt-6 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="mt-8">
              <label htmlFor="quantity" className="label-field">
                Cantidad
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Reducir cantidad"
                >
                  -
                </button>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={10}
                  value={quantity}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (v >= 1 && v <= 10) setQuantity(v);
                  }}
                  className="w-16 text-center input-field"
                  aria-label="Cantidad"
                />
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={available <= 0}
              className={`btn-primary w-full mt-8 text-lg py-4 ${
                added ? "bg-emerald-600 hover:bg-emerald-700" : ""
              }`}
            >
              {available <= 0
                ? "Agotado"
                : added
                  ? "Agregado al carrito"
                  : "Agregar al carrito"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
