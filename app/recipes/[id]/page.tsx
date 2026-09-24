"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChefHat,
  ImageIcon,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";

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
      const productsRes = await fetch("/api/products");
      const productsData = await productsRes.json();

      setProducts(productsData);

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

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("El archivo debe ser una imagen.");
      e.target.value = "";
      return;
    }

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

  function getQuantityPlaceholder(unitType: string) {
    const normalized = unitType.toLowerCase();

    if (normalized === "unidad" || normalized === "unit") {
      return "Cantidad (un)";
    }

    if (normalized === "gramos" || normalized === "g") {
      return "Cantidad (gr)";
    }

    if (normalized === "kilo" || normalized === "kg") {
      return "Cantidad (kg)";
    }

    return `Cantidad (${unitType})`;
  }

  function addIngredient() {
    if (!selectedProduct || !quantity) return;

    const numericQuantity = Number(quantity);

    if (numericQuantity <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }

    const product = products.find(
      (p) => p.id === Number(selectedProduct),
    );

    if (!product) return;

    const alreadyExists = items.find(
      (item) => item.productId === product.id,
    );

    if (alreadyExists) {
      alert("Ese ingrediente ya existe.");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        quantity: numericQuantity,
        unitType: product.unitType,
      },
    ]);

    setSelectedProduct("");
    setQuantity("");
  }

  function removeIngredient(productId: number) {
    setItems((prev) =>
      prev.filter((item) => item.productId !== productId),
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      alert("El nombre de la receta es obligatorio.");
      return;
    }

    if (!price || Number(price) <= 0) {
      alert("El precio debe ser mayor a 0.");
      return;
    }

    if (items.length === 0) {
      alert("La receta necesita ingredientes.");
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
          name: name.trim(),
          price: Number(price),
          imageUrl,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error || "Error actualizando receta.");
        return;
      }

      alert("Receta actualizada correctamente.");
      router.push("/recipes");
    } catch (error) {
      console.error(error);
      alert("Error actualizando receta.");
    }
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center rounded-3xl border border-slate-200 bg-[#f6f8f7]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50">
            <ChefHat className="h-6 w-6 text-green-600" />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Cargando receta...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#f6f8f7]">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50">
              <ChefHat className="h-5 w-5 text-green-600" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Editar receta
              </h1>

              <p className="text-sm text-slate-500">
                Modificá los ingredientes, precio e imagen
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/recipes")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a recetas
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-5xl space-y-5"
        >
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Información básica
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Actualizá los datos principales de la receta.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="recipe-name"
                  className="text-sm font-semibold text-slate-700"
                >
                  Nombre
                </label>

                <input
                  id="recipe-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Pancho completo"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-4 focus:ring-green-50"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="recipe-price"
                  className="text-sm font-semibold text-slate-700"
                >
                  Precio
                </label>

                <input
                  id="recipe-price"
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ej. 5000"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-4 focus:ring-green-50"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                  <ImageIcon className="h-5 w-5 text-green-600" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Imagen de la receta
                  </h2>

                  <p className="text-sm text-slate-500">
                    Podés cambiar la imagen. Se optimiza automáticamente.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-5">
              <div className="relative flex h-52 w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <Image
                  src={imageUrl}
                  alt={name || "Imagen de receta"}
                  unoptimized
                  fill
                  sizes="384px"
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col items-center gap-3">
                <label
                  htmlFor="recipe-image-upload"
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
                    uploadingImage
                      ? "cursor-not-allowed bg-slate-300"
                      : "cursor-pointer bg-green-600 hover:bg-green-700"
                  }`}
                >
                  <Upload className="h-4 w-4" />

                  {uploadingImage
                    ? "Procesando..."
                    : "Elegir imagen"}
                </label>

                <input
                  id="recipe-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />

                {uploadingImage && (
                  <p className="text-sm font-medium text-amber-600">
                    Optimizando imagen...
                  </p>
                )}

                {!uploadingImage &&
                  imageUrl !== "/uploads/placeholder.jpg" && (
                    <p className="text-sm font-medium text-green-600">
                      Imagen lista para guardar
                    </p>
                  )}

                <p className="text-xs text-slate-400">
                  JPG, PNG, WEBP u otro formato de imagen · Máximo 5 MB
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Ingredientes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Administrá los productos que componen esta receta.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_190px_auto]">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-50"
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
                min="0"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={
                  selectedProduct
                    ? getQuantityPlaceholder(
                        products.find(
                          (product) =>
                            product.id === Number(selectedProduct),
                        )?.unitType || "",
                      )
                    : "Cantidad"
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-4 focus:ring-green-50"
              />

              <button
                type="button"
                onClick={addIngredient}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white">
                    <ChefHat className="h-5 w-5 text-slate-400" />
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No hay ingredientes agregados.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Seleccioná un producto y agregalo a la receta.
                  </p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div
                    key={item.productId}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-bold text-slate-500">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <p className="break-words font-semibold text-slate-800">
                          {item.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Cantidad:{" "}
                          <span className="font-semibold text-slate-700">
                            {item.quantity} {item.unitType}
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeIngredient(item.productId)
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="mt-4 rounded-xl bg-green-50 px-4 py-3">
                <p className="text-sm font-medium text-green-700">
                  {items.length}{" "}
                  {items.length === 1
                    ? "ingrediente agregado"
                    : "ingredientes agregados"}
                </p>
              </div>
            )}
          </section>

          <div className="flex flex-col-reverse gap-3 pb-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/recipes")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </button>

            <button
              type="submit"
              disabled={uploadingImage}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Save className="h-4 w-4" />

              {uploadingImage
                ? "Procesando imagen..."
                : "Guardar cambios"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}