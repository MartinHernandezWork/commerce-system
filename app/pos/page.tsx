"use client";

import { useEffect, useState } from "react";

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [showSuccess, setShowSuccess] = useState(false);

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);

  // 🔥 MODAL
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [qty, setQty] = useState(1);

  async function loadData() {
    const [p, c, r] = await Promise.all([
      fetch("/api/products?pos=true").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
      fetch("/api/recipes").then((res) => res.json()),
    ]);

    setProducts(p);
    setCategories(c);
    setRecipes(r);
  }

  useEffect(() => {
    loadData();
  }, []);

  function getAvailableStock(posId: string, stock: number) {
    const item = cart.find((p) => p.posId === posId);
    if (!item) return stock;
    return stock - item.qty;
  }

  // 🔥 abrir modal en vez de agregar directo
  function openModal(product: any) {
    setSelectedItem(product);
    setQty(1);
    setModalOpen(true);
  }

  function confirmAdd() {
    if (!selectedItem) return;

    const available = getAvailableStock(selectedItem.posId, selectedItem.stock);

    if (qty <= 0) return;

    if (qty > available) {
      alert("Stock insuficiente");
      return;
    }

    setCart((prev) => {
      const found = prev.find((p) => p.posId === selectedItem.posId);

      if (found) {
        return prev.map((p) =>
          p.posId === selectedItem.posId ? { ...p, qty: p.qty + qty } : p,
        );
      }

      return [...prev, { ...selectedItem, qty }];
    });

    setModalOpen(false);
    setSelectedItem(null);
  }

  function removeFromCart(posId: string) {
    setCart((prev) => prev.filter((p) => p.posId !== posId));
  }

  async function finalizeSale() {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, p) => sum + p.salePrice * p.qty, 0);

    const groupRes = await fetch("/api/sale-group/create", {
      method: "POST",
      body: JSON.stringify({
        total,
        customerName,
        paymentMethod,
      }),
    });

    const groupData = await groupRes.json();

    if (!groupRes.ok) {
      alert("Error creando ticket");
      return;
    }

    const groupId = groupData.id;

    for (const item of cart) {
      if (item.type === "product") {
        await fetch("/api/sales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.id,
            quantity: item.qty,
            groupId,
          }),
        });
      }

      if (item.type === "recipe") {
        await fetch("/api/recipes/use", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipeId: item.id,
            quantity: item.qty,
            groupId,
          }),
        });
      }
    }

    // 🔥 sonido
    const audio = new Audio("/sounds/success.mp3");
    audio.play();

    // 🔥 popup
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);

    setCart([]);
    setCustomerName("");
    setPaymentMethod("efectivo");

    await loadData();
  }

  const posItems = [
    ...products.map((p) => ({
      ...p,
      type: "product",
      posId: `product-${p.id}`,
    })),
    ...recipes.map((r) => ({
      ...r,
      type: "recipe",
      posId: `recipe-${r.id}`,
      salePrice: r.price,
      imageUrl: "uploads/placeholder.jpg",
      stock: 9999,
    })),
  ];

  const filteredProducts = posItems.filter((p) => {
    const matchCategory =
      selectedCategory === null || p.categoryId === selectedCategory;

    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()));

    return matchCategory && matchSearch;
  });

  return (
    <div className="flex h-screen">
      {/* IZQUIERDA */}
      <div className="flex-1 p-4 overflow-y-auto">
        <input
          className="border p-2 rounded w-full mb-4"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredProducts.map((product) => {
            const available = getAvailableStock(product.posId, product.stock);

            return (
              <div
                key={product.posId}
                onClick={() => available > 0 && openModal(product)}
                className="border rounded-lg p-2 cursor-pointer hover:shadow-md"
              >
                <img
                  src={product.imageUrl ?? "uploads/placeholder.jpg"}
                  className="w-full h-32 object-cover rounded"
                />

                <div className="text-center font-medium mt-2">
                  {product.name}
                </div>

                {product.type === "recipe" && (
                  <div className="text-xs text-orange-500 text-center">
                    Receta
                  </div>
                )}

                <div className="text-center text-green-600">
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

      {/* CARRITO */}
      <div className="w-80 border-l p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Carrito</h2>

        <div className="flex-1 overflow-y-auto space-y-2">
          {cart.map((item) => (
            <div key={item.posId} className="border p-2 flex justify-between">
              <div>
                {item.name} x{item.qty}
              </div>

              <button
                onClick={() => removeFromCart(item.posId)}
                className="text-red-600 cursor-pointer"
              >
                ❌
              </button>
            </div>
          ))}
        </div>

        <input
          className="border p-2 mb-2"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Cliente"
        />

        <select
          className="border p-2 mb-2"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="efectivo">💵 Efectivo</option>
          <option value="transferencia">📲 Transferencia</option>
        </select>

        <button
          onClick={finalizeSale}
          className="bg-green-600 text-white py-2 rounded hover:bg-green-800 cursor-pointer"
        >
          Finalizar venta
        </button>
      </div>

      {/* MODAL CANTIDAD */}
      {modalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-80">
            <h2 className="font-bold mb-2">{selectedItem.name}</h2>

            <img
              src={selectedItem.imageUrl ?? "/uploads/placeholder.jpg"}
              className="w-full h-32 object-cover mb-3 rounded"
            />

            <input
              type="number"
              className="border p-2 w-full mb-3"
              value={qty}
              min={1}
              onChange={(e) => setQty(Number(e.target.value))}
            />

            <div className="flex gap-2">
              <button
                onClick={confirmAdd}
                className="bg-green-600 text-white flex-1 py-2 rounded"
              >
                Agregar
              </button>

              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-300 flex-1 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccess && (
        <div className="fixed top-5 right-5 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-bounce">
          ✅ ¡Listo! Venta realizada
        </div>
      )}
    </div>
  );
}
