import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET: listar recetas
// ADMIN + EMPLOYEE
// GET: listar recetas
// ADMIN + EMPLOYEE
export async function GET() {
  try {
    await requireAuth();

    const recipes = await prisma.recipe.findMany({
      where: {
        deletedAt: null,
      },

      include: {
        category: true,

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
    console.error("GET /recipes error:", error);

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        error: "Error cargando recetas",
      },
      { status: 500 },
    );
  }
}

// POST: crear receta
// ADMIN solamente
// POST: crear receta
// ADMIN solamente
export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();

    const {
      name,
      price,
      categoryId,
      items,
      imageUrl,
    } = body;

    if (!name || price == null || !items?.length) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 },
      );
    }

    // -----------------------------------------
    // VALIDAR CATEGORÍA
    // -----------------------------------------

    if (categoryId == null) {
      return NextResponse.json(
        { error: "La receta debe tener una categoría." },
        { status: 400 },
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id: Number(categoryId),
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          error: "La categoría seleccionada no existe.",
        },
        { status: 400 },
      );
    }

    const categoryName = category.name
      .toLowerCase()
      .trim();

    // Estas categorías son solamente para extras
    if (
      categoryName === "aderezos" ||
      categoryName === "descartables"
    ) {
      return NextResponse.json(
        {
          error:
            "Aderezos y Descartables no pueden asignarse a recetas.",
        },
        { status: 400 },
      );
    }

    // -----------------------------------------
    // VALIDAR PRODUCTOS
    // -----------------------------------------

    const productIds = items.map((item: any) =>
      Number(item.productId),
    );

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

    // -----------------------------------------
    // CREAR RECETA
    // -----------------------------------------

    const recipe = await prisma.recipe.create({
      data: {
        name: name.trim(),

        price: Number(price),

        // ✅ categoryId pertenece a Recipe
        categoryId: Number(categoryId),

        // Imagen opcional
        imageUrl: imageUrl || null,

        // ✅ Los items SOLO reciben productId y quantity
        items: {
          create: items.map((item: any) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
          })),
        },
      },

      include: {
        category: true,

        items: true,
      },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("POST /recipes error:", error);

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          error: "No tenés permisos para crear recetas",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        error: "Error creando receta",
      },
      { status: 500 },
    );
  }
}