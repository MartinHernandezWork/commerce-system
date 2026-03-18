"use client";

import { useEffect, useState } from "react";

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);

  async function loadData() {
    const p = await fetch("/api/products").then((r) => r.json());
    const c = await fetch("/api/categories").then((r) => r.json());

    setProducts(p);
    setCategories(c);
  }

  useEffect(() => {
    loadData();
  }, []);

  function getAvailableStock(productId: number, stock: number) {
    const item = cart.find((p) => p.id === productId);
    if (!item) return stock;
    return stock - item.qty;
  }

  function addToCart(product: any) {
    const available = getAvailableStock(product.id, product.stock);

    if (available <= 0) {
      alert("No hay más stock disponible");
      return;
    }

    setCart((prev) => {
      const found = prev.find((p) => p.id === product.id);

      if (found) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p,
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((p) => p.id !== id));
  }

  async function finalizeSale() {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, p) => sum + p.salePrice * p.qty, 0);

    // 1️⃣ crear ticket (SaleGroup)

    const groupRes = await fetch("/api/sale-group/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        total,
        customerName,
        paymentMethod,
      }),
    });

    const groupData = await groupRes.json();

    if (!groupRes.ok) {
      if (groupData.error === "NO_CASH_OPEN") {
        alert("⚠️ No hay caja abierta");
        return;
      }

      alert("Error creando ticket");
      return;
    }

    const groupId = groupData.id;

    // 2️⃣ crear ventas

    for (const item of cart) {
      await fetch("/api/sales", {
        method: "POST",
        body: JSON.stringify({
          productId: item.id,
          quantity: item.qty,
          groupId,
        }),
      });
    }

    alert("Venta registrada ✅");

    setCart([]);

    await loadData();
  }

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === null || p.categoryId === selectedCategory;

    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()));

    return matchCategory && matchSearch;
  });

  return (
    <div className="flex h-screen">
      {/* IZQUIERDA: GRILLA */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Buscador */}
        <input
          className="border p-2 rounded w-full mb-4"
          placeholder="Buscar producto por nombre o código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Filtros por categoría */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded border ${
              selectedCategory === null
                ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                : ""
            }`}
          >
            Todas
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded border ${
                selectedCategory === cat.id
                  ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                  : ""
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* GRILLA DE PRODUCTOS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredProducts.map((product) => {
            const available = getAvailableStock(product.id, product.stock);

            return (
              <div
                key={product.id}
                onClick={() => available > 0 && addToCart(product)}
                className={`border rounded-lg p-2 shadow-sm
        ${available > 0 ? "cursor-pointer hover:shadow-md" : "opacity-40"}
      `}
              >
                <img
                  src={product.imageUrl ?? "/placeholder.png"}
                  className="w-full h-32 object-cover rounded"
                />

                <div className="mt-2 text-center font-medium">
                  {product.name}
                </div>

                <div className="text-center text-sm text-green-500">
                  ${product.salePrice}
                </div>

                <div className="text-center text-xs text-gray-500">
                  Stock: {available}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DERECHA: CARRITO */}
      <div className="w-80 border-l p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Carrito</h2>

        <div className="flex-1 overflow-y-auto space-y-3">
          {cart.length === 0 && (
            <p className="text-gray-500">No hay productos</p>
          )}

          {cart.map((item) => (
            <div
              key={item.id}
              className="border rounded p-2 flex justify-between"
            >
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-600">
                  {item.qty} x ${item.salePrice}
                </div>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-600 font-bold cursor-pointer"
              >
                ❌
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-3">
          <input
            placeholder="Nombre cliente"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="border px-2 py-1 rounded"
          />

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="CASH">Efectivo</option>
            <option value="TRANSFER">Transferencia</option>
            <option value="CARD">Tarjeta</option>
          </select>
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="text-lg font-semibold">
            Total: ${cart.reduce((sum, p) => sum + p.salePrice * p.qty, 0)}
          </div>

          <button
            className="bg-green-600 hover:bg-green-700 text-white w-full mt-3 py-2 rounded cursor-pointer"
            onClick={finalizeSale}
            disabled={cart.length === 0}
          >
            Finalizar venta
          </button>
        </div>
      </div>
    </div>
  );
}
