import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();

  // Asegurarse de que el barcode empiece con #
  const barcode = body.barcode
    ? body.barcode.startsWith("#")
      ? body.barcode
      : `#${body.barcode}`
    : "";

  const data = {
    ...body,
    barcode,
    pricePerKg: parseFloat(body.pricePerKg),   // ahora usamos pricePerKg
    stockGrams: parseInt(body.stockGrams),     // ahora usamos stockGrams
  };

  // Validar si el barcode ya existe
  if (barcode) {
    const existing = await prisma.product.findUnique({
      where: { barcode },
    });
    if (existing) {
      return NextResponse.json(
        { error: `El código de barra "${barcode}" ya existe.` },
        { status: 400 }
      );
    }
  }

  const product = await prisma.product.create({ data });
  return NextResponse.json(product);
}

// PUT actualizado para validar barcode
export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...rest } = body;

  // Asegurarse de que el barcode empiece con #
  const barcode = rest.barcode
    ? rest.barcode.startsWith("#")
      ? rest.barcode
      : `#${rest.barcode}`
    : "";

  // Validar si el barcode ya existe en otro producto
  if (barcode) {
    const existing = await prisma.product.findUnique({
      where: { barcode },
    });
    if (existing && existing.id !== id) {
      return NextResponse.json(
        { error: `El código de barra "${barcode}" ya existe.` },
        { status: 400 }
      );
    }
  }

  const data = {
    ...rest,
    barcode,
    pricePerKg: rest.pricePerKg
      ? parseFloat(rest.pricePerKg)
      : undefined,
    stockGrams: rest.stockGrams
      ? parseInt(rest.stockGrams)
      : undefined,
  };

  const updated = await prisma.product.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { id } = body;
  const deleted = await prisma.product.delete({ where: { id } });
  return NextResponse.json(deleted);
}
