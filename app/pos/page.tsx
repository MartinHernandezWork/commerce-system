"use client";

import Image from "next/image";
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
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);

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

  function showErrorToast(message: string) {
    setErrorMessage(message);
    setShowError(true);

    const audio = new Audio("/sounds/error.mp3");
    audio.play();

    setTimeout(() => {
      setShowError(false);
    }, 2500);
  }

  function getAvailableStock(posId: string, stock: number) {
    const item = cart.find((p) => p.posId === posId);

    if (!item) return stock;

    return stock - item.qty;
  }

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
      showErrorToast("Stock insuficiente.");
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

    // VALIDAR DINERO RECIBIDO
    if (paymentMethod === "efectivo" && Number(cashReceived) < total) {
      showErrorToast("El dinero recibido es insuficiente.");
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

    // VALIDAR CAJA ABIERTA
    if (!groupRes.ok) {
      showErrorToast(
        "No se puede realizar la venta.\nAsegurate de que la caja esté abierta.",
      );

      return;
    }

    const groupId = groupData.id;

    for (const item of cart) {
      if (item.type === "product") {
        await fetch("/api/sales", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipeId: item.id,
            quantity: item.qty,
            groupId,
          }),
        });
      }
    }

    // SONIDO DE ÉXITO
    const audio = new Audio("/sounds/success.mp3");
    audio.play();

    // POPUP DE ÉXITO
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
      imageUrl: r.imageUrl || "/uploads/placeholder.jpg",
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
    <div className="min-h-full lg:h-full bg-green-100 rounded-3xl flex flex-col lg:flex-row overflow-hidden">
      {/* PRODUCTOS */}
      <div className="flex-1 min-w-0 p-4 sm:p-5 overflow-y-auto">
        {/* BUSCADOR */}
        <input
          className="w-full border border-slate-300 bg-white rounded-2xl p-3.5 sm:p-3 mb-4 sm:mb-5 shadow-sm focus:ring-2 focus:ring-green-500 outline-none"
          placeholder="🔍 Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* CATEGORÍAS */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === null
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-100"
            }`}
          >
            Todas
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === category.id
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 border hover:bg-gray-100"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* PRODUCTOS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredProducts.map((product) => {
            const available = getAvailableStock(product.posId, product.stock);

            return (
              <div
                key={product.posId}
                onClick={() => available > 0 && openModal(product)}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-200 ${
                  available > 0
                    ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                {/* IMAGEN */}
                <div className="aspect-square w-full flex items-center justify-center  overflow-hidden">
                  <Image
                    src={product.imageUrl || "/uploads/placeholder.jpg"}
                    alt={product.name}
                    unoptimized
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* INFORMACIÓN */}
                <div className="p-2.5 sm:p-3">
                  <div className="font-semibold text-center text-sm sm:text-base line-clamp-2 min-h-[40px]">
                    {product.name}
                  </div>

                  <div className="text-center text-xl sm:text-2xl font-bold text-green-600 mt-2">
                    ${Number(product.salePrice).toLocaleString()}
                  </div>

                  <div
                    className={`text-center text-xs mt-2 ${
                      available <= 0
                        ? "text-red-600 font-semibold"
                        : "text-gray-500"
                    }`}
                  >
                    Stock: {available}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-2xl border p-8 text-center text-gray-500 mt-4">
            No se encontraron productos.
          </div>
        )}
      </div>

      {/* CARRITO */}
      <div className="w-full lg:w-[380px] xl:w-[400px] bg-white border-t lg:border-t-0 lg:border-l shadow-2xl p-4 sm:p-5 flex flex-col lg:h-full">
        {/* HEADER */}
        <div className="mb-4 sm:mb-5">
          <h2 className="text-2xl font-bold text-slate-800">Carrito</h2>

          <p className="text-sm text-gray-500">
            {cart.length}{" "}
            {cart.length === 1
              ? "producto en el carrito"
              : "productos en el carrito"}
          </p>
        </div>

        {/* PRODUCTOS DEL CARRITO */}
        <div className="lg:flex-1 lg:overflow-y-auto space-y-3 max-h-[350px] lg:max-h-none overflow-y-auto">
          {cart.length === 0 && (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center text-gray-400">
              <div className="text-3xl mb-2">🛒</div>
              <div className="font-medium">El carrito está vacío</div>
              <div className="text-sm mt-1">
                Seleccioná un producto para comenzar
              </div>
            </div>
          )}

          {cart.map((item) => (
            <div
              key={item.posId}
              className="bg-slate-50 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="min-w-0">
                <div className="font-medium text-gray-800 break-words">
                  {item.name} x{item.qty}
                </div>

                <div className="text-sm text-green-600 font-semibold mt-1">
                  ${(item.salePrice * item.qty).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => removeFromCart(item.posId)}
                className="shrink-0 w-9 h-9 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                aria-label={`Eliminar ${item.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 sm:p-5 mb-4 mt-4">
          <div className="text-sm text-gray-500">Total a cobrar</div>

          <div className="text-3xl sm:text-4xl font-black text-green-600 break-words">
            ${total.toLocaleString()}
          </div>
        </div>

        {/* MÉTODO DE PAGO */}
        <select
          className="w-full border border-slate-300 rounded-xl p-3.5 sm:p-3 mb-3 focus:ring-2 focus:ring-green-500 outline-none bg-white"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="efectivo">💵 Efectivo</option>

          <option value="transferencia">📲 Transferencia</option>
        </select>

        {/* CLIENTE */}
        <input
          className="w-full border border-slate-300 rounded-xl p-3.5 sm:p-3 mb-3 focus:ring-2 focus:ring-green-500 outline-none"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="👤 Nombre del cliente"
        />

        {/* EFECTIVO */}
        {paymentMethod === "efectivo" && (
          <input
            type="number"
            className="w-full border border-slate-300 rounded-xl p-3.5 sm:p-3 mb-3 focus:ring-2 focus:ring-green-500 outline-none"
            value={cashReceived}
            onChange={(e) => setCashReceived(e.target.value)}
            placeholder="💵 Monto recibido"
          />
        )}

        {/* CAMBIO */}
        {paymentMethod === "efectivo" && cashReceived && total > 0 && (
          <div className="bg-slate-50 border rounded-2xl p-4 mb-4 shadow-sm">
            <div className="flex justify-between gap-4">
              <span>Total</span>

              <span className="font-bold">${total.toLocaleString()}</span>
            </div>

            <div className="flex justify-between gap-4 mt-1">
              <span>Recibido</span>

              <span className="font-bold">${received.toLocaleString()}</span>
            </div>

            <div className="flex justify-between gap-4 mt-2">
              <span className="font-semibold">
                {change < 0 ? "Faltan" : "Cambio"}
              </span>

              <span
                className={`text-xl font-black ${
                  change < 0 ? "text-red-600" : "text-green-600"
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
          disabled={cart.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-4 rounded-2xl shadow-lg transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
        >
          Finalizar venta
        </button>
      </div>

      {/* MODAL */}
      {modalOpen && selectedItem && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl w-full max-w-sm shadow-2xl">
            <h2 className="font-bold text-xl mb-4 text-gray-800 break-words">
              {selectedItem.name}
            </h2>

            {/* IMAGEN */}
            <div className="mb-4 w-36 h-36 sm:w-40 sm:h-40 mx-auto rounded-2xl flex items-center justify-center bg-gray-100 overflow-hidden">
              <Image
                src={selectedItem.imageUrl || "/uploads/placeholder.jpg"}
                alt={selectedItem.name}
                unoptimized
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>

            <input
              type="number"
              className="border border-gray-300 rounded-xl p-3.5 w-full mb-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500"
              value={qty}
              min={1}
              onChange={(e) => setQty(Number(e.target.value))}
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={confirmAdd}
                className="bg-green-600 text-white flex-1 py-3.5 sm:py-3 rounded-xl hover:bg-green-700 active:bg-green-800 font-semibold cursor-pointer"
              >
                Agregar
              </button>

              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-200 flex-1 py-3.5 sm:py-3 rounded-xl hover:bg-gray-300 active:bg-gray-400 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {showSuccess && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-sm bg-green-600 text-white px-5 sm:px-6 py-4 rounded-2xl shadow-2xl z-50 text-center sm:text-left">
          ✅ ¡Venta realizada!
        </div>
      )}

      {/* ERROR */}
      {showError && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-sm bg-red-600 text-white px-5 sm:px-6 py-4 rounded-2xl shadow-2xl z-50 whitespace-pre-line text-center sm:text-left">
          ❌ {errorMessage}
        </div>
      )}
    </div>
  );
}
