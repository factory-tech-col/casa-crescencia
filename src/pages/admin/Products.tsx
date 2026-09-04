import { useState, useMemo, useCallback } from "react";
import { useProducts } from "@/features/products/ProductsProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { formatPrice, slugify } from "@/utils/format";
import type { Product } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: string;
  stock: number;
  is_active: boolean;
  image_url: string;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  category_id: "",
  stock: 0,
  is_active: true,
  image_url: "",
};

export function AdminProducts() {
  const { products, categories, loading, fetchProducts } = useProducts();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)),
      );
    }
    if (categoryFilter) {
      result = result.filter((p) => p.category_id === categoryFilter);
    }
    return result;
  }, [products, debouncedSearch, categoryFilter]);

  const openAddForm = useCallback(() => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setMessage(null);
  }, []);

  const openEditForm = useCallback((product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      price: product.price,
      category_id: product.category_id ?? "",
      stock: product.inventory?.stock ?? 0,
      is_active: product.is_active,
      image_url: product.images?.find((img) => img.is_primary)?.url ?? product.images?.[0]?.url ?? "",
    });
    setShowForm(true);
    setMessage(null);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setMessage(null);
  }, []);

  const handleNameChange = useCallback((name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugify(name),
    }));
  }, []);

  const handleToggleActive = useCallback(
    async (product: Product) => {
      if (!isSupabaseConfigured() || !supabase) return;
      const { error } = await supabase
        .from("products")
        .update({ is_active: !product.is_active, updated_at: new Date().toISOString() })
        .eq("id", product.id);
      if (!error) fetchProducts();
    },
    [fetchProducts],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.name.trim() || form.price <= 0) {
        setMessage({ type: "error", text: "Nombre y precio son obligatorios" });
        return;
      }

      setSaving(true);
      setMessage(null);

      try {
        if (editingProduct) {
          if (isSupabaseConfigured() && supabase) {
            const { error } = await supabase
              .from("products")
              .update({
                name: form.name,
                slug: form.slug,
                description: form.description || null,
                price: Math.round(form.price),
                category_id: form.category_id || null,
                is_active: form.is_active,
                updated_at: new Date().toISOString(),
              })
              .eq("id", editingProduct.id);

            if (error) throw error;

            if (editingProduct.inventory) {
              await supabase
                .from("inventory")
                .update({ stock: form.stock, updated_at: new Date().toISOString() })
                .eq("product_id", editingProduct.id);
            }
          }
          setMessage({ type: "success", text: "Producto actualizado" });
        } else {
          if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
              .from("products")
              .insert({
                name: form.name,
                slug: form.slug,
                description: form.description || null,
                price: Math.round(form.price),
                currency: "COP",
                category_id: form.category_id || null,
                is_active: form.is_active,
              })
              .select("id")
              .single();

            if (error) throw error;

            if (data) {
              await supabase.from("inventory").insert({
                product_id: data.id,
                stock: form.stock,
                reserved: 0,
              });
            }
          }
          setMessage({ type: "success", text: "Producto creado" });
        }

        fetchProducts();
        setTimeout(closeForm, 1000);
      } catch (err) {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Error al guardar el producto",
        });
      } finally {
        setSaving(false);
      }
    },
    [form, editingProduct, fetchProducts, closeForm],
  );

  const handleDelete = useCallback(
    async (product: Product) => {
      if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
      if (!isSupabaseConfigured() || !supabase) return;

      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (!error) fetchProducts();
    },
    [fetchProducts],
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="mt-1 text-sm text-gray-500">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-oro-600 text-white text-sm font-medium rounded-lg hover:bg-oro-700 transition-colors focus:outline-none focus:ring-2 focus:ring-oro-500 focus:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar producto
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <label htmlFor="product-search" className="sr-only">
            Buscar productos
          </label>
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            id="product-search"
            type="text"
            placeholder="Buscar por nombre o slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oro-500 focus:border-oro-500"
          />
        </div>
        <div className="sm:w-48">
          <label htmlFor="category-filter" className="sr-only">
            Filtrar por categoría
          </label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oro-500 focus:border-oro-500 bg-white"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg
            className="w-12 h-12 mx-auto text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <p className="mt-3 text-sm text-gray-500">
            {search || categoryFilter ? "No se encontraron productos" : "No hay productos todavía"}
          </p>
          {!search && !categoryFilter && (
            <button
              type="button"
              onClick={openAddForm}
              className="mt-4 text-sm font-medium text-oro-600 hover:text-oro-700"
            >
              Agregar tu primer producto
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500" scope="col">
                    Producto
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell" scope="col">
                    Categoría
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500" scope="col">
                    Precio
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 hidden md:table-cell" scope="col">
                    Stock
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500" scope="col">
                    Estado
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500" scope="col">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                          {product.images?.[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.images[0].alt_text ?? product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">
                            /{product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-gray-600">
                        {product.category?.name ?? "Sin categoría"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          (product.inventory?.stock ?? 0) > 10
                            ? "bg-green-50 text-green-700"
                            : (product.inventory?.stock ?? 0) > 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {product.inventory?.stock ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(product)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-oro-500 focus:ring-offset-2 ${
                          product.is_active ? "bg-oro-600" : "bg-gray-300"
                        }`}
                        role="switch"
                        aria-checked={product.is_active}
                        aria-label={`${product.is_active ? "Desactivar" : "Activar"} ${product.name}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            product.is_active ? "translate-x-[18px]" : "translate-x-[3px]"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(product)}
                          className="p-1.5 text-gray-400 hover:text-oro-600 rounded-lg hover:bg-oro-50 transition-colors"
                          aria-label={`Editar ${product.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          aria-label={`Eliminar ${product.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={closeForm} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 rounded-t-xl">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProduct ? "Editar producto" : "Nuevo producto"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {message && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                  role="alert"
                >
                  {message.text}
                </div>
              )}

              <div>
                <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  id="product-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oro-500 focus:border-oro-500"
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label htmlFor="product-slug" className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  id="product-slug"
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oro-500 focus:border-oro-500"
                  placeholder="slug-del-producto"
                />
              </div>

              <div>
                <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="product-description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oro-500 focus:border-oro-500 resize-none"
                  placeholder="Descripción del producto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (COP) *
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    required
                    min={0}
                    value={form.price}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, price: parseInt(e.target.value, 10) || 0 }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oro-500 focus:border-oro-500"
                  />
                </div>
                <div>
                  <label htmlFor="product-stock" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    id="product-stock"
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, stock: parseInt(e.target.value, 10) || 0 }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oro-500 focus:border-oro-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  id="product-category"
                  value={form.category_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oro-500 focus:border-oro-500 bg-white"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="product-image" className="block text-sm font-medium text-gray-700 mb-1">
                  URL de imagen principal
                </label>
                <input
                  id="product-image"
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oro-500 focus:border-oro-500"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-oro-500 focus:ring-offset-2 ${
                    form.is_active ? "bg-oro-600" : "bg-gray-300"
                  }`}
                  role="switch"
                  aria-checked={form.is_active}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      form.is_active ? "translate-x-[18px]" : "translate-x-[3px]"
                    }`}
                  />
                </button>
                <label
                  className="text-sm text-gray-700 cursor-pointer"
                  onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                >
                  Activo
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-oro-600 rounded-lg hover:bg-oro-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? "Guardando..."
                    : editingProduct
                      ? "Guardar cambios"
                      : "Crear producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
