"use client";

import { useEffect, useMemo, useState } from "react";

export default function HistoryPage() {
  const [groups, setGroups] = useState<any[]>([]);

  // Fecha actual en formato YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);

  async function load() {
    const data = await fetch("/api/sale-group/history").then((r) => r.json());

    setGroups(data);
  }

  useEffect(() => {
    load();
  }, []);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const saleDate = new Date(group.createdAt).toISOString().split("T")[0];

      return saleDate === selectedDate;
    });
  }, [groups, selectedDate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Historial de ventas</h1>

      {/* SELECTOR DE FECHA */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Seleccionar fecha
        </label>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-lg px-3 py-2 shadow-sm"
        />
      </div>

      {/* TOTAL DE VENTAS */}
      <div className="mb-4 text-sm text-gray-600">
        Ventas encontradas:{" "}
        <span className="font-bold">{filteredGroups.length}</span>
      </div>

      <div className="space-y-4">
        {filteredGroups.length === 0 && (
          <div className="bg-white border rounded-xl p-6 text-center text-gray-500">
            No hay ventas para la fecha seleccionada.
          </div>
        )}

        {filteredGroups.map((group) => (
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
                {group.paymentMethod === "CASH"
                  ? "Efectivo"
                  : group.paymentMethod === "TRANSFER"
                    ? "Transferencia"
                    : group.paymentMethod}
              </div>
            </div>

            {/* DIVISOR */}
            <div className="my-3 border-t border-gray-200" />

            {/* ITEMS */}
            <div>
              <div className="text-sm font-semibold text-red-700 mb-2">
                Productos:
              </div>

              <div className="space-y-1 text-sm">
                {/* PRODUCTOS */}
                {group.sales?.map((sale: any) => (
                  <div
                    key={`product-${sale.id}`}
                    className="flex justify-between border-b border-gray-100 pb-1"
                  >
                    <span className="text-gray-600 font-bold">
                      {sale.product.name}
                    </span>

                    <span className="text-gray-600">x{sale.quantity}</span>
                  </div>
                ))}

                {/* RECETAS */}
                {group.recipeSales?.map((item: any) => (
                  <div
                    key={`recipe-${item.id}`}
                    className="flex justify-between border-b border-gray-100 pb-1"
                  >
                    <span className="text-gray-600 font-bold">
                      {item.recipe.name}
                    </span>

                    <span className="text-gray-600">x{item.quantity}</span>
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
