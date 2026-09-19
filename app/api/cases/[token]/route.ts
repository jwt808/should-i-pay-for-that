import { prisma } from "@/lib/prisma";
import { serializeCase } from "@/lib/serialize-case";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const record = await prisma.case.findUnique({
    where: { accessToken: token },
    include: { files: true, outcomes: true },
  });
  if (!record) return Response.json({ error: "Case not found." }, { status: 404 });
  return Response.json({
    ...serializeCase(record),
    hasOutcome: record.outcomes.length > 0,
  });
}
