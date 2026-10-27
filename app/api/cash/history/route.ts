import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();

    const history = await prisma.cashRegister.findMany({
      orderBy: {
        openedAt: "desc",
      },
      include: {
        saleGroups: {
          where: {
            cancelledAt: null,
          },
        },
      },
    });

    return NextResponse.json(history);
  } catch (err) {
    console.error("Error al obtener el historial de cajas:", err);

    return NextResponse.json(
      { error: "Error al obtener el historial de cajas." },
      { status: 500 },
    );
  }
}
