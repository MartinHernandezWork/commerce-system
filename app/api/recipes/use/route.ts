import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await requireAuth();

    const body = await req.json();

    const { recipeId, quantity, groupId } = body;

    if (!recipeId || !quantity || !groupId) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 },
      );
    }

    const recipe = await prisma.recipe.findFirst({
      where: {
        id: Number(recipeId),
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

    // Validar stock
    for (const item of recipe.items) {
      const required =
        item.quantity * Number(quantity);

      if (item.product.stock < required) {
        return NextResponse.json(
          {
            error: `Stock insuficiente de ${item.product.name}`,
          },
          { status: 400 },
        );
      }
    }

    // Descontar stock y registrar la venta
    await prisma.$transaction(async (tx) => {
      // 1. Descontar stock de ingredientes
      for (const item of recipe.items) {
        const required =
          item.quantity * Number(quantity);

        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: required,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: -required,
            type: "SALE",
            note: `Venta receta ${recipe.name}`,
          },
        });
      }

      // 2. Registrar la venta de la receta
      if (groupId) {
        await tx.recipeSale.create({
          data: {
            recipeId: Number(recipeId),
            groupId: Number(groupId),
            quantity: Number(quantity),

            // Snapshot histórico
            recipeName: recipe.name,
            unitPrice: recipe.price,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("POST /recipes/use error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Error procesando receta" },
      { status: 500 },
    );
  }
}