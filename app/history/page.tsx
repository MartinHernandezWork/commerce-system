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

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Historial de ventas</h1>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.id} className="border rounded p-4">
            <div className="font-bold">Ticket #{group.id}</div>

            <div className="text-sm text-gray-500">
              {new Date(group.createdAt).toLocaleString()}
            </div>

            <div className="mt-2 space-y-1">
              {group.sales.map((sale: any) => (
                <div key={sale.id}>
                  {sale.product.name} x {sale.quantity}
                </div>
              ))}
            </div>

            <div className="mt-2 font-semibold">Total: ${group.total}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
