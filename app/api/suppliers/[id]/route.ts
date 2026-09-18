import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;
    const supplierId = Number(id);

    if (!Number.isInteger(supplierId) || supplierId <= 0) {
      return NextResponse.json(
        { error: "ID de proveedor inválido" },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(supplier);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "Error al obtener el proveedor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const supplierId = Number(id);

    if (!Number.isInteger(supplierId) || supplierId <= 0) {
      return NextResponse.json(
        { error: "ID de proveedor inválido" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const updated = await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        name: body.name,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "No tenés permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "Error al actualizar el proveedor" },
      { status: 500 }
    );
  }
}