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
      <div className="w-full min-h-full px-4 py-8 sm:px-6 sm:py-12 flex justify-center">
        <div className="w-full max-w-3xl">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full px-4 py-6 sm:px-6 sm:py-8 md:py-10 flex justify-center">
      <div className="w-full max-w-3xl space-y-5 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 break-words">
            Editando: {product.name}
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Modificá la información del producto.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 sm:space-y-6 border border-gray-200 p-4 sm:p-6 rounded-2xl shadow-sm bg-white"
        >
          {/* Nombre */}
          <div>
            <label className="block font-medium mb-1.5">Nombre</label>

            <input
              name="name"
              defaultValue={product.name}
              required
              className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block font-medium mb-1.5">Descripción</label>

            <textarea
              name="description"
              defaultValue={product.description || ""}
              rows={4}
              className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-y"
            />
          </div>

          {/* Barcode / SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1.5">Barcode</label>

              <input
                name="barcode"
                defaultValue={product.barcode || ""}
                className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block font-medium mb-1.5">SKU interno</label>

              <input
                name="sku"
                defaultValue={product.sku || ""}
                className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Stock / Unidad / Coste / Venta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1.5">Stock</label>

              <input
                name="stock"
                type="number"
                step="0.01"
                defaultValue={product.stock}
                required
                className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block font-medium mb-1.5">Tipo de unidad</label>

              <select
                name="unitType"
                defaultValue={product.unitType || "UNIT"}
                className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
              >
                <option value="UNIT">Unidad</option>
                <option value="G">Gramos</option>
                <option value="KG">Kilos</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1.5">Precio costo</label>

              <input
                name="costPrice"
                type="number"
                step="0.01"
                defaultValue={product.costPrice}
                required
                className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block font-medium mb-1.5">Precio venta</label>

              <input
                name="salePrice"
                type="number"
                step="0.01"
                defaultValue={product.salePrice}
                required
                className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Categoría / Proveedor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1.5">Categoría</label>

              <select
                name="categoryId"
                defaultValue={product.categoryId || ""}
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

            <div>
              <label className="block font-medium mb-1.5">Proveedor</label>

              <select
                name="supplierId"
                defaultValue={product.supplierId || ""}
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

          {/* Mostrar en POS */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="showInPOS"
                defaultChecked={product.showInPOS}
                className="w-5 h-5 accent-green-600 shrink-0"
              />

              <span className="font-medium">Mostrar producto a la venta</span>
            </label>
          </div>

          {/* Imagen */}
          <div>
            <label className="block font-medium mb-2">
              Imagen del producto
            </label>

            {uploading && (
              <p className="text-sm text-gray-500 mb-2">Procesando imagen...</p>
            )}

            <div className="w-full max-w-xs aspect-square border border-gray-200 rounded-2xl flex items-center justify-center bg-gray-100 text-gray-400 overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>Sin imagen</span>
              )}
            </div>

            <label className="inline-flex items-center justify-center bg-blue-500 text-white px-5 py-3 mt-3 rounded-xl cursor-pointer hover:bg-blue-600 transition font-medium w-full sm:w-auto">
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

          {/* Guardar */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto bg-green-500 text-white px-6 py-3 rounded-xl cursor-pointer hover:bg-green-600 transition font-semibold shadow-sm"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
