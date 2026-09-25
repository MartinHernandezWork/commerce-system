"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  X,
  Wallet,
  ArrowRight,
  Banknote,
  ArrowRightLeft,
  Check,
  Package,
  UserRound,
  CircleAlert,
} from "lucide-react";

type PaymentMethod = "efectivo" | "transferencia" | "mixto";

type Extra = {
  productId: number;
  name: string;
  salePrice: number;
  quantity: number;
  categoryName: string;
  stock: number;
};

type CartUnit = {
  extras: Extra[];
};

type CartItem = {
  posId: string;
  id: number;
  name: string;
  type: "product" | "recipe";
  salePrice: number;
  stock: number;
  qty: number;
  imageUrl?: string | null;
  categoryId?: number | null;
  units: CartUnit[];
};

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  description?: string | null;
  stock: number;
  showInPOS: boolean;
  unitType: "UNIT" | "G" | "KG";
  salePrice: number;
  imageUrl?: string | null;
  category?: Category | null;
};

type Recipe = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  category?: Category | null;
};

type CashStatus = {
  open: boolean;
  cashRegister?: {
    id: number;
    initial: number;
    openedAt: string;
  } | null;
};

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [qty, setQty] = useState(1);
  const [unitExtras, setUnitExtras] = useState<Extra[][]>([[]]);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");

  const [cashAmount, setCashAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [cashReceived, setCashReceived] = useState("");

  const [customerName, setCustomerName] = useState("");

  const [cashStatus, setCashStatus] = useState<CashStatus>({
    open: false,
    cashRegister: null,
  });

  async function loadData() {
    try {
      setLoading(true);

      const [productsRes, recipesRes, categoriesRes, cashRes] =
        await Promise.all([
          fetch("/api/products?pos=true"),
          fetch("/api/recipes?showInPOS=true"),
          fetch("/api/categories"),
          fetch("/api/cash/status"),
        ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      }

      if (recipesRes.ok) {
        const data = await recipesRes.json();
        setRecipes(Array.isArray(data) ? data : data.recipes || []);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(Array.isArray(data) ? data : data.categories || []);
      }

      if (cashRes.ok) {
        const data = await cashRes.json();

        setCashStatus({
          open: Boolean(data.isOpen),
          cashRegister: data.cashRegister || null,
        });
      }
    } catch (error) {
      console.error("Error cargando POS:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/cash/status");

        if (!response.ok) return;

        const data = await response.json();

        setCashStatus({
          open: Boolean(data.isOpen),
          cashRegister: data.cashRegister || null,
        });
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  function isExtraProduct(product: Product) {
    const categoryName = product.category?.name?.toLowerCase().trim();

    return categoryName === "aderezos" || categoryName === "descartables";
  }

  const sellableProducts = useMemo(() => {
    return products.filter((product) => !isExtraProduct(product));
  }, [products]);

  const extraProducts = useMemo(() => {
    return products.filter((product) => isExtraProduct(product));
  }, [products]);

  const allItems = useMemo(() => {
    const productItems = sellableProducts.map((product) => ({
      ...product,
      type: "product" as const,
      salePrice: product.salePrice,
    }));

    const recipeItems = recipes.map((recipe) => ({
      id: recipe.id,
      name: recipe.name,
      stock: 999999,
      salePrice: recipe.price,
      imageUrl: recipe.imageUrl,
      categoryId: recipe.category?.id ?? null,
      category: recipe.category,
      type: "recipe" as const,
    }));

    return [...productItems, ...recipeItems];
  }, [sellableProducts, recipes]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return allItems.filter((item) => {
      const matchesSearch =
        !normalizedSearch || item.name.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === null || item.category?.id === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allItems, search, selectedCategory]);

  function getExtrasByCategory(categoryName: string) {
    return extraProducts.filter(
      (product) =>
        product.category?.name?.toLowerCase().trim() ===
        categoryName.toLowerCase().trim(),
    );
  }

  function getAvailableStock(posId: string, stock: number) {
    const reserved = cart
      .filter((item) => item.posId === posId)
      .reduce((total, item) => total + item.qty, 0);

    return Math.max(0, stock - reserved);
  }

  function getReservedExtraQuantity(productId: number) {
    return cart.reduce((total, item) => {
      return (
        total +
        item.units.reduce((unitTotal, unit) => {
          return (
            unitTotal +
            unit.extras.reduce((extraTotal, extra) => {
              if (extra.productId !== productId) {
                return extraTotal;
              }

              return extraTotal + extra.quantity;
            }, 0)
          );
        }, 0)
      );
    }, 0);
  }

  function getCurrentUnitExtras() {
    return unitExtras[selectedUnitIndex] || [];
  }

  function getExtraQuantity(productId: number) {
    const extras = getCurrentUnitExtras();

    const extra = extras.find((item) => item.productId === productId);

    return extra?.quantity || 0;
  }

  function getTotalSelectedExtraQuantity(productId: number) {
    return unitExtras.reduce((total, extras) => {
      const extra = extras.find((item) => item.productId === productId);

      return total + (extra?.quantity || 0);
    }, 0);
  }

  function openModal(item: any) {
    setSelectedItem(item);
    setQty(1);
    setSelectedUnitIndex(0);
    setUnitExtras([[]]);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedItem(null);
    setQty(1);
    setSelectedUnitIndex(0);
    setUnitExtras([[]]);
  }

  function syncUnitExtrasWithQuantity(newQty: number) {
    setUnitExtras((previous) => {
      const next = [...previous];

      while (next.length < newQty) {
        next.push([]);
      }

      if (next.length > newQty) {
        next.splice(newQty);
      }

      return next;
    });

    setSelectedUnitIndex((previous) =>
      Math.min(previous, Math.max(0, newQty - 1)),
    );
  }

  function changeModalQuantity(newQty: number) {
    if (!selectedItem) return;

    const safeQty = Math.max(1, Math.floor(newQty));

    if (selectedItem.type === "product") {
      const availableStock = getAvailableStock(
        `product-${selectedItem.id}`,
        selectedItem.stock,
      );

      if (safeQty > availableStock) {
        alert(`Stock disponible: ${availableStock}`);
        return;
      }
    }

    setQty(safeQty);
    syncUnitExtrasWithQuantity(safeQty);
  }

  function addExtra(product: Product) {
    if (!selectedItem) return;

    const selectedInModal = getTotalSelectedExtraQuantity(product.id);
    const alreadyReserved = getReservedExtraQuantity(product.id);
    const totalAfterAdding = alreadyReserved + selectedInModal + 1;

    if (totalAfterAdding > product.stock) {
      alert(
        `No hay suficiente stock de ${product.name}. Stock disponible: ${
          product.stock - alreadyReserved
        }`,
      );

      return;
    }

    setUnitExtras((previous) => {
      const next = previous.map((extras) => [...extras]);

      const currentExtras = [...(next[selectedUnitIndex] || [])];

      const existingIndex = currentExtras.findIndex(
        (extra) => extra.productId === product.id,
      );

      if (existingIndex === -1) {
        currentExtras.push({
          productId: product.id,
          name: product.name,
          salePrice: product.salePrice,
          quantity: 1,
          categoryName: product.category?.name || "",
          stock: product.stock,
        });
      } else {
        currentExtras[existingIndex] = {
          ...currentExtras[existingIndex],
          quantity: currentExtras[existingIndex].quantity + 1,
        };
      }

      next[selectedUnitIndex] = currentExtras;

      return next;
    });
  }

  function removeExtra(product: Product) {
    setUnitExtras((previous) => {
      const next = previous.map((extras) => [...extras]);

      const currentExtras = [...(next[selectedUnitIndex] || [])];

      const existingIndex = currentExtras.findIndex(
        (extra) => extra.productId === product.id,
      );

      if (existingIndex === -1) {
        return previous;
      }

      const existing = currentExtras[existingIndex];

      if (existing.quantity <= 1) {
        currentExtras.splice(existingIndex, 1);
      } else {
        currentExtras[existingIndex] = {
          ...existing,
          quantity: existing.quantity - 1,
        };
      }

      next[selectedUnitIndex] = currentExtras;

      return next;
    });
  }

  function selectUnit(index: number) {
    if (index < 0 || index >= qty) return;

    setSelectedUnitIndex(index);
  }

  function confirmAdd() {
    if (!selectedItem) return;

    if (qty <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }

    if (selectedItem.type === "product") {
      const availableStock = getAvailableStock(
        `product-${selectedItem.id}`,
        selectedItem.stock,
      );

      if (qty > availableStock) {
        alert(`Stock disponible: ${availableStock}`);
        return;
      }
    }

    const units: CartUnit[] = Array.from({ length: qty }, (_, index) => ({
      extras: (unitExtras[index] || []).map((extra) => ({
        ...extra,
      })),
    }));

    const hasExtras = units.some((unit) => unit.extras.length > 0);

    setCart((previous) => {
      if (!hasExtras) {
        const posId =
          selectedItem.type === "product"
            ? `product-${selectedItem.id}`
            : `recipe-${selectedItem.id}`;

        const existingIndex = previous.findIndex(
          (item) =>
            item.posId === posId &&
            item.units.every((unit) => unit.extras.length === 0),
        );

        if (existingIndex !== -1) {
          const next = [...previous];
          const existing = next[existingIndex];

          next[existingIndex] = {
            ...existing,
            qty: existing.qty + qty,
            units: [...existing.units, ...units],
          };

          return next;
        }
      }

      const cartItem: CartItem = {
        posId: `${selectedItem.type}-${selectedItem.id}-${Date.now()}-${Math.random()}`,
        id: selectedItem.id,
        name: selectedItem.name,
        type: selectedItem.type,
        salePrice: selectedItem.salePrice,
        stock: selectedItem.stock,
        qty,
        imageUrl: selectedItem.imageUrl,
        categoryId: selectedItem.categoryId ?? null,
        units,
      };

      return [...previous, cartItem];
    });

    closeModal();
  }

  function increaseCartItem(index: number) {
    setCart((previous) => {
      const next = [...previous];
      const item = next[index];

      if (!item) {
        return previous;
      }

      if (item.type === "product") {
        const totalInCart = previous
          .filter(
            (current) => current.type === "product" && current.id === item.id,
          )
          .reduce((total, current) => total + current.qty, 0);

        if (totalInCart + 1 > item.stock) {
          alert(`Stock disponible: ${item.stock}`);
          return previous;
        }
      }

      next[index] = {
        ...item,
        qty: item.qty + 1,
        units: [
          ...item.units,
          {
            extras: [],
          },
        ],
      };

      return next;
    });
  }

  function decreaseCartItem(index: number) {
    setCart((previous) => {
      const next = [...previous];
      const item = next[index];

      if (!item) {
        return previous;
      }

      if (item.qty <= 1) {
        next.splice(index, 1);
        return next;
      }

      next[index] = {
        ...item,
        qty: item.qty - 1,
        units: item.units.slice(0, -1),
      };

      return next;
    });
  }

  function removeCartItem(index: number) {
    setCart((previous) => {
      const next = [...previous];
      next.splice(index, 1);
      return next;
    });
  }

  function clearCart() {
    if (cart.length === 0) return;

    if (!confirm("¿Vaciar todo el carrito?")) {
      return;
    }

    setCart([]);
  }

  function getItemTotal(item: CartItem) {
    return item.salePrice * item.qty;
  }

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + getItemTotal(item), 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((total, item) => total + item.qty, 0);
  }, [cart]);

  const parsedCashAmount = Number.parseFloat(cashAmount.replace(",", ".")) || 0;

  const parsedTransferAmount =
    Number.parseFloat(transferAmount.replace(",", ".")) || 0;

  const parsedCashReceived =
    Number.parseFloat(cashReceived.replace(",", ".")) || 0;

  const calculatedMixedTotal = parsedCashAmount + parsedTransferAmount;

  const calculatedChange = parsedCashReceived - cartTotal;

  const isPaymentValid = useMemo(() => {
    if (cartTotal <= 0) {
      return false;
    }

    if (paymentMethod === "efectivo") {
      return parsedCashReceived >= cartTotal;
    }

    if (paymentMethod === "transferencia") {
      return parsedTransferAmount === cartTotal;
    }

    if (paymentMethod === "mixto") {
      return (
        parsedCashAmount > 0 &&
        parsedTransferAmount > 0 &&
        Math.abs(calculatedMixedTotal - cartTotal) < 0.01
      );
    }

    return false;
  }, [
    cartTotal,
    paymentMethod,
    parsedCashReceived,
    parsedTransferAmount,
    parsedCashAmount,
    calculatedMixedTotal,
  ]);

  function selectPaymentMethod(method: PaymentMethod) {
    setPaymentMethod(method);

    if (method === "efectivo") {
      setCashReceived(String(cartTotal));
      setCashAmount("");
      setTransferAmount("");
    }

    if (method === "transferencia") {
      setTransferAmount(String(cartTotal));
      setCashAmount("");
      setCashReceived("");
    }

    if (method === "mixto") {
      setCashAmount("");
      setTransferAmount("");
      setCashReceived("");
    }
  }

  function updateMixedCash(value: string) {
    setCashAmount(value);
    setCashReceived(value);
  }

  async function finalizeSale() {
    if (processing) return;

    if (!cashStatus.open) {
      alert("La caja está cerrada.");
      return;
    }

    if (cart.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    if (!isPaymentValid) {
      alert("El pago no es válido.");
      return;
    }

    for (const item of cart) {
      if (item.type !== "product") continue;

      const product = products.find((current) => current.id === item.id);

      if (!product) {
        alert(`No se encontró el producto "${item.name}".`);
        return;
      }

      const totalProductInCart = cart
        .filter(
          (current) => current.type === "product" && current.id === item.id,
        )
        .reduce((total, current) => total + current.qty, 0);

      if (totalProductInCart > product.stock) {
        alert(
          `No hay suficiente stock de ${product.name}. Stock disponible: ${product.stock}.`,
        );
        return;
      }
    }

    const extrasRequested = new Map<number, number>();

    for (const item of cart) {
      for (const unit of item.units) {
        for (const extra of unit.extras) {
          const current = extrasRequested.get(extra.productId) || 0;

          extrasRequested.set(extra.productId, current + extra.quantity);
        }
      }
    }

    for (const [productId, requestedQuantity] of extrasRequested.entries()) {
      const product = products.find((current) => current.id === productId);

      if (!product) {
        alert("No se encontró uno de los extras seleccionados.");
        return;
      }

      if (requestedQuantity > product.stock) {
        alert(
          `No hay suficiente stock de ${product.name}. Stock disponible: ${product.stock}.`,
        );
        return;
      }
    }

    let finalCashAmount = 0;
    let finalTransferAmount = 0;
    let finalCashReceived = 0;

    if (paymentMethod === "efectivo") {
      finalCashAmount = cartTotal;
      finalCashReceived = parsedCashReceived;
    }

    if (paymentMethod === "transferencia") {
      finalTransferAmount = cartTotal;
    }

    if (paymentMethod === "mixto") {
      finalCashAmount = parsedCashAmount;
      finalTransferAmount = parsedTransferAmount;
      finalCashReceived = parsedCashAmount;
    }

    setProcessing(true);

    try {
      const items = cart.map((item) => ({
        type: item.type === "product" ? "PRODUCT" : "RECIPE",

        ...(item.type === "product"
          ? {
              productId: item.id,
            }
          : {
              recipeId: item.id,
            }),

        quantity: item.qty,

        units: item.units.map((unit) => ({
          extras: unit.extras.map((extra) => ({
            productId: extra.productId,
            quantity: extra.quantity,
          })),
        })),
      }));

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: customerName.trim() || null,
          paymentMethod,
          cashAmount: finalCashAmount,
          transferAmount: finalTransferAmount,
          cashReceived: finalCashReceived,
          items,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo completar la venta.");
      }

      try {
        const audio = new Audio("/sounds/success.mp3");
        await audio.play();
      } catch {}

      setCart([]);
      setCustomerName("");
      setCashAmount("");
      setTransferAmount("");
      setCashReceived("");

      await loadData();

      alert("Venta registrada correctamente.");
    } catch (error: any) {
      console.error("FINALIZE SALE ERROR:", error);

      try {
        const audio = new Audio("/sounds/error.mp3");
        await audio.play();
      } catch {}

      alert(error?.message || "No se pudo completar la venta.");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-green-100 border-t-green-600 animate-spin" />
          <p className="text-sm font-medium text-gray-500">
            Cargando punto de venta...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] min-h-0 flex flex-col overflow-hidden bg-gray-50">
      <div className="shrink-0 border-b border-gray-200 bg-white">
        <div className="h-16 px-4 lg:px-6 flex items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <ShoppingCart size={20} />
            </div>

            <div className="hidden sm:block">
              <h1 className="text-base font-black text-gray-900">Ventas</h1>

              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                    cashStatus.open ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      cashStatus.open ? "bg-green-500" : "bg-amber-500"
                    }`}
                  />

                  {cashStatus.open ? "Caja abierta" : "Caja cerrada"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar producto o receta..."
                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-50"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <X size={17} />
                </button>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {cashStatus.cashRegister && (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
                  Inicial
                </div>

                <div className="text-sm font-bold text-gray-800">
                  ${cashStatus.cashRegister.initial.toLocaleString("es-AR")}
                </div>
              </div>
            )}

            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${
                cashStatus.open
                  ? "bg-green-50 text-green-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  cashStatus.open ? "bg-green-500" : "bg-amber-500"
                }`}
              />

              {cashStatus.open ? "Caja abierta" : "Caja cerrada"}
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 flex overflow-hidden">
        <aside className="hidden lg:flex w-52 xl:w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="px-4 pt-5 pb-3">
            <div className="text-[11px] font-black uppercase tracking-wider text-gray-400">
              Categorías
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition ${
                selectedCategory === null
                  ? "bg-green-600 text-white shadow-sm shadow-green-600/20"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-3">
                <Package size={17} />
                Todos
              </span>

              <span
                className={`text-xs ${
                  selectedCategory === null ? "text-green-100" : "text-gray-400"
                }`}
              >
                {allItems.length}
              </span>
            </button>

            {categories
              .filter((category) => {
                const name = category.name.toLowerCase().trim();

                return name !== "aderezos" && name !== "descartables";
              })
              .map((category) => {
                const categoryCount = allItems.filter(
                  (item) => item.category?.id === category.id,
                ).length;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition ${
                      selectedCategory === category.id
                        ? "bg-green-600 text-white shadow-sm shadow-green-600/20"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="truncate text-left">{category.name}</span>

                    <span
                      className={`ml-2 text-xs ${
                        selectedCategory === category.id
                          ? "text-green-100"
                          : "text-gray-400"
                      }`}
                    >
                      {categoryCount}
                    </span>
                  </button>
                );
              })}
          </div>

          {!cashStatus.open && (
            <div className="m-3 rounded-2xl bg-amber-50 border border-amber-100 p-3">
              <div className="flex items-center gap-2 text-amber-700">
                <CircleAlert size={16} />
                <span className="text-xs font-bold">Caja cerrada</span>
              </div>

              <p className="mt-1 text-[11px] leading-relaxed text-amber-700/80">
                Abrí la caja para poder registrar ventas.
              </p>
            </div>
          )}
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden flex flex-col">
          <div className="lg:hidden shrink-0 border-b border-gray-200 bg-white px-4 py-3">
            <div className="flex gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                  selectedCategory === null
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Todos
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                    selectedCategory === category.id
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 xl:p-6">
            {!cashStatus.open && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <CircleAlert size={18} className="shrink-0" />

                <div>
                  <span className="font-bold">La caja está cerrada.</span> Abrí
                  la caja antes de registrar una venta.
                </div>
              </div>
            )}

            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {selectedCategory === null
                    ? "Productos"
                    : categories.find(
                        (category) => category.id === selectedCategory,
                      )?.name || "Productos"}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  {filteredItems.length}{" "}
                  {filteredItems.length === 1
                    ? "producto disponible"
                    : "productos disponibles"}
                </p>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-500 hover:border-gray-300 hover:text-gray-800 transition"
                >
                  <Trash2 size={15} />
                  Vaciar carrito
                </button>
              )}
            </div>

            {filteredItems.length === 0 ? (
              <div className="min-h-72 flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center">
                  <Search size={24} />
                </div>

                <h3 className="mt-4 font-bold text-gray-800">
                  No encontramos productos
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Probá con otra búsqueda o categoría.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {filteredItems.map((item) => {
                  const availableStock =
                    item.type === "product"
                      ? getAvailableStock(`product-${item.id}`, item.stock)
                      : 999999;

                  const unavailable =
                    !cashStatus.open ||
                    (item.type === "product" && availableStock <= 0);

                  return (
                    <button
                      key={`${item.type}-${item.id}`}
                      type="button"
                      disabled={unavailable}
                      onClick={() => openModal(item)}
                      className="group text-left rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm transition duration-200 hover:-translate-y-1 hover:border-green-200 hover:shadow-lg hover:shadow-gray-200/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={item.imageUrl || "/uploads/placeholder.jpg"}
                          alt={item.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />

                        {item.type === "product" && (
                          <div className="absolute left-2.5 top-2.5">
                            <span
                              className={`px-2 py-1 rounded-lg bg-white/95 backdrop-blur text-[10px] font-bold shadow-sm ${
                                availableStock <= 3
                                  ? "text-amber-700"
                                  : "text-gray-600"
                              }`}
                            >
                              Stock {availableStock}
                            </span>
                          </div>
                        )}

                        {item.type === "recipe" && (
                          <div className="absolute left-2.5 top-2.5">
                            <span className="px-2 py-1 rounded-lg bg-green-600/95 text-white text-[10px] font-bold">
                              Receta
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-3.5">
                        <div className="min-h-[42px] text-sm font-bold leading-5 text-gray-900 line-clamp-2">
                          {item.name}
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span className="text-lg font-black text-green-600">
                            ${item.salePrice.toLocaleString("es-AR")}
                          </span>

                          <span className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center transition group-hover:bg-green-600 group-hover:text-white">
                            <Plus size={17} />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        <aside className="hidden xl:flex w-[370px] 2xl:w-[410px] shrink-0 flex-col border-l border-gray-200 bg-white">
          <div className="shrink-0 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                  <ShoppingCart size={19} />
                </div>

                <div>
                  <h2 className="font-black text-gray-900">Tu pedido</h2>

                  <p className="text-xs text-gray-400">
                    {totalItems} {totalItems === 1 ? "unidad" : "unidades"}
                  </p>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                  title="Vaciar carrito"
                >
                  <Trash2 size={17} />
                </button>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full min-h-64 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-300 flex items-center justify-center">
                  <ShoppingCart size={28} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-gray-700">
                  Tu pedido está vacío
                </h3>

                <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-gray-400">
                  Seleccioná un producto para comenzar la venta.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div
                    key={item.posId}
                    className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <img
                        src={item.imageUrl || "/uploads/placeholder.jpg"}
                        alt={item.name}
                        className="w-14 h-14 shrink-0 rounded-xl object-cover bg-gray-100"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-gray-900 line-clamp-2">
                              {item.name}
                            </div>

                            <div className="mt-1 text-xs font-semibold text-green-600">
                              ${item.salePrice.toLocaleString("es-AR")} c/u
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeCartItem(index)}
                            className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-100 hover:text-gray-700 transition"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {item.units.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {item.units.map((unit, unitIndex) => (
                          <div
                            key={unitIndex}
                            className="rounded-xl bg-gray-50 px-3 py-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-gray-600">
                                Unidad {unitIndex + 1}
                              </span>

                              {unit.extras.length === 0 && (
                                <span className="text-[10px] text-gray-400">
                                  Sin extras
                                </span>
                              )}
                            </div>

                            {unit.extras.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {unit.extras.map((extra) => (
                                  <span
                                    key={extra.productId}
                                    className="px-2 py-1 rounded-lg bg-white border border-gray-200 text-[10px] font-medium text-gray-600"
                                  >
                                    {extra.name} ×{extra.quantity}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => decreaseCartItem(index)}
                          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
                        >
                          <Minus size={15} />
                        </button>

                        <span className="w-9 text-center text-sm font-bold text-gray-900">
                          {item.qty}
                        </span>

                        <button
                          type="button"
                          onClick={() => increaseCartItem(index)}
                          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-green-50 hover:text-green-600 transition"
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      <div className="text-base font-black text-gray-900">
                        ${getItemTotal(item).toLocaleString("es-AR")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50 p-4">
            <div className="mb-3">
              <div className="relative">
                <UserRound
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Nombre del cliente (opcional)"
                  className="w-full h-10 rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-green-400 focus:ring-4 focus:ring-green-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-gray-200/70">
              <button
                type="button"
                onClick={() => selectPaymentMethod("efectivo")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition ${
                  paymentMethod === "efectivo"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Banknote size={15} />
                Efectivo
              </button>

              <button
                type="button"
                onClick={() => selectPaymentMethod("transferencia")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition ${
                  paymentMethod === "transferencia"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <ArrowRightLeft size={15} />
                Transfer.
              </button>

              <button
                type="button"
                onClick={() => selectPaymentMethod("mixto")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition ${
                  paymentMethod === "mixto"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Wallet size={15} />
                Mixto
              </button>
            </div>

            {paymentMethod === "efectivo" && (
              <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
                <label className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  Efectivo recibido
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cashReceived}
                  onChange={(event) => setCashReceived(event.target.value)}
                  placeholder="0"
                  className="mt-1.5 w-full h-11 rounded-xl border border-gray-200 px-3 text-lg font-bold text-gray-900 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-50"
                />

                {parsedCashReceived >= cartTotal && cartTotal > 0 && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Vuelto</span>

                    <span className="text-sm font-black text-green-600">
                      ${Math.max(0, calculatedChange).toLocaleString("es-AR")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === "transferencia" && (
              <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
                <label className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  Transferencia
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={transferAmount}
                  onChange={(event) => setTransferAmount(event.target.value)}
                  placeholder="0"
                  className="mt-1.5 w-full h-11 rounded-xl border border-gray-200 px-3 text-lg font-bold text-gray-900 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-50"
                />

                {parsedTransferAmount === cartTotal && cartTotal > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-green-600">
                    <Check size={14} />
                    Pago completo
                  </div>
                )}
              </div>
            )}

            {paymentMethod === "mixto" && (
              <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                      Efectivo
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={cashAmount}
                      onChange={(event) => updateMixedCash(event.target.value)}
                      placeholder="0"
                      className="mt-1.5 w-full h-11 rounded-xl border border-gray-200 px-3 text-base font-bold text-gray-900 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-50"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                      Transferencia
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={transferAmount}
                      onChange={(event) =>
                        setTransferAmount(event.target.value)
                      }
                      placeholder="0"
                      className="mt-1.5 w-full h-11 rounded-xl border border-gray-200 px-3 text-base font-bold text-gray-900 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-50"
                    />
                  </div>
                </div>

                <div className="mt-2">
                  {Math.abs(calculatedMixedTotal - cartTotal) < 0.01 ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                      <Check size={14} />
                      Pago completo
                    </div>
                  ) : calculatedMixedTotal < cartTotal ? (
                    <div className="text-xs font-semibold text-amber-600">
                      Faltan $
                      {(cartTotal - calculatedMixedTotal).toLocaleString(
                        "es-AR",
                      )}
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-amber-600">
                      Sobran $
                      {(calculatedMixedTotal - cartTotal).toLocaleString(
                        "es-AR",
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  Total
                </div>

                <div className="mt-0.5 text-2xl font-black text-gray-950">
                  ${cartTotal.toLocaleString("es-AR")}
                </div>
              </div>

              <div className="text-right text-[11px] text-gray-400">
                {totalItems} {totalItems === 1 ? "producto" : "productos"}
              </div>
            </div>

            <button
              type="button"
              disabled={
                processing ||
                !cashStatus.open ||
                cart.length === 0 ||
                !isPaymentValid
              }
              onClick={finalizeSale}
              className="mt-3 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-green-600 text-sm font-black text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 hover:shadow-green-600/30 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  Cobrar venta
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </aside>
      </div>

      {cart.length > 0 && (
        <div className="xl:hidden shrink-0 border-t border-gray-200 bg-white p-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-400">
                {totalItems} {totalItems === 1 ? "producto" : "productos"}
              </div>

              <div className="text-xl font-black text-gray-900">
                ${cartTotal.toLocaleString("es-AR")}
              </div>
            </div>

            <button
              type="button"
              onClick={clearCart}
              className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500"
            >
              <Trash2 size={18} />
            </button>

            <button
              type="button"
              disabled={!cashStatus.open || cart.length === 0}
              onClick={() => {
                const element = document.getElementById("mobile-checkout");

                element?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="h-11 px-5 rounded-xl bg-green-600 text-white text-sm font-black disabled:bg-gray-300"
            >
              Cobrar
            </button>
          </div>
        </div>
      )}

      {modalOpen && selectedItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-950/60 backdrop-blur-sm p-3 sm:p-5">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="shrink-0 border-b border-gray-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-4">
                <img
                  src={selectedItem.imageUrl || "/uploads/placeholder.jpg"}
                  alt={selectedItem.name}
                  className="w-14 h-14 rounded-2xl object-cover bg-gray-100"
                />

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 truncate">
                    {selectedItem.name}
                  </h2>

                  <p className="mt-0.5 text-sm text-green-600 font-bold">
                    ${selectedItem.salePrice.toLocaleString("es-AR")} por unidad
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div>
                  <div className="font-black text-gray-900">Cantidad</div>

                  {selectedItem.type === "product" && (
                    <div className="mt-1 text-xs text-gray-500">
                      Stock disponible:{" "}
                      {getAvailableStock(
                        `product-${selectedItem.id}`,
                        selectedItem.stock,
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => changeModalQuantity(qty - 1)}
                    className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                  >
                    <Minus size={17} />
                  </button>

                  <span className="w-12 text-center text-lg font-black text-gray-900">
                    {qty}
                  </span>

                  <button
                    type="button"
                    onClick={() => changeModalQuantity(qty + 1)}
                    className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-green-50 hover:text-green-600"
                  >
                    <Plus size={17} />
                  </button>
                </div>
              </div>

              {qty > 1 && (
                <div className="mt-6">
                  <div className="mb-3">
                    <h3 className="text-sm font-black text-gray-900">
                      Configurá cada unidad
                    </h3>

                    <p className="mt-1 text-xs text-gray-400">
                      Podés elegir extras diferentes para cada unidad.
                    </p>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {Array.from({ length: qty }, (_, index) => {
                      const extras = unitExtras[index] || [];

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectUnit(index)}
                          className={`min-w-28 rounded-2xl border p-3 text-left transition ${
                            selectedUnitIndex === index
                              ? "border-green-500 bg-green-50 shadow-sm"
                              : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`text-sm font-black ${
                              selectedUnitIndex === index
                                ? "text-green-700"
                                : "text-gray-800"
                            }`}
                          >
                            Unidad {index + 1}
                          </div>

                          <div className="mt-1 text-[11px] text-gray-400">
                            {extras.length === 0
                              ? "Sin extras"
                              : `${extras.length} extra${
                                  extras.length === 1 ? "" : "s"
                                }`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-gray-900">Extras</h3>

                    <p className="mt-1 text-xs text-gray-400">
                      Unidad {selectedUnitIndex + 1}
                    </p>
                  </div>

                  {getCurrentUnitExtras().length > 0 && (
                    <span className="text-xs font-bold text-green-600">
                      {getCurrentUnitExtras().reduce(
                        (total, extra) => total + extra.quantity,
                        0,
                      )}{" "}
                      seleccionados
                    </span>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wide text-gray-400">
                        Aderezos
                      </h4>
                    </div>

                    {getExtrasByCategory("aderezos").length === 0 ? (
                      <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-400">
                        No hay aderezos disponibles.
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-2">
                        {getExtrasByCategory("aderezos").map((product) => {
                          const quantity = getExtraQuantity(product.id);

                          const reserved = getReservedExtraQuantity(product.id);

                          const available = product.stock - reserved;

                          return (
                            <div
                              key={product.id}
                              className={`flex items-center justify-between rounded-2xl border p-3 transition ${
                                quantity > 0
                                  ? "border-green-200 bg-green-50/60"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-gray-900 truncate">
                                  {product.name}
                                </div>

                                <div className="mt-1 text-[10px] text-gray-400">
                                  Stock {available}
                                </div>
                              </div>

                              <div className="ml-3 flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => removeExtra(product)}
                                  disabled={quantity <= 0}
                                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-25"
                                >
                                  <Minus size={14} />
                                </button>

                                <span className="w-8 text-center text-xs font-black">
                                  {quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => addExtra(product)}
                                  disabled={
                                    available <=
                                    getTotalSelectedExtraQuantity(product.id)
                                  }
                                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-green-50 hover:text-green-600 disabled:opacity-25"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-2">
                      <h4 className="text-xs font-black uppercase tracking-wide text-gray-400">
                        Descartables
                      </h4>
                    </div>

                    {getExtrasByCategory("descartables").length === 0 ? (
                      <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-400">
                        No hay descartables disponibles.
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-2">
                        {getExtrasByCategory("descartables").map((product) => {
                          const quantity = getExtraQuantity(product.id);

                          const reserved = getReservedExtraQuantity(product.id);

                          const available = product.stock - reserved;

                          return (
                            <div
                              key={product.id}
                              className={`flex items-center justify-between rounded-2xl border p-3 transition ${
                                quantity > 0
                                  ? "border-green-200 bg-green-50/60"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-gray-900 truncate">
                                  {product.name}
                                </div>

                                <div className="mt-1 text-[10px] text-gray-400">
                                  Stock {available}
                                </div>
                              </div>

                              <div className="ml-3 flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => removeExtra(product)}
                                  disabled={quantity <= 0}
                                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-25"
                                >
                                  <Minus size={14} />
                                </button>

                                <span className="w-8 text-center text-xs font-black">
                                  {quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => addExtra(product)}
                                  disabled={
                                    available <=
                                    getTotalSelectedExtraQuantity(product.id)
                                  }
                                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-green-50 hover:text-green-600 disabled:opacity-25"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wide text-green-700">
                      Unidad {selectedUnitIndex + 1}
                    </div>

                    <div className="mt-1 text-sm font-bold text-gray-800">
                      {getCurrentUnitExtras().length === 0
                        ? "Sin extras"
                        : "Extras seleccionados"}
                    </div>
                  </div>

                  {getCurrentUnitExtras().length > 0 && (
                    <Check size={18} className="text-green-600" />
                  )}
                </div>

                {getCurrentUnitExtras().length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {getCurrentUnitExtras().map((extra) => (
                      <span
                        key={extra.productId}
                        className="rounded-lg bg-white border border-green-100 px-2 py-1 text-[11px] font-semibold text-gray-600"
                      >
                        {extra.name} ×{extra.quantity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    Subtotal
                  </div>

                  <div className="text-xl font-black text-gray-900">
                    ${(selectedItem.salePrice * qty).toLocaleString("es-AR")}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="h-11 px-5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={confirmAdd}
                  className="h-11 px-6 flex items-center justify-center gap-2 rounded-xl bg-green-600 text-sm font-black text-white shadow-lg shadow-green-600/20 hover:bg-green-700 transition"
                >
                  Agregar al pedido
                  <Plus size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div id="mobile-checkout" className="hidden" />
    </div>
  );
}
