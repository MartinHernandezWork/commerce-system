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
        // ✅ Devolver categoría
        category: true,

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

    const {
      name,
      price,
      categoryId,
      imageUrl,
      items,
    } = body;

    const recipeId = Number(id);

    // -----------------------------------------
    // VALIDAR ID
    // -----------------------------------------

    if (isNaN(recipeId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 },
      );
    }

    // -----------------------------------------
    // VALIDAR DATOS
    // -----------------------------------------

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "El nombre de la receta es obligatorio." },
        { status: 400 },
      );
    }

    if (price == null || Number(price) <= 0) {
      return NextResponse.json(
        { error: "El precio debe ser mayor a 0." },
        { status: 400 },
      );
    }

    if (categoryId == null) {
      return NextResponse.json(
        {
          error: "La receta debe tener una categoría.",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: "La receta necesita al menos un ingrediente.",
        },
        { status: 400 },
      );
    }

    // -----------------------------------------
    // VERIFICAR RECETA
    // -----------------------------------------

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

    // -----------------------------------------
    // VALIDAR CATEGORÍA
    // -----------------------------------------

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

    // Aderezos y Descartables son solamente extras
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

    const hasInvalidProductId = productIds.some(
      (productId: number) =>
        !Number.isInteger(productId) ||
        productId <= 0,
    );

    if (hasInvalidProductId) {
      return NextResponse.json(
        {
          error: "Hay ingredientes con productos inválidos.",
        },
        { status: 400 },
      );
    }

    // Evitar ingredientes repetidos
    const uniqueProductIds = new Set(productIds);

    if (uniqueProductIds.size !== productIds.length) {
      return NextResponse.json(
        {
          error:
            "No podés agregar el mismo producto más de una vez.",
        },
        { status: 400 },
      );
    }

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
      (productId: number) =>
        !activeProductIds.has(productId),
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
    // VALIDAR CANTIDADES
    // -----------------------------------------

    for (const item of items) {
      const itemQuantity = Number(item.quantity);

      if (
        !Number.isFinite(itemQuantity) ||
        itemQuantity <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Todos los ingredientes deben tener una cantidad mayor a 0.",
          },
          { status: 400 },
        );
      }
    }

    // -----------------------------------------
    // ACTUALIZAR RECETA
    // -----------------------------------------

    const recipe = await prisma.recipe.update({
      where: {
        id: recipeId,
      },
      data: {
        name: name.trim(),
        price: Number(price),

        // ✅ Nueva categoría
        categoryId: Number(categoryId),

        imageUrl: imageUrl || null,
      },
    });

    // -----------------------------------------
    // BORRAR INGREDIENTES ANTERIORES
    // -----------------------------------------

    await prisma.recipeItem.deleteMany({
      where: {
        recipeId,
      },
    });

    // -----------------------------------------
    // CREAR NUEVOS INGREDIENTES
    // -----------------------------------------

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
          error:
            "No tenés permisos para actualizar recetas",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        error: "Error actualizando receta",
      },
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
    console.error(
      "DELETE /recipes/[id] error:",
      error,
    );

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
          error:
            "No tenés permisos para eliminar recetas",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        error: "Error eliminando receta",
      },
      { status: 500 },
    );
  }
}