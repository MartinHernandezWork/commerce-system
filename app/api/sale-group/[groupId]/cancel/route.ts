
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await getCurrentUser();

    // Debe estar autenticado.
    if (!user) {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 },
      );
    }

    // Solo ADMIN puede anular ventas.
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

    // Recibir y validar el motivo de anulación.
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Debés indicar el motivo de anulación" },
        { status: 400 },
      );
    }

    const cancellationReason =
      typeof body === "object" &&
      body !== null &&
      "reason" in body &&
      typeof body.reason === "string"
        ? body.reason.trim()
        : "";

    if (!cancellationReason) {
      return NextResponse.json(
        { error: "El motivo de anulación es obligatorio" },
        { status: 400 },
      );
    }

    if (cancellationReason.length > 1000) {
      return NextResponse.json(
        { error: "El motivo no puede superar los 1000 caracteres" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      /*
       * 1. Buscar la venta y los datos necesarios
       * para reconstruir el stock utilizado.
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

      // Evitar anular dos veces la misma venta.
      if (group.cancelledAt) {
        throw new Error("ALREADY_CANCELLED");
      }

      /*
       * 2. Devolver los productos vendidos directamente.
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
       * 3. Devolver los ingredientes de las recetas.
       * La cantidad utilizada por unidad se multiplica
       * por la cantidad de recetas vendidas.
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
         * 4. Devolver aderezos y descartables.
         * Se conserva el criterio de cantidades de tu API.
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
       * 5. Registrar la anulación y su motivo.
       * Todo queda guardado en la misma transacción.
       */
      const cancelledGroup = await tx.saleGroup.update({
        where: {
          id: group.id,
        },
        data: {
          cancelledAt: new Date(),
          cancelledById: user.id,
          cancellationReason,
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

    console.error(
      "POST /api/sale-group/[groupId]/cancel error:",
      error,
    );

    return NextResponse.json(
      { error: "Error anulando la venta" },
      { status: 500 },
    );
  }
}
