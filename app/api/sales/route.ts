// app/api/sales/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { productId, quantityGrams } = await req.json();

    // Validar tipos
    const productIdNum = Number(productId);
    const quantityNum = Number(quantityGrams);

    if (isNaN(productIdNum) || isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id: productIdNum } });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    if (product.stockGrams < quantityNum) {
      return NextResponse.json({ error: "Stock insuficiente" }, { status: 400 });
    }

    const totalPrice = (quantityNum / 1000) * product.pricePerKg;

    // Crear venta
    const sale = await prisma.sale.create({
      data: {
        productId: productIdNum,
        quantityGrams: quantityNum,
        totalPrice,
      },
      include: { product: true }, // incluir info del producto para frontend
    });

    // Actualizar stock
    await prisma.product.update({
      where: { id: productIdNum },
      data: { stockGrams: product.stockGrams - quantityNum },
    });

    return NextResponse.json(sale);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sales);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
