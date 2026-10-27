import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const employeeName =
      typeof body.employeeName === "string" ? body.employeeName.trim() : "";

    const initial = Number(body.initial);

    if (!employeeName) {
      return NextResponse.json(
        { error: "Ingresá el nombre del empleado que abre la caja." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(initial) || initial < 0) {
      return NextResponse.json(
        { error: "El monto inicial de la caja no es válido." },
        { status: 400 },
      );
    }

    const openCash = await prisma.cashRegister.findFirst({
      where: {
        closedAt: null,
      },
    });

    if (openCash) {
      return NextResponse.json(
        { error: "Ya hay una caja abierta." },
        { status: 400 },
      );
    }

    const cash = await prisma.cashRegister.create({
      data: {
        initial,
        openedByName: employeeName,
      },
    });

    return NextResponse.json(cash, { status: 201 });
  } catch (err) {
    console.error("Error al abrir caja:", err);

    return NextResponse.json(
      { error: "Error al abrir caja." },
      { status: 500 },
    );
  }
}
