import { Link } from "react-router-dom";
import { useCheckout } from "@/features/checkout/CheckoutProvider";
import { formatPrice } from "@/utils/format";

export default function CheckoutSummaryPanel() {
  const { summary } = useCheckout();

  if (!summary) {
    return (
      <div className="card p-6 sticky top-24">
        <p className="text-sm text-gray-500">No hay un resumen de compra disponible.</p>
        <Link to="/productos" className="btn-primary w-full mt-4 block text-center">
          Ver productos
        </Link>
      </div>
    );
  }

  const { items, subtotal, shipping, total } = summary;

  return (
    <div className="card p-6 sticky top-24">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de la Compra</h2>

      <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
        {items.map((item) => {
          const img = item.product.images?.find((i) => i.is_primary) || item.product.images?.[0];
          return (
            <div key={item.product.id} className="flex items-start gap-3 text-sm">
              <div className="w-12 h-12 shrink-0 bg-gray-100 rounded overflow-hidden">
                {img && (
                  <img src={img.url} alt={img.alt_text || item.product.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-900 font-medium line-clamp-1 truncate">{item.product.name}</p>
                <p className="text-gray-500">Cantidad: {item.quantity}</p>
              </div>
              <span className="font-medium shrink-0">
                {formatPrice(item.product.price * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      <hr className="border-gray-200 mb-4" />
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Costo de envío</span>
          <span className="font-medium">
            {shipping === 0 ? <span className="text-emerald-600">Gratis</span> : formatPrice(shipping)}
          </span>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span className="text-oro-700">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
