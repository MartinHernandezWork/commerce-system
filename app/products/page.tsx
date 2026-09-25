"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CircleAlert,
  Edit3,
  ImageIcon,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Store,
  Trash2,
  Truck,
  X,
} from "lucide-react";

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
      "ATENCIÓN\n\n¿Estás seguro que quieres eliminar este producto?",
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#f6f8f7]">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <Package size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Productos
              </h1>

              <p className="mt-0.5 text-xs font-medium text-slate-400">
                Administrá los productos y su información
              </p>
            </div>
          </div>

          <div className="relative w-full lg:mx-auto lg:w-full lg:max-w-md">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto, categoría o proveedor..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:ring-4 focus:ring-green-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-slate-600"
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex justify-start lg:justify-end">
            <Link
              href="/products/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 sm:w-auto"
            >
              <Plus size={17} />
              Nuevo producto
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                  <Package size={23} className="animate-pulse" />
                </div>

                <p className="font-semibold text-slate-700">
                  Cargando productos...
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Estamos buscando los productos registrados.
                </p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="max-w-md">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <Package size={30} />
                </div>

                <h2 className="text-xl font-black text-slate-800">
                  No hay productos registrados
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Todavía no hay productos cargados en el sistema.
                </p>

                <Link
                  href="/products/new"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                >
                  <Plus size={17} />
                  Crear producto
                </Link>
              </div>
            </div>
          ) : (
            <>
              {search && (
                <div className="flex items-center gap-2 rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
                  <Search
                    size={16}
                    className="shrink-0 text-green-600"
                  />

                  <p className="text-sm font-medium text-green-800">
                    Buscando{" "}
                    <span className="font-black">"{search}"</span>
                  </p>

                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="ml-auto shrink-0 cursor-pointer rounded-lg p-1 text-green-600 transition hover:bg-green-100 hover:text-green-800"
                    aria-label="Limpiar búsqueda"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Productos
                      </p>

                      <p className="mt-2 text-2xl font-black text-slate-900">
                        {products.length}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <Package size={17} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Resultados
                      </p>

                      <p className="mt-2 text-2xl font-black text-slate-900">
                        {filteredProducts.length}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Search size={17} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Categorías
                      </p>

                      <p className="mt-2 text-2xl font-black text-slate-900">
                        {
                          new Set(
                            products
                              .map(
                                (product) =>
                                  product.category?.id,
                              )
                              .filter(Boolean),
                          ).size
                        }
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Store size={17} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Proveedores
                      </p>

                      <p className="mt-2 text-2xl font-black text-slate-900">
                        {
                          new Set(
                            products
                              .map(
                                (product) =>
                                  product.supplier?.id,
                              )
                              .filter(Boolean),
                          ).size
                        }
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Truck size={17} />
                    </div>
                  </div>
                </div>
              </section>

              {filteredProducts.length === 0 ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <div className="max-w-md">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                      <Search size={30} />
                    </div>

                    <h2 className="text-xl font-black text-slate-800">
                      No se encontraron productos
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      Probá con otro nombre, categoría o proveedor.
                    </p>

                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                    >
                      <X size={17} />
                      Limpiar búsqueda
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* TABLA DESKTOP */}
                  <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                            <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                              Imagen
                            </th>

                            <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                              Nombre
                            </th>

                            <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                              Stock
                            </th>

                            <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                              Costo
                            </th>

                            <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                              Venta
                            </th>

                            <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                              Venta en POS
                            </th>

                            <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                              Categoría
                            </th>

                            <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                              Proveedor
                            </th>

                            <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">
                              Acciones
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredProducts.map((p) => (
                            <tr
                              key={p.id}
                              className="border-b border-slate-100 last:border-b-0 transition hover:bg-slate-50/70"
                            >
                              <td className="px-5 py-4">
                                <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                  <Image
                                    src={
                                      p.imageUrl ||
                                      "/uploads/placeholder.jpg"
                                    }
                                    alt={p.name}
                                    fill
                                    unoptimized
                                    sizes="56px"
                                    className="object-cover"
                                  />
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <p className="font-bold text-slate-800">
                                  {p.name}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                                  {formatStock(
                                    p.stock,
                                    p.unitType,
                                  )}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span className="font-semibold text-slate-500">
                                  ${p.costPrice.toFixed(2)}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span className="font-black text-green-700">
                                  ${p.salePrice.toFixed(2)}
                                </span>
                              </td>

                              {/* ESTADO DE VENTA */}
                              <td className="px-5 py-4">
                                {p.showInPOS ? (
                                  <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1.5 text-xs font-black text-green-700">
                                    Disponible
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-600">
                                    No disponible
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <span className="text-sm font-medium text-slate-600">
                                  {p.category?.name ?? "-"}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span className="text-sm font-medium text-slate-600">
                                  {p.supplier?.name ?? "-"}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">
                                  <Link
                                    href={`/products/${p.id}/edit`}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                                  >
                                    <Edit3 size={14} />
                                    Editar
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteProduct(p.id)
                                    }
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:border-red-200 hover:bg-red-100"
                                  >
                                    <Trash2 size={14} />
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

                  {/* TARJETAS MOBILE */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
                    {filteredProducts.map((p) => (
                      <article
                        key={p.id}
                        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                      >
                        <div className="flex gap-4 p-4">
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 sm:h-28 sm:w-28">
                            <Image
                              src={
                                p.imageUrl ||
                                "/uploads/placeholder.jpg"
                              }
                              alt={p.name}
                              fill
                              unoptimized
                              sizes="112px"
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h2 className="break-words text-lg font-black text-slate-900">
                                {p.name}
                              </h2>

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                                <Package size={17} />
                              </div>
                            </div>

                            <div className="mt-2">
                              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                                Stock
                              </p>

                              <p className="mt-0.5 text-sm font-bold text-slate-700">
                                {formatStock(
                                  p.stock,
                                  p.unitType,
                                )}
                              </p>
                            </div>

                            <p className="mt-2 truncate text-xs font-medium text-slate-500">
                              {p.category?.name ?? "Sin categoría"}
                            </p>

                            {/* ESTADO DE VENTA MOBILE */}
                            <div className="mt-2">
                              {p.showInPOS ? (
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-black text-green-700">
                                  Disponible para la venta
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-black text-red-600">
                                  No disponible para la venta
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 px-4 py-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                                Precio costo
                              </p>

                              <p className="mt-1.5 break-words text-lg font-black text-slate-700">
                                ${p.costPrice.toFixed(2)}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-green-100 bg-green-50/70 p-3">
                              <p className="text-[11px] font-black uppercase tracking-wider text-green-600">
                                Precio venta
                              </p>

                              <p className="mt-1.5 break-words text-lg font-black text-green-700">
                                ${p.salePrice.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 p-3">
                              <div className="flex items-center gap-2">
                                <Store
                                  size={14}
                                  className="text-slate-400"
                                />

                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                                  Categoría
                                </span>
                              </div>

                              <p className="mt-1.5 break-words text-sm font-bold text-slate-700">
                                {p.category?.name ?? "-"}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-3">
                              <div className="flex items-center gap-2">
                                <Truck
                                  size={14}
                                  className="text-slate-400"
                                />

                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                                  Proveedor
                                </span>
                              </div>

                              <p className="mt-1.5 break-words text-sm font-bold text-slate-700">
                                {p.supplier?.name ?? "-"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/70 p-4">
                          <Link
                            href={`/products/${p.id}/edit`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                          >
                            <Edit3 size={16} />
                            Editar
                          </Link>

                          <button
                            type="button"
                            onClick={() => deleteProduct(p.id)}
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:border-red-200 hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}