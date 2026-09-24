"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FolderPlus, Save } from "lucide-react";

export default function NewCategoryPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Ingresá un nombre para la categoría.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error || "Error al crear categoría.");
        return;
      }

      router.push("/categories");
    } catch (error) {
      console.error(error);
      alert("Error al crear categoría.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#f6f8f7]">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50">
              <FolderPlus className="h-5 w-5 text-green-600" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Nueva categoría
              </h1>

              <p className="text-sm text-slate-500">
                Agregá una nueva categoría al sistema
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/categories")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a categorías
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto w-full max-w-2xl">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Información de la categoría
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Definí el nombre que tendrá la nueva categoría.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="category-name"
                className="text-sm font-semibold text-slate-700"
              >
                Nombre
              </label>

              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Bebidas"
                required
                autoFocus
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-4 focus:ring-green-50"
              />

              <p className="text-xs text-slate-400">
                Usá un nombre corto y fácil de identificar.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/categories")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <Save className="h-4 w-4" />
                {saving ? "Guardando..." : "Crear categoría"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}