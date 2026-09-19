import { bypassCheckoutEnabled } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { markPaid, runInvestigation } from "@/lib/investigation";

export async function POST(request: Request) {
  if (!bypassCheckoutEnabled()) {
    return Response.json(
      { error: "DEV_BYPASS_CHECKOUT is not enabled." },
      { status: 403 },
    );
  }
  const { token } = (await request.json()) as { token?: string };
  if (!token) return Response.json({ error: "Missing case token." }, { status: 400 });
  const record = await prisma.case.findUnique({ where: { accessToken: token } });
  if (!record) return Response.json({ error: "Case not found." }, { status: 404 });

  await markPaid(record.id, { sessionId: "dev_bypass" });
  try {
    await runInvestigation(record.id);
  } catch (error) {
    await prisma.case.update({
      where: { id: record.id },
      data: {
        status: "NEEDS REVIEW",
        reviewerNotes: `Investigation error: ${error instanceof Error ? error.message : "unknown"}`,
      },
    });
  }
  return Response.json({ ok: true, token: record.accessToken });
}
