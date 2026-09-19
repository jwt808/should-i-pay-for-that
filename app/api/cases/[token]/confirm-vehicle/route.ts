import { prisma } from "@/lib/prisma";
import { runInvestigation } from "@/lib/investigation";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const body = (await request.json()) as {
    year?: string;
    make?: string;
    model?: string;
  };
  const record = await prisma.case.findUnique({ where: { accessToken: token } });
  if (!record) return Response.json({ error: "Case not found." }, { status: 404 });
  if (!record.paidAt) {
    return Response.json({ error: "Case is not paid." }, { status: 400 });
  }

  const year = body.year ? Number.parseInt(body.year, 10) : record.vehicleYear;
  await prisma.case.update({
    where: { id: record.id },
    data: {
      vehicleYear: Number.isFinite(year) ? year : record.vehicleYear,
      vehicleMake: body.make || record.vehicleMake,
      vehicleModel: body.model || record.vehicleModel,
      vehicleConfirmed: true,
      vinUncertain: false,
    },
  });
  await runInvestigation(record.id);
  return Response.json({ ok: true });
}
