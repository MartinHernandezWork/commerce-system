"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ImageIcon,
  Package,
  Save,
  Store,
  Truck,
  Upload,
} from "lucide-react";

export default function EditProduct(props: any) {
  const router = useRouter();

  const rawParams = React.use(props.params) as { id: string };
  const { id } = rawParams;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    async function load() {
      const [pRes, catRes, supRes] = await Promise.all([
        fetch(`/api/products/${id}`),
        fetch("/api/categories"),
        fetch("/api/suppliers"),
      ]);

      const prod = await pRes.json();

      if (pRes.status !== 200) {
        alert("Producto no encontrado");
        router.push("/products");
        return;
      }

      setProduct(prod);
      setImageUrl(prod.imageUrl || "");
      setCategories(await catRes.json());
      setSuppliers(await supRes.json());
      setLoading(false);
    }

    load();
  }, [id, router]);

  async function uploadImage(file: File) {
    const form = new FormData();
    form.append("file", file);
    setUploading(true);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setUploading(false);

    if (data.url) {
      setImageUrl(data.url);
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    const body = {
      id,
      name: e.target.name.value,
      description: e.target.description.value,
      barcode: e.target.barcode.value,
      sku: e.target.sku.value,
      stock: e.target.stock.value,
      unitType: e.target.unitType.value,
      costPrice: e.target.costPrice.value,
      salePrice: e.target.salePrice.value,
      categoryId: e.target.categoryId.value || null,
      supplierId: e.target.supplierId.value || null,
      showInPOS: e.target.showInPOS.checked,
      imageUrl,
    };

    const res = await fetch("/api/products", {
      method: "PUT",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      alert("Error al actualizar producto");
      return;
    }

    alert("Producto actualizado correctamente");
    router.push("/products");
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center rounded-3xl border border-slate-200 bg-[#f6f8f7]">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600">
            <Package
              size={23}
              className="animate-pulse"
            />
          </div>

          <p className="font-semibold text-slate-700">
            Cargando producto...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Estamos preparando la información del producto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#f6f8f7]">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <Package size={21} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black tracking-tight text-slate-900">
                Editar producto
              </h1>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                Modificá la información de {product.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/products")}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 sm:w-auto"
          >
            <ArrowLeft size={17} />
            Volver a productos
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <Package size={19} />
                  </div>

                  <div>
                    <h2 className="font-black text-slate-900">
                      Información básica
                    </h2>

                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                      Datos principales del producto
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Nombre
                  </label>

                  <input
                    name="name"
                    defaultValue={product.name}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Descripción
                  </label>

                  <textarea
                    name="description"
                    defaultValue={product.description || ""}
                    rows={4}
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">
                      Barcode
                    </label>

                    <input
                      name="barcode"
                      defaultValue={product.barcode || ""}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">
                      SKU interno
                    </label>

                    <input
                      name="sku"
                      defaultValue={product.sku || ""}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <Store size={19} />
                  </div>

                  <div>
                    <h2 className="font-black text-slate-900">
                      Stock y precios
                    </h2>

                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                      Cantidad disponible y valores del producto
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Stock
                  </label>

                  <input
                    name="stock"
                    type="number"
                    step="0.01"
                    defaultValue={product.stock}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Tipo de unidad
                  </label>

                  <select
                    name="unitType"
                    defaultValue={product.unitType || "UNIT"}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                  >
                    <option value="UNIT">Unidad</option>
                    <option value="G">Gramos</option>
                    <option value="KG">Kilos</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Precio costo
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      $
                    </span>

                    <input
                      name="costPrice"
                      type="number"
                      step="0.01"
                      defaultValue={product.costPrice}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-8 pr-4 text-sm font-bold text-slate-700 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Precio venta
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-green-600">
                      $
                    </span>

                    <input
                      name="salePrice"
                      type="number"
                      step="0.01"
                      defaultValue={product.salePrice}
                      required
                      className="w-full rounded-xl border border-green-200 bg-green-50/30 py-3 pl-8 pr-4 text-sm font-black text-green-700 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Truck size={19} />
                  </div>

                  <div>
                    <h2 className="font-black text-slate-900">
                      Clasificación
                    </h2>

                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                      Categoría y proveedor del producto
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Categoría
                  </label>

                  <select
                    name="categoryId"
                    defaultValue={product.categoryId || ""}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                  >
                    <option value="">Sin categoría</option>

                    {categories.map((c) => (
                      <option value={c.id} key={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Proveedor
                  </label>

                  <select
                    name="supplierId"
                    defaultValue={product.supplierId || ""}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                  >
                    <option value="">Sin proveedor</option>

                    {suppliers.map((s) => (
                      <option value={s.id} key={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <ShoppingCartIcon />
                  </div>

                  <div>
                    <h2 className="font-black text-slate-900">
                      Disponibilidad en POS
                    </h2>

                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                      Controlá si el producto aparece para vender
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-green-200 hover:bg-green-50/50">
                  <input
                    type="checkbox"
                    name="showInPOS"
                    defaultChecked={product.showInPOS}
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-green-600"
                  />

                  <div>
                    <p className="font-bold text-slate-800">
                      Mostrar producto a la venta
                    </p>

                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      Si está activado, este producto estará
                      disponible para seleccionarlo desde el
                      punto de venta.
                    </p>
                  </div>
                </label>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <ImageIcon size={19} />
                  </div>

                  <div>
                    <h2 className="font-black text-slate-900">
                      Imagen del producto
                    </h2>

                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                      Actualizá la imagen que identifica al producto
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {uploading && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
                    <Upload
                      size={16}
                      className="animate-pulse"
                    />

                    Procesando imagen...
                  </div>
                )}

                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                        <ImageIcon size={32} />

                        <span className="mt-2 text-sm font-semibold">
                          Sin imagen
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-sm font-bold text-slate-700">
                      Cambiar imagen
                    </p>

                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      Seleccioná una nueva imagen para actualizar
                      la foto del producto.
                    </p>

                    <label className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 sm:w-fit">
                      <Upload size={17} />
                      Elegir imagen

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];

                          if (file) {
                            uploadImage(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/products")}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-green-700 sm:w-auto"
              >
                <Save size={17} />
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function ShoppingCartIcon() {
  return <Package size={19} />;
}