"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditSupplierPage() {
  const router = useRouter();
  const { id } = useParams();
  const [supplier, setSupplier] = useState<any>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/suppliers/${id}`);
      const data = await res.json();
      setSupplier(data);
      setName(data.name);
      setPhone(data.phone ?? "");
      setEmail(data.email ?? "");
      setAddress(data.address ?? "");
    }
    load();
  }, [id]);

  async function handleSubmit(e: any) {
    e.preventDefault();

    const res = await fetch(`/api/suppliers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, address }),
    });

    if (res.ok) {
      router.push("/suppliers");
    } else {
      alert("Error al guardar los cambios");
    }
  }

  if (!supplier) return <p className="p-6">Cargando proveedor...</p>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Editar Proveedor</h1>

      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded bg-white shadow-sm">
        <input
          className="border p-2 w-full rounded"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Dirección"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
