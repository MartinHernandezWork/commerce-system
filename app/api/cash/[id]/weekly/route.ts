
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

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

function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function nextDate(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function formatShortDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (
      !startDate ||
      !endDate ||
      !isValidDateString(startDate) ||
      !isValidDateString(endDate)
    ) {
      return NextResponse.json(
        {
          error:
            "Las fechas no son válidas. Usá el formato YYYY-MM-DD.",
        },
        { status: 400 },
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        {
          error: "La fecha inicial no puede ser posterior a la fecha final.",
        },
        { status: 400 },
      );
    }

    // Argentina utiliza UTC-3.
    // Se incluye todo el día final usando un límite exclusivo.
    const start = new Date(`${startDate}T00:00:00-03:00`);
    const endExclusive = new Date(
      `${nextDate(endDate)}T00:00:00-03:00`,
    );

    // Se buscan las ventas por su fecha real de creación,
    // no por la fecha en que se abrió la caja.
    const saleGroups = await prisma.saleGroup.findMany({
      where: {
        createdAt: {
          gte: start,
          lt: endExclusive,
        },
        cancelledAt: null,
      },
      include: {
        sales: {
          include: {
            product: {
              select: {
                unitType: true,
              },
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
                      select: {
                        unitType: true,
                      },
                    },
                  },
                },
                extras: {
                  include: {
                    product: {
                      select: {
                        unitType: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const salesSummary = new Map<string, SalesSummary>();
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

    for (const group of saleGroups) {
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

        addStock(
          sale.productId,
          sale.productName,
          unit,
          quantity,
        );
      }

      // B. Recetas vendidas.
      for (const sale of group.recipeSales) {
        const quantity = Number(sale.quantity);
        const unitPrice = Number(sale.unitPrice);

        addSale(
          sale.recipeName,
          quantity,
          unitPrice,
          quantity * unitPrice,
        );
      }

      // C. Ingredientes, aderezos y descartables.
      // Se usan los registros históricos guardados en cada pedido.
      for (const item of group.order?.items ?? []) {
        // Cada ingrediente se multiplica por la cantidad
        // de recetas vendidas.
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

        // Los extras ya tienen registrada su cantidad consumida.
        // No se multiplica nuevamente por la cantidad del pedido.
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

    // HOJA 1: productos y recetas vendidos durante la semana.
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

    // HOJA 2: consumo acumulado de mercadería de toda la semana.
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

    // Formato, encabezados y filtros.
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

    const filename =
      `reposicion-semanal-Lo-Del-Donald-` +
      `${formatShortDate(startDate)}-al-${formatShortDate(endDate)}.xlsx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    console.error("Error generando Excel semanal de reposición:", error);

    const message =
      error instanceof Error
        ? error.message
        : "No se pudo generar el Excel semanal de reposición.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
