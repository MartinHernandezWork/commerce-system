"use client";

export default function HomePage() {
  return (
    <main className="min-h-full flex items-center justify-center px-5 sm:px-6 text-[#171717]">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-8 sm:gap-10 md:gap-16 text-center md:text-left">
        {/* Logo */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full blur-3xl opacity-25" />

          <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full bg-black p-3 sm:p-4 shadow-xl">
            <img
              src="/uploads/donald.jpg"
              alt="Logo de Lo Del Donald"
              className="w-full h-full rounded-full object-contain p-2 sm:p-3"
            />
          </div>
        </div>

        {/* Texto */}
        <div className="max-w-xl">
          <span className="inline-block mb-3 sm:mb-4 rounded-full bg-[#f5c400]/20 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-[#8a6900]">
            🌭 Panchos hechos para disfrutar
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">
            Lo Del<span className="text-[#e6392f]">Donald</span>
          </h1>

          <p className="mt-4 sm:mt-5 text-base sm:text-lg md:text-xl leading-relaxed text-gray-600">
            Panchos ricos, simples y bien cargados.
            <br />
            Vení a disfrutar algo diferente.
          </p>
        </div>
      </div>
    </main>
  );
}
