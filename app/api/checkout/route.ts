import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

type PaymentMethodInput = "efectivo" | "transferencia" | "mixto";

type CheckoutExtra = {
  productId: number;
  quantity?: number;
};

type CheckoutUnit = {
  extras?: CheckoutExtra[];
};

type CheckoutItem = {
  type: "PRODUCT" | "RECIPE";

  productId?: number;
  recipeId?: number;

  quantity: number;

  units?: CheckoutUnit[];
};

type CheckoutBody = {
  items: CheckoutItem[];

  paymentMethod: PaymentMethodInput;

  cashReceived?: number;

  cashAmount?: number;

  transferAmount?: number;

  customerName?: string | null;
};

function controlledError(message: string) {
  return new Error(message);
}

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = (await request.json()) as CheckoutBody;

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        {
          error: "El carrito está vacío.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      body.paymentMethod !== "efectivo" &&
      body.paymentMethod !== "transferencia" &&
      body.paymentMethod !== "mixto"
    ) {
      return NextResponse.json(
        {
          error: "Método de pago inválido.",
        },
        {
          status: 400,
        },
      );
    }

    for (const item of body.items) {
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        return NextResponse.json(
          {
            error: "Todas las cantidades deben ser mayores a 0.",
          },
          {
            status: 400,
          },
        );
      }

      if (item.type !== "PRODUCT" && item.type !== "RECIPE") {
        return NextResponse.json(
          {
            error: "Tipo de producto inválido.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        item.type === "PRODUCT" &&
        (!item.productId || !Number.isInteger(item.productId))
      ) {
        return NextResponse.json(
          {
            error: "Producto inválido.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        item.type === "RECIPE" &&
        (!item.recipeId || !Number.isInteger(item.recipeId))
      ) {
        return NextResponse.json(
          {
            error: "Receta inválida.",
          },
          {
            status: 400,
          },
        );
      }

      /*
       * Si viene units, debe coincidir con quantity.
       */
      if (item.units && item.units.length !== Math.floor(item.quantity)) {
        return NextResponse.json(
          {
            error:
              "La cantidad de unidades no coincide con la cantidad del producto.",
          },
          {
            status: 400,
          },
        );
      }
    }

    /*
     * ---------------------------------------------------------
     * TRANSACCIÓN
     * ---------------------------------------------------------
     */

    const result = await prisma.$transaction(async (tx) => {
      /*
       * -----------------------------------------------------
       * CAJA ABIERTA
       * -----------------------------------------------------
       */

      const cash = await tx.cashRegister.findFirst({
        where: {
          closedAt: null,
        },
        orderBy: {
          openedAt: "desc",
        },
      });

      if (!cash) {
        throw controlledError(
          "No hay una caja abierta. Abrí la caja antes de vender.",
        );
      }

      /*
       * -----------------------------------------------------
       * IDS DE PRODUCTOS
       * -----------------------------------------------------
       */

      const productIds = body.items
        .filter((item) => item.type === "PRODUCT" && item.productId)
        .map((item) => item.productId as number);

      const recipeIds = body.items
        .filter((item) => item.type === "RECIPE" && item.recipeId)
        .map((item) => item.recipeId as number);

      /*
       * Obtener todos los IDs de extras desde units.
       */

      const extraProductIds = body.items.flatMap((item) =>
        (item.units || []).flatMap((unit) =>
          (unit.extras || []).map((extra) => extra.productId),
        ),
      );

      const allRequestedProductIds = [
        ...new Set([...productIds, ...extraProductIds]),
      ];

      /*
       * -----------------------------------------------------
       * OBTENER PRODUCTOS
       * -----------------------------------------------------
       */

      const products =
        allRequestedProductIds.length > 0
          ? await tx.product.findMany({
              where: {
                id: {
                  in: allRequestedProductIds,
                },
              },
              include: {
                category: true,
              },
            })
          : [];

      const productMap = new Map(
        products.map((product) => [product.id, product]),
      );

      /*
       * -----------------------------------------------------
       * OBTENER RECETAS
       * -----------------------------------------------------
       */

      const recipes =
        recipeIds.length > 0
          ? await tx.recipe.findMany({
              where: {
                id: {
                  in: recipeIds,
                },
                deletedAt: null,
              },
              include: {
                items: {
                  include: {
                    product: true,
                  },
                },
              },
            })
          : [];

      const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));

      /*
       * -----------------------------------------------------
       * CALCULAR TOTAL + VALIDAR STOCK
       * -----------------------------------------------------
       */

      let total = 0;

      for (const item of body.items) {
        /*
         * ===================================================
         * PRODUCTO
         * ===================================================
         */

        if (item.type === "PRODUCT") {
          const product = productMap.get(item.productId!);

          if (!product) {
            throw controlledError("Uno de los productos ya no existe.");
          }

          if (product.deletedAt) {
            throw controlledError(`${product.name} fue eliminado.`);
          }

          if (!product.showInPOS) {
            throw controlledError(
              `${product.name} no está disponible para vender.`,
            );
          }

          if (product.stock < item.quantity) {
            throw controlledError(
              `No hay suficiente stock de ${product.name}. Stock disponible: ${product.stock}.`,
            );
          }

          total += product.salePrice * item.quantity;
        }

        /*
         * ===================================================
         * RECETA
         * ===================================================
         */

        if (item.type === "RECIPE") {
          const recipe = recipeMap.get(item.recipeId!);

          if (!recipe) {
            throw controlledError(
              "Una de las recetas no existe o fue eliminada.",
            );
          }

          total += recipe.price * item.quantity;

          /*
           * Validar ingredientes.
           */

          for (const recipeItem of recipe.items) {
            const requiredQuantity = recipeItem.quantity * item.quantity;

            if (recipeItem.product.stock < requiredQuantity) {
              throw controlledError(
                `No hay suficiente stock de ${recipeItem.product.name} para preparar ${recipe.name}.`,
              );
            }
          }
        }
      }

      /*
       * -----------------------------------------------------
       * PREPARAR EXTRAS
       * -----------------------------------------------------
       *
       * Acá ya NO multiplicamos:
       *
       * extra.quantity * item.quantity
       *
       * porque cada unidad tiene sus propios extras.
       *
       * Ejemplo:
       *
       * 3 hamburguesas
       *
       * unidad 1 -> nada
       * unidad 2 -> mayo x1
       * unidad 3 -> mayo x1 + ketchup x1
       *
       * Resultado:
       *
       * mayo    = 2
       * ketchup = 1
       */

      const extraTotals = new Map<number, number>();

      for (const item of body.items) {
        /*
         * Las unidades son obligatorias para el
         * nuevo formato.
         *
         * Por compatibilidad, si no vienen,
         * generamos unidades vacías.
         */

        const units =
          item.units ||
          Array.from(
            {
              length: Math.floor(item.quantity),
            },
            () => ({
              extras: [],
            }),
          );

        for (let unitIndex = 0; unitIndex < units.length; unitIndex++) {
          const unit = units[unitIndex];

          for (const extra of unit.extras || []) {
            const product = productMap.get(extra.productId);

            if (!product) {
              throw controlledError("Uno de los extras ya no existe.");
            }

            if (product.deletedAt) {
              throw controlledError(`${product.name} fue eliminado.`);
            }

            const categoryName =
              product.category?.name?.toLowerCase().trim() || "";

            if (
              categoryName !== "aderezos" &&
              categoryName !== "descartables"
            ) {
              throw controlledError(`${product.name} no es un extra válido.`);
            }

            const quantity = Number(extra.quantity) || 0;

            if (quantity <= 0) {
              throw controlledError(
                `Cantidad inválida para el extra ${product.name}.`,
              );
            }

            const current = extraTotals.get(product.id) || 0;

            extraTotals.set(product.id, current + quantity);
          }
        }
      }

      /*
       * -----------------------------------------------------
       * VALIDAR STOCK TOTAL DE EXTRAS
       * -----------------------------------------------------
       */

      for (const [productId, requestedQuantity] of extraTotals.entries()) {
        const product = productMap.get(productId);

        if (!product) {
          throw controlledError("Uno de los extras no existe.");
        }

        if (product.stock < requestedQuantity) {
          throw controlledError(
            `No hay suficiente stock de ${product.name}. Stock disponible: ${product.stock}.`,
          );
        }
      }

      /*
       * -----------------------------------------------------
       * VALIDAR PAGO
       * -----------------------------------------------------
       */

      const cashReceived = Number(body.cashReceived) || 0;

      const requestedCashAmount = Number(body.cashAmount) || 0;

      const requestedTransferAmount = Number(body.transferAmount) || 0;

      let cashAmount = 0;
      let transferAmount = 0;
      let change = 0;

      /*
       * =====================================================
       * EFECTIVO
       * =====================================================
       */

      if (body.paymentMethod === "efectivo") {
        cashAmount = total;
        transferAmount = 0;

        if (cashReceived < total) {
          throw controlledError(
            `El efectivo recibido es insuficiente. Faltan ${
              total - cashReceived
            }.`,
          );
        }

        change = cashReceived - total;
      }

      /*
       * =====================================================
       * TRANSFERENCIA
       * =====================================================
       */

      if (body.paymentMethod === "transferencia") {
        cashAmount = 0;
        transferAmount = total;

        if (Math.abs(requestedTransferAmount - total) > 0.01) {
          throw controlledError(
            "El importe de transferencia no coincide con el total.",
          );
        }

        change = 0;
      }

      /*
       * =====================================================
       * MIXTO
       * =====================================================
       */

      if (body.paymentMethod === "mixto") {
        transferAmount = requestedTransferAmount;

        cashAmount = total - transferAmount;

        if (transferAmount <= 0) {
          throw controlledError("La transferencia debe ser mayor a 0.");
        }

        if (transferAmount > total) {
          throw controlledError("La transferencia no puede superar el total.");
        }

        if (cashReceived < cashAmount) {
          throw controlledError(
            `El efectivo recibido es insuficiente. Faltan ${
              cashAmount - cashReceived
            }.`,
          );
        }

        change = cashReceived - cashAmount;
      }

      /*
       * El cashAmount enviado por frontend
       * no es confiable.
       *
       * Lo calculamos nosotros.
       */

      void requestedCashAmount;

      /*
       * -----------------------------------------------------
       * SALE GROUP
       * -----------------------------------------------------
       */

      const group = await tx.saleGroup.create({
        data: {
          total,

          customerName: body.customerName?.trim() || null,

          paymentMethod:
            body.paymentMethod === "efectivo"
              ? "CASH"
              : body.paymentMethod === "transferencia"
                ? "TRANSFER"
                : "MIXED",

          cashAmount,

          transferAmount,

          cashReceived,

          change,

          cash: {
            connect: {
              id: cash.id,
            },
          },
        },
      });

      /*
       * -----------------------------------------------------
       * ORDER
       * -----------------------------------------------------
       */

      const order = await tx.order.create({
        data: {
          groupId: group.id,
          status: "PENDING",
        },
      });

      /*
       * -----------------------------------------------------
       * PROCESAR ITEMS
       * -----------------------------------------------------
       */

      for (const item of body.items) {
        /*
         * ===================================================
         * PRODUCTO
         * ===================================================
         */

        if (item.type === "PRODUCT") {
          const product = productMap.get(item.productId!);

          if (!product) {
            throw controlledError("Producto no encontrado.");
          }

          const itemTotal = product.salePrice * item.quantity;

          /*
           * Histórico de venta.
           */

          await tx.sale.create({
            data: {
              productId: product.id,

              productName: product.name,

              unitPrice: product.salePrice,

              quantity: item.quantity,

              totalPrice: itemTotal,

              groupId: group.id,
            },
          });

          /*
           * Descontar stock del producto.
           */

          await tx.product.update({
            where: {
              id: product.id,
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          /*
           * Movimiento.
           */

          await tx.stockMovement.create({
            data: {
              productId: product.id,

              type: "SALE",

              quantity: -item.quantity,

              note: `Venta #${group.id}`,
            },
          });

          /*
           * Crear OrderItem.
           */

          const orderItem = await tx.orderItem.create({
            data: {
              orderId: order.id,

              type: "PRODUCT",

              productId: product.id,

              name: product.name,

              quantity: item.quantity,

              unitPrice: product.salePrice,
            },
          });

          /*
           * -------------------------------------------------
           * EXTRAS POR UNIDAD
           * -------------------------------------------------
           */

          const units =
            item.units ||
            Array.from(
              {
                length: Math.floor(item.quantity),
              },
              () => ({
                extras: [],
              }),
            );

          for (let unitIndex = 0; unitIndex < units.length; unitIndex++) {
            const unit = units[unitIndex];

            for (const extra of unit.extras || []) {
              const extraProduct = productMap.get(extra.productId);

              if (!extraProduct) {
                throw controlledError("Extra no encontrado.");
              }

              const extraQuantity = Number(extra.quantity) || 0;

              if (extraQuantity <= 0) {
                throw controlledError(
                  `Cantidad inválida para el extra ${extraProduct.name}.`,
                );
              }

              /*
               * Descontar stock del extra.
               */

              await tx.product.update({
                where: {
                  id: extraProduct.id,
                },
                data: {
                  stock: {
                    decrement: extraQuantity,
                  },
                },
              });

              /*
               * Movimiento de stock.
               */

              await tx.stockMovement.create({
                data: {
                  productId: extraProduct.id,

                  type: "SALE",

                  quantity: -extraQuantity,

                  note: `Extra de venta #${group.id} - Unidad ${unitIndex + 1}`,
                },
              });

              /*
               * Snapshot del extra.
               *
               * IMPORTANTE:
               *
               * unitIndex permite saber a qué
               * unidad pertenece.
               */

              await tx.orderItemExtra.create({
                data: {
                  orderItemId: orderItem.id,

                  productId: extraProduct.id,

                  name: extraProduct.name,

                  quantity: extraQuantity,

                  category:
                    extraProduct.category?.name?.toLowerCase().trim() ===
                    "aderezos"
                      ? "ADEREZO"
                      : "DESCARTABLE",

                  unitIndex,
                },
              });
            }
          }
        }

        /*
         * ===================================================
         * RECETA
         * ===================================================
         */

        if (item.type === "RECIPE") {
          const recipe = recipeMap.get(item.recipeId!);

          if (!recipe) {
            throw controlledError("Receta no encontrada.");
          }

          /*
           * Histórico de receta.
           */

          await tx.recipeSale.create({
            data: {
              recipeId: recipe.id,

              recipeName: recipe.name,

              unitPrice: recipe.price,

              groupId: group.id,

              quantity: item.quantity,
            },
          });

          /*
           * Crear OrderItem.
           */

          const orderItem = await tx.orderItem.create({
            data: {
              orderId: order.id,

              type: "RECIPE",

              recipeId: recipe.id,

              name: recipe.name,

              quantity: item.quantity,

              unitPrice: recipe.price,
            },
          });

          /*
           * -------------------------------------------------
           * INGREDIENTES
           * -------------------------------------------------
           */

          for (const recipeItem of recipe.items) {
            const requiredQuantity = recipeItem.quantity * item.quantity;

            await tx.product.update({
              where: {
                id: recipeItem.product.id,
              },
              data: {
                stock: {
                  decrement: requiredQuantity,
                },
              },
            });

            await tx.stockMovement.create({
              data: {
                productId: recipeItem.product.id,

                type: "SALE",

                quantity: -requiredQuantity,

                note: `Ingrediente de ${recipe.name} - Venta #${group.id}`,
              },
            });

            /*
             * Snapshot del ingrediente.
             */

            await tx.orderItemIngredient.create({
              data: {
                orderItemId: orderItem.id,

                productId: recipeItem.product.id,

                name: recipeItem.product.name,

                quantity: recipeItem.quantity,
              },
            });
          }

          /*
           * -------------------------------------------------
           * EXTRAS DE RECETA POR UNIDAD
           * -------------------------------------------------
           */

          const units =
            item.units ||
            Array.from(
              {
                length: Math.floor(item.quantity),
              },
              () => ({
                extras: [],
              }),
            );

          for (let unitIndex = 0; unitIndex < units.length; unitIndex++) {
            const unit = units[unitIndex];

            for (const extra of unit.extras || []) {
              const extraProduct = productMap.get(extra.productId);

              if (!extraProduct) {
                throw controlledError("Extra no encontrado.");
              }

              const extraQuantity = Number(extra.quantity) || 0;

              if (extraQuantity <= 0) {
                throw controlledError(
                  `Cantidad inválida para el extra ${extraProduct.name}.`,
                );
              }

              /*
               * Descontar stock.
               */

              await tx.product.update({
                where: {
                  id: extraProduct.id,
                },
                data: {
                  stock: {
                    decrement: extraQuantity,
                  },
                },
              });

              /*
               * Movimiento.
               */

              await tx.stockMovement.create({
                data: {
                  productId: extraProduct.id,

                  type: "SALE",

                  quantity: -extraQuantity,

                  note: `Extra de ${recipe.name} - Venta #${group.id} - Unidad ${
                    unitIndex + 1
                  }`,
                },
              });

              /*
               * Snapshot.
               */

              await tx.orderItemExtra.create({
                data: {
                  orderItemId: orderItem.id,

                  productId: extraProduct.id,

                  name: extraProduct.name,

                  quantity: extraQuantity,

                  category:
                    extraProduct.category?.name?.toLowerCase().trim() ===
                    "aderezos"
                      ? "ADEREZO"
                      : "DESCARTABLE",

                  unitIndex,
                },
              });
            }
          }
        }
      }

      /*
       * -----------------------------------------------------
       * RESULTADO
       * -----------------------------------------------------
       */

      return {
        groupId: group.id,

        orderId: order.id,

        total,

        cashAmount,

        transferAmount,

        cashReceived,

        change,
      };
    });

    return NextResponse.json(
      {
        success: true,

        message: "Venta registrada correctamente.",

        ...result,
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("CHECKOUT ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "No se pudo completar la venta.",
      },
      {
        status: 400,
      },
    );
  }
}
