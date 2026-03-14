import { NextResponse } from "next/server";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Optimize the image (resize + compress)
    const optimized = await sharp(buffer)
      .resize(256, 256, {
        fit: "cover",
      })                            // tamaño máximo
      .jpeg({ quality: 70 })       // compresión
      .toBuffer();

    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Ensure uploads dir exists
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, optimized);

    const url = `/uploads/${fileName}`;

    return NextResponse.json({ url });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al subir imagen" },
      { status: 500 }
    );
  }
}
