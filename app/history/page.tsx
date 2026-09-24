"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  CreditCard,
  ReceiptText,
  RefreshCw,
  Search,
  ShoppingBag,
  User,
  X,
  XCircle,
} from "lucide-react";

type Sale = {
  id: number;
  productName: string;
  quantity: number;
};

type RecipeSale = {
  id: number;
  recipeName: string;
  quantity: number;
};

type SaleGroup = {
  id: number;
  createdAt: string;
  total: number;
  customerName: string | null;
  paymentMethod: "CASH" | "TRANSFER" | "MIXED";
  cashAmount?: number;
  transferAmount?: number;
  cashReceived?: number;
  change?: number;
  cancelled?: boolean;
  sales?: Sale[];
  recipeSales?: RecipeSale[];
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

function formatDateLabel(date: string) {
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  ).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getPaymentLabel(
  paymentMethod: SaleGroup["paymentMethod"],
) {
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

function getPaymentStyle(
  paymentMethod: SaleGroup["paymentMethod"],
) {
  switch (paymentMethod) {
    case "CASH":
      return "border-green-200 bg-green-50 text-green-700";
    case "TRANSFER":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "MIXED":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function PaymentIcon({
  paymentMethod,
}: {
  paymentMethod: SaleGroup["paymentMethod"];
}) {
  if (paymentMethod === "CASH") {
    return <Banknote size={14} />;
  }

  if (paymentMethod === "TRANSFER") {
    return <CreditCard size={14} />;
  }

  return <ArrowLeftRight size={14} />;
}

export default function HistoryPage() {
  const [groups, setGroups] = useState<SaleGroup[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA"),
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function load(manual = false) {
    try {
      if (manual) {
        setRefreshing(true);
      }

      setErrorMessage("");

      const response = await fetch(
        "/api/sale-group/history",
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "No se pudo cargar el historial de ventas.",
        );
      }

      setGroups(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error(error);

      setErrorMessage(
        error?.message ||
          "No se pudo cargar el historial de ventas.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredGroups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return groups.filter((group) => {
      const saleDate = new Date(group.createdAt)
        .toLocaleDateString("en-CA");

      if (saleDate !== selectedDate) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const ticketMatch = String(group.id)
        .toLowerCase()
        .includes(normalizedSearch);

      const customerMatch = (
        group.customerName || "Consumidor final"
      )
        .toLowerCase()
        .includes(normalizedSearch);

      const productMatch =
        group.sales?.some((sale) =>
          sale.productName
            .toLowerCase()
            .includes(normalizedSearch),
        ) || false;

      const recipeMatch =
        group.recipeSales?.some((recipe) =>
          recipe.recipeName
            .toLowerCase()
            .includes(normalizedSearch),
        ) || false;

      return (
        ticketMatch ||
        customerMatch ||
        productMatch ||
        recipeMatch
      );
    });
  }, [groups, selectedDate, search]);

  const activeGroups = useMemo(() => {
    return filteredGroups.filter(
      (group) => !group.cancelled,
    );
  }, [filteredGroups]);

  const totalFacturacion = useMemo(() => {
    return activeGroups.reduce(
      (acc, group) => acc + Number(group.total),
      0,
    );
  }, [activeGroups]);

  const totalProductosVendidos = useMemo(() => {
    return activeGroups.reduce((acc, group) => {
      const products =
        group.sales?.reduce(
          (sum, sale) => sum + Number(sale.quantity),
          0,
        ) || 0;

      const recipes =
        group.recipeSales?.reduce(
          (sum, item) => sum + Number(item.quantity),
          0,
        ) || 0;

      return acc + products + recipes;
    }, 0);
  }, [activeGroups]);

  const ticketPromedio =
    activeGroups.length > 0
      ? totalFacturacion / activeGroups.length
      : 0;

  const cancelledGroups = filteredGroups.filter(
    (group) => group.cancelled,
  ).length;

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-3xl bg-[#f6f8f7]">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600">
            <RefreshCw
              size={23}
              className="animate-spin"
            />
          </div>

          <p className="font-semibold text-slate-700">
            Cargando historial...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Estamos buscando las ventas registradas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#f6f8f7]">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-center">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
        <ReceiptText size={21} />
      </div>

      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Historial de ventas
        </h1>

        <p className="mt-0.5 text-xs font-medium text-slate-400">
          Consultá las ventas y sus detalles
        </p>
      </div>
    </div>

    <div className="relative w-full lg:mx-auto lg:w-full lg:max-w-md">
      <Search
        size={17}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar ticket, cliente o producto..."
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:ring-4 focus:ring-green-100"
      />

      {search && (
        <button
          type="button"
          onClick={() => setSearch("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-slate-600"
          aria-label="Limpiar búsqueda"
        >
          <X size={16} />
        </button>
      )}
    </div>

    <div className="flex justify-start lg:justify-end">
      <button
        type="button"
        onClick={() => load(true)}
        disabled={refreshing}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw
          size={17}
          className={refreshing ? "animate-spin" : ""}
        />

        {refreshing ? "Actualizando..." : "Actualizar"}
      </button>
    </div>
  </div>
</header>

      <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {errorMessage && (
            <div className="overflow-hidden rounded-2xl border border-red-200 bg-white">
              <div className="flex items-start gap-3 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <CircleAlert size={18} />
                </div>

                <div>
                  <p className="font-bold text-slate-800">
                    No se pudo cargar el historial
                  </p>

                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {errorMessage}
                  </p>
                </div>
              </div>

              <div className="h-1 bg-red-500" />
            </div>
          )}

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarDays
                    size={17}
                    className="text-green-600"
                  />

                  <h2 className="text-sm font-black uppercase tracking-wide text-slate-600">
                    Consultar fecha
                  </h2>
                </div>

                <p className="mt-1 text-xs font-medium capitalize text-slate-400">
                  {formatDateLabel(selectedDate)}
                </p>
              </div>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) =>
                  setSelectedDate(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100 sm:w-auto"
              />
            </div>
          </section>

          {search && (
            <div className="flex items-center gap-2 rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
              <Search
                size={16}
                className="shrink-0 text-green-600"
              />

              <p className="text-sm font-medium text-green-800">
                Buscando{" "}
                <span className="font-black">
                  "{search}"
                </span>{" "}
                en los tickets de esta fecha.
              </p>

              <button
                type="button"
                onClick={() => setSearch("")}
                className="ml-auto shrink-0 cursor-pointer rounded-lg p-1 text-green-600 transition hover:bg-green-100 hover:text-green-800"
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Ventas del día
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {activeGroups.length}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ReceiptText size={19} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Facturación
                  </p>

                  <p className="mt-2 break-words text-2xl font-black text-green-700 sm:text-3xl">
                    {formatMoney(totalFacturacion)}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Banknote size={19} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Productos vendidos
                  </p>

                  <p className="mt-2 text-3xl font-black text-purple-700">
                    {totalProductosVendidos}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <ShoppingBag size={19} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Ticket promedio
                  </p>

                  <p className="mt-2 break-words text-2xl font-black text-amber-700 sm:text-3xl">
                    {formatMoney(ticketPromedio)}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <ReceiptText size={19} />
                </div>
              </div>
            </div>
          </section>

          {cancelledGroups > 0 && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
              <XCircle
                size={17}
                className="shrink-0 text-red-600"
              />

              <p className="text-sm font-semibold text-red-700">
                {cancelledGroups}{" "}
                {cancelledGroups === 1
                  ? "venta anulada"
                  : "ventas anuladas"}{" "}
                en esta fecha
              </p>
            </div>
          )}

          {filteredGroups.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="max-w-md">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <ReceiptText size={30} />
                </div>

                <h2 className="text-xl font-black text-slate-800">
                  {search
                    ? "No se encontraron ventas"
                    : "Sin ventas"}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {search
                    ? "Probá con otro ticket, cliente, producto o receta."
                    : "No hay ventas registradas para la fecha seleccionada."}
                </p>
              </div>
            </div>
          ) : (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-800">
                    Tickets
                  </h2>

                  <p className="text-xs font-medium text-slate-400">
                    {filteredGroups.length}{" "}
                    {filteredGroups.length === 1
                      ? "ticket registrado"
                      : "tickets registrados"}
                  </p>
                </div>
              </div>

              {filteredGroups.map((group) => {
                const cancelled = Boolean(
                  group.cancelled,
                );

                const productCount =
                  (group.sales?.length ?? 0) +
                  (group.recipeSales?.length ?? 0);

                return (
                  <article
                    key={group.id}
                    className={`overflow-hidden rounded-3xl border shadow-sm transition hover:shadow-md ${
                      cancelled
                        ? "border-red-200 bg-white"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    {cancelled && (
                      <div className="border-b border-red-200 bg-red-50 px-5 py-3 sm:px-6">
                        <div className="flex items-center gap-2">
                          <XCircle
                            size={17}
                            className="text-red-600"
                          />

                          <span className="text-xs font-black uppercase tracking-wider text-red-700">
                            Venta anulada
                          </span>
                        </div>
                      </div>
                    )}

                    <header className="border-b border-slate-200 px-5 py-5 sm:px-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-black tracking-tight text-slate-900">
                              Ticket #{group.id}
                            </h3>

                            {!cancelled && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-green-700">
                                <CheckCircle2 size={12} />
                                Registrada
                              </span>
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                              <CalendarDays
                                size={14}
                                className="text-slate-400"
                              />

                              {formatDate(
                                group.createdAt,
                              )}
                            </span>

                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                              <Clock3
                                size={14}
                                className="text-slate-400"
                              />

                              {formatTime(
                                group.createdAt,
                              )}
                            </span>

                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                              <User
                                size={14}
                                className="text-slate-400"
                              />

                              {group.customerName ||
                                "Consumidor final"}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`shrink-0 rounded-2xl px-4 py-2.5 sm:text-right ${
                            cancelled
                              ? "bg-red-50"
                              : "bg-green-50"
                          }`}
                        >
                          <p
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              cancelled
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            Total
                          </p>

                          <p
                            className={`mt-0.5 text-xl font-black ${
                              cancelled
                                ? "text-red-700 line-through"
                                : "text-green-700"
                            }`}
                          >
                            {formatMoney(
                              Number(group.total),
                            )}
                          </p>
                        </div>
                      </div>
                    </header>

                    <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3.5 sm:px-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                          Pago
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${getPaymentStyle(
                            group.paymentMethod,
                          )}`}
                        >
                          <PaymentIcon
                            paymentMethod={
                              group.paymentMethod
                            }
                          />

                          {getPaymentLabel(
                            group.paymentMethod,
                          )}
                        </span>

                        {group.paymentMethod ===
                          "MIXED" && (
                          <>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                              <Banknote size={13} />

                              {formatMoney(
                                Number(
                                  group.cashAmount || 0,
                                ),
                              )}
                            </span>

                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                              <CreditCard size={13} />

                              {formatMoney(
                                Number(
                                  group.transferAmount ||
                                    0,
                                ),
                              )}
                            </span>
                          </>
                        )}

                        {Number(group.change || 0) >
                          0 && (
                          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                            Vuelto{" "}
                            {formatMoney(
                              Number(group.change),
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 sm:p-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <ShoppingBag
                            size={16}
                            className="text-green-600"
                          />

                          <h4 className="text-sm font-black uppercase tracking-wide text-slate-600">
                            Productos
                          </h4>
                        </div>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                          {productCount}{" "}
                          {productCount === 1
                            ? "línea"
                            : "líneas"}
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-2xl border border-slate-200">
                        {group.sales?.map(
                          (sale, index) => (
                            <div
                              key={`product-${sale.id}`}
                              className={`flex items-center justify-between gap-4 bg-white px-4 py-3.5 ${
                                index > 0
                                  ? "border-t border-slate-100"
                                  : ""
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-700">
                                  {sale.productName}
                                </p>

                                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                  Producto
                                </p>
                              </div>

                              <span className="shrink-0 rounded-xl bg-slate-50 px-2.5 py-1.5 text-xs font-black text-slate-700">
                                x{sale.quantity}
                              </span>
                            </div>
                          ),
                        )}

                        {group.recipeSales?.map(
                          (item, index) => (
                            <div
                              key={`recipe-${item.id}`}
                              className={`flex items-center justify-between gap-4 bg-green-50/40 px-4 py-3.5 ${
                                index > 0 ||
                                (group.sales?.length ??
                                  0) > 0
                                  ? "border-t border-slate-100"
                                  : ""
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-700">
                                  {item.recipeName}
                                </p>

                                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-green-600">
                                  Receta
                                </p>
                              </div>

                              <span className="shrink-0 rounded-xl bg-white px-2.5 py-1.5 text-xs font-black text-slate-700 shadow-sm">
                                x{item.quantity}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <footer className="border-t border-slate-200 bg-slate-50/70 px-5 py-3.5 sm:px-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400">
                          <ReceiptText size={14} />

                          {productCount}{" "}
                          {productCount === 1
                            ? "producto"
                            : "productos"}
                        </span>

                        <span className="text-xs font-semibold text-slate-400">
                          Ticket #{group.id}
                        </span>
                      </div>
                    </footer>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}