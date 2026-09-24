"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Search,
  Plus,
  StickyNote,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  CalendarDays,
} from "lucide-react";

type NoteType =
  | "MERCADERIA_INGRESO"
  | "MERCADERIA_PERDIDA"
  | "CAMBIO"
  | "OTRA";

type Note = {
  id: number;
  authorName: string;
  type: NoteType;
  content: string;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const NOTE_TYPES: {
  value: NoteType;
  label: string;
}[] = [
  {
    value: "MERCADERIA_INGRESO",
    label: "Ingreso de mercadería",
  },
  {
    value: "MERCADERIA_PERDIDA",
    label: "Mercadería perdida",
  },
  {
    value: "CAMBIO",
    label: "Cambio",
  },
  {
    value: "OTRA",
    label: "Otra",
  },
];

function getTypeLabel(type: NoteType) {
  return (
    NOTE_TYPES.find(
      (item) => item.value === type,
    )?.label ?? type
  );
}

function getTypeClass(type: NoteType) {
  switch (type) {
    case "MERCADERIA_INGRESO":
      return "bg-green-100 text-green-700";

    case "MERCADERIA_PERDIDA":
      return "bg-red-100 text-red-700";

    case "CAMBIO":
      return "bg-blue-100 text-blue-700";

    case "OTRA":
      return "bg-yellow-100 text-yellow-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotesPage() {
  // --------------------------------
  // NOTAS
  // --------------------------------

  const [notes, setNotes] = useState<Note[]>([]);

  // --------------------------------
  // PAGINACIÓN
  // --------------------------------

  const [page, setPage] = useState(1);

  const [pagination, setPagination] =
    useState<Pagination>({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    });

  // --------------------------------
  // BÚSQUEDA / FILTROS
  // --------------------------------

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] =
    useState<"ALL" | NoteType>("ALL");

  // --------------------------------
  // ESTADOS
  // --------------------------------

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // --------------------------------
  // MODAL
  // --------------------------------

  const [showModal, setShowModal] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [authorName, setAuthorName] =
    useState("");

  const [type, setType] =
    useState<NoteType>("MERCADERIA_INGRESO");

  const [content, setContent] = useState("");

  // --------------------------------
  // CARGAR NOTAS
  // --------------------------------

  useEffect(() => {
    const controller = new AbortController();

    const delay = search.trim() ? 350 : 0;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("limit", "20");

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (typeFilter !== "ALL") {
          params.set("type", typeFilter);
        }

        const res = await fetch(
          `/api/notes?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error ??
              "Error cargando notas.",
          );
        }

        // --------------------------------
        // IMPORTANTE
        // La API devuelve:
        //
        // {
        //   notes: [],
        //   pagination: {}
        // }
        //
        // No hacemos .filter() acá.
        // --------------------------------

        setNotes(
          Array.isArray(data.notes)
            ? data.notes
            : [],
        );

        if (data.pagination) {
          setPagination({
            page:
              Number(data.pagination.page) ||
              page,

            limit:
              Number(data.pagination.limit) ||
              20,

            total:
              Number(data.pagination.total) ||
              0,

            totalPages:
              Number(
                data.pagination.totalPages,
              ) || 1,
          });
        } else {
          setPagination({
            page,
            limit: 20,
            total: 0,
            totalPages: 1,
          });
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Error cargando notas:",
          err,
        );

        setNotes([]);

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las notas.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, delay);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [page, search, typeFilter]);

  // --------------------------------
  // CAMBIAR BÚSQUEDA
  // --------------------------------

  function handleSearchChange(value: string) {
    setSearch(value);

    // Cada nueva búsqueda empieza desde página 1.
    setPage(1);
  }

  // --------------------------------
  // CAMBIAR FILTRO
  // --------------------------------

  function handleTypeChange(
    value: "ALL" | NoteType,
  ) {
    setTypeFilter(value);

    // Cada nuevo filtro empieza desde página 1.
    setPage(1);
  }

  // --------------------------------
  // ABRIR MODAL
  // --------------------------------

  function openModal() {
    setError("");
    setSuccess("");

    setAuthorName("");
    setType("MERCADERIA_INGRESO");
    setContent("");

    setShowModal(true);
  }

  // --------------------------------
  // CERRAR MODAL
  // --------------------------------

  function closeModal() {
    if (saving) {
      return;
    }

    setShowModal(false);
    setError("");
  }

  // --------------------------------
  // CREAR NOTA
  // --------------------------------

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!authorName.trim()) {
      setError(
        "Ingresá el nombre de quien deja la nota.",
      );
      return;
    }

    if (!content.trim()) {
      setError(
        "Ingresá una descripción.",
      );
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorName: authorName.trim(),
          type,
          content: content.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error ??
            "No se pudo crear la nota.",
        );
      }

      // --------------------------------
      // LIMPIAR FORMULARIO
      // --------------------------------

      setAuthorName("");
      setType("MERCADERIA_INGRESO");
      setContent("");

      setShowModal(false);

      setSuccess(
        "Nota creada correctamente.",
      );

      // --------------------------------
      // VOLVER A PRIMERA PÁGINA
      // --------------------------------

      setPage(1);
    } catch (err) {
      console.error(
        "Error creando nota:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear la nota.",
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------
  // PAGINACIÓN
  // --------------------------------

  function goToPreviousPage() {
    if (page <= 1) {
      return;
    }

    setPage((current) => current - 1);
  }

  function goToNextPage() {
    if (page >= pagination.totalPages) {
      return;
    }

    setPage((current) => current + 1);
  }

  // --------------------------------
  // RENDER
  // --------------------------------

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* -------------------------------- */}
        {/* HEADER */}
        {/* -------------------------------- */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <StickyNote size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Notas
                </h1>

                <p className="text-sm text-gray-500">
                  Registrá ingresos, pérdidas,
                  cambios y otras novedades.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            <Plus size={20} />
            Nueva nota
          </button>
        </div>

        {/* -------------------------------- */}
        {/* SUCCESS */}
        {/* -------------------------------- */}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* -------------------------------- */}
        {/* FILTROS */}
        {/* -------------------------------- */}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_260px]">
            {/* BUSCADOR */}

            <div className="relative">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  handleSearchChange(
                    e.target.value,
                  )
                }
                placeholder="Buscar por autor o contenido..."
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* TIPO */}

            <select
              value={typeFilter}
              onChange={(e) =>
                handleTypeChange(
                  e.target.value as
                    | "ALL"
                    | NoteType,
                )
              }
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              <option value="ALL">
                Todos los tipos
              </option>

              {NOTE_TYPES.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* TOTAL */}

          <div className="mt-3 text-sm text-gray-500">
            {loading
              ? "Cargando..."
              : `${pagination.total} ${
                  pagination.total === 1
                    ? "nota"
                    : "notas"
                }`}
          </div>
        </div>

        {/* -------------------------------- */}
        {/* ERROR */}
        {/* -------------------------------- */}

        {error && !showModal && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {error}
          </div>
        )}

        {/* -------------------------------- */}
        {/* NOTAS */}
        {/* -------------------------------- */}

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
            Cargando notas...
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <StickyNote
              size={42}
              className="mx-auto mb-3 text-gray-300"
            />

            <h2 className="text-lg font-semibold text-gray-700">
              No hay notas
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {search ||
              typeFilter !== "ALL"
                ? "No encontramos notas con esos filtros."
                : "Todavía no se registraron notas."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                {/* CABECERA */}

                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getTypeClass(
                          note.type,
                        )}`}
                      >
                        {getTypeLabel(
                          note.type,
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <User size={15} />
                        {note.authorName}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <CalendarDays
                          size={15}
                        />
                        {formatDate(
                          note.createdAt,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CONTENIDO */}

                <div className="mt-4 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                  {note.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* -------------------------------- */}
        {/* PAGINACIÓN */}
        {/* -------------------------------- */}

        {!loading &&
          pagination.totalPages > 1 && (
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={page <= 1}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={18} />
                Anterior
              </button>

              <div className="text-center text-sm text-gray-600">
                Página{" "}
                <span className="font-semibold text-gray-900">
                  {page}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-gray-900">
                  {pagination.totalPages}
                </span>
              </div>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={
                  page >= pagination.totalPages
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
                <ChevronRight size={18} />
              </button>
            </div>
          )}
      </div>

      {/* -------------------------------- */}
      {/* MODAL NUEVA NOTA */}
      {/* -------------------------------- */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Nueva nota
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Registrá una novedad del negocio.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-40"
              >
                <X size={21} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >
              {/* ERROR */}

              {error && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  {error}
                </div>
              )}

              {/* AUTOR */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Nombre de quien deja la nota
                </label>

                <input
                  type="text"
                  value={authorName}
                  onChange={(e) =>
                    setAuthorName(
                      e.target.value,
                    )
                  }
                  maxLength={100}
                  placeholder="Ej: Juan"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* TIPO */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tipo de nota
                </label>

                <select
                  value={type}
                  onChange={(e) =>
                    setType(
                      e.target.value as NoteType,
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                >
                  {NOTE_TYPES.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* CONTENIDO */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Descripción
                </label>

                <textarea
                  value={content}
                  onChange={(e) =>
                    setContent(
                      e.target.value,
                    )
                  }
                  maxLength={2000}
                  rows={7}
                  placeholder="Escribí los detalles de la nota..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />

                <div className="mt-1 text-right text-xs text-gray-400">
                  {content.length}/2000
                </div>
              </div>

              {/* BOTONES */}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Guardando..."
                    : "Guardar nota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
