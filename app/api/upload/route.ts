import { NextResponse } from "next/server";
import sharp from "sharp";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    // Verificar que realmente sea un archivo
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Verificar que sea una imagen
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen" },
        { status: 400 },
      );
    }

    // Convertir el archivo recibido a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Optimizar:
    // - máximo 600x600
    // - mantiene proporción
    // - no recorta el producto
    // - convierte siempre a WebP
    // - calidad 80
    const optimized = await sharp(buffer)
      .resize(600, 600, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 80,
      })
      .toBuffer();

    // Crear carpeta de uploads si no existe
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, {
      recursive: true,
    });

    // Nombre seguro para el archivo
    const originalName = path
      .parse(file.name)
      .name.replace(/[^a-zA-Z0-9-_]/g, "_");

    const fileName = `${Date.now()}-${originalName}.webp`;

    const filePath = path.join(uploadDir, fileName);

    // Guardar únicamente la versión optimizada
    await writeFile(filePath, optimized);

    // URL que se guardará en la base de datos
    const url = `/uploads/${fileName}`;

    return NextResponse.json({
      url,
    });
  } catch (error) {
    console.error("Error al subir imagen:", error);

    return NextResponse.json(
      { error: "Error al subir imagen" },
      { status: 500 },
    );
  }
}
