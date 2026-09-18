import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "No autenticado",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error("Error en /api/auth/me:", error);

    return NextResponse.json(
      {
        error: "Error interno",
      },
      {
        status: 500,
      }
    );
  }
}