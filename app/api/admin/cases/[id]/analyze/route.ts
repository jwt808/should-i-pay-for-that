import { isAdminRequest } from "@/lib/admin-auth";
import { runInvestigation } from "@/lib/investigation";
import { serializeCase } from "@/lib/serialize-case";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const record = await runInvestigation(id);
  return Response.json(serializeCase(record, { includeEmail: true }));
}
