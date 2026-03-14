"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (!confirm("¿Seguro que querés eliminar este proveedor?")) return;

    const res = await fetch("/api/suppliers", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    } else {
      alert("Error al eliminar proveedor");
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Proveedores</h1>

        <Link
          href="/suppliers/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          Crear proveedor
        </Link>
      </div>

      {loading ? (
        <p>Cargando proveedores...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Nombre</th>
                <th className="p-3">Teléfono</th>
                <th className="p-3">Email</th>
                <th className="p-3">Dirección</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3">{s.phone ?? "-"}</td>
                  <td className="p-3">{s.email ?? "-"}</td>
                  <td className="p-3">{s.address ?? "-"}</td>

                  <td className="p-3 text-right space-x-2">
                    <Link
                      href={`/suppliers/${s.id}/edit`}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer"
                    >
                      Editar
                    </Link>

                    <button
                      onClick={() => deleteSupplier(s.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
