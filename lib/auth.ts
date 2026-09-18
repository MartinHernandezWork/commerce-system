import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export type AuthUser = {
  id: number;
  username: string;
  role: "ADMIN" | "EMPLOYEE";
};

function verifyToken(token: string) {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET no está configurado");
  }

  const [userId, timestamp, signature] = token.split(".");

  if (!userId || !timestamp || !signature) {
    return null;
  }

  const payload = `${userId}.${timestamp}`;

  const expectedSignature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  try {
    const isValid = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );

    if (!isValid) {
      return null;
    }
  } catch {
    return null;
  }

  const timestampNumber = Number(timestamp);
  const userIdNumber = Number(userId);

  if (
    !Number.isFinite(timestampNumber) ||
    !Number.isInteger(userIdNumber) ||
    userIdNumber <= 0
  ) {
    return null;
  }

  const tokenAge = Date.now() - timestampNumber;

  const maxAge = 8 * 60 * 60 * 1000;

  if (tokenAge < 0 || tokenAge > maxAge) {
    return null;
  }

  return {
    userId: userIdNumber,
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  const tokenData = verifyToken(token);

  if (!tokenData) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: tokenData.userId,
    },
    select: {
      id: true,
      username: true,
      role: true,
    },
  });

  if (!user) {
    return null;
  }

  return user;
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();

  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return user;
}