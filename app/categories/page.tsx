"use client";

import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");

  async function load() {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  }

  async function createCategory(e: any) {
    e.preventDefault();

    await fetch("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    setName("");
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

        <button className="inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600">
          Crear
        </button>
      </form>

      {/* LISTADO */}
      <ul className="space-y-2">
        {categories.map((c) => (
          <li
            className="border rounded p-3 bg-white shadow-sm"
            key={c.id}
          >
            {c.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
