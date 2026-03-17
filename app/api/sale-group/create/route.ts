import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {

    const { total } = await req.json();

    // ✅ verificar caja abierta

    const cash = await prisma.cashRegister.findFirst({
      where: {
        closedAt: null,
      },
      orderBy: {
        openedAt: "desc",
      },
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
        cashId: cash.id,
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