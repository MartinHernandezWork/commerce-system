import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();

    const suppliers = await prisma.supplier.findMany({
      orderBy: { id: "desc" },
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();

    const supplier = await prisma.supplier.create({
      data: {
        name: body.name,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
      },
    });

    return NextResponse.json(supplier);
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
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();

    const { id } = await req.json();

    await prisma.supplier.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ ok: true });
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
      { error: "Error al eliminar el proveedor" },
      { status: 500 }
    );
  }
}