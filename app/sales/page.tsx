"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  stockGrams: number;
  pricePerKg: number;
}

interface Sale {
  id: number;
  product: { name: string };
  quantityGrams: number;
  totalPrice: number;
  createdAt: string;
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [quantityGrams, setQuantityGrams] = useState<string>(""); // placeholder funciona
  const [total, setTotal] = useState<number>(0);
  const [sales, setSales] = useState<Sale[]>([]);

  // Traer productos
  const fetchProducts = async () => {
    const data = await fetch("/api/products").then((res) => res.json());
    setProducts(data);
  };

  // Traer ventas
  const fetchSales = async () => {
    const data = await fetch("/api/sales").then((res) => res.json());
    setSales(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, []);

  // Calcular total automáticamente
  useEffect(() => {
    if (selectedProduct && quantityGrams !== "" && Number(quantityGrams) > 0) {
      const product = products.find((p) => p.id === selectedProduct);
      if (product) {
        setTotal((Number(quantityGrams) / 1000) * product.pricePerKg);
      }
    } else {
      setTotal(0);
    }
  }, [selectedProduct, quantityGrams, products]);

  // Registrar venta
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct || quantityGrams === "" || Number(quantityGrams) <= 0) return;

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProduct,
        quantityGrams: Number(quantityGrams),
      }),
    });

    if (res.ok) {
      alert("Venta registrada con éxito ✅");
      setQuantityGrams("");
      setSelectedProduct(null);
      setTotal(0);
      fetchProducts(); // actualizar stock
      fetchSales();   // actualizar registro
    } else {
      const error = await res.json();
      alert(error.error);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md space-y-6">
      <h1 className="text-xl font-bold">Registrar Venta</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          className="w-full p-2 border rounded-lg"
          value={selectedProduct ?? ""}
          onChange={(e) => setSelectedProduct(Number(e.target.value))}
        >
          <option value="">Seleccionar producto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({(p.stockGrams / 1000).toFixed(2)} kg en stock)
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Cantidad de gramos a vender"
          className="w-full p-2 border rounded-lg"
          value={quantityGrams}
          min={1}
          onChange={(e) => setQuantityGrams(e.target.value)}
        />

        <div className="text-lg font-semibold">Total: ${total.toFixed(2)}</div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Registrar venta
        </button>
      </form>

      {/* Registro de ventas */}
      <div>
        <h2 className="text-lg font-bold mt-6 mb-2">Registro de Ventas</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Producto</th>
              <th className="border p-2">Cantidad (g)</th>
              <th className="border p-2">Total ($)</th>
              <th className="border p-2">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id}>
                <td className="border p-2">{s.id}</td>
                <td className="border p-2">{s.product.name}</td>
                <td className="border p-2">{s.quantityGrams}</td>
                <td className="border p-2">{s.totalPrice.toFixed(2)}</td>
                <td className="border p-2">{new Date(s.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
