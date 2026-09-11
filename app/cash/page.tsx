"use client";

import { useState } from "react";

export default function CashPage() {
  const [initial, setInitial] = useState(0);

  async function openCash() {
    const res = await fetch("/api/cash/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initial }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Caja abierta ✅");
  }

  return (
    <div className="w-full min-h-full px-4 py-8 sm:px-6 sm:py-12 md:py-16 flex justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-md shadow-green-500/30 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              Abrir caja
            </h1>

            <p className="text-sm sm:text-base text-gray-500 mt-1">
              Ingresá el monto inicial para comenzar el día
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm sm:text-base text-gray-600">
              Monto inicial
            </label>

            <input
              type="number"
              value={initial}
              onChange={(e) => setInitial(Number(e.target.value))}
              className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 outline-none p-3.5 sm:p-3 w-full rounded-xl transition"
              placeholder="Ej: 10000"
            />
          </div>

          <button
            onClick={openCash}
            className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 transition text-white py-3.5 sm:py-3 rounded-xl font-medium shadow-sm cursor-pointer"
          >
            Abrir caja
          </button>
        </div>
      </div>
    </div>
  );
}
