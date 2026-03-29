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
    <div className="w-full max-w-md mx-auto pt-48">
      <div className="bg-white p-8 rounded-2xl shadow-md shadow-green-500 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Abrir caja</h1>
          <p className="text-sm text-gray-500">
            Ingresá el monto inicial para comenzar el día
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-600">Monto inicial</label>

          <input
            type="number"
            value={initial}
            onChange={(e) => setInitial(Number(e.target.value))}
            className="border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none p-3 w-full rounded-lg transition"
            placeholder="Ej: 10000"
          />
        </div>

        <button
          onClick={openCash}
          className="w-full bg-green-600 hover:bg-green-700 transition text-white py-3 rounded-lg font-medium shadow-sm"
        >
          Abrir caja
        </button>
      </div>
    </div>
  );
}
