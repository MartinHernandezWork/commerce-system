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
            0,
          );

          const totals = totalsByMethod(cash.saleGroups);

          return (
            <div key={cash.id} className="border p-4 rounded shadow-sm">
              <div className="font-bold">Caja #{cash.id}</div>

              <div>Apertura: {new Date(cash.openedAt).toLocaleString()}</div>

              <div>
                Cierre:{" "}
                {cash.closedAt
                  ? new Date(cash.closedAt).toLocaleString()
                  : "Abierta"}
              </div>

              <div>Inicial: ${cash.initial}</div>

              <div className="mt-2 font-semibold">Vendido: ${totalSales}</div>

              {/* 🔹 NUEVO */}

              <div className="mt-2 text-sm">
                <div>Efectivo: ${totals.cash}</div>

                <div>Transferencia: ${totals.transfer}</div>

                <div>Tarjeta: ${totals.card}</div>
              </div>

              <div className="mt-2">Final: ${cash.final ?? "-"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
