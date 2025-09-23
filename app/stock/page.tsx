"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  description?: string;
  pricePerKg: number;
  stockGrams: number;
  barcode?: string;
}

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Product>({
    id: 0,
    name: "",
    description: "",
    pricePerKg: 0,
    stockGrams: 0,
    barcode: "",
  });
  const [errorMessage, setErrorMessage] = useState(""); // Mensaje de error

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = async (id: number) => {
    setErrorMessage(""); // Resetear mensaje de error
    const barcode = editForm.barcode
      ? editForm.barcode.startsWith("#")
        ? editForm.barcode
        : `#${editForm.barcode}`
      : "";

    const res = await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, barcode }),
    });

    if (res.ok) {
      setEditId(null);
      fetchProducts();
    } else {
      const data = await res.json();
      setErrorMessage(data.error || "Error al actualizar el producto.");
    }
  };

  const handleDelete = async (id: number) => {
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchProducts();
  };

  // función para mostrar stock en gramos o kilos
  const formatStock = (grams: number) => {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(2)} kg`;
    }
    return `${grams} g`;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manejo de stock</h1>

      {errorMessage && (
        <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">
          {errorMessage}
        </div>
      )}

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">ID 🔢</th>
            <th className="border p-2">Nombre 🖊️</th>
            <th className="border p-2">Descripción 📄</th>
            <th className="border p-2">Precio por kilo 💰</th>
            <th className="border p-2">Stock 📦</th>
            <th className="border p-2">Código de barras 🏷️</th>
            <th className="border p-2">Acciones ⚙️</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.id}</td>
              {editId === p.id ? (
                <>
                  <td className="border p-2">
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="border p-1 w-full"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      className="border p-1 w-full"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={editForm.pricePerKg}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          pricePerKg: Number(e.target.value),
                        })
                      }
                      className="border p-1 w-full"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={editForm.stockGrams}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          stockGrams: Number(e.target.value),
                        })
                      }
                      className="border p-1 w-full"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      value={editForm.barcode}
                      onChange={(e) =>
                        setEditForm({ ...editForm, barcode: e.target.value })
                      }
                      className="border p-1 w-full"
                    />
                  </td>
                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => handleEdit(p.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="border p-2">{p.name}</td>
                  <td className="border p-2">{p.description}</td>
                  <td className="border p-2">
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(p.pricePerKg)}
                  </td>
                  <td className="border p-2">{formatStock(p.stockGrams)}</td>
                  <td className="border p-2">{p.barcode}</td>
                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => {
                        setEditId(p.id);
                        setEditForm(p);
                        setErrorMessage(""); // resetear error al comenzar a editar
                      }}
                      className="bg-yellow-500 text-black px-2 py-1 rounded hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Borrar
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
