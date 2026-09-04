import { useState, useCallback, useEffect, useRef } from "react";
import type { Product, Category } from "@/types";
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from "@/lib/products-data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const BASE = import.meta.env.BASE_URL || "/";

function resolveImageUrl(raw?: string, productId?: string): string {
  if (raw && raw.startsWith("http")) return raw;
  if (raw && raw.startsWith("/")) {
    if (raw.match(/\/productos\/[a-z]/)) {
      const num = productId?.replace(/\D/g, "").replace(/^0+/, "");
      return num ? `${BASE}productos/${num}.png` : raw;
    }
    if (raw.match(/\/productos\/\d+\.png/)) {
      if (raw.startsWith(`${BASE}productos/`)) return raw;
      return `${BASE}${raw.replace(/^\//, "")}`;
    }
    return raw;
  }
  if (raw && !raw.startsWith("/")) return `${BASE}${raw}`;
  if (productId) {
    const num = productId.replace(/\D/g, "").replace(/^0+/, "");
    if (num) return `${BASE}productos/${num}.png`;
  }
  return "";
}

interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "name" | "price_asc" | "price_desc" | "newest";
}

// Extracts the numeric slot (1-30) used to order Aretes before Pulseras.
// Falls back to order_index, then to the numeric part of the product id.
function numericSlot(p: Product): number {
  if (typeof p.order_index === "number" && p.order_index > 0) return p.order_index;
  const m = (p.id || "").replace(/\D/g, "");
  const n = m ? parseInt(m.replace(/^0+/, ""), 10) : NaN;
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}

// Default order: Aretes (1-17) first, then Pulseras (18-30).
function sortBySlot(a: Product, b: Product): number {
  return numericSlot(a) - numericSlot(b);
}

interface ProductsContextType {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
}

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured() && supabase) {
        let query = supabase
          .from("products")
          .select("*, category:categories(*), images:product_images(*), inventory:inventory(*)")
          .eq("is_active", true);

        if (filters?.category) {
          query = query.eq("category.slug", filters.category.toLowerCase());
        }
        if (filters?.search) {
          query = query.ilike("name", `%${filters.search}%`);
        }
        if (filters?.minPrice) {
          query = query.gte("price", filters.minPrice);
        }
        if (filters?.maxPrice) {
          query = query.lte("price", filters.maxPrice);
        }

        switch (filters?.sortBy) {
          case "name":
            query = query.order("name");
            break;
          case "price_asc":
            query = query.order("price", { ascending: true });
            break;
          case "price_desc":
            query = query.order("price", { ascending: false });
            break;
          default:
            query = query.order("order_index", { ascending: true, nullsFirst: false });
        }

        const { data, error: err } = await query;
        if (err) throw err;
        const raw = (data || []) as unknown as Product[];
        let mapped = raw.map((p) => ({
          ...p,
          images:
            p.images?.map((img) => ({
              ...img,
              url: resolveImageUrl(img.url, p.id),
            })) ?? [],
        }));
        // Strict local category filter: guarantees the list contains ONLY the
        // selected category even if the embedded `category` relation is missing,
        // null, or its slug differs in case/whitespace. This is the source of
        // truth so Aretes never leak into the Pulseras view (and vice versa).
        if (filters?.category) {
          const catSlug = filters.category.toLowerCase().trim();
          mapped = mapped.filter(
            (p) => p.category?.slug?.toLowerCase().trim() === catSlug,
          );
        }
        // "newest" is the catalog's default view; keep Aretes (1-17) before
        // Pulseras (18-30) instead of raw insertion order.
        if (!filters?.sortBy || filters?.sortBy === "newest") mapped.sort(sortBySlot);

        // Ignore stale responses so an older (unfiltered) request never
        // overwrites a newer (category-filtered) one.
        if (seq !== requestSeq.current) return;
        setProducts(mapped);

        const { data: cats } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order");
        if (seq !== requestSeq.current) return;
        setCategories((cats as Category[]) || []);
      } else {
        let result = [...DEFAULT_PRODUCTS];
        if (filters?.category) {
          const catSlug = filters.category.toLowerCase().trim();
          result = result.filter(
            (p) => p.category?.slug?.toLowerCase().trim() === catSlug,
          );
        }
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          result = result.filter(
            (p) =>
              p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)),
          );
        }
        if (filters?.sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
        if (filters?.sortBy === "price_asc") result.sort((a, b) => a.price - b.price);
        if (filters?.sortBy === "price_desc") result.sort((a, b) => b.price - a.price);
        if (!filters?.sortBy || filters?.sortBy === "newest") result.sort(sortBySlot);

        if (seq !== requestSeq.current) return;
        setProducts(result);
        if (seq !== requestSeq.current) return;
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setError(err instanceof Error ? err.message : "Error al cargar productos");
      let fallback = [...DEFAULT_PRODUCTS];
      if (filters?.category) {
        const catSlug = filters.category.toLowerCase().trim();
        fallback = fallback.filter(
          (p) => p.category?.slug?.toLowerCase().trim() === catSlug,
        );
      }
      setProducts(fallback);
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only auto-load when a child (e.g. Catalog) hasn't already started a
    // filtered request. Child effects run before this parent effect, so if a
    // category/search filter drove its own fetch on mount we leave that result
    // in place instead of overwriting it with an unfiltered fetch.
    if (requestSeq.current === 0) {
      fetchProducts();
    }
  }, [fetchProducts]);

  const getProductBySlug = useCallback(
    (slug: string) => products.find((p) => p.slug === slug),
    [products],
  );

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  );

  return (
    <ProductsContext.Provider
      value={{ products, categories, loading, error, fetchProducts, getProductBySlug, getProductById }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts(): ProductsContextType {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}
