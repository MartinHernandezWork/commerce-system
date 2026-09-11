import "./globals.css";
import Navbar from "./navbar";

export const metadata = {
  title: "Sistema Ventas",
  description: "Manage products, stock and sales",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="bg-gray-100 h-full flex flex-col">
        <Navbar />

        <main className="flex-1 min-h-0 max-w-6xl mx-auto w-full p-4 sm:p-6">
          {children}
        </main>
      </body>
    </html>
  );
}