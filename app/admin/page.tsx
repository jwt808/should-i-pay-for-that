import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminQueuePage() {
  if (!(await isAdminRequest())) redirect("/admin/login");
  const cases = await prisma.case.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-[var(--navy)]">Case queue</h1>
        <form action="/api/admin/logout" method="post">
          <button className="text-sm underline" type="submit">
            Sign out
          </button>
        </form>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--rule)] text-[var(--muted)]">
              <th className="py-2">Status</th>
              <th>Vehicle</th>
              <th>Quote</th>
              <th>Coverage</th>
              <th>Confidence</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id} className="border-b border-[var(--rule)]">
                <td className="py-3">
                  <Link className="underline" href={`/admin/cases/${c.id}`}>
                    {c.status}
                  </Link>
                </td>
                <td>
                  {[c.vehicleYear, c.vehicleMake, c.vehicleModel].filter(Boolean).join(" ") ||
                    c.vin}
                  <div className="text-xs text-[var(--muted)]">{c.mileage.toLocaleString()} mi</div>
                </td>
                <td>{c.quotedPrice != null ? `$${c.quotedPrice.toFixed(0)}` : "—"}</td>
                <td>{c.potentialCoverage || "—"}</td>
                <td>{c.reportConfidence || "—"}</td>
                <td>{c.reviewRequired ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!cases.length && <p className="mt-6 text-[var(--muted)]">No cases yet.</p>}
    </div>
  );
}
