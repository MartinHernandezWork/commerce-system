"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useEffect } from "react";

export default function Navbar() {
  const [cashOpen, setCashOpen] = useState<boolean | null>(null);

  useEffect(() => {
    function load() {
      fetch("/api/cash/status")
        .then((res) => res.json())
        .then((data) => {
          setCashOpen(data.isOpen);
        });
    }

    load();

    const interval = setInterval(load, 3000);

    return () => clearInterval(interval);
  }, []);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  function toggle(menu: string) {
    setOpenMenu(openMenu === menu ? null : menu);
  }

  function closeMenu() {
    setOpenMenu(null);
  }

  function menuClass(name: string) {
    return `
      absolute mt-2 w-44 rounded shadow bg-white text-black
      transition-all duration-200 origin-top
      ${
        openMenu === name
          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
      }
    `;
  }

  function iconClass(name: string) {
    return `transition-transform duration-200 ${
      openMenu === name ? "rotate-180" : ""
    }`;
  }

  return (
    <header className="bg-black text-white px-6 py-4 shadow">
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold" onClick={closeMenu}>
            PUNTO DE VENTA 🛒
          </Link>

          {cashOpen !== null && (
            <span
              className={`text-xs px-2 py-1 rounded font-semibold ${
                cashOpen ? "bg-green-600 text-white" : "bg-red-600 text-white"
              }`}
            >
              {cashOpen ? "Caja abierta" : "Caja cerrada"}
            </span>
          )}
        </div>

        <div className="flex gap-6 relative">
          {/* VENTAS */}
          <Link
            href="/pos"
            onClick={closeMenu}
            className="bg-green-700 hover:bg-green-500 px-3 py-1 rounded cursor-pointer"
          >
            Ventas
          </Link>

          {/* CAJA */}
          <div className="relative">
            <button
              onClick={() => toggle("cash")}
              className="cursor-pointer flex items-center gap-1"
            >
              Caja
              <ChevronDown size={16} className={iconClass("cash")} />
            </button>

            <div className={menuClass("cash")}>
              <Link
                href="/cash"
                onClick={closeMenu}
                className="block px-3 py-2 hover:rounded-md hover:bg-gray-200 cursor-pointer"
              >
                Abrir caja
              </Link>

              <Link
                href="/cash/close"
                onClick={closeMenu}
                className="block px-3 py-2 hover:rounded-md hover:bg-gray-200 cursor-pointer"
              >
                Cerrar caja
              </Link>
            </div>
          </div>

          {/* HISTORIAL */}
          <div className="relative">
            <button
              onClick={() => toggle("history")}
              className="cursor-pointer flex items-center gap-1"
            >
              Historial
              <ChevronDown size={16} className={iconClass("history")} />
            </button>

            <div className={menuClass("history")}>
              <Link
                href="/history"
                onClick={closeMenu}
                className="block px-3 py-2 hover:rounded-md hover:bg-gray-200 cursor-pointer"
              >
                Historial de venta
              </Link>
              <Link
                href="/cash/history"
                onClick={closeMenu}
                className="block px-3 py-2 hover:rounded-md hover:bg-gray-200 cursor-pointer"
              >
                Historial de caja
              </Link>
            </div>
          </div>

          {/* PRODUCTOS */}
          <div className="relative">
            <button
              onClick={() => toggle("products")}
              className="cursor-pointer flex items-center gap-1"
            >
              Productos
              <ChevronDown size={16} className={iconClass("products")} />
            </button>

            <div className={menuClass("products")}>
              <Link
                href="/products"
                onClick={closeMenu}
                className="block px-3 py-2 hover:rounded-md hover:bg-gray-200 cursor-pointer"
              >
                Productos
              </Link>

              <Link
                href="/categories"
                onClick={closeMenu}
                className="block px-3 py-2 hover:rounded-md hover:bg-gray-200 cursor-pointer"
              >
                Categorías
              </Link>

              <Link
                href="/suppliers"
                onClick={closeMenu}
                className="block px-3 py-2 hover:rounded-md hover:bg-gray-200 cursor-pointer"
              >
                Proveedores
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
