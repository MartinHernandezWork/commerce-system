"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Edit3,
  Folder,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type Category = {
  id: number;
  name: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);

      const res = await fetch("/api/categories");
      const data = await res.json();

      setCategories(data);
    } catch (error) {
      console.error(error);
      alert("Error cargando categorías.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory(id: number) {
    if (!confirm("¿Seguro que querés eliminar esta categoría?")) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error || "Error eliminando categoría.");
        return;
      }

      load();
    } catch (error) {
      console.error(error);
      alert("Error eliminando categoría.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const searchText = search.toLowerCase().trim();

  const filteredCategories = categories.filter((category) => {
    if (!searchText) return true;

    return category.name?.toLowerCase().includes(searchText);
  });

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#f6f8f7]">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(280px,460px)_1fr] lg:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50">
              <Folder className="h-5 w-5 text-green-600" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Categorías
              </h1>

              <p className="text-sm text-slate-500">
                Administrá las categorías de tus productos
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar categoría..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex justify-start lg:justify-end">
            <Link
              href="/categories/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Nueva categoría
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-5">
          {!loading && categories.length > 0 && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Categorías
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {categories.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Resultados
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {filteredCategories.length}
                </p>
              </div>

              <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
                <p className="text-sm font-medium text-slate-500">
                  Estado
                </p>

                <p className="mt-1 text-lg font-bold text-green-600">
                  {searchText ? "Búsqueda activa" : "Todas visibles"}
                </p>
              </div>
            </div>
          )}

          {searchText && categories.length > 0 && (
            <div className="flex flex-col gap-2 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-green-700">
                Mostrando{" "}
                <span className="font-semibold">
                  {filteredCategories.length}
                </span>{" "}
                de{" "}
                <span className="font-semibold">
                  {categories.length}
                </span>{" "}
                categorías para{" "}
                <span className="font-semibold">
                  “{search}”
                </span>
              </p>

              <button
                type="button"
                onClick={() => setSearch("")}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 transition hover:text-green-800"
              >
                <X className="h-4 w-4" />
                Limpiar
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50">
                  <Folder className="h-6 w-6 text-green-600" />
                </div>

                <p className="text-sm font-medium text-slate-500">
                  Cargando categorías...
                </p>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
                <Folder className="h-7 w-7 text-green-600" />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No hay categorías registradas
              </h2>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Creá tu primera categoría para organizar los
                productos del sistema.
              </p>

              <Link
                href="/categories/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Crear primera categoría
              </Link>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Search className="h-6 w-6 text-slate-400" />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No se encontraron categorías
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Probá con otro nombre o limpiá la búsqueda.
              </p>

              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                <X className="h-4 w-4" />
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                        <Folder className="h-5 w-5 text-green-600" />
                      </div>

                      <div className="min-w-0">
                        <p className="break-words font-semibold text-slate-900">
                          {category.name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Categoría #{category.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex w-full gap-2 sm:w-auto">
                      <Link
                        href={`/categories/${category.id}/edit`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 sm:flex-none"
                      >
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </Link>

                      <button
                        type="button"
                        onClick={() => deleteCategory(category.id)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 sm:flex-none"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}