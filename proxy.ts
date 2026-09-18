import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

function getAuthUser(token: string | undefined) {
  if (!token) {
    return null;
  }

  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    return null;
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

  if (!Number.isFinite(timestampNumber)) {
    return null;
  }

  const tokenAge = Date.now() - timestampNumber;

  const maxAge = 8 * 60 * 60 * 1000;

  if (tokenAge < 0 || tokenAge > maxAge) {
    return null;
  }

  return {
    userId: Number(userId),
  };
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get("auth_token")?.value;
  const user = getAuthUser(authToken);

  const isAuthenticated = user !== null;

  const isLoginPage = pathname === "/login";
  const isLoginApi = pathname === "/api/auth/login";

  if (isLoginPage || isLoginApi) {
    if (isLoginPage && isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};