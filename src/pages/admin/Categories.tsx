import { useState, useCallback } from "react";
import { useProducts } from "@/features/products/ProductsProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { slugify } from "@/utils/format";
import type { Category } from "@/types";

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

const EMPTY_FORM: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  is_active: true,
  sort_order: 0,
};

export function AdminCategories() {
  const { categories, loading, fetchProducts } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const openAddForm = useCallback(() => {
    setEditingCategory(null);
    setForm({ ...EMPTY_FORM, sort_order: categories.length });
    setShowForm(true);
    setMessage(null);
  }, [categories.length]);

  const openEditForm = useCallback((category: Category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      is_active: category.is_active,
      sort_order: category.sort_order,
    });
    setShowForm(true);
    setMessage(null);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingCategory(null);
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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.name.trim()) {
        setMessage({ type: "error", text: "El nombre es obligatorio" });
        return;
      }

      setSaving(true);
      setMessage(null);

      try {
        if (!isSupabaseConfigured() || !supabase) {
          setMessage({ type: "error", text: "Supabase no está configurado" });
          return;
        }

        if (editingCategory) {
          const { error } = await supabase
            .from("categories")
            .update({
              name: form.name,
              slug: form.slug,
              description: form.description || null,
              is_active: form.is_active,
              sort_order: form.sort_order,
              updated_at: new Date().toISOString(),
            })
            .eq("id", editingCategory.id);

          if (error) throw error;
          setMessage({ type: "success", text: "Categoría actualizada" });
        } else {
          const { error } = await supabase.from("categories").insert({
            name: form.name,
            slug: form.slug,
            description: form.description || null,
            is_active: form.is_active,
            sort_order: form.sort_order,
          });

          if (error) throw error;
          setMessage({ type: "success", text: "Categoría creada" });
        }

        fetchProducts();
        setTimeout(closeForm, 1000);
      } catch (err) {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Error al guardar la categoría",
        });
      } finally {
        setSaving(false);
      }
    },
    [form, editingCategory, fetchProducts, closeForm],
  );

  const handleToggleActive = useCallback(
    async (category: Category) => {
      if (!isSupabaseConfigured() || !supabase) return;
      const { error } = await supabase
        .from("categories")
        .update({ is_active: !category.is_active, updated_at: new Date().toISOString() })
        .eq("id", category.id);
      if (!error) fetchProducts();
    },
    [fetchProducts],
  );

  const handleDelete = useCallback(
    async (category: Category) => {
      if (!confirm(`¿Eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`)) return;
      if (!isSupabaseConfigured() || !supabase) return;

      const { error } = await supabase.from("categories").delete().eq("id", category.id);
      if (!error) fetchProducts();
    },
    [fetchProducts],
  );

  const handleMoveUp = useCallback(
    async (category: Category, index: number) => {
      if (index === 0 || !isSupabaseConfigured() || !supabase) return;
      const prev = categories[index - 1];
      const tempOrder = category.sort_order;
      await supabase
        .from("categories")
        .update({ sort_order: prev.sort_order, updated_at: new Date().toISOString() })
        .eq("id", category.id);
      await supabase
        .from("categories")
        .update({ sort_order: tempOrder, updated_at: new Date().toISOString() })
        .eq("id", prev.id);
      fetchProducts();
    },
    [categories, fetchProducts],
  );

  const handleMoveDown = useCallback(
    async (category: Category, index: number) => {
      if (index >= categories.length - 1 || !isSupabaseConfigured() || !supabase) return;
      const next = categories[index + 1];
      const tempOrder = category.sort_order;
      await supabase
        .from("categories")
        .update({ sort_order: next.sort_order, updated_at: new Date().toISOString() })
        .eq("id", category.id);
      await supabase
        .from("categories")
        .update({ sort_order: tempOrder, updated_at: new Date().toISOString() })
        .eq("id", next.id);
      fetchProducts();
    },
    [categories, fetchProducts],
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="mt-1 text-sm text-gray-500">
            {categories.length} categor{categories.length !== 1 ? "ías" : "ía"}
          </p>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-miyuki-600 text-white text-sm font-medium rounded-lg hover:bg-miyuki-700 transition-colors focus:outline-none focus:ring-2 focus:ring-miyuki-500 focus:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar categoría
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg
            className="w-12 h-12 mx-auto text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
          </svg>
          <p className="mt-3 text-sm text-gray-500">No hay categorías todavía</p>
          <button
            type="button"
            onClick={openAddForm}
            className="mt-4 text-sm font-medium text-miyuki-600 hover:text-miyuki-700"
          >
            Agregar tu primera categoría
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 w-8" scope="col">
                    <span className="sr-only">Orden</span>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500" scope="col">
                    Nombre
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell" scope="col">
                    Slug
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
                {categories.map((category, index) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(category, index)}
                          disabled={index === 0}
                          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Mover arriba"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(category, index)}
                          disabled={index === categories.length - 1}
                          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Mover abajo"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 8.25l7.5 7.5 7.5-7.5" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        {category.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[300px]">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <code className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        /{category.slug}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(category)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-miyuki-500 focus:ring-offset-2 ${
                          category.is_active ? "bg-miyuki-600" : "bg-gray-300"
                        }`}
                        role="switch"
                        aria-checked={category.is_active}
                        aria-label={`${category.is_active ? "Desactivar" : "Activar"} ${category.name}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            category.is_active ? "translate-x-[18px]" : "translate-x-[3px]"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(category)}
                          className="p-1.5 text-gray-400 hover:text-miyuki-600 rounded-lg hover:bg-miyuki-50 transition-colors"
                          aria-label={`Editar ${category.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          aria-label={`Eliminar ${category.name}`}
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
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCategory ? "Editar categoría" : "Nueva categoría"}
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
                <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  id="category-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-miyuki-500 focus:border-miyuki-500"
                  placeholder="Nombre de la categoría"
                />
              </div>

              <div>
                <label htmlFor="category-slug" className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  id="category-slug"
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-miyuki-500 focus:border-miyuki-500"
                  placeholder="slug-de-la-categoria"
                />
              </div>

              <div>
                <label htmlFor="category-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="category-description"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-miyuki-500 focus:border-miyuki-500 resize-none"
                  placeholder="Descripción opcional"
                />
              </div>

              <div>
                <label htmlFor="category-sort" className="block text-sm font-medium text-gray-700 mb-1">
                  Orden
                </label>
                <input
                  id="category-sort"
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      sort_order: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-miyuki-500 focus:border-miyuki-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-miyuki-500 focus:ring-offset-2 ${
                    form.is_active ? "bg-miyuki-600" : "bg-gray-300"
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
                  Activa
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
                  className="px-4 py-2.5 text-sm font-medium text-white bg-miyuki-600 rounded-lg hover:bg-miyuki-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? "Guardando..."
                    : editingCategory
                      ? "Guardar cambios"
                      : "Crear categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
