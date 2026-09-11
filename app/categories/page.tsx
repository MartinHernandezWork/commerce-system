"use client";

import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  }

  async function createCategory(e: any) {
    e.preventDefault();

    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setName("");
    load();
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

  function startEdit(cat: any) {
    setEditingId(cat.id);
    setEditingName(cat.name);
  }

  async function saveEdit(id: number) {
    await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName }),
    });

    setEditingId(null);
    setEditingName("");
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">
          Categorías
        </h1>

        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Creá y administrá las categorías de tus productos
        </p>
      </div>
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

      {/* FORMULARIO */}
      <form
        onSubmit={createCategory}
        className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="border border-gray-300 p-3 rounded-xl flex-1 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Nombre de la categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 active:bg-green-700  text-white px-5 py-3 rounded-xl font-bold transition cursor-pointer sm:shrink-0"
          >
            Crear
          </button>
        </div>
      </form>

      {/* NO RESULTS */}
      {categories.length > 0 && filteredCategories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 text-center shadow-sm">
          <p className="text-gray-600 font-medium">
            No se encontraron categorías.
          </p>

          <p className="text-sm text-gray-400 mt-1">Probá con otro nombre.</p>

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
              {editingId === c.id ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    className="border border-gray-300 p-3 rounded-xl flex-1 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500 transition"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    autoFocus
                  />

                  <div className="flex gap-2 sm:shrink-0">
                    <button
                      onClick={() => saveEdit(c.id)}
                      className="flex-1 sm:flex-none px-4 py-3 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-xl font-medium transition cursor-pointer"
                    >
                      Guardar
                    </button>

                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditingName("");
                      }}
                      className="flex-1 sm:flex-none px-4 py-3 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white rounded-xl font-medium transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="font-medium text-gray-800 break-words">
                    {c.name}
                  </span>

                  <div className="flex gap-2 sm:shrink-0">
                    <button
                      onClick={() => startEdit(c)}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl font-medium transition cursor-pointer"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => deleteCategory(c.id)}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl font-medium transition cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
