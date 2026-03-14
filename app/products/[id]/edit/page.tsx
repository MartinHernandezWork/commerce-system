"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProduct(props: any) {
  const router = useRouter();

  // ✅ En Next.js 15, params es un Promise → lo resolvemos
  const rawParams = React.use(props.params) as { id: string };
  const { id } = rawParams;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // ✅ Cargar datos iniciales
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

    if (data.url) setImageUrl(data.url);
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
      costPrice: e.target.costPrice.value,
      salePrice: e.target.salePrice.value,
      categoryId: e.target.categoryId.value || null,
      supplierId: e.target.supplierId.value || null,
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

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Editando: {product.name}</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 border p-6 rounded-lg shadow-sm bg-white"
      >
        <div>
          <label className="block font-medium">Nombre</label>
          <input
            name="name"
            defaultValue={product.name}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Descripción</label>
          <textarea
            name="description"
            defaultValue={product.description || ""}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Barcode</label>
            <input
              name="barcode"
              defaultValue={product.barcode || ""}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block font-medium">SKU interno</label>
            <input
              name="sku"
              defaultValue={product.sku || ""}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-medium">Stock</label>
            <input
              name="stock"
              type="number"
              defaultValue={product.stock}
              required
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block font-medium">Precio costo</label>
            <input
              name="costPrice"
              type="number"
              step="0.01"
              defaultValue={product.costPrice}
              required
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block font-medium">Precio venta</label>
            <input
              name="salePrice"
              type="number"
              step="0.01"
              defaultValue={product.salePrice}
              required
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Categoría</label>
            <select
              name="categoryId"
              defaultValue={product.categoryId || ""}
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

          <div>
            <label className="block font-medium">Proveedor</label>
            <select
              name="supplierId"
              defaultValue={product.supplierId || ""}
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

        {/* Imagen */}
        <div>
          <label className="block font-medium mb-2">Imagen del producto</label>

          <label className="inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600">
            Elegir imagen
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => uploadImage(e.target.files?.[0]!)}
            />
          </label>

          {uploading && (
            <p className="text-sm text-gray-500 mt-2">Procesando imagen...</p>
          )}

          <div className="mt-3 w-40 h-40 border rounded flex items-center justify-center bg-gray-100 text-gray-400">
            {imageUrl ? (
              <img src={imageUrl} className="w-full h-full object-cover" />
            ) : (
              <span>Sin imagen</span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="inline-block bg-green-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-600"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
