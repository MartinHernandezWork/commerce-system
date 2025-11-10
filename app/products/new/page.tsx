"use client";

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
        fetch("/api/suppliers")
      ]);

      setCategories(await catRes.json());
      setSuppliers(await supRes.json());
    }

    fetchData();
  }, []);

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

    if (data.url) setImageUrl(data.url);
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    const body = {
      name: e.target.name.value,
      description: e.target.description.value,
      barcode: e.target.barcode.value,
      sku: e.target.sku.value,
      stock: e.target.stock.value,
      costPrice: e.target.costPrice.value,
      salePrice: e.target.salePrice.value,
      categoryId: e.target.categoryId.value || null,
      supplierId: e.target.supplierId.value || null,
      imageUrl,
    };

    const res = await fetch("/api/products", {
      method: "POST",
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

      <form onSubmit={handleSubmit} className="space-y-6 border p-6 rounded-lg shadow-sm bg-white">

        <div className="space-y-2">
          <label className="block font-medium">Nombre</label>
          <input
            name="name"
            required
            className="border p-2 rounded w-full"
            placeholder="Nombre del producto"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium">Descripción</label>
          <textarea
            name="description"
            className="border p-2 rounded w-full"
            placeholder="Descripción del producto"
          />
        </div>

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

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block font-medium">Stock</label>
            <input
              name="stock"
              type="number"
              required
              className="border p-2 rounded w-full"
              placeholder="Cantidad"
            />
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block font-medium">Categoría</label>
            <select name="categoryId" className="border p-2 rounded w-full">
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
            <select name="supplierId" className="border p-2 rounded w-full">
              <option value="">Sin proveedor</option>
              {suppliers.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Imagen */}
        <div className="space-y-2">
          <label className="block font-medium">Imagen del producto</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => uploadImage(e.target.files?.[0]!)}
          />

          {uploading && <p className="text-sm text-gray-500">Optimizando imagen...</p>}

          {imageUrl && (
            <img
              src={imageUrl}
              className="mt-4 w-40 h-40 object-cover rounded border"
            />
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full font-semibold"
        >
          Crear producto
        </button>
      </form>
    </div>
  );
}
