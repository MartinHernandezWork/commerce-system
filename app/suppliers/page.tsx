"use client";

import { useEffect, useState } from "react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  async function load() {
    const res = await fetch("/api/suppliers");
    setSuppliers(await res.json());
  }

  async function createSupplier(e: any) {
    e.preventDefault();

    const body = {
      name,
      phone: phone || null,
      email: email || null,
      address: address || null,
    };

    await fetch("/api/suppliers", {
      method: "POST",
      body: JSON.stringify(body),
    });

    // Reset
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");

    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Proveedores</h1>

      {/* FORMULARIO */}
      <form onSubmit={createSupplier} className="space-y-4 border p-4 rounded bg-white shadow-sm">
        <input
          className="border p-2 w-full rounded"
          placeholder="Nombre del proveedor"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="border p-2 w-full rounded"
          placeholder="Teléfono (opcional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="border p-2 w-full rounded"
          placeholder="Email (opcional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full rounded"
          placeholder="Dirección (opcional)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <button className="bg-green-600 text-white px-4 py-2 rounded w-full">
          Crear proveedor
        </button>
      </form>

      {/* LISTADO */}
      <ul className="space-y-3">
        {suppliers.map((s) => (
          <li className="border rounded p-4 bg-white shadow-sm" key={s.id}>
            <div className="font-semibold text-lg">{s.name}</div>

            <div className="text-sm text-gray-700 mt-1">
              {s.phone && <p>📞 {s.phone}</p>}
              {s.email && <p>✉️ {s.email}</p>}
              {s.address && <p>📍 {s.address}</p>}
            </div>

            {!s.phone && !s.email && !s.address && (
              <p className="text-sm text-gray-500">Sin datos adicionales</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
