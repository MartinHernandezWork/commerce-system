"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function CreateProductPage() {
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

    // Máximo 5 MB para la imagen original
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("La imagen original no puede superar los 5 MB.");
      return;
    }

    // Verificar que sea una imagen
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

      // La API devuelve la URL de la imagen optimizada
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

    // No permitir crear mientras se está procesando la imagen
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
    <div className="w-full min-h-full px-4 py-6 sm:px-6 sm:py-8 md:py-10 flex justify-center">
      <div className="w-full max-w-3xl space-y-5 sm:space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">
            Crear Producto
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Completá la información del nuevo producto.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 sm:space-y-6 border border-gray-200 p-4 sm:p-6 rounded-2xl shadow-sm bg-white"
        >
          {/* NOMBRE */}
          <div className="space-y-2">
            <label className="block font-medium">Nombre</label>

            <input
              name="name"
              required
              className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Nombre del producto"
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div className="space-y-2">
            <label className="block font-medium">Descripción</label>

            <textarea
              name="description"
              rows={4}
              className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-y"
              placeholder="Descripción del producto"
            />
          </div>

          {/* BARCODE / SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-medium">Barcode</label>

              <input
                name="barcode"
                className={`border p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.barcode
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300"
                }`}
                placeholder="Código de barras"
              />

              {errors.barcode && (
                <p className="text-sm text-red-600 font-medium">
                  {errors.barcode}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block font-medium">SKU interno</label>

              <input
                name="sku"
                className={`border p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.sku
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300"
                }`}
                placeholder="SKU del sistema"
              />

              {errors.sku && (
                <p className="text-sm text-red-600 font-medium">{errors.sku}</p>
              )}
            </div>
          </div>

          {/* STOCK / UNIDAD / PRECIOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-medium">Stock</label>

              <input
                name="stock"
                type="number"
                step="0.01"
                required
                className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Cantidad"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium">Tipo de unidad</label>

              <select
                name="unitType"
                className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                defaultValue="UNIT"
              >
                <option value="UNIT">Unidad</option>
                <option value="G">Gramos</option>
                <option value="KG">Kilos</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-medium">Precio costo</label>

              <input
                name="costPrice"
                type="number"
                step="0.01"
                required
                className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium">Precio venta</label>

              <input
                name="salePrice"
                type="number"
                step="0.01"
                required
                className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* CATEGORÍA / PROVEEDOR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-medium">Categoría</label>

              <select
                name="categoryId"
                className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
              >
                <option value="">Sin categoría</option>

                {categories.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-medium">Proveedor</label>

              <select
                name="supplierId"
                className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
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

          {/* MOSTRAR EN POS */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="showInPOS"
                defaultChecked={true}
                className="w-5 h-5 accent-green-600 shrink-0"
              />

              <span className="font-medium">Mostrar producto a la venta</span>
            </label>
          </div>

          {/* IMAGEN */}
          <div>
            <label className="block font-medium mb-2">
              Imagen del producto <span className="text-red-500">*</span>
            </label>

            <p className="text-sm text-gray-500 mb-3">
              La imagen es obligatoria. Tamaño máximo del archivo original: 5
              MB. Se optimizará automáticamente al subirla.
            </p>

            {/* VISTA PREVIA */}
            <div className="mb-3 w-full max-w-xs aspect-square border border-gray-200 rounded-2xl flex items-center justify-center bg-gray-100 text-gray-400 overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Vista previa del producto"
                  width={320}
                  height={320}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Image
                  src="/uploads/placeholder.jpg"
                  alt="Sin imagen"
                  width={320}
                  height={320}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* BOTÓN SUBIR */}
            <label
              className={`inline-flex items-center justify-center px-5 py-3 rounded-xl text-white font-medium transition w-full sm:w-auto ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
              }`}
            >
              {uploading ? "Procesando..." : "Elegir imagen"}

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

                  // Permite volver a seleccionar el mismo archivo
                  e.target.value = "";
                }}
              />
            </label>

            {uploading && (
              <p className="text-sm text-gray-500 mt-2">
                Optimizando imagen...
              </p>
            )}

            {imageUrl && !uploading && (
              <p className="text-sm text-green-600 mt-2">
                Imagen optimizada correctamente.
              </p>
            )}
          </div>

          {/* CREAR */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="w-full sm:w-auto bg-green-500 text-white px-6 py-3 rounded-xl font-semibold transition hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
            >
              {uploading ? "Procesando imagen..." : "Crear producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
