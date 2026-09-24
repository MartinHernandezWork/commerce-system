"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChefHat,
  Edit3,
  ImageIcon,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

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

    const recipeNameMatch = recipe.name
      .toLowerCase()
      .includes(searchText);

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

      setRecipes((prev) =>
        prev.filter((recipe) => recipe.id !== id),
      );
    } catch (error) {
      console.error(error);
      alert("Error eliminando receta");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#f6f8f7]">
      {/* HEADER */}
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(280px,520px)_1fr] lg:items-center">
          {/* TÍTULO */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <ChefHat size={21} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black tracking-tight text-slate-900">
                Recetas
              </h1>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                Gestioná las recetas del sistema
              </p>
            </div>
          </div>

          {/* BUSCADOR */}
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar receta o ingrediente..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-slate-700"
                aria-label="Limpiar búsqueda"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {/* NUEVA RECETA */}
          <div className="flex justify-start lg:justify-end">
            <Link
              href="/recipes/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 sm:w-auto"
            >
              <Plus size={18} />
              Nueva receta
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-5">
          {/* ESTADÍSTICAS */}
          {!loading && recipes.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Recetas
                </p>

                <p className="mt-1 text-2xl font-black text-slate-900">
                  {recipes.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Resultados
                </p>

                <p className="mt-1 text-2xl font-black text-slate-900">
                  {filteredRecipes.length}
                </p>
              </div>

              <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-1">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Ingredientes
                </p>

                <p className="mt-1 text-2xl font-black text-slate-900">
                  {recipes.reduce(
                    (total, recipe) =>
                      total + recipe.items.length,
                    0,
                  )}
                </p>
              </div>
            </div>
          )}

          {/* ESTADO DE BÚSQUEDA */}
          {!loading && search.trim() && (
            <div className="flex flex-col gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <Search
                  size={16}
                  className="shrink-0 text-green-600"
                />

                <p className="truncate text-sm font-semibold text-green-800">
                  Buscando &quot;{search}&quot;
                </p>
              </div>

              <p className="text-sm font-medium text-green-700">
                {filteredRecipes.length}{" "}
                {filteredRecipes.length === 1
                  ? "resultado"
                  : "resultados"}
              </p>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                <ChefHat size={22} />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-500">
                Cargando recetas...
              </p>
            </div>
          )}

          {/* SIN RECETAS */}
          {!loading && recipes.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                <ChefHat size={25} />
              </div>

              <h2 className="mt-4 text-lg font-black text-slate-900">
                No hay recetas registradas
              </h2>

              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                Creá tu primera receta para comenzar a gestionar
                los productos que la componen.
              </p>

              <Link
                href="/recipes/new"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
              >
                <Plus size={18} />
                Crear primera receta
              </Link>
            </div>
          )}

          {/* SIN RESULTADOS */}
          {!loading &&
            recipes.length > 0 &&
            filteredRecipes.length === 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Search size={24} />
                </div>

                <h2 className="mt-4 text-lg font-black text-slate-900">
                  No se encontraron recetas
                </h2>

                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                  Probá con otro nombre de receta o ingrediente.
                </p>

                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                >
                  <X size={17} />
                  Limpiar búsqueda
                </button>
              </div>
            )}

          {/* RECETAS */}
          {!loading && filteredRecipes.length > 0 && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* INFORMACIÓN PRINCIPAL */}
                  <div className="p-4 sm:p-5">
                    <div className="flex gap-4">
                      {/* IMAGEN */}
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 sm:h-28 sm:w-28">
                        {recipe.imageUrl ? (
                          <Image
                            src={recipe.imageUrl}
                            alt={recipe.name}
                            fill
                            sizes="(max-width: 640px) 96px, 112px"
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <ImageIcon size={30} />
                          </div>
                        )}
                      </div>

                      {/* DATOS */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h2 className="break-words text-lg font-black text-slate-900 sm:text-xl">
                              {recipe.name}
                            </h2>

                            <div className="mt-1 text-lg font-black text-green-600">
                              $
                              {recipe.price.toLocaleString(
                                "es-AR",
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 text-left text-xs font-medium text-slate-400 sm:text-right">
                            {new Date(
                              recipe.createdAt,
                            ).toLocaleDateString("es-AR")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* INGREDIENTES */}
                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                          Ingredientes
                        </p>

                        <span className="text-xs font-semibold text-slate-400">
                          {recipe.items.length}{" "}
                          {recipe.items.length === 1
                            ? "ingrediente"
                            : "ingredientes"}
                        </span>
                      </div>

                      {recipe.items.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-400">
                          Sin ingredientes
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {recipe.items.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600"
                            >
                              {item.product.name}{" "}
                              <span className="text-slate-400">
                                ·
                              </span>{" "}
                              {item.quantity}{" "}
                              {item.product.unitType}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACCIONES */}
                  <div className="border-t border-slate-100 bg-slate-50/60 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Link
                        href={`/recipes/${recipe.id}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                      >
                        <Edit3 size={17} />
                        Editar
                      </Link>

                      <button
                        type="button"
                        onClick={() => deleteRecipe(recipe.id)}
                        className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:border-red-200 hover:bg-red-100"
                      >
                        <Trash2 size={17} />
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