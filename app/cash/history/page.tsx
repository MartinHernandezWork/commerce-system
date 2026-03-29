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

  function totalsByMethod(groups: any[]) {
    let cash = 0;
    let transfer = 0;
    let card = 0;

    for (const g of groups) {
      if (g.paymentMethod === "CASH") cash += g.total;
      if (g.paymentMethod === "TRANSFER") transfer += g.total;
      if (g.paymentMethod === "CARD") card += g.total;
    }

    return { cash, transfer, card };
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Historial de cajas</h1>

      <div className="space-y-4">
        {data.map((cash) => {
          const totalSales = cash.saleGroups.reduce(
            (sum: number, g: any) => sum + g.total,
            0
          );

          const totals = totalsByMethod(cash.saleGroups);

          return (
            <div key={cash.id} className="border p-4 rounded">
              <div>
                🗓️Fecha apertura:{" "}
                {new Date(cash.openedAt).toLocaleString()}
              </div>

              <div>
                🗓️Fecha cierre:{" "}
                {cash.closedAt
                  ? new Date(cash.closedAt).toLocaleString()
                  : "Abierta"}
              </div>

              <div>💰 Dinero Inicial: ${cash.initial}</div>

              <div className="text-green-800">📈 Ventas: ${totalSales}</div>

              <div>📠 Dinero en caja: ${cash.final ?? "-"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
