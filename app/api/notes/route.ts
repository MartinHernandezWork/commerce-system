import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

const VALID_TYPES = [
  "MERCADERIA_INGRESO",
  "MERCADERIA_PERDIDA",
  "CAMBIO",
  "OTRA",
] as const;

type NoteType = (typeof VALID_TYPES)[number];

function isNoteType(value: unknown): value is NoteType {
  return (
    typeof value === "string" &&
    VALID_TYPES.includes(value as NoteType)
  );
}

// GET /api/notes
//
// Parámetros:
// ?page=1
// ?limit=20
// ?search=juan
// ?type=MERCADERIA_INGRESO
//
// ADMIN + EMPLOYEE
export async function GET(req: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(req.url);

    // --------------------------------
    // PAGINACIÓN
    // --------------------------------

    const rawPage = Number.parseInt(
      searchParams.get("page") ?? "1",
      10,
    );

    const rawLimit = Number.parseInt(
      searchParams.get("limit") ?? "20",
      10,
    );

    const page =
      Number.isFinite(rawPage) && rawPage >= 1
        ? rawPage
        : 1;

    // Nunca permitimos más de 50 notas por consulta.
    const limit =
      Number.isFinite(rawLimit) && rawLimit >= 1
        ? Math.min(rawLimit, 50)
        : 20;

    // --------------------------------
    // BÚSQUEDA
    // --------------------------------

    const search = (
      searchParams.get("search") ?? ""
    ).trim();

    // --------------------------------
    // FILTRO POR TIPO
    // --------------------------------

    const typeParam =
      searchParams.get("type") ?? "ALL";

    const type =
      typeParam !== "ALL" &&
      isNoteType(typeParam)
        ? typeParam
        : null;

    // --------------------------------
    // WHERE
    // --------------------------------

    const where = {
      ...(search
        ? {
            OR: [
              {
                authorName: {
                  contains: search,
                },
              },
              {
                content: {
                  contains: search,
                },
              },
            ],
          }
        : {}),

      ...(type
        ? {
            type,
          }
        : {}),
    };

    // --------------------------------
    // CONSULTA
    // --------------------------------

    const [notes, total] =
      await prisma.$transaction([
        prisma.note.findMany({
          where,
          orderBy: {
            createdAt: "desc",
          },
          skip: (page - 1) * limit,
          take: limit,
        }),

        prisma.note.count({
          where,
        }),
      ]);

    // --------------------------------
    // PAGINACIÓN
    // --------------------------------

    const totalPages = Math.max(
      1,
      Math.ceil(total / limit),
    );

    return NextResponse.json({
      notes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/notes error:",
      error,
    );

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error: "No estás autenticado",
        },
        {
          status: 401,
        },
      );
    }

    return NextResponse.json(
      {
        error: "Error cargando notas",
      },
      {
        status: 500,
      },
    );
  }
}

// POST /api/notes
//
// ADMIN + EMPLOYEE
export async function POST(req: Request) {
  try {
    await requireAuth();

    const body = await req.json();

    const {
      authorName,
      type,
      content,
    } = body;

    // --------------------------------
    // AUTOR
    // --------------------------------

    if (
      typeof authorName !== "string" ||
      !authorName.trim()
    ) {
      return NextResponse.json(
        {
          error: "El nombre es obligatorio.",
        },
        {
          status: 400,
        },
      );
    }

    const cleanAuthorName =
      authorName.trim();

    if (cleanAuthorName.length > 100) {
      return NextResponse.json(
        {
          error:
            "El nombre no puede superar los 100 caracteres.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------
    // TIPO
    // --------------------------------

    if (!isNoteType(type)) {
      return NextResponse.json(
        {
          error:
            "El tipo de nota no es válido.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------
    // CONTENIDO
    // --------------------------------

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "La descripción de la nota es obligatoria.",
        },
        {
          status: 400,
        },
      );
    }

    const cleanContent =
      content.trim();

    if (cleanContent.length > 2000) {
      return NextResponse.json(
        {
          error:
            "La nota no puede superar los 2000 caracteres.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------
    // CREAR NOTA
    // --------------------------------

    const note =
      await prisma.note.create({
        data: {
          authorName: cleanAuthorName,
          type,
          content: cleanContent,
        },
      });

    return NextResponse.json(
      note,
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/notes error:",
      error,
    );

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error: "No estás autenticado",
        },
        {
          status: 401,
        },
      );
    }

    return NextResponse.json(
      {
        error: "Error creando nota",
      },
      {
        status: 500,
      },
    );
  }
}