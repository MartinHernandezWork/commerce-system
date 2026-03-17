import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {

  const cash = await prisma.cashRegister.findFirst({
    where: { closedAt: null },
    orderBy: { openedAt: "desc" },
    include: {
      saleGroups: true,
    },
  });

  if (!cash) {
    return NextResponse.json(
      { error: "No hay caja abierta" },
      { status: 400 }
    );
  }

  const totalSales = cash.saleGroups.reduce(
    (sum, g) => sum + g.total,
    0
  );

  const finalAmount = cash.initial + totalSales;

  const closed = await prisma.cashRegister.update({
    where: { id: cash.id },
    data: {
      closedAt: new Date(),
      final: finalAmount,
    },
  });

  return NextResponse.json({
    ...closed,
    totalSales,
    finalAmount,
  });
}