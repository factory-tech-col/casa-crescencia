import { useState, useCallback, useEffect } from "react";
import type { Product, Category } from "@/types";
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from "@/lib/products-data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "name" | "price_asc" | "price_desc" | "newest";
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

  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured() && supabase) {
        let query = supabase
          .from("products")
          .select("*, category:categories(*), images:product_images(*), inventory:inventory(*)")
          .eq("is_active", true);

        if (filters?.category) {
          query = query.eq("category.slug", filters.category);
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
            query = query.order("created_at", { ascending: false });
        }

        const { data, error: err } = await query;
        if (err) throw err;
        setProducts((data as unknown as Product[]) || []);

        const { data: cats } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order");
        setCategories((cats as Category[]) || []);
      } else {
        let result = [...DEFAULT_PRODUCTS];
        if (filters?.category) {
          result = result.filter((p) => p.category?.slug === filters.category);
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

        setProducts(result);
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar productos");
      setProducts(DEFAULT_PRODUCTS);
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
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
