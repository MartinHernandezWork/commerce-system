"use client";

import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [groups, setGroups] = useState<any[]>([]);

  async function load() {
    const data = await fetch("/api/sale-group/history").then((r) => r.json());

    setGroups(data);
  }

  useEffect(() => {
    load();
  }, []);

  function paymentLabel(method: string) {
    if (method === "CASH") return "Efectivo";
    if (method === "TRANSFER") return "Transferencia";
    if (method === "CARD") return "Tarjeta";
    return method;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Historial de ventas</h1>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.id} className="border rounded p-4 shadow-sm">
            {/* HEADER */}

            <div className="flex justify-between">
              <div>
                <div className="font-bold">Ticket #{group.id}</div>

                <div className="text-sm text-gray-500">
                  {new Date(group.createdAt).toLocaleString()}
                </div>

                <div className="text-sm">
                  Cliente: {group.customerName || "—"}
                </div>

                <div className="text-sm">
                  Pago: {paymentLabel(group.paymentMethod)}
                </div>

                <div className="text-sm">Caja: {group.cash?.id ?? "-"}</div>
              </div>

              <div className="text-lg font-bold">${group.total}</div>
            </div>

            {/* PRODUCTOS */}

            <div className="mt-3 border-t pt-2 space-y-1">
              {group.sales.map((sale: any) => (
                <div key={sale.id}>
                  {sale.product.name} x {sale.quantity}
                </div>
              ))}
            </div>
            <div className="text-sm mt-1">
              👤 Cliente: {group.customerName || "Consumidor final"}
            </div>

            <div className="text-sm">💳 Metodo: {group.paymentMethod}</div>

            <div className="mt-2 font-semibold text-green-800">Total: ${group.total}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
