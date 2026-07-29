import { NextResponse } from "next/server";
import {
  getLocalAdminSessionValue,
  isLocalAdminEnabled,
  LOCAL_ADMIN_COOKIE,
  LOCAL_ADMIN_MAX_AGE,
  validateLocalAdminCredentials,
} from "@/lib/admin/local-auth";

export async function POST(request: Request) {
  if (!isLocalAdminEnabled()) {
    return NextResponse.json(
      { error: "O acesso administrativo local não está disponível." },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    password?: unknown;
  } | null;

  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!validateLocalAdminCredentials(email, password)) {
    return NextResponse.json(
      { error: "E-mail ou senha incorretos." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(LOCAL_ADMIN_COOKIE, getLocalAdminSessionValue(), {
    httpOnly: true,
    maxAge: LOCAL_ADMIN_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: false,
  });

  return response;
}
