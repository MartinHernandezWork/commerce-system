// app/api/sales/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { productId, quantity } = await req.json();

    const productIdNum = Number(productId);
    const quantityNum = Number(quantity);

    if (isNaN(productIdNum) || isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productIdNum },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    if (product.stock < quantityNum) {
      return NextResponse.json(
        { error: "Stock insuficiente" },
        { status: 400 }
      );
    }

    const totalPrice = product.salePrice * quantityNum;

    // Transacción para asegurar consistencia
    const sale = await prisma.$transaction(async (tx) => {
      // Crear venta
      const newSale = await tx.sale.create({
        data: {
          productId: productIdNum,
          quantity: quantityNum,
          totalPrice,
        },
        include: { product: true },
      });

      // Descontar stock
      await tx.product.update({
        where: { id: productIdNum },
        data: { stock: product.stock - quantityNum },
      });

      // Registrar movimiento de stock
      await tx.stockMovement.create({
        data: {
          productId: productIdNum,
          quantity: -quantityNum,
          type: "SALE",
          note: `Venta de ${quantityNum} unidades`,
        },
      });

      return newSale;
    });

    return NextResponse.json(sale);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
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
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
