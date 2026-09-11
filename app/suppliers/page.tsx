"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/suppliers");
      const data = await res.json();

      setSuppliers(data);
      setLoading(false);
    }

    load();
  }, []);

  async function deleteSupplier(id: number) {
    if (!confirm("¿Seguro que querés eliminar este proveedor?")) {
      return;
    }

    const res = await fetch("/api/suppliers", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setSuppliers((prev) =>
        prev.filter((s) => s.id !== id),
      );
    } else {
      alert("Error al eliminar proveedor");
    }
  }

  const filteredSuppliers = suppliers.filter((supplier) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return true;

    return (
      supplier.name?.toLowerCase().includes(searchText) ||
      supplier.phone?.toLowerCase().includes(searchText) ||
      supplier.email?.toLowerCase().includes(searchText) ||
      supplier.address?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="w-full min-h-full px-4 py-6 sm:px-6 sm:py-8 lg:p-8 space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">
            Proveedores
          </h1>

          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Administrá los proveedores del sistema
          </p>
        </div>

        <Link
          href="/suppliers/new"
          className="w-full sm:w-auto inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-sm font-semibold transition"
        >
          + Crear proveedor
        </Link>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500">
            Cargando proveedores...
          </p>
        </div>
      ) : suppliers.length === 0 ? (
        /* EMPTY */
        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 text-center shadow-sm">
          <p className="text-gray-500">
            No hay proveedores registrados.
          </p>

          <Link
            href="/suppliers/new"
            className="inline-flex items-center justify-center mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition"
          >
            Crear primer proveedor
          </Link>
        </div>
      ) : (
        <>
          {/* SEARCH */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar proveedor, teléfono, email o dirección..."
                className="w-full border border-slate-300 rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
                  aria-label="Limpiar búsqueda"
                >
                  ×
                </button>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {filteredSuppliers.length === suppliers.length
                ? `${suppliers.length} proveedor${
                    suppliers.length !== 1 ? "es" : ""
                  }`
                : `Mostrando ${filteredSuppliers.length} de ${
                    suppliers.length
                  } proveedores`}
            </p>
          </div>

          {/* NO RESULTS */}
          {filteredSuppliers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 text-center shadow-sm">
              <p className="text-gray-600 font-medium">
                No se encontraron proveedores.
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Probá con otro nombre, teléfono, email o dirección.
              </p>

              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b bg-gray-50">
                        <th className="p-4 font-semibold text-gray-700">
                          Nombre
                        </th>

                        <th className="p-4 font-semibold text-gray-700">
                          Teléfono
                        </th>

                        <th className="p-4 font-semibold text-gray-700">
                          Email
                        </th>

                        <th className="p-4 font-semibold text-gray-700">
                          Dirección
                        </th>

                        <th className="p-4 font-semibold text-gray-700 text-right">
                          Acciones
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredSuppliers.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b last:border-b-0 hover:bg-gray-50 transition"
                        >
                          <td className="p-4 font-medium text-slate-800">
                            {s.name}
                          </td>

                          <td className="p-4 text-gray-600">
                            {s.phone ?? "-"}
                          </td>

                          <td className="p-4 text-gray-600 break-all">
                            {s.email ?? "-"}
                          </td>

                          <td className="p-4 text-gray-600">
                            {s.address ?? "-"}
                          </td>

                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/suppliers/${s.id}/edit`}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition cursor-pointer"
                              >
                                Editar
                              </Link>

                              <button
                                onClick={() =>
                                  deleteSupplier(s.id)
                                }
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition cursor-pointer"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE / TABLET */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
                {filteredSuppliers.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                  >
                    {/* INFO */}
                    <div className="p-4 sm:p-5 space-y-4">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-800 break-words">
                          {s.name}
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">
                            Teléfono
                          </p>

                          <p className="font-medium text-gray-700 break-words">
                            {s.phone ?? "-"}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">
                            Email
                          </p>

                          <p className="font-medium text-gray-700 break-all">
                            {s.email ?? "-"}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">
                            Dirección
                          </p>

                          <p className="font-medium text-gray-700 break-words">
                            {s.address ?? "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="border-t border-gray-100 p-4 flex flex-col sm:flex-row gap-2">
                      <Link
                        href={`/suppliers/${s.id}/edit`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
                      >
                        Editar
                      </Link>

                      <button
                        onClick={() => deleteSupplier(s.id)}
                        className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
