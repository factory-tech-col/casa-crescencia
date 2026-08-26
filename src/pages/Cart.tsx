import { Link } from "react-router-dom";
import { useCart } from "@/features/cart/CartProvider";
import { SEO } from "@/components/seo/SEO";
import { formatPrice } from "@/utils/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export default function Cart() {
  const { items, updateQuantity, removeItem, getSubtotal, getShippingCost, getTotal } = useCart();

  const subtotal = getSubtotal();
  const shipping = getShippingCost();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <>
        <SEO title="Carrito" description="Tu carrito de compras en MIYUKI" />
        <div className="container-custom py-20 text-center">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">
            Tu carrito está vacío
          </h1>
          <p className="text-gray-500 mb-8">
            Agrega productos para comenzar tu compra
          </p>
          <Link to="/productos" className="btn-primary">
            Ver productos
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Carrito" description="Tu carrito de compras en MIYUKI" />
      <div className="container-custom py-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Carrito</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const img = item.product.images?.find((i) => i.is_primary) || item.product.images?.[0];
              return (
                <div key={item.product.id} className="card p-4 flex gap-4">
                  <Link
                    to={`/productos/${item.product.slug}`}
                    className="w-20 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden"
                  >
                    {img ? (
                      <img
                        src={img.url}
                        alt={img.alt_text || item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/productos/${item.product.slug}`}
                      className="font-medium text-gray-900 hover:text-miyuki-600 line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-miyuki-700 font-semibold mt-1">
                      {formatPrice(item.product.price)}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-sm"
                          aria-label={`Reducir cantidad de ${item.product.name}`}
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= 10}
                          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-sm disabled:opacity-50"
                          aria-label={`Aumentar cantidad de ${item.product.name}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-sm text-red-500 hover:text-red-700 transition-colors"
                        aria-label={`Eliminar ${item.product.name} del carrito`}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-emerald-600">Gratis</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-500">
                    Envío gratis en compras superiores a {formatPrice(FREE_SHIPPING_THRESHOLD)}
                  </p>
                )}
                <hr className="border-gray-200" />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-miyuki-700">{formatPrice(total)}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-primary w-full mt-6 block text-center">
                Continuar al checkout
              </Link>
              <Link
                to="/productos"
                className="btn-secondary w-full mt-3 block text-center text-sm"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
