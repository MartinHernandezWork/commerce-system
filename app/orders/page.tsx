"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Clock3,
  CreditCard,
  Package,
  RefreshCw,
  ShoppingBag,
  User,
  Wallet,
  Banknote,
  ArrowLeftRight,
  ChefHat,
  CircleAlert,
  CalendarDays,
} from "lucide-react";

type OrderItemIngredient = {
  id: number;
  name: string;
  quantity: number;
  product: {
    unitType: "UNIT" | "G" | "KG";
  };
};

type OrderItemExtra = {
  id: number;
  name: string;
  quantity: number;
  category: "ADEREZO" | "DESCARTABLE";
  unitIndex: number;
};

type OrderItem = {
  id: number;
  type: "PRODUCT" | "RECIPE";
  name: string;
  quantity: number;
  unitPrice: number;
  ingredients: OrderItemIngredient[];
  extras: OrderItemExtra[];
};

type Order = {
  id: number;
  status: "PENDING" | "COMPLETED";
  createdAt: string;
  completedAt: string | null;
  group: {
    id: number;
    customerName: string | null;
    total: number;
    createdAt: string;
    paymentMethod: "CASH" | "TRANSFER" | "MIXED";
    cashAmount: number;
    transferAmount: number;
    cashReceived: number;
    change: number;
  };
  items: OrderItem[];
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getPaymentLabel(paymentMethod: Order["group"]["paymentMethod"]) {
  switch (paymentMethod) {
    case "CASH":
      return "Efectivo";
    case "TRANSFER":
      return "Transferencia";
    case "MIXED":
      return "Mixto";
    default:
      return paymentMethod;
  }
}

function PaymentIcon({
  paymentMethod,
}: {
  paymentMethod: Order["group"]["paymentMethod"];
}) {
  if (paymentMethod === "CASH") {
    return <Banknote size={14} />;
  }

  if (paymentMethod === "TRANSFER") {
    return <CreditCard size={14} />;
  }

  return <ArrowLeftRight size={14} />;
}

function getPaymentStyle(paymentMethod: Order["group"]["paymentMethod"]) {
  switch (paymentMethod) {
    case "CASH":
      return "bg-green-50 text-green-700 border-green-200";
    case "TRANSFER":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "MIXED":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function formatUnit(unitType: "UNIT" | "G" | "KG", quantity: number) {
  switch (unitType) {
    case "G":
      return `${quantity} g`;

    case "KG":
      return `${quantity} kg`;

    case "UNIT":
      return `${quantity} un`;

    default:
      return quantity.toString();
  }
}

function getExtrasByUnit(extras: OrderItemExtra[]) {
  const grouped = new Map<number, OrderItemExtra[]>();

  for (const extra of extras) {
    const current = grouped.get(extra.unitIndex) ?? [];
    current.push(extra);
    grouped.set(extra.unitIndex, current);
  }

  return Array.from(grouped.entries()).sort(
    ([unitA], [unitB]) => unitA - unitB,
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const loadOrders = useCallback(async (manual = false) => {
    try {
      if (manual) {
        setRefreshing(true);
      }

      const response = await fetch("/api/orders", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "No se pudieron cargar las órdenes.");
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error(error);

      setErrorMessage(error?.message || "No se pudieron cargar las órdenes.");

      setShowError(true);

      window.setTimeout(() => {
        setShowError(false);
      }, 3500);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    const interval = window.setInterval(() => {
      loadOrders();
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadOrders]);

  async function completeOrder(orderId: number) {
    if (completingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      "¿Confirmás que esta orden ya fue entregada?",
    );

    if (!confirmed) {
      return;
    }

    setCompletingId(orderId);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo completar la orden.");
      }

      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch (error: any) {
      console.error(error);

      setErrorMessage(error?.message || "No se pudo completar la orden.");

      setShowError(true);

      window.setTimeout(() => {
        setShowError(false);
      }, 3500);
    } finally {
      setCompletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-3xl bg-[#f6f8f7]">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600">
            <RefreshCw size={23} className="animate-spin" />
          </div>

          <p className="font-semibold text-slate-700">Cargando órdenes...</p>

          <p className="mt-1 text-sm text-slate-400">
            Estamos buscando los pedidos pendientes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#f6f8f7]">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <ChefHat size={20} />
                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">
                    Órdenes
                  </h1>

                  <p className="text-xs font-medium text-slate-400">
                    Preparación y entrega
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                <Clock3 size={13} />
                {orders.length}{" "}
                {orders.length === 1 ? "pendiente" : "pendientes"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadOrders(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />

            {refreshing ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {orders.length === 0 ? (
          <div className="flex min-h-full items-center justify-center py-12">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                <Check size={32} strokeWidth={2.5} />
              </div>

              <h2 className="text-xl font-black text-slate-800">Todo al día</h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                No hay órdenes pendientes en este momento. Los nuevos pedidos
                aparecerán automáticamente.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-400">
                <RefreshCw size={13} />
                Actualización automática
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 xl:grid-cols-2">
            {orders.map((order) => {
              const isCompleting = completingId === order.id;

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <header className="border-b border-slate-200 bg-white px-5 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xl font-black tracking-tight text-slate-900">
                            Orden #{order.id}
                          </span>

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Pendiente
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <Clock3 size={14} className="text-slate-400" />
                            {formatTime(order.createdAt)}
                          </span>

                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <CalendarDays
                              size={14}
                              className="text-slate-400"
                            />
                            {formatDate(order.createdAt)}
                          </span>

                          {order.group.customerName && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                              <User size={14} className="text-slate-400" />
                              {order.group.customerName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 rounded-2xl bg-green-50 px-4 py-2.5 text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">
                          Total
                        </p>

                        <p className="mt-0.5 text-lg font-black text-green-700">
                          {formatMoney(order.group.total)}
                        </p>
                      </div>
                    </div>
                  </header>

                  <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Pago
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${getPaymentStyle(
                          order.group.paymentMethod,
                        )}`}
                      >
                        <PaymentIcon
                          paymentMethod={order.group.paymentMethod}
                        />

                        {getPaymentLabel(order.group.paymentMethod)}
                      </span>

                      {order.group.paymentMethod === "MIXED" && (
                        <>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <Banknote size={13} />
                            {formatMoney(order.group.cashAmount)}
                          </span>

                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <CreditCard size={13} />
                            {formatMoney(order.group.transferAmount)}
                          </span>
                        </>
                      )}

                      {order.group.change > 0 && (
                        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                          <Wallet size={13} />
                          Vuelto {formatMoney(order.group.change)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 p-4 sm:p-5">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-2xl border border-slate-200"
                      >
                        <div className="flex items-center justify-between gap-3 bg-white px-4 py-3.5">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-green-100 px-2 font-black text-green-700">
                              x{item.quantity}
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate font-bold text-slate-800">
                                {item.name}
                              </h3>

                              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                {item.type === "RECIPE" ? "Receta" : "Producto"}
                              </p>
                            </div>
                          </div>

                          <span className="shrink-0 text-sm font-black text-slate-800">
                            {formatMoney(item.unitPrice * item.quantity)}
                          </span>
                        </div>

                        {item.ingredients.length > 0 && (
                          <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3">
                            <div className="mb-2 flex items-center gap-2">
                              <ChefHat size={14} className="text-green-600" />

                              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                                Preparación
                              </p>
                            </div>

                            <div className="grid gap-1.5 sm:grid-cols-2">
                              {item.ingredients.map((ingredient) => (
                                <div
                                  key={ingredient.id}
                                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2"
                                >
                                  <span className="text-xs font-medium text-slate-600">
                                    {ingredient.name}
                                  </span>

                                  <span className="ml-3 text-xs font-black text-slate-700">
                                    {formatUnit(
                                      ingredient.product.unitType,
                                      ingredient.quantity,
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.extras.length > 0 && (
                          <div className="border-t border-slate-100 bg-white px-4 py-3">
                            <div className="mb-3 flex items-center gap-2">
                              <Package size={14} className="text-amber-600" />

                              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                                Extras por unidad
                              </p>
                            </div>

                            <div className="space-y-2">
                              {getExtrasByUnit(item.extras).map(
                                ([unitIndex, extras]) => (
                                  <div
                                    key={unitIndex}
                                    className="rounded-xl border border-amber-100 bg-amber-50/60 p-3"
                                  >
                                    <div className="mb-2 flex items-center gap-2">
                                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-[10px] font-black text-amber-700">
                                        {unitIndex + 1}
                                      </span>

                                      <span className="text-xs font-black uppercase tracking-wide text-slate-600">
                                        Unidad {unitIndex + 1}
                                      </span>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                      {extras.map((extra) => (
                                        <div
                                          key={extra.id}
                                          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 shadow-sm"
                                        >
                                          {extra.category === "ADEREZO" ? (
                                            <ShoppingBag
                                              size={13}
                                              className="text-amber-600"
                                            />
                                          ) : (
                                            <Package
                                              size={13}
                                              className="text-amber-600"
                                            />
                                          )}

                                          <span className="text-xs font-semibold text-slate-700">
                                            {extra.name}
                                          </span>

                                          {extra.quantity > 1 && (
                                            <span className="text-[11px] font-black text-slate-500">
                                              x{extra.quantity}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <footer className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <button
                      type="button"
                      onClick={() => completeOrder(order.id)}
                      disabled={isCompleting}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-green-700 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                      {isCompleting ? (
                        <>
                          <RefreshCw size={17} className="animate-spin" />
                          Marcando como entregado...
                        </>
                      ) : (
                        <>
                          <Check size={18} strokeWidth={2.8} />
                          Marcar como entregado
                        </>
                      )}
                    </button>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {showError && (
        <div className="fixed bottom-5 right-5 z-[100] w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-2xl border border-red-200 bg-white shadow-xl">
          <div className="flex items-start gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <CircleAlert size={18} />
            </div>

            <div className="min-w-0">
              <p className="font-bold text-slate-800">Ocurrió un error</p>

              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                {errorMessage}
              </p>
            </div>
          </div>

          <div className="h-1 bg-red-500" />
        </div>
      )}
    </div>
  );
}
