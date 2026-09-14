"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      router.push("/categories");
    } else {
      alert("Error al crear categoría");
    }
  }

  return (
    <div className="w-full min-h-full px-4 py-6 sm:px-6 sm:py-8 md:py-10 flex justify-center">
      <div className="w-full max-w-xl space-y-5 sm:space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">
            Nueva categoría
          </h1>

          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Agregá una nueva categoría al sistema
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4"
        >
          {/* NOMBRE */}
          <div className="space-y-2">
            <label className="block font-medium text-slate-700">
              Nombre
            </label>

            <input
              className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Nombre de la categoría"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* BOTÓN */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold transition cursor-pointer"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
