import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET receta
// ADMIN + EMPLOYEE
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();

    const { id } = await context.params;

    const recipeId = Number(id);

    if (isNaN(recipeId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 },
      );
    }

    const recipe = await prisma.recipe.findFirst({
      where: {
        id: recipeId,
        deletedAt: null,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: "Receta no encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("GET /recipes/[id] error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Error obteniendo receta" },
      { status: 500 },
    );
  }
}

// PUT actualizar receta
// ADMIN solamente
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const body = await req.json();

    const { name, price, imageUrl, items } = body;

    const recipeId = Number(id);

    if (isNaN(recipeId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 },
      );
    }

    // Verificar que la receta exista y esté activa
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        id: recipeId,
        deletedAt: null,
      },
    });

    if (!existingRecipe) {
      return NextResponse.json(
        { error: "Receta no encontrada" },
        { status: 404 },
      );
    }

    // Actualizar receta base
    const recipe = await prisma.recipe.update({
      where: {
        id: recipeId,
      },
      data: {
        name,
        price,
        imageUrl,
      },
    });

    // Borrar ingredientes anteriores
    await prisma.recipeItem.deleteMany({
      where: {
        recipeId,
      },
    });

    // Crear nuevos ingredientes
    await prisma.recipeItem.createMany({
      data: items.map((item: any) => ({
        recipeId,
        productId: Number(item.productId),
        quantity: Number(item.quantity),
      })),
    });

    return NextResponse.json({
      success: true,
      recipe,
    });
  } catch (error) {
    console.error("PUT /recipes/[id] error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "No tenés permisos para actualizar recetas" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Error actualizando receta" },
      { status: 500 },
    );
  }
}

// DELETE receta → Soft Delete
// ADMIN solamente
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    const recipeId = Number(id);

    if (isNaN(recipeId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 },
      );
    }

    const recipe = await prisma.recipe.findFirst({
      where: {
        id: recipeId,
        deletedAt: null,
      },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: "Receta no encontrada" },
        { status: 404 },
      );
    }

    const deleted = await prisma.recipe.update({
      where: {
        id: recipeId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      recipe: deleted,
    });
  } catch (error) {
    console.error("DELETE /recipes/[id] error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "No tenés permisos para eliminar recetas" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Error eliminando receta" },
      { status: 500 },
    );
  }
}