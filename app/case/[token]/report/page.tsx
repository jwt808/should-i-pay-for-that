import { notFound } from "next/navigation";
import { ReportView } from "@/components/ReportView";
import { prisma } from "@/lib/prisma";
import { parseReport } from "@/lib/investigation";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const record = await prisma.case.findUnique({ where: { accessToken: token } });
  if (!record) notFound();
  if (record.status !== "DELIVERED" && record.status !== "RESOLVED") {
    return (
      <p className="mx-auto max-w-2xl px-4 py-12">
        This report is not delivered yet. Check your case status page.
      </p>
    );
  }
  const report = parseReport(record.reportJson);
  if (!report) {
    return <p className="mx-auto max-w-2xl px-4 py-12">Report is not available.</p>;
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="mb-6 text-sm print:hidden">
        Print this page or use your browser&apos;s Save as PDF.
      </p>
      <ReportView report={report} printable />
    </div>
  );
}
