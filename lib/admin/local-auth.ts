import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const LOCAL_ADMIN_COOKIE = "rcvend-local-admin";
export const LOCAL_ADMIN_MAX_AGE = 60 * 60 * 8;

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isLocalAdminEnabled() {
  return Boolean(
    process.env.NODE_ENV !== "production" &&
      !hasSupabaseEnv() &&
      process.env.LOCAL_ADMIN_EMAIL &&
      process.env.LOCAL_ADMIN_PASSWORD &&
      process.env.LOCAL_ADMIN_SESSION_SECRET,
  );
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function sessionValue() {
  const email = process.env.LOCAL_ADMIN_EMAIL ?? "";
  const secret = process.env.LOCAL_ADMIN_SESSION_SECRET ?? "";

  return createHmac("sha256", secret)
    .update(`rcvend-local-admin:${email}`)
    .digest("hex");
}

export function validateLocalAdminCredentials(email: string, password: string) {
  if (!isLocalAdminEnabled()) return false;

  return (
    safeEqual(email.trim().toLowerCase(), process.env.LOCAL_ADMIN_EMAIL!.trim().toLowerCase()) &&
    safeEqual(password, process.env.LOCAL_ADMIN_PASSWORD!)
  );
}

export async function hasValidLocalAdminSession() {
  if (!isLocalAdminEnabled()) return false;

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCAL_ADMIN_COOKIE)?.value;

  return Boolean(cookieValue && safeEqual(cookieValue, sessionValue()));
}

export function getLocalAdminSessionValue() {
  if (!isLocalAdminEnabled()) {
    throw new Error("O acesso administrativo local não está habilitado.");
  }

  return sessionValue();
}
