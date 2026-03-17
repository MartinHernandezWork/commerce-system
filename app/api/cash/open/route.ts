import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { initial } = await req.json();

    // ver si hay caja abierta
    const openCash = await prisma.cashRegister.findFirst({
      where: {
        closedAt: null,
      },
    });

    if (openCash) {
      return NextResponse.json(
        { error: "Ya hay una caja abierta" },
        { status: 400 }
      );
    }

    const cash = await prisma.cashRegister.create({
      data: {
        initial: Number(initial) || 0,
      },
    });

    return NextResponse.json(cash);

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Error al abrir caja" },
      { status: 500 }
    );
  }
}