import { Link } from "react-router-dom";
import type { Product } from "@/types";
import { useCart } from "@/features/cart/CartProvider";
import { formatPrice } from "@/utils/format";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link
        to={`/productos/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-gray-100"
      >
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt_text ?? product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="h-12 w-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z"
              />
            </svg>
          </div>
        )}

        {product.category && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-miyuki-700 backdrop-blur-sm">
            {product.category.name}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link to={`/productos/${product.slug}`} className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-miyuki-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-end justify-between gap-2">
          <p className="text-lg font-bold text-miyuki-600">
            {formatPrice(product.price)}
          </p>

          <button
            type="button"
            onClick={() => addItem(product)}
            className="shrink-0 rounded-md bg-miyuki-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-miyuki-700 active:bg-miyuki-800 transition-colors"
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
