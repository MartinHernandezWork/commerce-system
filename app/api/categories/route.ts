import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/auth";

// GET → listar categorías
// ADMIN + EMPLOYEE
export async function GET() {
  try {
    await requireAuth();

    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /categories error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 },
    );
  }
}

// POST → crear categoría
// ADMIN solamente
export async function POST(req: Request) {
  try {
    await requireAdmin();

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 },
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("POST /categories error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "No tenés permisos para crear categorías" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 },
    );
  }
}