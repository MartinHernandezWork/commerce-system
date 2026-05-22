import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET → listar productos
export async function GET(request: Request) {
  try {

    const { searchParams } = new URL(request.url);

    const onlyPOS = searchParams.get("pos");

    const products = await prisma.product.findMany({
      where: onlyPOS === "true"
        ? {
          showInPOS: true,
        }
        : undefined,

      include: {
        supplier: true,
        category: true,
      },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET /products error:", err);
    return NextResponse.json(
      { error: "Error cargando productos" },
      { status: 500 }
    );
  }
}

// POST → crear producto
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      stock,
      unitType,
      costPrice,
      salePrice,
      barcode,
      sku,
      description,
      supplierId,
      categoryId,
      showInPOS,
      imageUrl,
    } = body;

    // Validar barcode único
    if (barcode) {
      const existing = await prisma.product.findUnique({
        where: { barcode },
      });

      if (existing) {
        return NextResponse.json(
          { error: `El código de barras "${barcode}" ya existe.` },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        stock: Number(stock) || 0,
        unitType,
        costPrice: Number(costPrice),
        salePrice: Number(salePrice),
        barcode: barcode || null,
        sku: sku || null,
        description: description || null,
        supplierId: supplierId ? Number(supplierId) : null,
        categoryId: categoryId ? Number(categoryId) : null,
        showInPOS,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error("POST /products error:", err);
    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 }
    );
  }
}

// PUT → actualizar producto
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...rest } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID requerido" },
        { status: 400 }
      );
    }

    const numId = Number(id);

    // Validación barcode
    if (rest.barcode) {
      const existing = await prisma.product.findUnique({
        where: { barcode: rest.barcode },
      });

      if (existing && existing.id !== numId) {
        return NextResponse.json(
          { error: `El código de barras "${rest.barcode}" ya existe.` },
          { status: 400 }
        );
      }
    }

    console.log("BODY UPDATE:", rest);

    const updated = await prisma.product.update({
      where: { id: numId },
      data: {
        name: rest.name,
        description: rest.description || null,
        barcode: rest.barcode || null,
        sku: rest.sku || null,

        stock:
          rest.stock !== undefined
            ? Number(rest.stock)
            : undefined,

        unitType:
          rest.unitType !== undefined
            ? rest.unitType
            : undefined,

        costPrice:
          rest.costPrice !== undefined
            ? Number(rest.costPrice)
            : undefined,

        salePrice:
          rest.salePrice !== undefined
            ? Number(rest.salePrice)
            : undefined,

        showInPOS: rest.showInPOS,

        supplierId:
          rest.supplierId &&
            !isNaN(Number(rest.supplierId))
            ? Number(rest.supplierId)
            : null,

        categoryId:
          rest.categoryId &&
            !isNaN(Number(rest.categoryId))
            ? Number(rest.categoryId)
            : null,

        imageUrl: rest.imageUrl || null,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /products error:", err);
    return NextResponse.json(
      { error: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}

// DELETE → eliminar producto
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID requerido" },
        { status: 400 }
      );
    }

    const deleted = await prisma.product.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(deleted);
  } catch (err) {
    console.error("DELETE /products error:", err);
    return NextResponse.json(
      { error: "Error al eliminar producto" },
      { status: 500 }
    );
  }
}
