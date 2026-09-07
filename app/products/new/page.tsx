"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function CreateProductPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

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

    // Máximo 5 MB
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("La imagen no puede superar los 5 MB.");
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

      setImageUrl(data.url);
    } catch {
      alert("Error de conexión al subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    // La imagen es obligatoria
    if (!imageUrl) {
      alert("Debes subir una imagen del producto antes de continuar.");
      return;
    }

    // No permitir crear mientras se está subiendo
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

    if (!res.ok) {
      alert("Error al crear el producto");
      return;
    }

    alert("Producto creado correctamente");

    e.target.reset();
    setImageUrl("");
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Crear Producto</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 border p-6 rounded-lg shadow-sm bg-white"
      >
        {/* NOMBRE */}
        <div className="space-y-2">
          <label className="block font-medium">Nombre</label>

          <input
            name="name"
            required
            className="border p-2 rounded w-full"
            placeholder="Nombre del producto"
          />
        </div>

        {/* DESCRIPCIÓN */}
        <div className="space-y-2">
          <label className="block font-medium">Descripción</label>

          <textarea
            name="description"
            className="border p-2 rounded w-full"
            placeholder="Descripción del producto"
          />
        </div>

        {/* BARCODE / SKU */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block font-medium">Barcode</label>

            <input
              name="barcode"
              className="border p-2 rounded w-full"
              placeholder="Código de barras"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-medium">SKU interno</label>

            <input
              name="sku"
              className="border p-2 rounded w-full"
              placeholder="SKU del sistema"
            />
          </div>
        </div>

        {/* STOCK / UNIDAD / PRECIOS */}
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block font-medium">Stock</label>

            <input
              name="stock"
              type="number"
              step="0.01"
              required
              className="border p-2 rounded w-full"
              placeholder="Cantidad"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-medium">Tipo de unidad</label>

            <select
              name="unitType"
              className="border p-2 rounded w-full"
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
              className="border p-2 rounded w-full"
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
              className="border p-2 rounded w-full"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* CATEGORÍA / PROVEEDOR */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block font-medium">Categoría</label>

            <select
              name="categoryId"
              className="border p-2 rounded w-full"
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
              className="border p-2 rounded w-full"
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
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="showInPOS"
            defaultChecked={true}
            className="w-5 h-5"
          />

          <label className="font-medium">
            Mostrar producto a la venta
          </label>
        </div>

        {/* IMAGEN */}
        <div>
          <label className="block font-medium mb-2">
            Imagen del producto{" "}
            <span className="text-red-500">*</span>
          </label>

          <p className="text-sm text-gray-500 mb-3">
            La imagen es obligatoria. Tamaño máximo: 5 MB.
          </p>

          {/* VISTA PREVIA */}
          <div className="mb-3 w-40 h-40 border rounded flex items-center justify-center bg-gray-100 text-gray-400 overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Vista previa del producto"
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>Sin imagen</span>
            )}
          </div>

          {/* BOTÓN SUBIR */}
          <label
            className={`inline-block px-4 py-2 rounded text-white ${
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
              Procesando imagen...
            </p>
          )}
        </div>

        {/* CREAR */}
        <button
          type="submit"
          disabled={uploading}
          className="inline-block bg-green-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? "Procesando imagen..." : "Crear producto"}
        </button>
      </form>
    </div>
  );
}