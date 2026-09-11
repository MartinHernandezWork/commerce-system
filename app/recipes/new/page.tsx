"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Product = {
  id: number;
  name: string;
  unitType: string;
};

type RecipeItem = {
  productId: number;
  name: string;
  quantity: number;
  unitType: string;
};

export default function NewRecipePage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");

  const [items, setItems] = useState<RecipeItem[]>([]);

  // IMAGEN
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();

      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  }

  // SUBIR IMAGEN
  async function uploadImage(file: File) {
    const form = new FormData();

    form.append("file", file);

    setUploading(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.url) {
        setImageUrl(data.url);
      } else {
        alert("Error al subir la imagen");
      }
    } catch (error) {
      console.error(error);
      alert("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  function addIngredient() {
    if (!selectedProduct || !quantity) return;

    const product = products.find((p) => p.id === Number(selectedProduct));

    if (!product) return;

    // evitar duplicados
    const alreadyExists = items.find((i) => i.productId === product.id);

    if (alreadyExists) {
      alert("Ese ingrediente ya fue agregado");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        quantity: Number(quantity),
        unitType: product.unitType,
      },
    ]);

    setSelectedProduct("");
    setQuantity("");
  }

  function removeIngredient(productId: number) {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (items.length === 0) {
      alert("Agregá al menos un ingrediente");
      return;
    }

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          price: Number(price),

          // IMAGEN
          imageUrl,

          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        alert("Error creando receta");
        return;
      }

      alert("Receta creada correctamente");

      router.push("/recipes");
    } catch (error) {
      console.error(error);
      alert("Error creando receta");
    }
  }

  return (
    <div className="w-full min-h-full px-4 py-6 sm:px-6 sm:py-8 md:py-10 flex justify-center">
      <div className="w-full max-w-4xl space-y-5 sm:space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">
            Nueva receta
          </h1>

          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Creá una receta usando productos existentes
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 space-y-5 sm:space-y-6 shadow-sm"
        >
          {/* DATOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* NOMBRE */}
            <div className="space-y-2">
              <label className="block font-medium">Nombre</label>

              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: Hamburguesa clásica"
              />
            </div>

            {/* PRECIO */}
            <div className="space-y-2">
              <label className="block font-medium">Precio de venta</label>

              <input
                required
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* IMAGEN */}
          <div>
            <label className="block font-medium mb-2">
              Imagen de la receta
            </label>

            <p className="text-sm text-gray-500 mb-3">
              Podés agregar una imagen para identificar la receta.
            </p>

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
              <p className="text-sm text-gray-500 mt-2">Procesando imagen...</p>
            )}

            {/* VISTA PREVIA */}
            <div className="mt-4 w-full max-w-xs aspect-square border border-gray-200 rounded-2xl flex items-center justify-center bg-gray-100 text-gray-400 overflow-hidden">
              {imageUrl ? (
                <Image
                  width={320}
                  height={320}
                  src={imageUrl}
                  alt="Imagen de la receta"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>Sin imagen</span>
              )}
            </div>
          </div>

          {/* INGREDIENTES */}
          <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-4 bg-gray-50">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                Ingredientes
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Seleccioná productos y cantidades
              </p>
            </div>

            {/* AGREGAR */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-3">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="border border-slate-300 p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              >
                <option value="">Seleccionar producto</option>

                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="border border-slate-300 p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                placeholder="Cantidad"
              />

              <button
                type="button"
                onClick={addIngredient}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-3 font-semibold transition cursor-pointer"
              >
                Agregar ingrediente
              </button>
            </div>

            {/* LISTA */}
            <div className="space-y-2">
              {items.length === 0 && (
                <div className="bg-white border border-dashed border-gray-300 rounded-xl p-5 text-center text-sm text-gray-500">
                  No hay ingredientes agregados.
                </div>
              )}

              {items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800 break-words">
                      {item.name}
                    </div>

                    <div className="text-sm text-gray-500 mt-1">
                      Cantidad:{" "}
                      <span className="font-medium">
                        {item.quantity} {item.unitType}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeIngredient(item.productId)}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-3 sm:py-2 rounded-xl font-medium transition cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => router.push("/recipes")}
              className="w-full sm:w-auto border border-gray-300 hover:bg-gray-100 px-5 py-3 rounded-xl font-medium transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={uploading}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-semibold transition cursor-pointer"
            >
              {uploading ? "Procesando imagen..." : "Crear receta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
