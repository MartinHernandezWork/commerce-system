"use client";

import { useEffect, useState } from "react";

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [cashReceived, setCashReceived] = useState("");
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

    // VALIDAR ANTES DE CREAR EL TICKET
    if (paymentMethod === "efectivo" && Number(cashReceived) < total) {
      alert("El dinero recibido es insuficiente");
      return;
    }

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
      alert("Error creando ticket, asegurate que la caja este abierta");
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
    setCashReceived("");

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

  const total = cart.reduce((sum, item) => sum + item.salePrice * item.qty, 0);

  const received = Number(cashReceived) || 0;

  const change = received - total;

  return (
  <div className="flex h-screen bg-slate-100 rounded-3xl">
    {/* PRODUCTOS */}
    <div className="flex-1 p-5 overflow-y-auto">
      <input
        className="w-full border border-slate-300 bg-white rounded-2xl p-3 mb-5 shadow-sm focus:ring-2 focus:ring-green-500 outline-none"
        placeholder="🔍 Buscar producto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredProducts.map((product) => {
          const available = getAvailableStock(
            product.posId,
            product.stock,
          );

          return (
            <div
              key={product.posId}
              onClick={() => available > 0 && openModal(product)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer border"
            >
              <img
                src={product.imageUrl ?? "/uploads/placeholder.jpg"}
                className="w-full h-40 object-cover"
              />

              <div className="p-3">
                <div className="font-semibold text-center">
                  {product.name}
                </div>

                {product.type === "recipe" && (
                  <div className="text-xs text-orange-500 text-center mt-1">
                    🍽️ Receta
                  </div>
                )}

                <div className="text-center text-2xl font-bold text-green-600 mt-2">
                  ${product.salePrice}
                </div>

                <div className="text-center text-xs text-gray-500 mt-2">
                  Stock: {available}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* CARRITO */}
    <div className="w-[400px] bg-white border-l shadow-2xl p-5 flex flex-col">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-slate-800">
          Carrito
        </h2>

        <p className="text-sm text-gray-500">
          {cart.length} productos en el carrito
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {cart.map((item) => (
          <div
            key={item.posId}
            className="bg-slate-50 rounded-xl p-3 flex justify-between items-center shadow-sm"
          >
            <div>
              <div className="font-medium">
                {item.name} x{item.qty}
              </div>

              <div className="text-sm text-green-600 font-semibold">
                ${(item.salePrice * item.qty).toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => removeFromCart(item.posId)}
              className="text-red-500 hover:text-red-700 transition cursor-pointer"
            >
              ❌
            </button>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-4 mt-4">
        <div className="text-sm text-gray-500">
          Total a cobrar
        </div>

        <div className="text-4xl font-black text-green-600">
          ${total.toLocaleString()}
        </div>
      </div>

      {/* MÉTODO DE PAGO */}
      <select
        className="w-full border border-slate-300 rounded-xl p-3 mb-3 focus:ring-2 focus:ring-green-500 outline-none"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <option value="efectivo">💵 Efectivo</option>
        <option value="transferencia">📲 Transferencia</option>
      </select>

      {/* CLIENTE */}
      <input
        className="w-full border border-slate-300 rounded-xl p-3 mb-3 focus:ring-2 focus:ring-green-500 outline-none"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        placeholder="👤 Nombre del cliente"
      />

      {/* EFECTIVO */}
      {paymentMethod === "efectivo" && (
        <>
          <input
            type="number"
            className="w-full border border-slate-300 rounded-xl p-3 mb-3 focus:ring-2 focus:ring-green-500 outline-none"
            value={cashReceived}
            onChange={(e) => setCashReceived(e.target.value)}
            placeholder="💵 Monto recibido"
          />    
        </>
      )}

      {/* CAMBIO */}
      {paymentMethod === "efectivo" &&
        cashReceived &&
        total > 0 && (
          <div className="bg-slate-50 border rounded-2xl p-4 mb-4 shadow-sm">
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-bold">
                ${total.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Recibido</span>
              <span className="font-bold">
                ${received.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between mt-2">
              <span className="font-semibold">
                {change < 0 ? "Faltan" : "Cambio"}
              </span>

              <span
                className={`text-xl font-black ${
                  change < 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                ${Math.abs(change).toLocaleString()}
              </span>
            </div>
          </div>
        )}

      {/* BOTÓN */}
      <button
        onClick={finalizeSale}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      >
        Finalizar venta
      </button>
    </div>

    {/* MODAL */}
    {modalOpen && selectedItem && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-3xl w-96 shadow-2xl">
          <h2 className="font-bold text-xl mb-3">
            {selectedItem.name}
          </h2>

          <img
            src={
              selectedItem.imageUrl ??
              "/uploads/placeholder.jpg"
            }
            className="w-full h-48 object-cover mb-4 rounded-2xl"
          />

          <input
            type="number"
            className="border rounded-xl p-3 w-full mb-4"
            value={qty}
            min={1}
            onChange={(e) => setQty(Number(e.target.value))}
          />

          <div className="flex gap-2">
            <button
              onClick={confirmAdd}
              className="bg-green-600 text-white flex-1 py-3 rounded-xl hover:bg-green-700"
            >
              Agregar
            </button>

            <button
              onClick={() => setModalOpen(false)}
              className="bg-gray-200 flex-1 py-3 rounded-xl hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )}

    {showSuccess && (
      <div className="fixed top-5 right-5 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50">
        ✅ ¡Venta realizada!
      </div>
    )}
  </div>
)};