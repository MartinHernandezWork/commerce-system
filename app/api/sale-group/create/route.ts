import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { total, customerName, paymentMethod } = await req.json();

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Falta método de pago" },
        { status: 400 }
      );
    }

    const validMethods = ["efectivo", "transferencia"];

    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Método de pago inválido" },
        { status: 400 }
      );
    }

    // ✅ verificar caja abierta
    const cash = await prisma.cashRegister.findFirst({
      where: { closedAt: null },
      orderBy: { openedAt: "desc" },
    });

    if (!cash) {
      return NextResponse.json(
        { error: "NO_CASH_OPEN" },
        { status: 400 }
      );
    }

    const group = await prisma.saleGroup.create({
      data: {
        total,
        customerName: customerName || null,
        paymentMethod: paymentMethod || "CASH",
        cashId: cash.id,
        customerName: customerName || null,
        paymentMethod,
      },
    });

    return NextResponse.json(group);

  } catch (err) {
    return NextResponse.json(
      { error: "Error creando ticket" },
      { status: 500 }
    );
  }
}