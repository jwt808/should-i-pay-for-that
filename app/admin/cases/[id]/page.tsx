import { notFound, redirect } from "next/navigation";
import { AdminCaseEditor } from "@/components/AdminCaseEditor";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { serializeCase } from "@/lib/serialize-case";

export const dynamic = "force-dynamic";

export default async function AdminCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminRequest())) redirect("/admin/login");
  const { id } = await params;
  const record = await prisma.case.findUnique({
    where: { id },
    include: { files: true },
  });
  if (!record) notFound();
  const payload = serializeCase(record, { includeEmail: true });
  return <AdminCaseEditor initial={payload as never} />;
}
