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
      const cashDate = new Date(cash.openedAt).toISOString().split("T")[0];

      return cashDate === selectedDate;
    });
  }, [data, selectedDate]);

  const stats = useMemo(() => {
    const cajasAbiertas = filteredData.filter((c) => !c.closedAt).length;

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
    <div className="p-6 bg-gray-50 min-h-screen rounded-3xl">
      <h1 className="text-3xl font-bold mb-6">Historial de cajas</h1>

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-4 border">
          <div className="text-sm text-gray-500">Total de cajas</div>

          <div className="text-3xl font-bold text-blue-600">
            {stats.totalCajas}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border">
          <div className="text-sm text-gray-500">Cajas abiertas</div>

          <div className="text-3xl font-bold text-orange-600">
            {stats.cajasAbiertas}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border">
          <div className="text-sm text-gray-500">Ventas acumuladas</div>

          <div className="text-3xl font-bold text-green-600">
            ${stats.ventasTotales.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border">
          <div className="text-sm text-gray-500">Dinero a controlar</div>

          <div className="text-3xl font-bold text-purple-600">
            ${stats.dineroControlado.toLocaleString()}
          </div>
        </div>
      </div>

      {/* LISTA */}
      <div className="space-y-4">
        {filteredData.length === 0 && (
          <div className="bg-white border rounded-xl p-6 text-center text-gray-500">
            No hay registros de cajas.
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
              className="bg-white rounded-2xl shadow-md border p-5"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xl font-bold">Caja #{cash.id}</div>

                  <div className="text-sm text-gray-500 mt-1">
                    Apertura: {new Date(cash.openedAt).toLocaleString()}
                  </div>
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">Apertura de caja</div>

                  <div className="text-2xl font-bold text-blue-700">
                    ${Number(cash.initial).toLocaleString()}
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">Ventas realizadas</div>

                  <div className="text-2xl font-bold text-green-700">
                    ${totalSales.toLocaleString()}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">Control de caja</div>

                  <div className="text-2xl font-bold text-purple-700">
                    {cash.final !== null && cash.final !== undefined
                      ? `$${Number(cash.final).toLocaleString()}`
                      : "-"}
                  </div>
                </div>

                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">Fecha de cierre</div>

                  <div className="font-bold text-orange-700">
                    {cash.closedAt
                      ? new Date(cash.closedAt).toLocaleString()
                      : "Caja actualmente abierta"}
                  </div>
                </div>
              </div>

              {/* RESUMEN */}
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tickets registrados</span>

                  <span className="font-bold">
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
