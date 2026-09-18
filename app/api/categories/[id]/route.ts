import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/auth";

// GET → obtener categoría por ID
// ADMIN + EMPLOYEE
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();

    const { id } = await params;

    const categoryId = Number(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 },
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("GET /categories/[id] error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Error al obtener la categoría" },
      { status: 500 },
    );
  }
}

// PUT → editar categoría
// ADMIN solamente
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const categoryId = Number(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 },
      );
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 },
      );
    }

    const category = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("PUT /categories/[id] error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "No tenés permisos para editar categorías" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar" },
      { status: 500 },
    );
  }
}

// DELETE → eliminar categoría
// ADMIN solamente
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const categoryId = Number(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 },
      );
    }

    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    return NextResponse.json({
      message: "Categoría eliminada",
    });
  } catch (error) {
    console.error("DELETE /categories/[id] error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "No tenés permisos para eliminar categorías" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Error al eliminar" },
      { status: 500 },
    );
  }
}