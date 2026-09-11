import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET receta
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const recipe = await prisma.recipe.findFirst({
      where: {
        id: Number(id),
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
    console.error(error);

    return NextResponse.json(
      { error: "Error obteniendo receta" },
      { status: 500 },
    );
  }
}

// PUT actualizar receta
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const { name, price, imageUrl, items } = body;
    const recipeId = Number(id);

    // verificar que la receta exista y esté activa
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

    // actualizar receta base
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

    // borrar ingredientes anteriores
    await prisma.recipeItem.deleteMany({
      where: {
        recipeId,
      },
    });

    // crear nuevos ingredientes
    await prisma.recipeItem.createMany({
      data: items.map((item: any) => ({
        recipeId,
        productId: item.productId,
        quantity: item.quantity,
      })),
    });

    return NextResponse.json({
      success: true,
      recipe,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error actualizando receta" },
      { status: 500 },
    );
  }
}

// DELETE receta → Soft Delete
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const recipe = await prisma.recipe.findFirst({
      where: {
        id: Number(id),
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
        id: Number(id),
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
    console.error(error);

    return NextResponse.json(
      { error: "Error eliminando receta" },
      { status: 500 },
    );
  }
}
