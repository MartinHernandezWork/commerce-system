import { prisma } from "@/lib/prisma";

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
      recipeSales: {
        include: {
          recipe: true,
        },
      },
      cash: true,
    },
  });

  return Response.json(groups);
}