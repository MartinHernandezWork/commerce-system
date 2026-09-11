"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Recipe = {
  id: number;
  name: string;
  price: number;
  createdAt: string;
  imageUrl: string | null;

  items: {
    id: number;
    quantity: number;

    product: {
      id: number;
      name: string;
      unitType: string;
    };
  }[];
};

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadRecipes();
  }, []);

  async function loadRecipes() {
    try {
      const res = await fetch("/api/recipes");
      const data = await res.json();

      setRecipes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const filteredRecipes = recipes.filter((recipe) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return true;

    const recipeNameMatch = recipe.name.toLowerCase().includes(searchText);

    const ingredientMatch = recipe.items.some((item) =>
      item.product.name.toLowerCase().includes(searchText),
    );

    return recipeNameMatch || ingredientMatch;
  });

  async function deleteRecipe(id: number) {
    const confirmDelete = confirm("¿Eliminar esta receta?");

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Error eliminando receta");
        return;
      }

      setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
    } catch (error) {
      console.error(error);
      alert("Error eliminando receta");
    }
  }

  return (
    <div className="w-full min-h-full px-4 py-6 sm:px-6 sm:py-8 lg:p-8 space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">
            Recetas
          </h1>

          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Gestioná todas las recetas del sistema
          </p>
        </div>

        <Link
          href="/recipes/new"
          className="w-full sm:w-auto inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl shadow-sm font-semibold transition"
        >
          + Nueva receta
        </Link>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500">Cargando recetas...</p>
        </div>
      )}

      {/* EMPTY */}
      {!loading && recipes.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 text-center shadow-sm">
          <p className="text-gray-500">No hay recetas creadas</p>

          <Link
            href="/recipes/new"
            className="inline-flex items-center justify-center mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold transition"
          >
            Crear primera receta
          </Link>
        </div>
      )}

      {/* RECETAS */}
      {!loading && recipes.length > 0 && (
        <>
          {/* BUSCADOR */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar receta o ingrediente..."
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
              {filteredRecipes.length === recipes.length
                ? `${recipes.length} receta${recipes.length !== 1 ? "s" : ""}`
                : `Mostrando ${filteredRecipes.length} de ${
                    recipes.length
                  } recetas`}
            </p>
          </div>

          {/* SIN RESULTADOS */}
          {filteredRecipes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 text-center shadow-sm">
              <p className="text-gray-600 font-medium">
                No se encontraron recetas.
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Probá con otro nombre de receta o ingrediente.
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
            /* GRID */
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition"
                >
                  {/* TOP */}
                  <div className="flex gap-4">
                    {/* IMAGEN */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                      <Image
                        src={recipe.imageUrl || "/uploads/placeholder.jpg"}
                        alt={recipe.name}
                        fill
                        sizes="(max-width: 640px) 96px, 112px"
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    {/* INFORMACIÓN */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h2 className="text-xl font-semibold text-slate-800 break-words">
                            {recipe.name}
                          </h2>

                          <div className="text-green-600 text-lg font-bold mt-1">
                            ${recipe.price.toLocaleString()}
                          </div>
                        </div>

                        <div className="text-sm text-gray-500 sm:text-right shrink-0">
                          {new Date(recipe.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* INGREDIENTES */}
                  <div className="mt-5">
                    <div className="text-sm font-semibold mb-2 text-gray-700">
                      Ingredientes
                    </div>

                    {recipe.items.length === 0 ? (
                      <div className="text-sm text-gray-400">
                        Sin ingredientes
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {recipe.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-gray-100 border border-gray-200 px-3 py-2 rounded-xl text-sm text-gray-700 break-words"
                          >
                            {item.product.name} — {item.quantity}{" "}
                            {item.product.unitType}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* BOTONES */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-4 border-t border-gray-100">
                    <Link
                      href={`/recipes/${recipe.id}`}
                      className="flex-1 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-xl font-semibold transition"
                    >
                      Editar
                    </Link>

                    <button
                      onClick={() => deleteRecipe(recipe.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
