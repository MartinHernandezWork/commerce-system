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
  ShoppingCart,
  ClipboardList,
  Wallet,
  History,
  Package,
  Circle,
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
      } catch {
        setUser(null);
      }
    }

    loadUser();
  }, [isLoginPage]);

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
        setCashOpen(Boolean(data.isOpen));
      } catch {
        setCashOpen(null);
      }
    }

    load();

    const interval = setInterval(load, 3000);

    return () => clearInterval(interval);
  }, [isLoginPage]);

  function toggle(menu: string) {
    setOpenMenu(openMenu === menu ? null : menu);
  }

  function closeMenus() {
    setOpenMenu(null);
    setMobileMenuOpen(false);
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  }

  function menuClass(name: string) {
    return `
      absolute right-0 top-full mt-2 w-56 rounded-2xl
      bg-white text-gray-800 border border-gray-200
      shadow-xl shadow-gray-200/50
      transition-all duration-200 origin-top
      z-50 overflow-hidden
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

  function navLink(path: string) {
    return pathname === path
      ? "bg-green-50 text-green-700"
      : "text-gray-600 hover:bg-gray-50 hover:text-green-700";
  }

  if (isLoginPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          <div className="flex items-center min-w-0">
            <Link
              href="/"
              onClick={closeMenus}
              className="flex items-center gap-3 shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-950 p-1.5 shadow-sm">
                <img
                  src="/uploads/donald.jpg"
                  alt="Logo de Lo Del Donald"
                  className="w-full h-full rounded-lg object-contain"
                />
              </div>

              <div className="hidden sm:block leading-tight">
                <div className="text-base font-black tracking-tight text-gray-950">
                  Lo Del <span className="text-green-600">Donald</span>
                </div>
              </div>
            </Link>

            {cashOpen !== null && (
              <div className="hidden lg:flex items-center ml-5 pl-5 border-l border-gray-200">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    cashOpen
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <Circle size={8} fill="currentColor" strokeWidth={0} />
                  {cashOpen ? "Caja abierta" : "Caja cerrada"}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/pos"
              onClick={closeMenus}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${navLink(
                "/pos",
              )}`}
            >
              <ShoppingCart size={17} />
              Ventas
            </Link>

            <Link
              href="/orders"
              onClick={closeMenus}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${navLink(
                "/orders",
              )}`}
            >
              <ClipboardList size={17} />
              Órdenes
            </Link>

            <div className="relative">
              <button
                onClick={() => toggle("cash")}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  openMenu === "cash"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Wallet size={17} />
                Caja
                <ChevronDown size={15} className={iconClass("cash")} />
              </button>

              <div className={menuClass("cash")}>
                <Link
                  href="/cash"
                  onClick={closeMenus}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-green-50 hover:text-green-700 transition"
                >
                  <Wallet size={17} />
                  <div>
                    <div className="font-semibold text-sm">Abrir caja</div>
                    <div className="text-xs text-gray-400">Iniciar jornada</div>
                  </div>
                </Link>

                <Link
                  href="/cash/close"
                  onClick={closeMenus}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-green-50 hover:text-green-700 transition"
                >
                  <Wallet size={17} />
                  <div>
                    <div className="font-semibold text-sm">Cerrar caja</div>
                    <div className="text-xs text-gray-400">
                      Finalizar jornada
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => toggle("history")}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  openMenu === "history"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <History size={17} />
                Historial
                <ChevronDown size={15} className={iconClass("history")} />
              </button>

              <div className={menuClass("history")}>
                <Link
                  href="/history"
                  onClick={closeMenus}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-green-50 hover:text-green-700 transition"
                >
                  <History size={17} />
                  <div>
                    <div className="font-semibold text-sm">
                      Historial de ventas
                    </div>
                    <div className="text-xs text-gray-400">
                      Consultar operaciones
                    </div>
                  </div>
                </Link>

                <Link
                  href="/cash/history"
                  onClick={closeMenus}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-green-50 hover:text-green-700 transition"
                >
                  <Wallet size={17} />
                  <div>
                    <div className="font-semibold text-sm">
                      Historial de caja
                    </div>
                    <div className="text-xs text-gray-400">
                      Movimientos de caja
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => toggle("products")}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    openMenu === "products"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Package size={17} />
                  Administración
                  <ChevronDown size={15} className={iconClass("products")} />
                </button>

                <div className={menuClass("products")}>
                  <Link
                    href="/products"
                    onClick={closeMenus}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-green-50 hover:text-green-700 transition"
                  >
                    <Package size={17} />
                    <div>
                      <div className="font-semibold text-sm">Productos</div>
                      <div className="text-xs text-gray-400">
                        Stock y precios
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/recipes"
                    onClick={closeMenus}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-green-50 hover:text-green-700 transition"
                  >
                    <Package size={17} />
                    <div>
                      <div className="font-semibold text-sm">Recetas</div>
                      <div className="text-xs text-gray-400">Preparaciones</div>
                    </div>
                  </Link>

                  <Link
                    href="/categories"
                    onClick={closeMenus}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-green-50 hover:text-green-700 transition"
                  >
                    <Package size={17} />
                    <div>
                      <div className="font-semibold text-sm">Categorías</div>
                      <div className="text-xs text-gray-400">Organización</div>
                    </div>
                  </Link>

                  <Link
                    href="/suppliers"
                    onClick={closeMenus}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-green-50 hover:text-green-700 transition"
                  >
                    <Package size={17} />
                    <div>
                      <div className="font-semibold text-sm">Proveedores</div>
                      <div className="text-xs text-gray-400">
                        Contactos y compras
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
                <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                  <User size={17} />
                </div>

                <div className="leading-tight">
                  <div className="text-sm font-bold text-gray-900">
                    {user.username}
                  </div>

                  <div className="text-[11px] font-medium text-gray-400">
                    {user.role === "ADMIN" ? "Administrador" : "Empleado"}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={logout}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
            >
              <LogOut size={17} />
              <span className="hidden lg:inline">Salir</span>
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-2">
            {user && (
              <div className="flex items-center gap-3 p-3 mb-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                  <User size={18} />
                </div>

                <div className="leading-tight">
                  <div className="font-bold text-gray-900">{user.username}</div>

                  <div className="text-xs text-gray-400">
                    {user.role === "ADMIN" ? "Administrador" : "Empleado"}
                  </div>
                </div>
              </div>
            )}

            {cashOpen !== null && (
              <div
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${
                  cashOpen
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                <Circle size={8} fill="currentColor" strokeWidth={0} />
                {cashOpen ? "Caja abierta" : "Caja cerrada"}
              </div>
            )}

            <Link
              href="/pos"
              onClick={closeMenus}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${navLink(
                "/pos",
              )}`}
            >
              <ShoppingCart size={18} />
              Ventas
            </Link>

            <Link
              href="/orders"
              onClick={closeMenus}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${navLink(
                "/orders",
              )}`}
            >
              <ClipboardList size={18} />
              Órdenes
            </Link>

            <div>
              <button
                onClick={() => toggle("mobile-cash")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                <span className="flex items-center gap-3">
                  <Wallet size={18} />
                  Caja
                </span>

                <ChevronDown size={18} className={iconClass("mobile-cash")} />
              </button>

              {openMenu === "mobile-cash" && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    href="/cash"
                    onClick={closeMenus}
                    className="block px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-green-50 hover:text-green-700"
                  >
                    Abrir caja
                  </Link>

                  <Link
                    href="/cash/close"
                    onClick={closeMenus}
                    className="block px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-green-50 hover:text-green-700"
                  >
                    Cerrar caja
                  </Link>
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => toggle("mobile-history")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                <span className="flex items-center gap-3">
                  <History size={18} />
                  Historial
                </span>

                <ChevronDown
                  size={18}
                  className={iconClass("mobile-history")}
                />
              </button>

              {openMenu === "mobile-history" && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    href="/history"
                    onClick={closeMenus}
                    className="block px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-green-50 hover:text-green-700"
                  >
                    Historial de ventas
                  </Link>

                  <Link
                    href="/cash/history"
                    onClick={closeMenus}
                    className="block px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-green-50 hover:text-green-700"
                  >
                    Historial de caja
                  </Link>
                </div>
              )}
            </div>

            {isAdmin && (
              <div>
                <button
                  onClick={() => toggle("mobile-products")}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  <span className="flex items-center gap-3">
                    <Package size={18} />
                    Administración
                  </span>

                  <ChevronDown
                    size={18}
                    className={iconClass("mobile-products")}
                  />
                </button>

                {openMenu === "mobile-products" && (
                  <div className="ml-4 mt-1 space-y-1">
                    <Link
                      href="/products"
                      onClick={closeMenus}
                      className="block px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-green-50 hover:text-green-700"
                    >
                      Productos
                    </Link>

                    <Link
                      href="/recipes"
                      onClick={closeMenus}
                      className="block px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-green-50 hover:text-green-700"
                    >
                      Recetas
                    </Link>

                    <Link
                      href="/categories"
                      onClick={closeMenus}
                      className="block px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-green-50 hover:text-green-700"
                    >
                      Categorías
                    </Link>

                    <Link
                      href="/suppliers"
                      onClick={closeMenus}
                      className="block px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-green-50 hover:text-green-700"
                    >
                      Proveedores
                    </Link>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition mt-3"
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
