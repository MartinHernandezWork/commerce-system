import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {

  const history = await prisma.cashRegister.findMany({

    orderBy: {
      openedAt: "desc",
    },

    include: {
      saleGroups: true,
    },
  });

  return NextResponse.json(history);
}