import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 📌 GET una receta
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const recipe = await prisma.recipe.findUnique({
            where: { id: Number(params.id) },
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

// 📌 DELETE receta
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.recipe.delete({
            where: { id: Number(params.id) },
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