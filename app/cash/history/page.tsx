"use client";

import { useEffect, useState } from "react";

export default function CashHistoryPage() {
  const [data, setData] = useState<any[]>([]);

  async function load() {
    const res = await fetch("/api/cash/history");
    const json = await res.json();

    setData(Array.isArray(json) ? json : []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Historial de cajas</h1>

      <div className="space-y-4">
        {data.map((cash) => {
          const totalSales = (cash.saleGroups ?? []).reduce(
            (sum: number, g: any) => sum + g.total,
            0,
          );

          return (
            <div key={cash.id} className="border p-4 rounded">
              {/* APERTURA */}
              <div className="font-semibold">
                🗓️ Fecha de apertura: {new Date(cash.openedAt).toLocaleString()}
              </div>

              {/* CIERRE */}
              <div className="font-semibold">
                🗓️ Fechas de cierre:{" "}
                {cash.closedAt
                  ? new Date(cash.closedAt).toLocaleString()
                  : "La caja está actualmente abierta"}
              </div>

              <div className="font-bold ">
                💰 Caja abierta con: ${cash.initial}
              </div>

              <div className="font-bold text-green-700">
                📈 Ventas: ${totalSales}
              </div>

              <div className="font-bold ">
                🏦 Control de caja:{" "}
                {cash.final !== null && cash.final !== undefined
                  ? `$${cash.final}`
                  : "-"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
