import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { adminPassword } from "./env";

export const ADMIN_COOKIE = "sip_admin";

function sign(value: string) {
  const secret = adminPassword();
  if (!secret) return "";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function expectedAdminToken() {
  return sign("authenticated");
}

export function adminTokenValid(token: string | undefined) {
  const expected = expectedAdminToken();
  if (!token || !expected || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export async function isAdminRequest() {
  const jar = await cookies();
  return adminTokenValid(jar.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin() {
  if (!(await isAdminRequest())) {
    throw new Error("UNAUTHORIZED");
  }
}
