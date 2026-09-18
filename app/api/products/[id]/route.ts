import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();

    const { id } = await context.params;

    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error("GET /products/[id] error:", err);

    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Error cargando producto" },
      { status: 500 },
    );
  }
}