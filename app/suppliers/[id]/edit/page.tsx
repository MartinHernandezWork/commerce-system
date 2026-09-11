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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
        email,
        address,
      }),
    });

    if (res.ok) {
      router.push("/suppliers");
    } else {
      alert("Error al guardar los cambios");
    }
  }

  if (!supplier) {
    return (
      <div className="w-full min-h-full px-4 py-8 sm:px-6 sm:py-12 flex justify-center">
        <div className="w-full max-w-xl">
          <p className="text-gray-500">Cargando proveedor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full px-4 py-6 sm:px-6 sm:py-8 md:py-10 flex justify-center">
      <div className="w-full max-w-xl space-y-5 sm:space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">
            Editar proveedor
          </h1>

          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Modificá la información del proveedor
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4"
        >
          {/* NOMBRE */}
          <div className="space-y-2">
            <label className="block font-medium text-slate-700">Nombre</label>

            <input
              className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Nombre del proveedor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* TELÉFONO */}
          <div className="space-y-2">
            <label className="block font-medium text-slate-700">Teléfono</label>

            <input
              type="tel"
              className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* EMAIL */}
          <div className="space-y-2">
            <label className="block font-medium text-slate-700">Email</label>

            <input
              type="email"
              className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* DIRECCIÓN */}
          <div className="space-y-2">
            <label className="block font-medium text-slate-700">
              Dirección
            </label>

            <input
              className="border border-slate-300 p-3 rounded-xl w-full outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Dirección"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* BOTÓN */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition cursor-pointer"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
