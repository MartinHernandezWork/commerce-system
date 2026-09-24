import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();

    const orders = await prisma.order.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        group: {
          select: {
            id: true,
            customerName: true,
            total: true,
            createdAt: true,
            paymentMethod: true,
            cashAmount: true,
            transferAmount: true,
            cashReceived: true,
            change: true,
          },
        },

        items: {
          orderBy: {
            id: "asc",
          },

          include: {
            ingredients: {
              orderBy: { id: "asc" },
              include: {
                product: {
                  select: {
                    unitType: true,
                  },
                },
              },
            },

            extras: {
              orderBy: [{ unitIndex: "asc" }, { id: "asc" }],
            },
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "No se pudieron obtener las órdenes.",
      },
      {
        status: 400,
      },
    );
  }
}
