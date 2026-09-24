"use client";

import { useState } from "react";
import {
  ArrowRight,
  Banknote,
  CircleAlert,
  CircleCheck,
  LockKeyhole,
  RefreshCw,
  Wallet,
} from "lucide-react";

export default function CashPage() {
  const [initial, setInitial] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function openCash() {
    setErrorMessage("");
    setSuccess(false);

    const amount = Number(initial);

    if (!Number.isFinite(amount) || amount < 0) {
      setErrorMessage("Ingresá un monto inicial válido.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/cash/open", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          initial: amount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || "No se pudo abrir la caja.",
        );
      }

      setSuccess(true);
    } catch (error: any) {
      setErrorMessage(
        error?.message || "No se pudo abrir la caja.",
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
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                <Wallet size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Abrir caja
                </h1>

                <p className="mt-1 text-sm font-medium text-slate-400">
                  Prepará la caja para comenzar la jornada
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-7">
            <div className="rounded-2xl border border-green-100 bg-green-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <Banknote size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Monto inicial
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Ingresá el dinero en efectivo que hay en la caja al
                    comenzar la jornada.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="initial"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Dinero inicial
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  $
                </span>

                <input
                  id="initial"
                  type="number"
                  min="0"
                  step="1"
                  value={initial}
                  onChange={(e) => {
                    setInitial(e.target.value);
                    setErrorMessage("");
                    setSuccess(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      openCash();
                    }
                  }}
                  placeholder="0"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-9 pr-4 text-lg font-bold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="overflow-hidden rounded-2xl border border-red-200 bg-white">
                <div className="flex items-start gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <CircleAlert size={18} />
                  </div>

                  <div>
                    <p className="font-bold text-slate-800">
                      No se pudo abrir la caja
                    </p>

                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      {errorMessage}
                    </p>
                  </div>
                </div>

                <div className="h-1 bg-red-500" />
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <CircleCheck size={19} />
                  </div>

                  <div>
                    <p className="font-bold text-green-800">
                      Caja abierta correctamente
                    </p>

                    <p className="mt-0.5 text-xs font-medium text-green-700">
                      Ya podés comenzar a registrar ventas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={openCash}
              disabled={loading || success}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-4 text-sm font-black text-white shadow-sm transition hover:bg-green-700 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Abriendo caja...
                </>
              ) : success ? (
                <>
                  <CircleCheck size={18} strokeWidth={2.5} />
                  Caja abierta
                </>
              ) : (
                <>
                  Abrir caja
                  <ArrowRight size={18} strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>

          <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-7">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
              <LockKeyhole size={13} />
              La caja debe estar abierta para registrar ventas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}