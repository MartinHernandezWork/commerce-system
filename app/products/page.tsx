"use client";

import { useState } from "react";

export default function NewProductPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    pricePerKg: "",
    stockGrams: "",
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
        pricePerKg: parseFloat(form.pricePerKg),
        stockGrams: parseInt(form.stockGrams),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage({ text: `Producto "${data.name}" creado correctamente! ✅`, type: "success" });
      setForm({ name: "", description: "", pricePerKg: "", stockGrams: "", barcode: "" });
    } else {
      setMessage({ text: data.error || "Error creando el producto. ❌", type: "error" });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md space-y-4">
      <h1 className="text-xl font-bold mb-2">Agregar un producto</h1>

      {message && (
        <div
          className={`p-2 rounded ${
            message.type === "success" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-2 border rounded-lg"
          required
        />
        <input
          placeholder="Descripción"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full p-2 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Precio por kilo"
          value={form.pricePerKg}
          onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
          className="w-full p-2 border rounded-lg"
          required
        />
        <input
          type="number"
          placeholder="Stock en gramos"
          value={form.stockGrams}
          onChange={(e) => setForm({ ...form, stockGrams: e.target.value })}
          className="w-full p-2 border rounded-lg"
          required
        />
        <input
          placeholder="Código de barras"
          value={form.barcode}
          onChange={(e) => setForm({ ...form, barcode: e.target.value })}
          className="w-full p-2 border rounded-lg"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Agregar
        </button>
      </form>
    </div>
  );
}
