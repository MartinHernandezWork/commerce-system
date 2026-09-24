import "./globals.css";
import Navbar from "./navbar";

export const metadata = {
  title: "Lo Del Donald",
  description: "Sistema de gestión de Lo Del Donald",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased">
        <div className="min-h-screen flex flex-col">
          <Navbar />

          <main className="flex-1 min-h-0 w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}