"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function EditRecipePage() {
  const params = useParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");

  const [items, setItems] = useState<RecipeItem[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // productos
      const productsRes = await fetch("/api/products");
      const productsData = await productsRes.json();

      setProducts(productsData);

      // receta
      const recipeRes = await fetch(`/api/recipes/${params.id}`);

      const recipeData = await recipeRes.json();

      setName(recipeData.name);
      setPrice(recipeData.price);

      setItems(
        recipeData.items.map((item: any) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          unitType: item.product.unitType,
        })),
      );
    } catch (error) {
      console.error(error);
      alert("Error cargando receta");
    } finally {
      setLoading(false);
    }
  }

  function addIngredient() {
    if (!selectedProduct || !quantity) return;

    const product = products.find((p) => p.id === Number(selectedProduct));

    if (!product) return;

    const alreadyExists = items.find((i) => i.productId === product.id);

    if (alreadyExists) {
      alert("Ese ingrediente ya existe");
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
      alert("La receta necesita ingredientes");
      return;
    }

    try {
      const res = await fetch(`/api/recipes/${params.id}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          price: Number(price),

          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        alert("Error actualizando receta");
        return;
      }

      alert("Receta actualizada");

      router.push("/recipes");
    } catch (error) {
      console.error(error);
      alert("Error actualizando receta");
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-500">Cargando receta...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold">Editar receta</h1>

        <p className="text-gray-500 mt-1">Modificá ingredientes y precios</p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-xl p-6 space-y-6"
      >
        {/* DATOS */}
        <div className="grid grid-cols-2 gap-4">
          {/* NOMBRE */}
          <div className="space-y-2">
            <label className="block font-medium">Nombre</label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* PRECIO */}
          <div className="space-y-2">
            <label className="block font-medium">Precio</label>

            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        {/* INGREDIENTES */}
        <div className="border rounded-xl p-4 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Ingredientes</h2>

            <p className="text-sm text-gray-500">
              Administrá los ingredientes de la receta
            </p>
          </div>

          {/* AGREGAR */}
          <div className="grid grid-cols-3 gap-4">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="border p-2 rounded"
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
              className="border p-2 rounded"
              placeholder="Cantidad"
            />

            <button
              type="button"
              onClick={addIngredient}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Agregar
            </button>
          </div>

          {/* LISTA */}
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                <div>
                  <div className="font-medium">{item.name}</div>

                  <div className="text-sm text-gray-500">
                    {item.quantity} {item.unitType}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeIngredient(item.productId)}
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
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
