"use client";

import { useEffect, useMemo, useState } from "react";

export default function CashHistoryPage() {
  const [data, setData] = useState<any[]>([]);

  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);

  async function load() {
    const res = await fetch("/api/cash/history");
    const json = await res.json();

    setData(Array.isArray(json) ? json : []);
  }

  useEffect(() => {
    load();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((cash) => {
      const cashDate = new Date(cash.openedAt)
        .toISOString()
        .split("T")[0];

      return cashDate === selectedDate;
    });
  }, [data, selectedDate]);

  const stats = useMemo(() => {
    const cajasAbiertas = filteredData.filter(
      (c) => !c.closedAt,
    ).length;

    const ventasTotales = filteredData.reduce((acc, cash) => {
      const totalSales = (cash.saleGroups ?? []).reduce(
        (sum: number, g: any) => sum + Number(g.total),
        0,
      );

      return acc + totalSales;
    }, 0);

    const dineroControlado = filteredData.reduce(
      (acc, cash) => acc + Number(cash.final || 0),
      0,
    );

    return {
      totalCajas: filteredData.length,
      cajasAbiertas,
      ventasTotales,
      dineroControlado,
    };
  }, [filteredData]);

  return (
    <div className="w-full min-h-full bg-gray-50 rounded-3xl p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Historial de cajas
        </h1>

        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Consultá las aperturas, cierres y movimientos de caja
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
            Total de cajas
          </div>

          <div className="text-3xl font-bold text-blue-600 mt-1">
            {stats.totalCajas}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border">
          <div className="text-sm text-gray-500">
            Cajas abiertas
          </div>

          <div className="text-3xl font-bold text-orange-600 mt-1">
            {stats.cajasAbiertas}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border">
          <div className="text-sm text-gray-500">
            Ventas acumuladas
          </div>

          <div className="text-2xl sm:text-3xl font-bold text-green-600 mt-1 break-words">
            ${stats.ventasTotales.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border">
          <div className="text-sm text-gray-500">
            Dinero a controlar
          </div>

          <div className="text-2xl sm:text-3xl font-bold text-purple-600 mt-1 break-words">
            ${stats.dineroControlado.toLocaleString()}
          </div>
        </div>
      </div>

      {/* LISTA */}
      <div className="space-y-4">
        {filteredData.length === 0 && (
          <div className="bg-white border rounded-2xl p-6 sm:p-8 text-center text-gray-500 shadow-sm">
            No hay registros de cajas para esta fecha.
          </div>
        )}

        {filteredData.map((cash) => {
          const totalSales = (cash.saleGroups ?? []).reduce(
            (sum: number, g: any) => sum + Number(g.total),
            0,
          );

          const isOpen = !cash.closedAt;

          return (
            <div
              key={cash.id}
              className="bg-white rounded-2xl shadow-sm border p-4 sm:p-5 lg:p-6"
            >
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div className="min-w-0">
                  <div className="text-lg sm:text-xl font-bold text-gray-800">
                    Caja #{cash.id}
                  </div>

                  <div className="text-sm text-gray-500 mt-1 break-words">
                    Apertura:{" "}
                    {new Date(cash.openedAt).toLocaleString()}
                  </div>
                </div>

                <div
                  className={`self-start shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold ${
                    isOpen
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {isOpen ? "🟢 Abierta" : "🔒 Cerrada"}
                </div>
              </div>

              <div className="border-t border-gray-200 my-4" />

              {/* DATOS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">
                    Apertura de caja
                  </div>

                  <div className="text-xl sm:text-2xl font-bold text-blue-700 mt-1 break-words">
                    ${Number(cash.initial).toLocaleString()}
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">
                    Ventas realizadas
                  </div>

                  <div className="text-xl sm:text-2xl font-bold text-green-700 mt-1 break-words">
                    ${totalSales.toLocaleString()}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">
                    Control de caja
                  </div>

                  <div className="text-xl sm:text-2xl font-bold text-purple-700 mt-1 break-words">
                    {cash.final !== null &&
                    cash.final !== undefined
                      ? `$${Number(cash.final).toLocaleString()}`
                      : "-"}
                  </div>
                </div>

                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">
                    Fecha de cierre
                  </div>

                  <div className="font-bold text-orange-700 mt-1 break-words">
                    {cash.closedAt
                      ? new Date(
                          cash.closedAt,
                        ).toLocaleString()
                      : "Caja actualmente abierta"}
                  </div>
                </div>
              </div>

              {/* RESUMEN */}
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-gray-500">
                    Tickets registrados
                  </span>

                  <span className="font-bold text-gray-800">
                    {cash.saleGroups?.length ?? 0}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}