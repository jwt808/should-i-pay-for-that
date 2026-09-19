import { readFile } from "node:fs/promises";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isPathInsideStorage } from "@/lib/storage";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; fileId: string }> },
) {
  if (!(await isAdminRequest())) return new Response("Unauthorized", { status: 401 });
  const { id, fileId } = await context.params;
  const file = await prisma.caseFile.findFirst({
    where: { id: fileId, caseId: id },
  });
  if (!file || !isPathInsideStorage(file.path)) {
    return new Response("Not found", { status: 404 });
  }
  const data = await readFile(file.path);
  return new Response(data, {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `inline; filename="${file.originalName.replace(/"/g, "")}"`,
    },
  });
}
