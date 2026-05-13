"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Recipe = {
  id: number;
  name: string;
  price: number;
  createdAt: string;

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
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Recetas</h1>

          <p className="text-gray-500 mt-1">
            Gestioná todas las recetas del sistema
          </p>
        </div>

        <Link
          href="/recipes/new"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          + Nueva receta
        </Link>
      </div>

      {/* LOADING */}
      {loading && <div className="text-gray-500">Cargando recetas...</div>}

      {/* EMPTY */}
      {!loading && recipes.length === 0 && (
        <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
          No hay recetas creadas
        </div>
      )}

      {/* GRID */}
      {!loading && recipes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white border rounded-xl p-5 shadow-sm"
            >
              {/* TOP */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{recipe.name}</h2>

                  <div className="text-green-600 font-medium mt-1">
                    ${recipe.price}
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  {new Date(recipe.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* INGREDIENTES */}
              <div className="mt-4">
                <div className="text-sm font-medium mb-2 text-gray-700">
                  Ingredientes
                </div>

                <div className="flex flex-wrap gap-2">
                  {recipe.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                    >
                      {item.product.name} — {item.quantity}{" "}
                      {item.product.unitType}
                    </div>
                  ))}
                </div>
              </div>

              {/* BOTONES */}
              <div className="flex gap-2 mt-6">
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg"
                >
                  Editar
                </Link>

                <button
                  onClick={() => deleteRecipe(recipe.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
