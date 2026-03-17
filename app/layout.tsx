import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Commerce System",
  description: "Manage products, stock and sales",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-100 min-h-screen flex flex-col">
        {/* Navbar */}
        <header className="bg-black text-white px-6 py-4 shadow">
          <nav className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-xl font-bold hover:opacity-80">
              PUNTO DE VENTA 🛒
            </Link>

            <div className="hidden sm:flex items-center gap-6">
              <Link
                href="/pos"
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Ventas
              </Link>
              <Link href="/products" className="hover:opacity-80">
                Productos
              </Link>
              <Link href="/categories" className="hover:opacity-80">
                Categorías
              </Link>
              <Link href="/suppliers" className="hover:opacity-80">
                Proveedores
              </Link>
              <Link href="/history" className="hover:opacity-80">
                Historial
              </Link>
              <Link href="/cash" className="hover:opacity-80">
                Abrir caja
              </Link>
              <Link href="/cash/close" className="hover:opacity-80">
                Cerrar caja
              </Link>
            </div>
          </nav>
        </header>

        {/* Contenido */}
        <main className="flex-1 max-w-6xl mx-auto w-full p-6">{children}</main>
      </body>
    </html>
  );
}
