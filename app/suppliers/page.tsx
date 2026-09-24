"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Edit3,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Truck,
  UserRound,
  X,
  Trash2,
} from "lucide-react";

type Supplier = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/suppliers");

        if (!res.ok) {
          throw new Error("Error al cargar proveedores");
        }

        const data = await res.json();
        setSuppliers(data);
      } catch {
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function deleteSupplier(id: number) {
    if (!confirm("¿Seguro que querés eliminar este proveedor?")) {
      return;
    }

    try {
      const res = await fetch("/api/suppliers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Error al eliminar proveedor");
      }

      setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
    } catch {
      alert("Error al eliminar proveedor");
    }
  }

  const searchText = search.toLowerCase().trim();

  const filteredSuppliers = suppliers.filter((supplier) => {
    if (!searchText) {
      return true;
    }

    return (
      supplier.name?.toLowerCase().includes(searchText) ||
      supplier.phone?.toLowerCase().includes(searchText) ||
      supplier.email?.toLowerCase().includes(searchText) ||
      supplier.address?.toLowerCase().includes(searchText)
    );
  });

  const hasSearch = searchText.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#f6f8f7]">
      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_minmax(280px,520px)_1fr] lg:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <Truck size={22} />
            </div>

            <div>
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                Proveedores
              </h1>

              <p className="text-sm text-slate-500">
                Administrá los proveedores del sistema
              </p>
            </div>
          </div>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar proveedor, teléfono, email..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex justify-start lg:justify-end">
            <Link
              href="/suppliers/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 sm:w-auto"
            >
              <Plus size={18} />
              Nuevo proveedor
            </Link>
          </div>
        </div>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-green-600" />

              <p className="text-sm font-medium text-slate-600">
                Cargando proveedores...
              </p>
            </div>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                <Truck size={28} />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No hay proveedores
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Todavía no hay proveedores registrados en el sistema.
              </p>

              <Link
                href="/suppliers/new"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                <Plus size={18} />
                Crear primer proveedor
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Proveedores
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {suppliers.length}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
                    <Truck size={19} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Resultados
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {filteredSuppliers.length}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Search size={19} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Estado
                    </p>

                    <p className="mt-1 text-lg font-bold text-green-700">
                      {hasSearch ? "Búsqueda activa" : "Todos visibles"}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
                    <UserRound size={19} />
                  </div>
                </div>
              </div>
            </div>

            {hasSearch && (
              <div className="flex flex-col gap-2 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <Search size={16} />

                  <span>
                    Mostrando {filteredSuppliers.length} de {suppliers.length}{" "}
                    proveedores para{" "}
                    <strong>&quot;{search}&quot;</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="inline-flex items-center justify-center gap-1.5 self-start rounded-xl px-3 py-1.5 text-sm font-semibold text-green-700 transition hover:bg-green-100 sm:self-auto"
                >
                  <X size={15} />
                  Limpiar
                </button>
              </div>
            )}

            {filteredSuppliers.length === 0 ? (
              <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="px-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Search size={26} />
                  </div>

                  <h2 className="mt-4 text-lg font-semibold text-slate-900">
                    No se encontraron proveedores
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Probá con otro nombre, teléfono, email o dirección.
                  </p>

                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    <X size={17} />
                    Limpiar búsqueda
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Nombre
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Teléfono
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Email
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Dirección
                          </th>

                          <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Acciones
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredSuppliers.map((supplier) => (
                          <tr
                            key={supplier.id}
                            className="border-b border-slate-100 last:border-b-0 transition hover:bg-slate-50/70"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
                                  <Truck size={17} />
                                </div>

                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {supplier.name}
                                  </p>

                                  <p className="text-xs text-slate-400">
                                    Proveedor #{supplier.id}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {supplier.phone || "-"}
                            </td>

                            <td className="max-w-[260px] break-all px-5 py-4 text-sm text-slate-600">
                              {supplier.email || "-"}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {supplier.address || "-"}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">
                                <Link
                                  href={`/suppliers/${supplier.id}/edit`}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                                >
                                  <Edit3 size={15} />
                                  Editar
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteSupplier(supplier.id)
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                                >
                                  <Trash2 size={15} />
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
                  {filteredSuppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                            <Truck size={21} />
                          </div>

                          <div className="min-w-0">
                            <h2 className="break-words text-lg font-semibold text-slate-900">
                              {supplier.name}
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Proveedor #{supplier.id}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 space-y-3">
                          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5">
                            <Phone
                              size={17}
                              className="mt-0.5 shrink-0 text-slate-400"
                            />

                            <div className="min-w-0">
                              <p className="text-xs font-medium text-slate-400">
                                Teléfono
                              </p>

                              <p className="mt-0.5 break-words text-sm font-medium text-slate-700">
                                {supplier.phone || "-"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5">
                            <Mail
                              size={17}
                              className="mt-0.5 shrink-0 text-slate-400"
                            />

                            <div className="min-w-0">
                              <p className="text-xs font-medium text-slate-400">
                                Email
                              </p>

                              <p className="mt-0.5 break-all text-sm font-medium text-slate-700">
                                {supplier.email || "-"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5">
                            <MapPin
                              size={17}
                              className="mt-0.5 shrink-0 text-slate-400"
                            />

                            <div className="min-w-0">
                              <p className="text-xs font-medium text-slate-400">
                                Dirección
                              </p>

                              <p className="mt-0.5 break-words text-sm font-medium text-slate-700">
                                {supplier.address || "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-slate-100 p-4">
                        <Link
                          href={`/suppliers/${supplier.id}/edit`}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                        >
                          <Edit3 size={16} />
                          Editar
                        </Link>

                        <button
                          type="button"
                          onClick={() => deleteSupplier(supplier.id)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}