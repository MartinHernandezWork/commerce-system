import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 📌 GET: listar recetas
export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      where: {
        deletedAt: null,
      },
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
      { status: 500 },
    );
  }
}

// 📌 POST: crear receta
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, price, items } = body;

    if (!name || price == null || !items?.length) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const productIds = items.map((item: any) => Number(item.productId));

    const activeProducts = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    const activeProductIds = new Set(
      activeProducts.map((product) => product.id),
    );

    const invalidProduct = productIds.find(
      (id: number) => !activeProductIds.has(id),
    );

    if (invalidProduct) {
      return NextResponse.json(
        {
          error: `El producto ${invalidProduct} no existe o fue eliminado.`,
        },
        { status: 400 },
      );
    }

    const recipe = await prisma.recipe.create({
      data: {
        name,
        price,
        items: {
          create: items.map((item: any) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
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
      { status: 500 },
    );
  }
}
