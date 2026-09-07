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

    const product = products.find(
      (p) => p.id === Number(selectedProduct)
    );

    if (!product) return;

    // evitar duplicados
    const alreadyExists = items.find(
      (i) => i.productId === product.id
    );

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
    setItems((prev) =>
      prev.filter((item) => item.productId !== productId)
    );
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold">
          Nueva receta
        </h1>

        <p className="text-gray-500 mt-1">
          Creá una receta usando productos existentes
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-xl p-6 space-y-6"
      >
        {/* DATOS */}
        <div className="grid grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="space-y-2">
            <label className="block font-medium">
              Nombre
            </label>

            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded w-full"
              placeholder="Ej: Hamburguesa clásica"
            />
          </div>

          {/* Precio */}
          <div className="space-y-2">
            <label className="block font-medium">
              Precio de venta
            </label>

            <input
              required
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border p-2 rounded w-full"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* IMAGEN */}
        <div>
          <label className="block font-medium mb-2">
            Imagen de la receta
          </label>

          <label className="inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600">
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

          {uploading && (
            <p className="text-sm text-gray-500 mt-2">
              Procesando imagen...
            </p>
          )}

          <div className="mt-3 w-40 h-40 border rounded flex items-center justify-center bg-gray-100 text-gray-400 overflow-hidden">
            {imageUrl ? (
              <Image
                width={160}
                height={160}  
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
        <div className="border rounded-xl p-4 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Ingredientes
            </h2>

            <p className="text-sm text-gray-500">
              Seleccioná productos y cantidades
            </p>
          </div>

          {/* AGREGAR */}
          <div className="grid grid-cols-3 gap-4">
            <select
              value={selectedProduct}
              onChange={(e) =>
                setSelectedProduct(e.target.value)
              }
              className="border p-2 rounded"
            >
              <option value="">
                Seleccionar producto
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value)
              }
              className="border p-2 rounded"
              placeholder="Cantidad"
            />

            <button
              type="button"
              onClick={addIngredient}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Agregar ingrediente
            </button>
          </div>

          {/* LISTA */}
          <div className="space-y-2">
            {items.length === 0 && (
              <div className="text-sm text-gray-500">
                No hay ingredientes agregados
              </div>
            )}

            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                <div>
                  <div className="font-medium">
                    {item.name}
                  </div>

                  <div className="text-sm text-gray-500">
                    {item.quantity} {item.unitType}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeIngredient(item.productId)
                  }
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/recipes")}
            className="border px-4 py-2 rounded-lg"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={uploading}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
          >
            Crear receta
          </button>
        </div>
      </form>
    </div>
  );
}