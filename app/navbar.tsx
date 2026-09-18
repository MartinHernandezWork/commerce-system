"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";

type UserData = {
  id: number;
  username: string;
  role: "ADMIN" | "EMPLOYEE";
};

export default function Navbar() {
  const pathname = usePathname();

  const [cashOpen, setCashOpen] = useState<boolean | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [user, setUser] = useState<UserData | null>(null);

  const isLoginPage = pathname === "/login";
  const isAdmin = user?.role === "ADMIN";

  // =========================================================
  // OBTENER USUARIO ACTUAL
  // =========================================================

  useEffect(() => {
    if (isLoginPage) {
      setUser(null);
      return;
    }

    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();

        setUser(data);
      } catch (error) {
        console.error("Error al obtener el usuario:", error);
        setUser(null);
      }
    }

    loadUser();
  }, [isLoginPage]);

  // =========================================================
  // ESTADO DE CAJA
  // =========================================================

  useEffect(() => {
    if (isLoginPage) {
      setCashOpen(null);
      return;
    }

    async function load() {
      try {
        const res = await fetch("/api/cash/status");

        if (!res.ok) {
          throw new Error("No se pudo obtener el estado de caja");
        }

        const data = await res.json();

        setCashOpen(data.isOpen);
      } catch (error) {
        console.error(
          "Error al obtener estado de caja:",
          error
        );
      }
    }

    load();

    const interval = setInterval(load, 3000);

    return () => clearInterval(interval);
  }, [isLoginPage]);

  // =========================================================
  // MENÚS
  // =========================================================

  function toggle(menu: string) {
    setOpenMenu(openMenu === menu ? null : menu);
  }

  function closeMenus() {
    setOpenMenu(null);
    setMobileMenuOpen(false);
  }

  // =========================================================
  // CERRAR SESIÓN
  // =========================================================

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  // =========================================================
  // CLASES DE MENÚ DESKTOP
  // =========================================================

  function menuClass(name: string) {
    return `
      absolute right-0 mt-2 w-48 rounded-xl shadow-lg
      bg-white text-black border border-gray-100
      transition-all duration-200 origin-top
      z-50
      ${
        openMenu === name
          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
      }
    `;
  }

  // =========================================================
  // CLASES DE ICONOS
  // =========================================================

  function iconClass(name: string) {
    return `transition-transform duration-200 ${
      openMenu === name ? "rotate-180" : ""
    }`;
  }

  // =========================================================
  // NO MOSTRAR NAVBAR EN LOGIN
  // =========================================================

  if (isLoginPage) {
    return null;
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <header className="bg-black text-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">

          {/* ================================================= */}
          {/* LOGO + NOMBRE + ESTADO DE CAJA */}
          {/* ================================================= */}

          <div className="flex items-center gap-3 min-w-0">

            <Link
              href="/"
              onClick={closeMenus}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <img
                src="/uploads/donald.jpg"
                alt="Logo de Lo Del Donald"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-contain bg-white"
              />

              <span className="text-lg sm:text-xl font-bold whitespace-nowrap">
                Lo Del Donald
              </span>
            </Link>

            {cashOpen !== null && (
              <span
                className={`hidden sm:inline-flex text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${
                  cashOpen
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {cashOpen
                  ? "Caja abierta"
                  : "Caja cerrada"}
              </span>
            )}
          </div>

          {/* ================================================= */}
          {/* DESKTOP */}
          {/* ================================================= */}

          <div className="hidden md:flex items-center gap-5">

            {/* ================================================= */}
            {/* VENTAS - TODOS */}
            {/* ================================================= */}

            <Link
              href="/pos"
              onClick={closeMenus}
              className="hover:text-gray-300 transition cursor-pointer"
            >
              Ventas
            </Link>

            {/* ================================================= */}
            {/* CAJA - TODOS */}
            {/* ================================================= */}

            <div className="relative">
              <button
                onClick={() => toggle("cash")}
                className="flex items-center gap-1.5 px-2 py-2 hover:text-gray-300 transition cursor-pointer"
              >
                Caja

                <ChevronDown
                  size={16}
                  className={iconClass("cash")}
                />
              </button>

              <div className={menuClass("cash")}>

                <Link
                  href="/cash"
                  onClick={closeMenus}
                  className="block px-4 py-3 hover:bg-gray-100 rounded-t-xl transition cursor-pointer"
                >
                  Abrir caja
                </Link>

                <Link
                  href="/cash/close"
                  onClick={closeMenus}
                  className="block px-4 py-3 hover:bg-gray-100 rounded-b-xl transition cursor-pointer"
                >
                  Cerrar caja
                </Link>

              </div>
            </div>

            {/* ================================================= */}
            {/* HISTORIAL - TODOS */}
            {/* ================================================= */}

            <div className="relative">
              <button
                onClick={() => toggle("history")}
                className="flex items-center gap-1.5 px-2 py-2 hover:text-gray-300 transition cursor-pointer"
              >
                Historial

                <ChevronDown
                  size={16}
                  className={iconClass("history")}
                />
              </button>

              <div className={menuClass("history")}>

                <Link
                  href="/history"
                  onClick={closeMenus}
                  className="block px-4 py-3 hover:bg-gray-100 rounded-t-xl transition cursor-pointer"
                >
                  Historial de venta
                </Link>

                <Link
                  href="/cash/history"
                  onClick={closeMenus}
                  className="block px-4 py-3 hover:bg-gray-100 rounded-b-xl transition cursor-pointer"
                >
                  Historial de caja
                </Link>

              </div>
            </div>

            {/* ================================================= */}
            {/* PRODUCTOS - SOLO ADMIN */}
            {/* ================================================= */}

            {isAdmin && (
              <div className="relative">

                <button
                  onClick={() => toggle("products")}
                  className="flex items-center gap-1.5 px-2 py-2 hover:text-gray-300 transition cursor-pointer"
                >
                  Productos

                  <ChevronDown
                    size={16}
                    className={iconClass("products")}
                  />
                </button>

                <div className={menuClass("products")}>

                  <Link
                    href="/products"
                    onClick={closeMenus}
                    className="block px-4 py-3 hover:bg-gray-100 rounded-t-xl transition cursor-pointer"
                  >
                    Productos
                  </Link>

                  <Link
                    href="/recipes"
                    onClick={closeMenus}
                    className="block px-4 py-3 hover:bg-gray-100 transition cursor-pointer"
                  >
                    Recetas
                  </Link>

                  <Link
                    href="/categories"
                    onClick={closeMenus}
                    className="block px-4 py-3 hover:bg-gray-100 transition cursor-pointer"
                  >
                    Categorías
                  </Link>

                  <Link
                    href="/suppliers"
                    onClick={closeMenus}
                    className="block px-4 py-3 hover:bg-gray-100 rounded-b-xl transition cursor-pointer"
                  >
                    Proveedores
                  </Link>

                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* USUARIO */}
            {/* ================================================= */}

            {user && (
              <div className="flex items-center gap-2 border-l border-gray-700 pl-4">

                <User size={17} />

                <div className="flex flex-col leading-tight">

                  <span className="text-sm font-semibold">
                    {user.username}
                  </span>

                  <span className="text-xs text-gray-400">
                    {user.role === "ADMIN"
                      ? "Administrador"
                      : "Empleado"}
                  </span>

                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* LOGOUT */}
            {/* ================================================= */}

            <button
              onClick={logout}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg font-medium transition cursor-pointer"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>

          </div>

          {/* ================================================= */}
          {/* MOBILE BUTTON */}
          {/* ================================================= */}

          <button
            onClick={() =>
              setMobileMenuOpen(!mobileMenuOpen)
            }
            className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? (
              <X size={26} />
            ) : (
              <Menu size={26} />
            )}
          </button>

        </div>

        {/* ================================================= */}
        {/* MOBILE MENU */}
        {/* ================================================= */}

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-2 border-t border-gray-800 pt-4 space-y-2">

            {/* ================================================= */}
            {/* USUARIO */}
            {/* ================================================= */}

            {user && (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 rounded-lg">

                <User size={20} />

                <div className="flex flex-col">

                  <span className="font-semibold">
                    {user.username}
                  </span>

                  <span className="text-sm text-gray-400">
                    {user.role === "ADMIN"
                      ? "Administrador"
                      : "Empleado"}
                  </span>

                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* ESTADO CAJA */}
            {/* ================================================= */}

            {cashOpen !== null && (
              <div
                className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                  cashOpen
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
              >
                {cashOpen
                  ? "● Caja abierta"
                  : "● Caja cerrada"}
              </div>
            )}

            {/* ================================================= */}
            {/* VENTAS - TODOS */}
            {/* ================================================= */}

            <Link
              href="/pos"
              onClick={closeMenus}
              className="block px-4 py-3 rounded-lg hover:bg-gray-800 transition cursor-pointer"
            >
              Ventas
            </Link>

            {/* ================================================= */}
            {/* CAJA - TODOS */}
            {/* ================================================= */}

            <div>

              <button
                onClick={() => toggle("mobile-cash")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-800 transition cursor-pointer"
              >
                <span>Caja</span>

                <ChevronDown
                  size={18}
                  className={iconClass("mobile-cash")}
                />
              </button>

              {openMenu === "mobile-cash" && (
                <div className="mt-1 ml-3 space-y-1">

                  <Link
                    href="/cash"
                    onClick={closeMenus}
                    className="block px-4 py-2.5 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                  >
                    Abrir caja
                  </Link>

                  <Link
                    href="/cash/close"
                    onClick={closeMenus}
                    className="block px-4 py-2.5 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                  >
                    Cerrar caja
                  </Link>

                </div>
              )}

            </div>

            {/* ================================================= */}
            {/* HISTORIAL - TODOS */}
            {/* ================================================= */}

            <div>

              <button
                onClick={() => toggle("mobile-history")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-800 transition cursor-pointer"
              >
                <span>Historial</span>

                <ChevronDown
                  size={18}
                  className={iconClass("mobile-history")}
                />
              </button>

              {openMenu === "mobile-history" && (
                <div className="mt-1 ml-3 space-y-1">

                  <Link
                    href="/history"
                    onClick={closeMenus}
                    className="block px-4 py-2.5 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                  >
                    Historial de venta
                  </Link>

                  <Link
                    href="/cash/history"
                    onClick={closeMenus}
                    className="block px-4 py-2.5 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                  >
                    Historial de caja
                  </Link>

                </div>
              )}

            </div>

            {/* ================================================= */}
            {/* PRODUCTOS - SOLO ADMIN */}
            {/* ================================================= */}

            {isAdmin && (
              <div>

                <button
                  onClick={() =>
                    toggle("mobile-products")
                  }
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                >
                  <span>Productos</span>

                  <ChevronDown
                    size={18}
                    className={iconClass(
                      "mobile-products"
                    )}
                  />
                </button>

                {openMenu === "mobile-products" && (
                  <div className="mt-1 ml-3 space-y-1">

                    <Link
                      href="/products"
                      onClick={closeMenus}
                      className="block px-4 py-2.5 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                    >
                      Productos
                    </Link>

                    <Link
                      href="/recipes"
                      onClick={closeMenus}
                      className="block px-4 py-2.5 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                    >
                      Recetas
                    </Link>

                    <Link
                      href="/categories"
                      onClick={closeMenus}
                      className="block px-4 py-2.5 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                    >
                      Categorías
                    </Link>

                    <Link
                      href="/suppliers"
                      onClick={closeMenus}
                      className="block px-4 py-2.5 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                    >
                      Proveedores
                    </Link>

                  </div>
                )}

              </div>
            )}

            {/* ================================================= */}
            {/* LOGOUT */}
            {/* ================================================= */}

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-semibold transition mt-3 cursor-pointer"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>

          </div>
        )}

      </nav>
    </header>
  );
}