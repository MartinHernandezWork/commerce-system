"use client";

import { useState } from "react";

export default function CloseCashPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function closeCash() {
    setLoading(true);

    const res = await fetch("/api/cash/close", {
      method: "POST",
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setResult(data);
  }

  return (
    <div className="w-full max-w-md mx-auto pt-48">
      <div className="bg-white p-8 rounded-2xl shadow-md shadow-red-500 space-y-6">
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Cerrar caja</h1>
          <p className="text-sm text-gray-500">
            Finalizá la jornada y revisá el resumen
          </p>
        </div>

        {/* BOTÓN */}
        <button
          onClick={closeCash}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 transition text-white py-3 rounded-lg font-medium shadow-sm disabled:opacity-50"
        >
          {loading ? "Cerrando..." : "Cerrar caja"}
        </button>

        {/* RESULTADO */}
        {result && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
            <h2 className="text-sm font-semibold text-gray-700">
              Resumen del día
            </h2>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total ventas</span>
              <span className="font-medium">${result.totalSales}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Monto final</span>
              <span className="font-medium">${result.finalAmount}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
