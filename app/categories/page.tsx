"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  async function load() {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  }

  async function deleteCategory(id: number) {
    if (!confirm("¿Seguro que querés eliminar esta categoría?")) {
      return;
    }

    await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    });

    load();
  }

  useEffect(() => {
    load();
  }, []);

  const filteredCategories = categories.filter((category) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return true;

    return category.name?.toLowerCase().includes(searchText);
  });

  return (
    <div className="w-full min-h-full px-4 py-6 sm:px-6 sm:py-8 lg:p-8 space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">
            Categorías
          </h1>

          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Administrá las categorías de tus productos
          </p>
        </div>

        <Link
          href="/categories/new"
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 active:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold text-center transition cursor-pointer"
        >
          + Nueva categoría
        </Link>
      </div>

      {/* SEARCH */}
      {categories.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar categoría..."
              className="w-full border border-slate-300 rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-2">
            {filteredCategories.length === categories.length
              ? `${categories.length} categoría${
                  categories.length !== 1 ? "s" : ""
                }`
              : `Mostrando ${filteredCategories.length} de ${
                  categories.length
                } categorías`}
          </p>
        </div>
      )}

      {/* SIN CATEGORÍAS */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 text-center shadow-sm">
          <p className="text-gray-500">
            No hay categorías registradas.
          </p>

          <Link
            href="/categories/new"
            className="inline-flex items-center justify-center mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition"
          >
            Crear primera categoría
          </Link>
        </div>
      ) : filteredCategories.length === 0 ? (
        /* NO RESULTS */
        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 text-center shadow-sm">
          <p className="text-gray-600 font-medium">
            No se encontraron categorías.
          </p>

          <p className="text-sm text-gray-400 mt-1">
            Probá con otro nombre.
          </p>

          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition cursor-pointer"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        /* LISTADO */
        <ul className="space-y-3">
          {filteredCategories.map((c) => (
            <li
              key={c.id}
              className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="font-medium text-gray-800 break-words">
                  {c.name}
                </span>

                <div className="flex gap-2 sm:shrink-0">
                  <Link
                    href={`/categories/${c.id}/edit`}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl font-medium text-center transition cursor-pointer"
                  >
                    Editar
                  </Link>

                  <button
                    onClick={() => deleteCategory(c.id)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl font-medium transition cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}