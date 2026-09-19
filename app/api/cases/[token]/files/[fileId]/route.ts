import { readFile } from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { isPathInsideStorage } from "@/lib/storage";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string; fileId: string }> },
) {
  const { token, fileId } = await context.params;
  const record = await prisma.case.findUnique({
    where: { accessToken: token },
    include: { files: true },
  });
  const file = record?.files.find((f) => f.id === fileId);
  if (!record || !file || !isPathInsideStorage(file.path)) {
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
