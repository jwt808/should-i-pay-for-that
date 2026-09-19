import { cookies } from "next/headers";
import { ADMIN_COOKIE, expectedAdminToken } from "@/lib/admin-auth";
import { adminPassword } from "@/lib/env";

export async function POST(request: Request) {
  const password = adminPassword();
  if (!password) {
    return Response.json(
      { error: "ADMIN_PASSWORD is not set on the server." },
      { status: 503 },
    );
  }
  const body = (await request.json()) as { password?: string };
  if (body.password !== password) {
    return Response.json({ error: "Incorrect password." }, { status: 401 });
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, expectedAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return Response.json({ ok: true });
}
