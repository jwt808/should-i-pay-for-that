import { CaseStatusClient } from "@/components/CaseStatusClient";

export const dynamic = "force-dynamic";

export default async function CasePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  return <CaseStatusClient token={token} paid={query.paid === "1"} />;
}
