"use client";

import { useState } from "react";
import {
  Banknote,
  CircleAlert,
  CircleCheck,
  LockKeyhole,
  RefreshCw,
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

export default function CloseCashPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function closeCash() {
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/cash/close", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || "No se pudo cerrar la caja.",
        );
      }

      setResult(data);
    } catch (error: any) {
      setErrorMessage(
        error?.message || "Ocurrió un error al cerrar la caja.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 items-center justify-center overflow-y-auto rounded-3xl bg-[#f6f8f7] p-4 sm:p-6">
      <div className="w-full max-w-lg">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-6 sm:px-7">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <LockKeyhole size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Cerrar caja
                </h1>

                <p className="mt-1 text-sm font-medium text-slate-400">
                  Finalizá la jornada y revisá el resumen
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-7">
            {!result && (
              <>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      <Wallet size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        ¿Terminaste la jornada?
                      </p>

                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        Al cerrar la caja se finalizará el turno actual y se
                        generará el resumen de ventas.
                      </p>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="overflow-hidden rounded-2xl border border-red-200 bg-white">
                    <div className="flex items-start gap-3 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                        <CircleAlert size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-slate-800">
                          No se pudo cerrar la caja
                        </p>

                        <p className="mt-1 text-sm leading-relaxed text-slate-500">
                          {errorMessage}
                        </p>
                      </div>
                    </div>

                    <div className="h-1 bg-red-500" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={closeCash}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-4 text-sm font-black text-white shadow-sm transition hover:bg-red-700 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Cerrando caja...
                    </>
                  ) : (
                    <>
                      <LockKeyhole size={18} strokeWidth={2.5} />
                      Cerrar caja
                    </>
                  )}
                </button>
              </>
            )}

            {result && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                      <CircleCheck size={20} strokeWidth={2.5} />
                    </div>

                    <div>
                      <p className="font-black text-green-800">
                        Caja cerrada correctamente
                      </p>

                      <p className="mt-0.5 text-xs font-medium text-green-700">
                        La jornada fue finalizada.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Banknote
                        size={16}
                        className="text-green-600"
                      />

                      <h2 className="text-sm font-black uppercase tracking-wide text-slate-600">
                        Resumen del día
                      </h2>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 bg-white">
                    <div className="flex items-center justify-between gap-4 px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-600">
                          Total ventas
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Ventas registradas durante la jornada
                        </p>
                      </div>

                      <span className="shrink-0 text-lg font-black text-slate-900">
                        {formatMoney(Number(result.totalSales) || 0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 bg-green-50/60 px-4 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-700">
                          Monto final
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Dinero final registrado en caja
                        </p>
                      </div>

                      <span className="shrink-0 text-xl font-black text-green-700">
                        {formatMoney(Number(result.finalAmount) || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                  <CircleCheck size={13} />
                  La caja quedó cerrada
                </div>
              </div>
            )}
          </div>

          {!result && (
            <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-7">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                <X size={13} />
                Esta acción finaliza la caja actual
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}