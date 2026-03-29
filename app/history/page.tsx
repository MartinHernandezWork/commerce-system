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
          <div
            key={group.id}
            className="border rounded-xl p-4 shadow-md bg-white"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-lg text-gray-800">
                  Ticket #{group.id}
                </div>

                <div className="text-black mt-1">
                  <div>
                    📅 Fecha: {new Date(group.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    🕒 Hora: {new Date(group.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold text-gray-500">TOTAL</div>
                <div className="text-green-600 font-bold text-xl">
                  ${group.total}
                </div>
              </div>
            </div>

            {/* DIVISOR */}
            <div className="my-3 border-t border-gray-200" />

            {/* CLIENTE Y PAGO */}
            <div className="text-sm space-y-1">
              <div>
                <span className="font-semibold text-gray-700">👤 Cliente:</span>{" "}
                {group.customerName || "Consumidor final"}
              </div>

              <div>
                <span className="font-semibold text-gray-700">
                  💳 Método de pago:
                </span>{" "}
                {group.paymentMethod}
              </div>
            </div>

            {/* DIVISOR */}
            <div className="my-3 border-t border-gray-200" />

            {/* PRODUCTOS */}
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">
                PRODUCTOS:
              </div>

              <div className="space-y-1 text-sm">
                {group.sales.map((sale: any) => (
                  <div
                    key={sale.id}
                    className="flex justify-between border-b border-gray-100 pb-1"
                  >
                    <span className="text-gray-800">{sale.product.name}</span>
                    <span className="text-gray-600">x{sale.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
