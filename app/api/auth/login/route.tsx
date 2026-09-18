import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";

function createAuthToken(userId: number) {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET no está configurado");
  }

  const timestamp = Date.now().toString();

  const payload = `${userId}.${timestamp}`;

  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return `${userId}.${timestamp}.${signature}`;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        {
          error: "Usuario y contraseña son requeridos",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "Usuario o contraseña incorrectos",
        },
        {
          status: 401,
        }
      );
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordIsValid) {
      return NextResponse.json(
        {
          error: "Usuario o contraseña incorrectos",
        },
        {
          status: 401,
        }
      );
    }

    const token = createAuthToken(user.id);

    const response = NextResponse.json({
      success: true,

      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);

    return NextResponse.json(
      {
        error: "Error al procesar el inicio de sesión",
      },
      {
        status: 500,
      }
    );
  }
}