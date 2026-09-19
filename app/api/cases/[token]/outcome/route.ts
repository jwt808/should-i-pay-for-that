import { OUTCOME_OPTIONS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const body = (await request.json()) as {
    whatHappened?: string;
    amountPaid?: string;
  };
  const whatHappened = (body.whatHappened || "").trim();
  if (!OUTCOME_OPTIONS.includes(whatHappened as (typeof OUTCOME_OPTIONS)[number])) {
    return Response.json({ error: "Choose what happened with the repair." }, { status: 400 });
  }
  const record = await prisma.case.findUnique({ where: { accessToken: token } });
  if (!record) return Response.json({ error: "Case not found." }, { status: 404 });

  const amount = body.amountPaid ? Number.parseFloat(body.amountPaid) : null;
  await prisma.outcome.create({
    data: {
      caseId: record.id,
      vehicleYear: record.vehicleYear,
      vehicleMake: record.vehicleMake,
      vehicleModel: record.vehicleModel,
      repairCategory: record.repairCategory,
      quotedPrice: record.quotedPrice,
      whatHappened,
      amountPaid: Number.isFinite(amount) ? amount : null,
    },
  });
  if (record.status === "DELIVERED") {
    await prisma.case.update({
      where: { id: record.id },
      data: { status: "RESOLVED" },
    });
  }
  return Response.json({ ok: true });
}
