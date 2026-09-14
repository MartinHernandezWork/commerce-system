import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET → obtener categoría por ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener la categoría" },
      { status: 500 }
    );
  }
}

// PUT → editar categoría
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: { name },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar" },
      { status: 500 }
    );
  }
}

// DELETE → eliminar categoría
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.category.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Categoría eliminada" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al eliminar" },
      { status: 500 }
    );
  }
}