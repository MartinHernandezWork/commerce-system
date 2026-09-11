"use client";

import { useState } from "react";

export default function CloseCashPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function closeCash() {
    setLoading(true);

    try {
      const res = await fetch("/api/cash/close", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setResult(data);
    } catch {
      alert("Ocurrió un error al cerrar la caja");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-full px-4 py-8 sm:px-6 sm:py-12 md:py-16 flex justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-md shadow-red-500/30 space-y-6">
          {/* ENCABEZADO */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              Cerrar caja
            </h1>

            <p className="text-sm sm:text-base text-gray-500 mt-1">
              Finalizá la jornada y revisá el resumen
            </p>
          </div>

          {/* BOTÓN */}
          <button
            onClick={closeCash}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 transition text-white py-3.5 sm:py-3 rounded-xl font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Cerrando..." : "Cerrar caja"}
          </button>

          {/* RESULTADO */}
          {result && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 space-y-3">
              <h2 className="text-base font-semibold text-gray-700">
                Resumen del día
              </h2>

              <div className="flex items-center justify-between gap-4 text-sm sm:text-base">
                <span className="text-gray-600">
                  Total ventas
                </span>

                <span className="font-semibold text-right">
                  ${result.totalSales}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm sm:text-base">
                <span className="text-gray-600">
                  Monto final
                </span>

                <span className="font-semibold text-right">
                  ${result.finalAmount}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
