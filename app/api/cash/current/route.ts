import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {

  const cash = await prisma.cashRegister.findFirst({
    where: {
      closedAt: null,
    },
    orderBy: {
      openedAt: "desc",
    },
  });

  return NextResponse.json(cash);
}