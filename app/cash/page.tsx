"use client";

import { useState } from "react";

export default function CashPage() {

  const [initial, setInitial] = useState(0);

  async function openCash() {

    const res = await fetch("/api/cash/open", {
      method: "POST",
      body: JSON.stringify({ initial }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Caja abierta ✅");
  }

  return (
    <div className="p-6 max-w-md">

      <h1 className="text-2xl mb-4">
        Abrir caja
      </h1>

      <input
        type="number"
        value={initial}
        onChange={(e) => setInitial(Number(e.target.value))}
        className="border p-2 w-full"
        placeholder="Monto inicial"
      />

      <button
        onClick={openCash}
        className="bg-green-600 text-white px-4 py-2 mt-4 rounded"
      >
        Abrir
      </button>

    </div>
  );
}