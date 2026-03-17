import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const openCash = await prisma.cashRegister.findFirst({
    where: {
      closedAt: null,
    },
  });

  return NextResponse.json({
    isOpen: !!openCash,
  });
}