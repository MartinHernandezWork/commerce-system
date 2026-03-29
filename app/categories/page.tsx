"use client";

import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

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
    if (!confirm("¿Seguro que querés eliminar esta categoría?")) return;

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

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Categorías</h1>

      {/* FORMULARIO */}
      <form onSubmit={createCategory} className="flex gap-2">
        <input
          className="border p-2 flex-1"
          placeholder="Nombre de la categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Crear
        </button>
      </form>

      {/* LISTADO */}
      <ul className="space-y-2">
        {categories.map((c) => (
          <li
            key={c.id}
            className="border rounded p-3 bg-white shadow-sm flex justify-between items-center"
          >
            {editingId === c.id ? (
              <>
  <input
    className="border p-1 flex-1 mr-2"
    value={editingName}
    onChange={(e) => setEditingName(e.target.value)}
  />

  <div className="flex gap-2">
    <button
      onClick={() => saveEdit(c.id)}
      className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer"
    >
      Guardar
    </button>

    <button
      onClick={() => setEditingId(null)}
      className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded cursor-pointer"
    >
      Cancelar
    </button>
  </div>
</>
            ) : (
              <>
                <span>{c.name}</span>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(c)}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => deleteCategory(c.id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}