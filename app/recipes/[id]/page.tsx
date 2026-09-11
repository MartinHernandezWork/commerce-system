"use client";

import Image from "next/image";
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

  const [imageUrl, setImageUrl] = useState("/uploads/placeholder.jpg");

  const [uploadingImage, setUploadingImage] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");

  const [items, setItems] = useState<RecipeItem[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // PRODUCTOS
      const productsRes = await fetch("/api/products");
      const productsData = await productsRes.json();

      setProducts(productsData);

      // RECETA
      const recipeRes = await fetch(`/api/recipes/${params.id}`);
      const recipeData = await recipeRes.json();

      setName(recipeData.name);
      setPrice(recipeData.price);

      setImageUrl(recipeData.imageUrl || "/uploads/placeholder.jpg");

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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    // VALIDAR TIPO
    if (!file.type.startsWith("image/")) {
      alert("El archivo debe ser una imagen.");
      e.target.value = "";
      return;
    }

    // VALIDAR TAMAÑO
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("La imagen no puede superar los 5 MB.");
      e.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error subiendo imagen.");
        return;
      }

      setImageUrl(data.url);
    } catch (error) {
      console.error(error);
      alert("Error subiendo imagen.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (items.length === 0) {
      alert("La receta necesita ingredientes");
      return;
    }

    if (uploadingImage) {
      alert("Esperá a que termine de procesarse la imagen.");
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
          imageUrl,

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
    return (
      <div className="w-full min-h-full px-4 py-8 sm:px-6 sm:py-12 flex justify-center">
        <div className="w-full max-w-4xl">
          <p className="text-gray-500">Cargando receta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full px-4 py-6 sm:px-6 sm:py-8 md:py-10 flex justify-center">
      <div className="w-full max-w-4xl space-y-5 sm:space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">
            Editar receta
          </h1>

          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Modificá ingredientes, precios e imagen
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* PRECIO */}
            <div className="space-y-2">
              <label className="block font-medium">Precio</label>

              <input
                type="number"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* IMAGEN */}
          <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 bg-gray-50 space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                Imagen
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Podés cambiar la imagen de la receta. Se optimizará
                automáticamente al subirla.
              </p>
            </div>

            {/* PREVIEW */}
            <div className="flex justify-center">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 bg-white border border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
                <Image
                  src={imageUrl}
                  alt={name || "Imagen de receta"}
                  unoptimized
                  fill
                  sizes="192px"
                  className="object-contain"
                />
              </div>
            </div>

            {/* INPUT */}
            <div>
              <label
                htmlFor="recipe-image-upload"
                className={`inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition ${
                  uploadingImage
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                {uploadingImage ? "Procesando..." : "Elegir imagen"}
              </label>

              <input
                id="recipe-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </div>

            {/* ESTADO */}
            {uploadingImage && (
              <p className="text-sm text-blue-600 font-medium">
                Optimizando imagen...
              </p>
            )}

            {!uploadingImage && imageUrl !== "/uploads/placeholder.jpg" && (
              <p className="text-sm text-green-600 font-medium">
                ✓ Imagen lista para guardar
              </p>
            )}
          </div>

          {/* INGREDIENTES */}
          <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-4 bg-gray-50">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                Ingredientes
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Administrá los ingredientes de la receta
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
                step="1"
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
                Agregar
              </button>
            </div>

            {/* LISTA */}
            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-300 rounded-xl p-5 text-center text-sm text-gray-500">
                  No hay ingredientes agregados.
                </div>
              ) : (
                items.map((item) => (
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
                ))
              )}
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
              disabled={uploadingImage}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingImage ? "Procesando imagen..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
