"use client";

import { useState } from "react";

export default function NewProductPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    barcode: "",
  });

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Asegurarse de que el barcode empiece con #
    const barcode = form.barcode
      ? form.barcode.startsWith("#")
        ? form.barcode
        : `#${form.barcode}`
      : "";

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        barcode,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage({ text: `Producto "${data.name}" creado correctamente!✅`, type: "success" });
      setForm({ name: "", description: "", price: "", stock: "", barcode: "" });
    } else {
      setMessage({ text: data.error || "Error creando el producto. ❌", type: "error" });
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Agregar un producto</h1>

      {message && (
        <div
          className={`mb-4 p-2 rounded ${
            message.type === "success" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 w-full"
          required
        />
        <input
          placeholder="Descripción"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          type="number"
          placeholder="Precio"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border p-2 w-full"
          required
        />
        <input
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="border p-2 w-full"
          required
        />
        <input
          placeholder="Codigo de barras"
          value={form.barcode}
          onChange={(e) => setForm({ ...form, barcode: e.target.value })}
          className="border p-2 w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Agregar
        </button>
      </form>
    </div>
  );
}
