import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { id: "desc" } });
  return NextResponse.json(suppliers);
}

export async function POST(req: Request) {
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
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.supplier.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
