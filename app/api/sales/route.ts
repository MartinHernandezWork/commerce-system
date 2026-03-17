// app/api/sales/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { productId, quantity, groupId } = await req.json();

    const productIdNum = Number(productId);
    const quantityNum = Number(quantity);

    if (isNaN(productIdNum) || isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    const sale = await prisma.$transaction(async (tx) => {

      const product = await tx.product.findUnique({
        where: { id: productIdNum },
      });

      if (!product) {
        throw new Error("NOT_FOUND");
      }

      if (product.stock <= 0) {
        throw new Error("NO_STOCK");
      }

      if (product.stock < quantityNum) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      const totalPrice = product.salePrice * quantityNum;

      // crear venta
      const newSale = await tx.sale.create({
        data: {
          productId: productIdNum,
          quantity: quantityNum,
          totalPrice,
          groupId: groupId ?? null,
        },
      });

      // descontar stock (forma segura)
      await tx.product.update({
        where: { id: productIdNum },
        data: {
          stock: {
            decrement: quantityNum,
          },
        },
      });

      // movimiento de stock
      await tx.stockMovement.create({
        data: {
          productId: productIdNum,
          quantity: -quantityNum,
          type: "SALE",
          note: `Venta de ${quantityNum}`,
        },
      });

      return newSale;
    });

    return NextResponse.json(sale);

  } catch (error: any) {

    if (error.message === "NOT_FOUND") {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    if (error.message === "NO_STOCK") {
      return NextResponse.json(
        { error: "Sin stock" },
        { status: 400 }
      );
    }

    if (error.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json(
        { error: "Stock insuficiente" },
        { status: 400 }
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
