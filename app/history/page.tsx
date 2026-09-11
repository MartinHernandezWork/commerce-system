"use client";

import { useEffect, useMemo, useState } from "react";

export default function HistoryPage() {
  const [groups, setGroups] = useState<any[]>([]);

  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);

  async function load() {
    const data = await fetch("/api/sale-group/history").then((r) =>
      r.json(),
    );

    setGroups(data);
  }

  useEffect(() => {
    load();
  }, []);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const saleDate = new Date(group.createdAt)
        .toISOString()
        .split("T")[0];

      return saleDate === selectedDate;
    });
  }, [groups, selectedDate]);

  const activeGroups = filteredGroups.filter(
    (group) => !group.cancelled,
  );

  const totalFacturacion = activeGroups.reduce(
    (acc, group) => acc + Number(group.total),
    0,
  );

  const totalProductosVendidos = activeGroups.reduce(
    (acc, group) =>
      acc +
      (group.sales?.reduce(
        (sum: number, sale: any) =>
          sum + Number(sale.quantity),
        0,
      ) || 0) +
      (group.recipeSales?.reduce(
        (sum: number, item: any) =>
          sum + Number(item.quantity),
        0,
      ) || 0),
    0,
  );

  const ticketPromedio =
    activeGroups.length > 0
      ? totalFacturacion / activeGroups.length
      : 0;

  return (
    <div className="w-full min-h-full bg-gray-50 rounded-3xl p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Historial de ventas
        </h1>

        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Consultá las ventas realizadas y sus detalles
        </p>
      </div>

      {/* FECHA */}
      <div className="bg-white border rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Seleccionar fecha
        </label>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full sm:w-auto border border-gray-300 rounded-xl px-3 py-3 sm:py-2 shadow-sm bg-white cursor-pointer outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500 transition"
        />
      </div>

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border">
          <div className="text-sm text-gray-500">
            Ventas del día
          </div>

          <div className="text-3xl font-bold text-blue-600 mt-1">
            {activeGroups.length}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border">
          <div className="text-sm text-gray-500">
            Facturación
          </div>

          <div className="text-2xl sm:text-3xl font-bold text-green-600 mt-1 break-words">
            ${totalFacturacion.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border">
          <div className="text-sm text-gray-500">
            Productos vendidos
          </div>

          <div className="text-3xl font-bold text-purple-600 mt-1">
            {totalProductosVendidos}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border">
          <div className="text-sm text-gray-500">
            Ticket promedio
          </div>

          <div className="text-2xl sm:text-3xl font-bold text-orange-600 mt-1 break-words">
            ${ticketPromedio.toFixed(0)}
          </div>
        </div>
      </div>

      {/* LISTA DE TICKETS */}
      <div className="space-y-4">
        {filteredGroups.length === 0 && (
          <div className="bg-white border rounded-2xl p-6 sm:p-8 text-center text-gray-500 shadow-sm">
            No hay ventas para la fecha seleccionada.
          </div>
        )}

        {filteredGroups.map((group) => (
          <div
            key={group.id}
            className={`border rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm ${
              group.cancelled
                ? "bg-red-50 border-red-300"
                : "bg-white"
            }`}
          >
            {/* VENTA ANULADA */}
            {group.cancelled && (
              <div className="mb-4 bg-red-100 text-red-700 px-3 py-2.5 rounded-xl font-bold text-sm sm:text-base">
                ❌ VENTA ANULADA
              </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="min-w-0">
                <div className="font-bold text-lg sm:text-xl text-gray-800">
                  Ticket #{group.id}
                </div>

                <div className="text-sm text-gray-700 mt-2 space-y-1">
                  <div className="break-words">
                    📅 Fecha:{" "}
                    {new Date(
                      group.createdAt,
                    ).toLocaleDateString()}
                  </div>

                  <div className="break-words">
                    🕒 Hora:{" "}
                    {new Date(
                      group.createdAt,
                    ).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="text-xs font-semibold text-gray-500">
                  TOTAL
                </div>

                <div
                  className={`font-bold text-2xl sm:text-xl break-words ${
                    group.cancelled
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  ${Number(group.total).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="my-4 border-t border-gray-200" />

            {/* CLIENTE Y PAGO */}
            <div className="text-sm space-y-2">
              <div className="flex flex-col sm:block gap-1">
                <span className="font-semibold text-gray-700">
                  👤 Cliente:
                </span>{" "}
                <span className="break-words">
                  {group.customerName || "Consumidor final"}
                </span>
              </div>

              <div className="flex flex-col sm:block gap-1">
                <span className="font-semibold text-gray-700">
                  💳 Método de pago:
                </span>{" "}
                <span>
                  {group.paymentMethod === "CASH"
                    ? "Efectivo"
                    : group.paymentMethod === "TRANSFER"
                      ? "Transferencia"
                      : group.paymentMethod}
                </span>
              </div>
            </div>

            {/* PRODUCTOS */}
            <div className="mt-5">
              <div className="text-sm font-semibold text-red-700 mb-2">
                Productos:
              </div>

              <div className="space-y-2 text-sm">
                {group.sales?.map((sale: any) => (
                  <div
                    key={`product-${sale.id}`}
                    className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2"
                  >
                    <span className="text-gray-600 font-bold min-w-0 break-words">
                      {sale.productName}
                    </span>

                    <span className="text-gray-600 shrink-0 font-medium">
                      x{sale.quantity}
                    </span>
                  </div>
                ))}

                {group.recipeSales?.map((item: any) => (
                  <div
                    key={`recipe-${item.id}`}
                    className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2"
                  >
                    <span className="text-gray-600 font-bold min-w-0 break-words">
                      {item.recipeName}
                    </span>

                    <span className="text-gray-600 shrink-0 font-medium">
                      x{item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* TICKETS */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-gray-500">
                  Cantidad de productos
                </span>

                <span className="font-bold text-gray-800">
                  {(group.sales?.length ?? 0) +
                    (group.recipeSales?.length ?? 0)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}