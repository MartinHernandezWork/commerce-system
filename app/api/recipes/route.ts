import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 📌 GET: listar recetas
export async function GET() {
    try {
        const recipes = await prisma.recipe.findMany({
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(recipes);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Error cargando recetas" },
            { status: 500 }
        );
    }
}

// 📌 POST: crear receta
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { name, price, items } = body;

        if (!name || price == null || !items?.length) {
            return NextResponse.json(
                { error: "Datos incompletos" },
                { status: 400 }
            );
        }

        const recipe = await prisma.recipe.create({
            data: {
                name,
                price,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                    })),
                },
            },
            include: {
                items: true,
            },
        });

        return NextResponse.json(recipe);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Error creando receta" },
            { status: 500 }
        );
    }
}