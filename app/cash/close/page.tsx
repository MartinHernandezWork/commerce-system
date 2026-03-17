"use client";

import { useState } from "react";

export default function CloseCashPage() {
  const [result, setResult] = useState<any>(null);

  async function closeCash() {
    const res = await fetch("/api/cash/close", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setResult(data);
  }

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-2xl mb-4">Cerrar caja</h1>

      <button
        onClick={closeCash}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Cerrar caja
      </button>

      {result && (
        <div className="mt-4 border p-4">
          <div>Total ventas: {result.totalSales}</div>

          <div>Monto final: {result.finalAmount}</div>
        </div>
      )}
    </div>
  );
}
