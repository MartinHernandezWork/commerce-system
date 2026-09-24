"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  LockKeyhole,
  ReceiptText,
  RefreshCw,
  Search,
  Wallet,
  X,
} from "lucide-react";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

type SaleGroup = {
  id: number;
  total: number;
};

type CashRegister = {
  id: number;
  openedAt: string;
  closedAt: string | null;
  initial: number;
  final: number | null;
  saleGroups: SaleGroup[];
};

export default function CashHistoryPage() {
  const [data, setData] = useState<CashRegister[]>([]);
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

      const res = await fetch("/api/cash/history", {
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json?.error || "No se pudo cargar el historial.",
        );
      }

      setData(Array.isArray(json) ? json : []);
    } catch (error: any) {
      console.error(error);

      setErrorMessage(
        error?.message || "No se pudo cargar el historial.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredData = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return data.filter((cash) => {
      const cashDate = new Date(cash.openedAt)
        .toLocaleDateString("en-CA");

      if (cashDate !== selectedDate) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const cashIdMatch = String(cash.id)
        .toLowerCase()
        .includes(normalizedSearch);

      const openedDateMatch = formatDateTime(cash.openedAt)
        .toLowerCase()
        .includes(normalizedSearch);

      const closedDateMatch = cash.closedAt
        ? formatDateTime(cash.closedAt)
            .toLowerCase()
            .includes(normalizedSearch)
        : false;

      return (
        cashIdMatch ||
        openedDateMatch ||
        closedDateMatch
      );
    });
  }, [data, selectedDate, search]);

  const stats = useMemo(() => {
    const cajasAbiertas = filteredData.filter(
      (cash) => !cash.closedAt,
    ).length;

    const ventasTotales = filteredData.reduce(
      (acc, cash) => {
        const totalSales = (cash.saleGroups ?? []).reduce(
          (sum, group) => sum + Number(group.total),
          0,
        );

        return acc + totalSales;
      },
      0,
    );

    const dineroControlado = filteredData.reduce(
      (acc, cash) => {
        return acc + Number(cash.final || 0);
      },
      0,
    );

    const tickets = filteredData.reduce(
      (acc, cash) => {
        return acc + (cash.saleGroups?.length ?? 0);
      },
      0,
    );

    return {
      totalCajas: filteredData.length,
      cajasAbiertas,
      ventasTotales,
      dineroControlado,
      tickets,
    };
  }, [filteredData]);

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
            Estamos buscando los registros de caja.
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
              <Banknote size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Historial de cajas
              </h1>

              <p className="mt-0.5 text-xs font-medium text-slate-400">
                Aperturas, cierres y movimientos de caja
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
              placeholder="Buscar caja o fecha..."
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

              {refreshing
                ? "Actualizando..."
                : "Actualizar"}
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
                en las cajas de esta fecha.
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
                    Total de cajas
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {stats.totalCajas}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Wallet size={19} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Cajas abiertas
                  </p>

                  <p className="mt-2 text-3xl font-black text-amber-600">
                    {stats.cajasAbiertas}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock3 size={19} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Ventas acumuladas
                  </p>

                  <p className="mt-2 break-words text-2xl font-black text-green-700 sm:text-3xl">
                    {formatMoney(stats.ventasTotales)}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Banknote size={19} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Dinero controlado
                  </p>

                  <p className="mt-2 break-words text-2xl font-black text-slate-900 sm:text-3xl">
                    {formatMoney(stats.dineroControlado)}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <CheckCircle2 size={19} />
                </div>
              </div>
            </div>
          </section>

          {filteredData.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="max-w-md">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <Wallet size={30} />
                </div>

                <h2 className="text-xl font-black text-slate-800">
                  {search
                    ? "No se encontraron cajas"
                    : "Sin registros"}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {search
                    ? "Probá buscando otro número de caja o fecha."
                    : "No hay registros de cajas para la fecha seleccionada."}
                </p>
              </div>
            </div>
          ) : (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-800">
                    Registros
                  </h2>

                  <p className="text-xs font-medium text-slate-400">
                    {filteredData.length}{" "}
                    {filteredData.length === 1
                      ? "caja registrada"
                      : "cajas registradas"}
                  </p>
                </div>
              </div>

              {filteredData.map((cash) => {
                const totalSales = (
                  cash.saleGroups ?? []
                ).reduce(
                  (sum, group) =>
                    sum + Number(group.total),
                  0,
                );

                const isOpen = !cash.closedAt;

                return (
                  <article
                    key={cash.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <header className="border-b border-slate-200 px-5 py-5 sm:px-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                              isOpen
                                ? "bg-amber-50 text-amber-600"
                                : "bg-green-50 text-green-600"
                            }`}
                          >
                            {isOpen ? (
                              <Clock3 size={21} />
                            ) : (
                              <LockKeyhole size={21} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-black text-slate-900">
                                Caja #{cash.id}
                              </h3>

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${
                                  isOpen
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : "border-green-200 bg-green-50 text-green-700"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    isOpen
                                      ? "bg-amber-500"
                                      : "bg-green-500"
                                  }`}
                                />

                                {isOpen
                                  ? "Abierta"
                                  : "Cerrada"}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                <Clock3
                                  size={13}
                                  className="text-slate-400"
                                />

                                Apertura{" "}
                                {formatDateTime(
                                  cash.openedAt,
                                )}
                              </span>

                              {cash.closedAt && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                  <LockKeyhole
                                    size={13}
                                    className="text-slate-400"
                                  />

                                  Cierre{" "}
                                  {formatDateTime(
                                    cash.closedAt,
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 rounded-2xl bg-green-50 px-4 py-2.5 sm:text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">
                            Ventas
                          </p>

                          <p className="mt-0.5 text-lg font-black text-green-700">
                            {formatMoney(totalSales)}
                          </p>
                        </div>
                      </div>
                    </header>

                    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                          Monto inicial
                        </p>

                        <p className="mt-2 text-lg font-black text-slate-800">
                          {formatMoney(
                            Number(cash.initial),
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-green-100 bg-green-50/60 p-4">
                        <p className="text-[11px] font-black uppercase tracking-wider text-green-600">
                          Ventas realizadas
                        </p>

                        <p className="mt-2 text-lg font-black text-green-700">
                          {formatMoney(totalSales)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                        <p className="text-[11px] font-black uppercase tracking-wider text-blue-600">
                          Control de caja
                        </p>

                        <p className="mt-2 text-lg font-black text-blue-700">
                          {cash.final !== null &&
                          cash.final !== undefined
                            ? formatMoney(
                                Number(cash.final),
                              )
                            : "—"}
                        </p>
                      </div>

                      <div
                        className={`rounded-2xl border p-4 ${
                          isOpen
                            ? "border-amber-100 bg-amber-50/60"
                            : "border-slate-100 bg-slate-50"
                        }`}
                      >
                        <p
                          className={`text-[11px] font-black uppercase tracking-wider ${
                            isOpen
                              ? "text-amber-600"
                              : "text-slate-400"
                          }`}
                        >
                          Estado
                        </p>

                        <p
                          className={`mt-2 text-sm font-black ${
                            isOpen
                              ? "text-amber-700"
                              : "text-slate-700"
                          }`}
                        >
                          {isOpen
                            ? "Caja actualmente abierta"
                            : "Caja cerrada"}
                        </p>
                      </div>
                    </div>

                    <footer className="border-t border-slate-200 bg-slate-50/70 px-4 py-3.5 sm:px-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                          <ReceiptText size={14} />

                          Tickets registrados
                        </div>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 shadow-sm">
                          {cash.saleGroups?.length ?? 0}
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