import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const groups = await prisma.saleGroup.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      sales: {
        include: {
          product: true,
        },
      },

      cash: true,
    },
  });

  return NextResponse.json(groups);
}
