"use client";

import { useEffect, useMemo, useState } from "react";

export default function HistoryPage() {
  const [groups, setGroups] = useState<any[]>([]);

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

  const activeGroups = filteredGroups.filter((group) => !group.cancelled);

  const totalFacturacion = activeGroups.reduce(
    (acc, group) => acc + Number(group.total),
    0,
  );

  const totalProductosVendidos = activeGroups.reduce(
    (acc, group) =>
      acc +
      (group.sales?.reduce(
        (sum: number, sale: any) => sum + Number(sale.quantity),
        0,
      ) || 0) +
      (group.recipeSales?.reduce(
        (sum: number, item: any) => sum + Number(item.quantity),
        0,
      ) || 0),
    0,
  );

  const ticketPromedio =
    activeGroups.length > 0 ? totalFacturacion / activeGroups.length : 0;

  async function cancelSale(id: number) {
    const ok = confirm(
      "¿Seguro que desea anular esta venta?\n\nEl stock será repuesto automáticamente.",
    );

    if (!ok) return;

    try {
      const res = await fetch(`/api/sale-group/${id}/cancel`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al anular la venta");
        return;
      }

      alert("Venta anulada correctamente");

      load();
    } catch {
      alert("Error de conexión");
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Historial de ventas</h1>

      {/* FECHA */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Seleccionar fecha
        </label>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-lg px-3 py-2 shadow-sm bg-white"
        />
      </div>

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 border">
          <div className="text-sm text-gray-500">Ventas del día</div>

          <div className="text-3xl font-bold text-blue-600">
            {activeGroups.length}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border">
          <div className="text-sm text-gray-500">Facturación</div>

          <div className="text-3xl font-bold text-green-600">
            ${totalFacturacion.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border">
          <div className="text-sm text-gray-500">Productos vendidos</div>

          <div className="text-3xl font-bold text-purple-600">
            {totalProductosVendidos}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border">
          <div className="text-sm text-gray-500">Ticket promedio</div>

          <div className="text-3xl font-bold text-orange-600">
            ${ticketPromedio.toFixed(0)}
          </div>
        </div>
      </div>

      {/* LISTA DE TICKETS */}
      <div className="space-y-4">
        {filteredGroups.length === 0 && (
          <div className="bg-white border rounded-xl p-6 text-center text-gray-500">
            No hay ventas para la fecha seleccionada.
          </div>
        )}

        {filteredGroups.map((group) => (
          <div
            key={group.id}
            className={`border rounded-xl p-4 shadow-md ${
              group.cancelled ? "bg-red-50 border-red-300" : "bg-white"
            }`}
          >
            {group.cancelled && (
              <div className="mb-3 bg-red-100 text-red-700 px-3 py-2 rounded-lg font-bold">
                ❌ VENTA ANULADA
              </div>
            )}

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

                <div
                  className={`font-bold text-xl ${
                    group.cancelled ? "text-red-600" : "text-green-600"
                  }`}
                >
                  ${group.total}
                </div>
              </div>
            </div>

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

            {/* PRODUCTOS */}
            <div>
              <div className="text-sm font-semibold text-red-700 mb-2">
                Productos:
              </div>

              <div className="space-y-1 text-sm">
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
