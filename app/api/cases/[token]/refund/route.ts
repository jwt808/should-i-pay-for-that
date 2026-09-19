import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const body = (await request.json()) as { reason?: string };
  const reason = (body.reason || "").trim();
  if (reason.length < 8) {
    return Response.json(
      { error: "Please tell us why the report was not worth $149." },
      { status: 400 },
    );
  }
  const record = await prisma.case.findUnique({ where: { accessToken: token } });
  if (!record) return Response.json({ error: "Case not found." }, { status: 404 });
  if (record.status !== "DELIVERED" && record.status !== "RESOLVED") {
    return Response.json(
      { error: "Refund requests are available after you receive the completed report." },
      { status: 400 },
    );
  }
  await prisma.case.update({
    where: { id: record.id },
    data: {
      refundRequestedAt: new Date(),
      refundReason: reason,
    },
  });
  return Response.json({ ok: true });
}
