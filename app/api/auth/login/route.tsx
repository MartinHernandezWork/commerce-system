import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

function createAuthToken() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET no está configurado");
  }

  const timestamp = Date.now().toString();

  const signature = createHmac("sha256", secret)
    .update(timestamp)
    .digest("hex");

  return `${timestamp}.${signature}`;
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "La contraseña es requerida" },
        { status: 400 },
      );
    }

    if (password !== process.env.AUTH_PASSWORD) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 },
      );
    }

    const token = createAuthToken();

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);

    return NextResponse.json(
      { error: "Error al procesar el inicio de sesión" },
      { status: 500 },
    );
  }
}
