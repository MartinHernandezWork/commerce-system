import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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

        cancelledBy: {
          select: {
            id: true,
            username: true,
          },
        },

        order: {
          include: {
            items: {
              include: {
                ingredients: true,
                extras: true,
              },
            },
          },
        },
      },
    });

    return Response.json(groups);
  } catch (error) {
    console.error("GET /api/sale-group/history error:", error);

    return Response.json(
      {
        error: "No se pudo cargar el historial de ventas.",
      },
      {
        status: 500,
      },
    );
  }
}