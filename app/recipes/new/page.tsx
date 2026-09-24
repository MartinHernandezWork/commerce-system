"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NewRecipePage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");

  const [items, setItems] = useState<RecipeItem[]>([]);

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

  function getQuantityPlaceholder() {
    const product = products.find(
      (p) => p.id === Number(selectedProduct),
    );

    if (!product) return "Cantidad";

    switch (product.unitType.toLowerCase()) {
      case "unidad":
        return "Cantidad (un)";

      case "gramos":
        return "Cantidad (gr)";

      case "kilo":
        return "Cantidad (kg)";

      case "unit":
        return "Cantidad (un)";

      case "g":
        return "Cantidad (gr)";

      case "kg":
        return "Cantidad (kg)";

      default:
        return `Cantidad (${product.unitType})`;
    }
  }

  async function uploadImage(file: File) {
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("La imagen original no puede superar los 5 MB.");
      return;
    }

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
    } catch (error) {
      console.error(error);
      alert("Error al subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  function addIngredient() {
    if (!selectedProduct || !quantity) return;

    const product = products.find(
      (p) => p.id === Number(selectedProduct),
    );

    if (!product) return;

    const alreadyExists = items.find(
      (i) => i.productId === product.id,
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
      prev.filter((item) => item.productId !== productId),
    );
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Ingresá un nombre para la receta.");
      return;
    }

    if (!price || Number(price) <= 0) {
      alert("Ingresá un precio de venta válido.");
      return;
    }

    if (items.length === 0) {
      alert("Agregá al menos un ingrediente");
      return;
    }

    if (uploading) {
      alert("Espera a que termine de procesarse la imagen.");
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
          imageUrl,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error creando receta");
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#f6f8f7]">
      {/* HEADER */}
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <ChefHat size={21} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black tracking-tight text-slate-900">
                Nueva receta
              </h1>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                Creá una receta usando productos existentes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/recipes")}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 sm:w-auto"
          >
            <ArrowLeft size={17} />
            Volver a recetas
          </button>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* INFORMACIÓN BÁSICA */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <ChefHat size={19} />
                  </div>

                  <div>
                    <h2 className="font-black text-slate-900">
                      Información básica
                    </h2>

                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                      Nombre y precio de venta
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Nombre
                  </label>

                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Hamburguesa clásica"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Precio de venta
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-green-600">
                      $
                    </span>

                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-green-200 bg-green-50/30 py-3 pl-8 pr-4 text-sm font-black text-green-700 outline-none transition placeholder:text-green-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* INGREDIENTES */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Plus size={19} />
                  </div>

                  <div>
                    <h2 className="font-black text-slate-900">
                      Ingredientes
                    </h2>

                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                      Seleccioná productos y cantidades
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                {/* AGREGAR INGREDIENTE */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_auto]">
                    <select
                      value={selectedProduct}
                      onChange={(e) => {
                        setSelectedProduct(e.target.value);
                        setQuantity("");
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
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
                      min="0"
                      step="0.01"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(e.target.value)
                      }
                      placeholder={getQuantityPlaceholder()}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                    />

                    <button
                      type="button"
                      onClick={addIngredient}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
                    >
                      <Plus size={17} />
                      Agregar
                    </button>
                  </div>
                </div>

                {/* LISTA */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Ingredientes agregados
                    </p>

                    <span className="text-xs font-semibold text-slate-400">
                      {items.length}{" "}
                      {items.length === 1
                        ? "ingrediente"
                        : "ingredientes"}
                    </span>
                  </div>

                  {items.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-300">
                        <Plus size={20} />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-500">
                        No hay ingredientes agregados
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Seleccioná un producto y agregalo a la
                        receta.
                      </p>
                    </div>
                  )}

                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                          <ChefHat size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="break-words text-sm font-bold text-slate-800">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-400">
                            Cantidad:{" "}
                            <span className="font-bold text-slate-600">
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
                        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:border-red-200 hover:bg-red-100 sm:w-auto"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* IMAGEN */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <ImageIcon size={19} />
                  </div>

                  <div>
                    <h2 className="font-black text-slate-900">
                      Imagen de la receta
                    </h2>

                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                      Agregá una imagen para identificar la receta
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {imageUrl ? (
                      <Image
                        width={320}
                        height={320}
                        src={imageUrl}
                        alt="Imagen de la receta"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-slate-300">
                        <ImageIcon size={32} />

                        <span className="mt-2 text-sm font-semibold">
                          Sin imagen
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-sm font-bold text-slate-700">
                      Imagen de la receta
                    </p>

                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      Tamaño máximo del archivo: 5 MB.
                    </p>

                    <label
                      className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition sm:w-fit ${
                        uploading
                          ? "cursor-not-allowed bg-slate-200 text-slate-400"
                          : "cursor-pointer border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      <Upload size={17} />

                      {uploading
                        ? "Procesando..."
                        : "Elegir imagen"}

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

                          e.target.value = "";
                        }}
                      />
                    </label>

                    {uploading && (
                      <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
                        <Upload
                          size={15}
                          className="animate-pulse"
                        />

                        Procesando imagen...
                      </div>
                    )}

                    {imageUrl && !uploading && (
                      <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-600">
                        <ImageIcon size={15} />

                        Imagen optimizada correctamente.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* BOTONES */}
            <div className="flex flex-col-reverse gap-3 pb-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/recipes")}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
              >
                <ArrowLeft size={17} />
                Cancelar
              </button>

              <button
                type="submit"
                disabled={uploading}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
              >
                <Save size={17} />

                {uploading
                  ? "Procesando imagen..."
                  : "Crear receta"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}