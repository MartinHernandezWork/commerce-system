"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ImageIcon,
  Package,
  Save,
  Store,
  Truck,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateProductPage() {
  const router = useRouter();

  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [errors, setErrors] = useState({
    barcode: "",
    sku: "",
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [catRes, supRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/suppliers"),
      ]);

      setCategories(await catRes.json());
      setSuppliers(await supRes.json());
    }

    fetchData();
  }, []);

  async function uploadImage(file: File) {
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("La imagen original no puede superar los 5 MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("El archivo seleccionado debe ser una imagen.");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    setUploading(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al subir la imagen.");
        return;
      }

      if (!data.url) {
        alert("El servidor no devolvió la URL de la imagen.");
        return;
      }

      setImageUrl(data.url);
    } catch {
      alert("Error de conexión al subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    setErrors({
      barcode: "",
      sku: "",
    });

    if (uploading) {
      alert("Espera a que termine de procesarse la imagen.");
      return;
    }

    const body = {
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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.field === "barcode") {
        setErrors({
          barcode: data.error,
          sku: "",
        });
      } else if (data.field === "sku") {
        setErrors({
          barcode: "",
          sku: data.error,
        });
      } else {
        alert(data.error || "Error al crear el producto");
      }

      return;
    }

    alert("Producto creado correctamente");

    e.target.reset();
    setImageUrl("");
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
                Nuevo producto
              </h1>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                Completá la información del nuevo producto
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
                    required
                    placeholder="Nombre del producto"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Descripción
                  </label>

                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Descripción del producto"
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
                      placeholder="Código de barras"
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 ${
                        errors.barcode
                          ? "border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                          : "border-slate-200 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      }`}
                    />

                    {errors.barcode && (
                      <p className="mt-1.5 text-sm font-semibold text-red-600">
                        {errors.barcode}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">
                      SKU interno
                    </label>

                    <input
                      name="sku"
                      placeholder="SKU del sistema"
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 ${
                        errors.sku
                          ? "border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                          : "border-slate-200 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      }`}
                    />

                    {errors.sku && (
                      <p className="mt-1.5 text-sm font-semibold text-red-600">
                        {errors.sku}
                      </p>
                    )}
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
                      Cantidad inicial y valores del producto
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
                    required
                    placeholder="Cantidad"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Tipo de unidad
                  </label>

                  <select
                    name="unitType"
                    defaultValue="UNIT"
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
                      required
                      placeholder="0.00"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-8 pr-4 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:ring-4 focus:ring-green-100"
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
                      required
                      placeholder="0.00"
                      className="w-full rounded-xl border border-green-200 bg-green-50/30 py-3 pl-8 pr-4 text-sm font-black text-green-700 outline-none transition placeholder:text-green-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
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
                    <Package size={19} />
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
                    defaultChecked={true}
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
                      Agregá una imagen para identificar el producto
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt="Vista previa del producto"
                        width={320}
                        height={320}
                        className="h-full w-full object-contain"
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
                      Imagen del producto
                    </p>

                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      Tamaño máximo del archivo: 5 MB.
                    </p>

                    <label
                      className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition sm:w-fit ${
                        uploading
                          ? "cursor-not-allowed bg-slate-200 text-slate-400"
                          : "cursor-pointer border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      <Upload size={17} />

                      {uploading
                        ? "Procesando..."
                        : "Elegir imagen"}

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];

                          if (file) {
                            uploadImage(file);
                          }

                          e.target.value = "";
                        }}
                      />
                    </label>

                    {uploading && (
                      <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
                        <Upload
                          size={15}
                          className="animate-pulse"
                        />

                        Optimizando imagen...
                      </div>
                    )}

                    {imageUrl && !uploading && (
                      <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-600">
                        <ImageIcon size={15} />

                        Imagen optimizada correctamente.
                      </div>
                    )}
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
                disabled={uploading}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
              >
                <Save size={17} />

                {uploading
                  ? "Procesando imagen..."
                  : "Crear producto"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}