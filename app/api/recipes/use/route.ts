import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { recipeId, quantity, groupId } = body;

        if (!recipeId || !quantity || !groupId) {
            return NextResponse.json(
                { error: "Datos incompletos" },
                { status: 400 }
            );
        }

        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
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
                { status: 404 }
            );
        }

        // validar stock
        for (const item of recipe.items) {
            const required = item.quantity * quantity;

            if (item.product.stock < required) {
                return NextResponse.json(
                    {
                        error: `Stock insuficiente de ${item.product.name}`,
                    },
                    { status: 400 }
                );
            }
        }

        // descontar stock
        await prisma.$transaction(async (tx) => {
            // 1. descontar stock de ingredientes
            for (const item of recipe.items) {
                const required = item.quantity * quantity;

                await tx.product.update({
                    where: { id: item.productId },
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

            // 2. registrar la venta de la receta (UNA SOLA VEZ)
            if (groupId) {
                await tx.recipeSale.create({
                    data: {
                        recipeId,
                        groupId,
                        quantity,
                    },
                });
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Error procesando receta" },
            { status: 500 }
        );
    }
}