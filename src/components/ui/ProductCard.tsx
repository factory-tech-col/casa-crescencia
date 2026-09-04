import { Link } from "react-router-dom";
import { useState } from "react";
import type { Product } from "@/types";
import { useCart } from "@/features/cart/CartProvider";
import { formatPrice } from "@/utils/format";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);

  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const imageUrl = primaryImage?.url ?? "";
  const showImage = Boolean(imageUrl) && !imgError;

  return (
    <div className="group flex flex-col overflow-hidden border border-stone-100 bg-crema transition-all duration-300">
      <Link
        to={`/productos/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-stone-50"
      >
        {showImage ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-300">
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
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link to={`/productos/${product.slug}`} className="flex-1">
          <h3 className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 transition-colors group-hover:text-gray-900">
            {product.name}
          </h3>
{product.category?.name && (
          <span className="absolute left-3 top-3 bg-white/95 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-600 backdrop-blur-sm">
            {product.category.name}
          </span>
        )}
      </Link>

        <div className="flex items-end justify-between gap-2 mt-auto pt-1">
          <p className="text-base font-medium text-gray-900">{formatPrice(product.price)}</p>

          <button
            type="button"
            onClick={() => addItem(product)}
            className="shrink-0 border border-gray-900 bg-gray-900 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-gray-800 active:bg-black"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
