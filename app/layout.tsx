// app/layout.tsx
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
    <html lang="en">
      <body className="bg-gray-100">
        {/* Navbar */}
        <nav className="bg-green-900 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold hover:underline">
              CON PASAS DE UVA
            </Link>
            <div className="space-x-4">
              <Link href="/products" className="hover:underline">
                Productos
              </Link>
              <Link href="/stock" className="hover:underline">
                Stock
              </Link>
              <Link href="/sales" className="hover:underline">
                Ventas
              </Link>
            </div>
          </div>
        </nav>

        {/* Contenido de cada página */}
        <main className="container mx-auto p-8">{children}</main>
      </body>
    </html>
  );
}
