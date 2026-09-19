import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { serializeCase } from "@/lib/serialize-case";
import type { CustomerReport } from "@/lib/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const record = await prisma.case.findUnique({
    where: { id },
    include: { files: true, outcomes: true },
  });
  if (!record) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({
    ...serializeCase(record, { includeEmail: true }),
    outcomes: record.outcomes,
    vinDecode: record.vinDecodeJson,
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = (await request.json()) as {
    report?: CustomerReport;
    reviewerNotes?: string;
    status?: string;
  };
  const data: Record<string, unknown> = {};
  if (body.report) data.reportJson = JSON.stringify(body.report);
  if (typeof body.reviewerNotes === "string") data.reviewerNotes = body.reviewerNotes;
  if (typeof body.status === "string") data.status = body.status;
  const record = await prisma.case.update({
    where: { id },
    data,
    include: { files: true },
  });
  return Response.json(serializeCase(record, { includeEmail: true }));
}
