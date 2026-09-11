"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();

        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function formatStock(stock: number, unitType: string) {
    switch (unitType) {
      case "G":
        return `${stock} g`;

      case "KG":
        return `${stock} kg`;

      case "UNIT":
      default:
        return `${stock} un`;
    }
  }

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return true;

    return (
      product.name?.toLowerCase().includes(searchText) ||
      product.category?.name?.toLowerCase().includes(searchText) ||
      product.supplier?.name?.toLowerCase().includes(searchText)
    );
  });

  async function deleteProduct(id: number) {
    const confirm1 = confirm(
      "⚠️ ATENCIÓN\n\nSi eliminás este producto se borrarán:\n- ventas registradas\n- movimientos de stock\n- historial\n\n¿Querés continuar?",
    );

    if (!confirm1) return;

    const confirmText = prompt(
      "Escriba ELIMINAR para confirmar definitivamente",
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
    <div className="w-full min-h-full px-4 py-6 sm:px-6 sm:py-8 lg:p-8 space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">
            Productos
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Administrá los productos y su información.
          </p>
        </div>

        <Link
          href="/products/new"
          className="w-full sm:w-auto inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl shadow-sm font-semibold transition"
        >
          + Crear producto
        </Link>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-gray-500">Cargando productos...</p>
        </div>
      ) : products.length === 0 ? (
        /* EMPTY */
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No hay productos registrados.</p>
        </div>
      ) : (
        <>
          {/* BUSCADOR */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto, categoría o proveedor..."
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
              {filteredProducts.length === products.length
                ? `${products.length} producto${
                    products.length !== 1 ? "s" : ""
                  }`
                : `Mostrando ${filteredProducts.length} de ${
                    products.length
                  } productos`}
            </p>
          </div>

          {/* SIN RESULTADOS */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
              <p className="text-gray-600 font-medium">
                No se encontraron productos.
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Probá con otro nombre, categoría o proveedor.
              </p>

              <button
                onClick={() => setSearch("")}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold transition cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <>
              {/* ====================================================== */}
              {/* DESKTOP TABLE */}
              {/* ====================================================== */}

              <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b bg-gray-50">
                        <th className="p-4 font-semibold text-gray-700">
                          Imagen
                        </th>

                        <th className="p-4 font-semibold text-gray-700">
                          Nombre
                        </th>

                        <th className="p-4 font-semibold text-gray-700">
                          Stock
                        </th>

                        <th className="p-4 font-semibold text-gray-700">
                          Costo
                        </th>

                        <th className="p-4 font-semibold text-gray-700">
                          Venta
                        </th>

                        <th className="p-4 font-semibold text-gray-700">
                          Categoría
                        </th>

                        <th className="p-4 font-semibold text-gray-700">
                          Proveedor
                        </th>

                        <th className="p-4 font-semibold text-gray-700 text-right">
                          Acciones
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b last:border-b-0 hover:bg-gray-50 transition"
                        >
                          {/* IMAGEN */}
                          <td className="p-4">
                            <div className="relative w-16 h-16">
                              <Image
                                src={p.imageUrl || "/uploads/placeholder.jpg"}
                                alt={p.name}
                                fill
                                unoptimized
                                sizes="64px"
                                className="object-cover rounded-xl border border-gray-200"
                              />
                            </div>
                          </td>

                          {/* NOMBRE */}
                          <td className="p-4 font-medium text-slate-800">
                            {p.name}
                          </td>

                          {/* STOCK */}
                          <td className="p-4">
                            {formatStock(p.stock, p.unitType)}
                          </td>

                          {/* COSTO */}
                          <td className="p-4 text-red-500 font-medium">
                            ${p.costPrice.toFixed(2)}
                          </td>

                          {/* VENTA */}
                          <td className="p-4 text-green-600 font-semibold">
                            ${p.salePrice.toFixed(2)}
                          </td>

                          {/* CATEGORÍA */}
                          <td className="p-4 text-gray-600">
                            {p.category?.name ?? "-"}
                          </td>

                          {/* PROVEEDOR */}
                          <td className="p-4 text-gray-600">
                            {p.supplier?.name ?? "-"}
                          </td>

                          {/* ACCIONES */}
                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/products/${p.id}/edit`}
                                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl cursor-pointer transition"
                              >
                                Editar
                              </Link>

                              <button
                                onClick={() => deleteProduct(p.id)}
                                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl cursor-pointer transition"
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

              {/* ====================================================== */}
              {/* MOBILE / TABLET CARDS */}
              {/* ====================================================== */}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                  >
                    {/* PRODUCT HEADER */}
                    <div className="p-4 flex gap-4">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
                        <Image
                          src={p.imageUrl || "/uploads/placeholder.jpg"}
                          alt={p.name}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 96px, 112px"
                          className="object-cover rounded-xl border border-gray-200"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="font-semibold text-lg text-slate-800 break-words">
                          {p.name}
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                          Stock:{" "}
                          <span className="font-medium text-gray-700">
                            {formatStock(p.stock, p.unitType)}
                          </span>
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          {p.category?.name ?? "Sin categoría"}
                        </p>
                      </div>
                    </div>

                    {/* INFO */}
                    <div className="border-t border-gray-100 px-4 py-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-red-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500">Precio costo</p>

                          <p className="text-lg font-bold text-red-500 break-words">
                            ${p.costPrice.toFixed(2)}
                          </p>
                        </div>

                        <div className="bg-green-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500">Precio venta</p>

                          <p className="text-lg font-bold text-green-600 break-words">
                            ${p.salePrice.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Categoría</span>

                          <p className="font-medium text-gray-700 break-words">
                            {p.category?.name ?? "-"}
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-500">Proveedor</span>

                          <p className="font-medium text-gray-700 break-words">
                            {p.supplier?.name ?? "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="border-t border-gray-100 p-4 flex flex-col sm:flex-row gap-2">
                      <Link
                        href={`/products/${p.id}/edit`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
                      >
                        Editar
                      </Link>

                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold cursor-pointer transition"
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
