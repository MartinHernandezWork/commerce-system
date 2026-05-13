import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET receta
export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const recipe = await prisma.recipe.findUnique({
            where: { id: Number(id) },
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

        return NextResponse.json(recipe);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Error obteniendo receta" },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request, context: any) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        const { name, price, items } = body;

        // actualizar receta base
        const recipe = await prisma.recipe.update({
            where: { id: Number(id) },
            data: {
                name,
                price,
            },
        });

        // borrar ingredientes anteriores
        await prisma.recipeItem.deleteMany({
            where: {
                recipeId: Number(id),
            },
        });

        // crear nuevos ingredientes
        await prisma.recipeItem.createMany({
            data: items.map((item: any) => ({
                recipeId: Number(id),
                productId: item.productId,
                quantity: item.quantity,
            })),
        });

        return NextResponse.json({ success: true, recipe });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Error actualizando receta" },
            { status: 500 }
        );
    }
}

// DELETE receta
export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        await prisma.recipe.delete({
            where: { id: Number(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Error eliminando receta" },
            { status: 500 }
        );
    }
}