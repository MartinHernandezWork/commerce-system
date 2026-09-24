import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    await requireAuth();

    const { id } = await context.params;

    const orderId = Number(id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(
        {
          error: "ID de orden inválido.",
        },
        {
          status: 400,
        }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "La orden no existe.",
        },
        {
          status: 404,
        }
      );
    }

    if (order.status === "COMPLETED") {
      return NextResponse.json(
        {
          error: "La orden ya fue entregada.",
        },
        {
          status: 400,
        }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },

      include: {
        group: {
          select: {
            id: true,
            customerName: true,
            total: true,
            createdAt: true,
          },
        },

        items: {
          include: {
            ingredients: true,
            extras: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Orden marcada como entregada.",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("COMPLETE ORDER ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "No se pudo completar la orden.",
      },
      {
        status: 400,
      }
    );
  }
}