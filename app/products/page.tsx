"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  async function deleteProduct(id: number) {
  const confirm1 = confirm(
    "⚠️ ATENCIÓN\n\nSi eliminás este producto se borrarán:\n- ventas registradas\n- movimientos de stock\n- historial\n\n¿Querés continuar?"
  );

  if (!confirm1) return;

  const confirmText = prompt(
    "Escriba ELIMINAR para confirmar definitivamente"
  );

  if (confirmText !== "ELIMINAR") {
    alert("Eliminación cancelada");
    return;
  }

  const res = await fetch("/api/products", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });

  if (res.ok) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  } else {
    alert("Error al eliminar producto");
  }
}


  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Productos</h1>

        <Link
          href="/products/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          Crear producto
        </Link>
      </div>

      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Imagen</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Costo</th>
                <th className="p-3">Venta</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Proveedor</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <img
                      src={p.imageUrl ?? "/placeholder.png"}
                      className="w-16 h-16 object-cover rounded border"
                    />
                  </td>

                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3 text-red-500">${p.costPrice.toFixed(2)}</td>
                  <td className="p-3 text-green-600">${p.salePrice.toFixed(2)}</td>
                  <td className="p-3">{p.category?.name ?? "-"}</td>
                  <td className="p-3">{p.supplier?.name ?? "-"}</td>

                  <td className="p-3 text-right space-x-2">
                    <Link
                      href={`/products/${p.id}/edit`}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer"
                    >
                      Editar
                    </Link>

                    <button
                      onClick={() => deleteProduct(p.id)}
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
