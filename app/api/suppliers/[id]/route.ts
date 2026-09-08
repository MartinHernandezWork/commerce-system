import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({
    where: { id: Number(id) },
  });
  return NextResponse.json(supplier);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.supplier.update({
    where: { id: Number(id) },
    data: {
      name: body.name,
      phone: body.phone || null,
      email: body.email || null,
      address: body.address || null,
    },
  });
  return NextResponse.json(updated);
}
