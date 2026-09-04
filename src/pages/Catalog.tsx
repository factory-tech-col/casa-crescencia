import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "@/features/products/ProductsProvider";
import { ProductCard } from "@/components/ui/ProductCard";
import { SEO } from "@/components/seo/SEO";
import { useDebounce } from "@/hooks/useDebounce";

type SortOption = "newest" | "name" | "price_asc" | "price_desc";

export default function Catalog() {
  const { products, categories, loading, fetchProducts } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    (searchParams.get("categoria") || "").toLowerCase(),
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.q = debouncedSearch;
    if (selectedCategory) params.categoria = selectedCategory;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedCategory, setSearchParams]);

  useEffect(() => {
    const urlCategory = (searchParams.get("categoria") || "").toLowerCase();
    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    fetchProducts({
      category: selectedCategory || undefined,
      search: debouncedSearch || undefined,
      sortBy,
    });
  }, [debouncedSearch, selectedCategory, sortBy, fetchProducts]);

  return (
    <>
      <SEO title="Productos" description="Explora todos los productos de Casa Crescencia" />

      <div className="container-custom py-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">Productos</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Categorías
            </h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !selectedCategory
                      ? "bg-oro-100 text-oro-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Todos
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat.slug
                        ? "bg-oro-100 text-oro-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <label htmlFor="search" className="sr-only">
                  Buscar productos
                </label>
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  id="search"
                  type="text"
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              <div className="flex gap-3">
                <div className="lg:hidden flex gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`shrink-0 px-3 py-2 rounded-full text-sm border transition-colors ${
                      !selectedCategory
                        ? "bg-oro-600 text-white border-oro-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-oro-300"
                    }`}
                  >
                    Todos
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`shrink-0 px-3 py-2 rounded-full text-sm border transition-colors ${
                        selectedCategory === cat.slug
                          ? "bg-oro-600 text-white border-oro-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-oro-300"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="input-field w-auto"
                  aria-label="Ordenar por"
                >
                  <option value="newest">Recientes</option>
                  <option value="name">Nombre A-Z</option>
                  <option value="price_asc">Precio Menor</option>
                  <option value="price_desc">Precio Mayor</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
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
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  No se encontraron productos
                </h2>
                <p className="text-gray-500">Intenta con otros filtros o términos de búsqueda</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
