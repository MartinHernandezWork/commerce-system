"use client";

import Link from "next/link";
import { ShoppingCart, ClipboardList, Package, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center px-5 py-10 sm:px-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
          <section>

            <div className="flex items-center gap-5 mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gray-950 p-2.5 shadow-lg">
                <img
                  src="/uploads/donald.jpg"
                  alt="Logo de Lo Del Donald"
                  className="w-full h-full rounded-2xl object-contain"
                />
              </div>

              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-gray-950">
                  Lo Del <span className="text-green-600">Donald</span>
                </h1>

                <p className="mt-2 text-sm sm:text-base text-gray-400 font-medium">
                  Ventas y gestión del comercio
                </p>
              </div>
            </div>

            <p className="max-w-xl text-lg sm:text-xl text-gray-500 leading-relaxed">
              Todo lo que necesitás para administrar ventas, caja, productos,
              recetas e inventario desde un solo lugar.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/pos"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 transition"
              >
                <ShoppingCart size={18} />
                Ir a ventas
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/orders"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-700 hover:text-green-700 font-bold transition"
              >
                <ClipboardList size={18} />
                Ver órdenes
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
