import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET → listar proveedores
export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("GET /suppliers error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST → crear proveedor
export async function POST(req: Request) {
  try {
    const { name, phone, email, address } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre del proveedor es obligatorio" },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
      },
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("POST /suppliers error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PUT → actualizar proveedor
export async function PUT(req: Request) {
  try {
    const { id, name, phone, email, address } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "El ID es obligatorio" },
        { status: 400 }
      );
    }

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre del proveedor es obligatorio" },
        { status: 400 }
      );
    }

    const updated = await prisma.supplier.update({
      where: { id: Number(id) },
      data: {
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /suppliers error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// DELETE → eliminar proveedor
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "El ID es obligatorio" },
        { status: 400 }
      );
    }

    const deleted = await prisma.supplier.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("DELETE /suppliers error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
