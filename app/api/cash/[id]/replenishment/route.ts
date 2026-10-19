import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

type StockUnit = "UNIT" | "G" | "KG";

type StockSummary = {
  productId: number;
  name: string;
  unit: StockUnit;
  quantity: number;
};

type SalesSummary = {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

function unitLabel(unit: StockUnit): string {
  switch (unit) {
    case "G":
      return "Gramos";
    case "KG":
      return "Kilogramos";
    default:
      return "Unidades";
  }
}

function formatQuantity(value: number): number {
  return Number(value.toFixed(4));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();

    const { id } = await context.params;
    const cashId = Number(id);

    if (!Number.isSafeInteger(cashId) || cashId <= 0) {
      return NextResponse.json(
        { error: "El número de caja no es válido." },
        { status: 400 },
      );
    }

    const cash = await prisma.cashRegister.findUnique({
      where: { id: cashId },
      include: {
        saleGroups: {
          where: { cancelledAt: null },
          include: {
            sales: {
              include: {
                product: {
                  select: { unitType: true },
                },
              },
            },
            recipeSales: true,
            order: {
              include: {
                items: {
                  include: {
                    ingredients: {
                      include: {
                        product: {
                          select: { unitType: true },
                        },
                      },
                    },
                    extras: {
                      include: {
                        product: {
                          select: { unitType: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cash) {
      return NextResponse.json(
        { error: "No se encontró la caja solicitada." },
        { status: 404 },
      );
    }

    if (!cash.closedAt) {
      return NextResponse.json(
        {
          error: "Solo se puede generar el Excel de una caja cerrada.",
        },
        { status: 400 },
      );
    }

    // Tabla 1: productos y recetas vendidos.
    const salesSummary = new Map<string, SalesSummary>();

    // Tabla 2: toda la mercadería consumida, consolidada
    // por producto, independientemente de cómo se utilizó.
    const stockSummary = new Map<number, StockSummary>();

    function addSale(
      name: string,
      quantity: number,
      unitPrice: number,
      total: number,
    ) {
      if (
        !Number.isFinite(quantity) ||
        !Number.isFinite(unitPrice) ||
        !Number.isFinite(total) ||
        quantity <= 0
      ) {
        return;
      }

      const key = JSON.stringify([name, unitPrice]);
      const existing = salesSummary.get(key);

      if (existing) {
        existing.quantity += quantity;
        existing.total += total;
      } else {
        salesSummary.set(key, {
          name,
          quantity,
          unitPrice,
          total,
        });
      }
    }

    function addStock(
      productId: number,
      name: string,
      unit: StockUnit,
      quantity: number,
    ) {
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return;
      }

      const existing = stockSummary.get(productId);

      if (existing) {
        if (existing.unit !== unit) {
          throw new Error(
            `El producto "${name}" tiene unidades inconsistentes. ` +
              "Revisá su configuración antes de generar el Excel.",
          );
        }

        existing.quantity += quantity;
      } else {
        stockSummary.set(productId, {
          productId,
          name,
          unit,
          quantity,
        });
      }
    }

    for (const group of cash.saleGroups) {
      // A. Productos vendidos directamente.
      for (const sale of group.sales) {
        const quantity = Number(sale.quantity);
        const unit = sale.product.unitType as StockUnit;

        addSale(
          sale.productName,
          quantity,
          Number(sale.unitPrice),
          Number(sale.totalPrice),
        );

        addStock(sale.productId, sale.productName, unit, quantity);
      }

      // B. Recetas vendidas.
      for (const sale of group.recipeSales) {
        const quantity = Number(sale.quantity);
        const unitPrice = Number(sale.unitPrice);

        addSale(sale.recipeName, quantity, unitPrice, quantity * unitPrice);
      }

      // C. Ingredientes, aderezos y descartables.
      // Se utilizan los registros asociados al pedido,
      // no la receta actual, para conservar el consumo histórico.
      for (const item of group.order?.items ?? []) {
        // Cada ingrediente guarda la cantidad necesaria
        // para una receta. Multiplicamos por las recetas vendidas.
        if (item.type === "RECIPE") {
          for (const ingredient of item.ingredients) {
            const quantity =
              Number(ingredient.quantity) * Number(item.quantity);

            addStock(
              ingredient.productId,
              ingredient.name,
              ingredient.product.unitType as StockUnit,
              quantity,
            );
          }
        }

        // Los extras se suman según la cantidad guardada
        // en cada registro, sin multiplicar otra vez.
        for (const extra of item.extras) {
          addStock(
            extra.productId,
            extra.name,
            extra.product.unitType as StockUnit,
            Number(extra.quantity),
          );
        }
      }
    }

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "Sistema Ventas - Lo Del Donald";
    workbook.created = new Date();
    workbook.modified = new Date();

    // HOJA 1: productos vendidos.
    const salesSheet = workbook.addWorksheet("Productos vendidos");

    salesSheet.columns = [
      { header: "Producto", key: "name", width: 36 },
      { header: "Cantidad vendida", key: "quantity", width: 18 },
      { header: "Precio unitario", key: "unitPrice", width: 20 },
      { header: "Total cobrado", key: "total", width: 20 },
    ];

    const salesRows = [...salesSummary.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "es"),
    );

    for (const item of salesRows) {
      salesSheet.addRow({
        name: item.name,
        quantity: formatQuantity(item.quantity),
        unitPrice: formatQuantity(item.unitPrice),
        total: formatQuantity(item.total),
      });
    }

    salesSheet.getColumn("unitPrice").numFmt = '"$"#,##0.00';
    salesSheet.getColumn("total").numFmt = '"$"#,##0.00';

    // HOJA 2: mercadería que se debe reponer.
    const stockSheet = workbook.addWorksheet("Mercaderia a reponer");

    stockSheet.columns = [
      { header: "Mercadería", key: "name", width: 38 },
      { header: "Cantidad consumida", key: "quantity", width: 22 },
      { header: "Unidad", key: "unit", width: 18 },
    ];

    const stockRows = [...stockSummary.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "es"),
    );

    for (const item of stockRows) {
      stockSheet.addRow({
        name: item.name,
        quantity: formatQuantity(item.quantity),
        unit: unitLabel(item.unit),
      });
    }

    // Formato y filtros para ambas tablas.
    for (const sheet of [salesSheet, stockSheet]) {
      sheet.views = [{ state: "frozen", ySplit: 1 }];

      sheet.autoFilter = {
        from: "A1",
        to: {
          row: Math.max(sheet.rowCount, 1),
          column: sheet.columnCount,
        },
      };

      const header = sheet.getRow(1);

      header.font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
      };

      header.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF16803D" },
      };

      header.alignment = {
        vertical: "middle",
        wrapText: true,
      };

      header.height = 30;

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.alignment = {
            vertical: "middle",
            wrapText: true,
          };
        }
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="ventas-Lo-Del-Donald-${new Date(
          cash.openedAt,
        ).toLocaleDateString("sv-SE", {
          timeZone: "America/Argentina/Buenos_Aires",
        })}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    console.error("Error generando Excel de reposición:", error);

    const message =
      error instanceof Error
        ? error.message
        : "No se pudo generar el Excel de reposición.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
