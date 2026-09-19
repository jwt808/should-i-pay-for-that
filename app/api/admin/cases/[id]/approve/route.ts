import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { serializeCase } from "@/lib/serialize-case";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const record = await prisma.case.update({
    where: { id },
    data: {
      status: "DELIVERED",
      deliveredAt: new Date(),
    },
    include: { files: true },
  });
  return Response.json(serializeCase(record, { includeEmail: true }));
}
