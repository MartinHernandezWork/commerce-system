import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await getCurrentUser();

    // Debe estar autenticado
    if (!user) {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 },
      );
    }

    // Solo ADMIN puede anular ventas
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tenés permisos para anular ventas" },
        { status: 403 },
      );
    }

    const { groupId } = await context.params;
    const id = Number(groupId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "ID de venta inválido" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      /*
       * Buscamos toda la información que necesitamos para reconstruir
       * exactamente el stock utilizado por esta venta.
       */
      const group = await tx.saleGroup.findUnique({
        where: {
          id,
        },
        include: {
          sales: true,

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

      if (!group) {
        throw new Error("SALE_GROUP_NOT_FOUND");
      }

      // Evitar que una misma venta sea anulada dos veces
      if (group.cancelledAt) {
        throw new Error("ALREADY_CANCELLED");
      }

      /*
       * ============================================================
       * 1. PRODUCTOS VENDIDOS DIRECTAMENTE
       * ============================================================
       *
       * Sale.quantity ya contiene la cantidad exacta vendida.
       */
      for (const sale of group.sales) {
        await tx.product.update({
          where: {
            id: sale.productId,
          },
          data: {
            stock: {
              increment: sale.quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: sale.productId,
            quantity: sale.quantity,
            type: "ADJUSTMENT",
            note: `Devolución por anulación de venta #${group.id}`,
          },
        });
      }

      /*
       * ============================================================
       * 2. INGREDIENTES DE RECETAS
       * ============================================================
       *
       * OrderItemIngredient.quantity representa la cantidad
       * utilizada POR UNA UNIDAD de la receta.
       *
       * Por eso multiplicamos:
       *
       * ingredient.quantity × orderItem.quantity
       */
      if (group.order) {
        for (const item of group.order.items) {
          if (item.type !== "RECIPE") {
            continue;
          }

          for (const ingredient of item.ingredients) {
            const quantityToRestore =
              ingredient.quantity * item.quantity;

            await tx.product.update({
              where: {
                id: ingredient.productId,
              },
              data: {
                stock: {
                  increment: quantityToRestore,
                },
              },
            });

            await tx.stockMovement.create({
              data: {
                productId: ingredient.productId,
                quantity: quantityToRestore,
                type: "ADJUSTMENT",
                note: `Devolución ingrediente por anulación de venta #${group.id}`,
              },
            });
          }
        }

        /*
         * ==========================================================
         * 3. ADEREZOS Y DESCARTABLES
         * ==========================================================
         *
         * OrderItemExtra.quantity ya representa la cantidad
         * consumida del extra, por lo que NO multiplicamos
         * nuevamente por item.quantity.
         */
        for (const item of group.order.items) {
          for (const extra of item.extras) {
            const quantityToRestore = extra.quantity;

            await tx.product.update({
              where: {
                id: extra.productId,
              },
              data: {
                stock: {
                  increment: quantityToRestore,
                },
              },
            });

            await tx.stockMovement.create({
              data: {
                productId: extra.productId,
                quantity: quantityToRestore,
                type: "ADJUSTMENT",
                note: `Devolución extra por anulación de venta #${group.id}`,
              },
            });
          }
        }
      }

      /*
       * ============================================================
       * 4. MARCAR LA VENTA COMO ANULADA
       * ============================================================
       */
      const cancelledGroup = await tx.saleGroup.update({
        where: {
          id: group.id,
        },
        data: {
          cancelledAt: new Date(),
          cancelledById: user.id,
        },
        include: {
          cancelledBy: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      return cancelledGroup;
    });

    return NextResponse.json({
      success: true,
      message: "Venta anulada correctamente",
      saleGroup: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SALE_GROUP_NOT_FOUND") {
        return NextResponse.json(
          { error: "Venta no encontrada" },
          { status: 404 },
        );
      }

      if (error.message === "ALREADY_CANCELLED") {
        return NextResponse.json(
          { error: "Esta venta ya fue anulada" },
          { status: 400 },
        );
      }
    }

    console.error("POST /api/sale-group/[groupId]/cancel error:", error);

    return NextResponse.json(
      { error: "Error anulando la venta" },
      { status: 500 },
    );
  }
}