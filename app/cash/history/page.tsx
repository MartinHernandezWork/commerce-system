"use client";

import { useEffect, useState } from "react";

export default function CashHistoryPage() {
  const [data, setData] = useState<any[]>([]);

  async function load() {
    const res = await fetch("/api/cash/history");
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Historial de cajas</h1>

      <div className="space-y-4">
        {data.map((cash) => {
          const totalSales = cash.saleGroups.reduce(
            (sum: number, g: any) => sum + g.total,
            0,
          );

          return (
            <div key={cash.id} className="border p-4 rounded">
              <div>
                Fecha apertura:
                {new Date(cash.openedAt).toLocaleString()}
              </div>

              <div>
                Fecha cierre:
                {cash.closedAt
                  ? new Date(cash.closedAt).toLocaleString()
                  : "Abierta"}
              </div>

              <div>Inicial: {cash.initial}</div>

              <div>Vendido: {totalSales}</div>

              <div>Final: {cash.final ?? "-"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
