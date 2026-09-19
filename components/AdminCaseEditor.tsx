"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReportView } from "@/components/ReportView";
import { ALL_STATUSES, BOTTOM_LINES, CONSISTENCY_LABELS, PRICE_CHECK_LABELS } from "@/lib/constants";
import type { CustomerReport, EstimateExtraction } from "@/lib/types";

type AdminCase = {
  id: string;
  accessToken: string;
  status: string;
  email?: string | null;
  vin: string;
  mileage: number;
  zip: string;
  customerExplanation: string | null;
  mechanicSaid: string | null;
  vehicleYear: number | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleTrim: string | null;
  vehicleEngine: string | null;
  quotedPrice: number | null;
  repairCategory: string | null;
  reportConfidence: string | null;
  highRiskFlags: string[];
  reviewerNotes: string | null;
  refundRequestedAt: string | null;
  refundReason: string | null;
  extraction: EstimateExtraction | null;
  recalls: { recalls?: Array<{ nhtsaCampaignNumber: string; component: string; summary: string }> } | null;
  report: CustomerReport | null;
  files: Array<{ id: string; originalName: string }>;
};

export function AdminCaseEditor({ initial }: { initial: AdminCase }) {
  const router = useRouter();
  const [notes, setNotes] = useState(initial.reviewerNotes || "");
  const [status, setStatus] = useState(initial.status);
  const [report, setReport] = useState<CustomerReport | null>(initial.report);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await fetch(`/api/admin/cases/${initial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report, reviewerNotes: notes, status }),
    });
    const json = await res.json();
    setBusy(false);
    setMessage(res.ok ? "Saved." : json.error);
    router.refresh();
  }

  async function analyze() {
    setBusy(true);
    const res = await fetch(`/api/admin/cases/${initial.id}/analyze`, { method: "POST" });
    const json = await res.json();
    setBusy(false);
    if (res.ok) {
      setReport(json.report);
      setStatus(json.status);
      setMessage("Analysis refreshed.");
    } else {
      setMessage(json.error);
    }
    router.refresh();
  }

  async function approve() {
    setBusy(true);
    await save();
    const res = await fetch(`/api/admin/cases/${initial.id}/approve`, { method: "POST" });
    const json = await res.json();
    setBusy(false);
    setMessage(res.ok ? "Delivered to customer." : json.error);
    if (res.ok) setStatus("DELIVERED");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--copper)]">{status}</p>
        <h1 className="font-serif text-3xl text-[var(--navy)]">
          {[initial.vehicleYear, initial.vehicleMake, initial.vehicleModel].filter(Boolean).join(" ") ||
            initial.vin}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {initial.vin} · {initial.mileage.toLocaleString()} mi · {initial.zip}
          {initial.email ? ` · ${initial.email}` : ""}
        </p>
        <p className="mt-2 text-sm">
          Customer link:{" "}
          <a className="underline" href={`/case/${initial.accessToken}`}>
            /case/{initial.accessToken.slice(0, 8)}…
          </a>
        </p>
      </div>

      {initial.highRiskFlags.length > 0 && (
        <aside className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
          <p className="font-semibold">High-risk flags</p>
          <ul className="mt-2 list-disc pl-5">
            {initial.highRiskFlags.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </aside>
      )}

      {initial.refundRequestedAt && (
        <aside className="rounded-xl border border-[var(--flag)] p-4 text-sm">
          Refund requested: {initial.refundReason}
        </aside>
      )}

      <section>
        <h2 className="font-serif text-2xl">Estimate files</h2>
        <ul className="mt-2 text-sm">
          {initial.files.map((f) => (
            <li key={f.id}>
              <a className="underline" href={`/api/admin/cases/${initial.id}/files/${f.id}`} target="_blank" rel="noreferrer">
                {f.originalName}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Customer notes</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm">{initial.customerExplanation || "—"}</p>
        <p className="mt-2 whitespace-pre-wrap text-sm">Mechanic said: {initial.mechanicSaid || "—"}</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Extraction</h2>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--navy)] p-4 text-xs text-white">
          {JSON.stringify(initial.extraction, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="font-serif text-2xl">NHTSA recalls</h2>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {(initial.recalls?.recalls ?? []).map((r) => (
            <li key={r.nhtsaCampaignNumber}>
              {r.nhtsaCampaignNumber} — {r.component}: {r.summary.slice(0, 180)}
            </li>
          ))}
        </ul>
      </section>

      {report && (
        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Edit draft report</h2>
          <label className="block text-sm">
            Bottom line
            <select
              className="mt-1 w-full rounded border px-3 py-2"
              value={report.bottomLine}
              onChange={(e) =>
                setReport({ ...report, bottomLine: e.target.value as CustomerReport["bottomLine"] })
              }
            >
              {BOTTOM_LINES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            What the shop wants
            <textarea
              className="mt-1 w-full rounded border px-3 py-2"
              rows={5}
              value={report.whatShopWants}
              onChange={(e) => setReport({ ...report, whatShopWants: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Consistency
            <select
              className="mt-1 w-full rounded border px-3 py-2"
              value={report.consistency}
              onChange={(e) =>
                setReport({
                  ...report,
                  consistency: e.target.value as CustomerReport["consistency"],
                })
              }
            >
              {CONSISTENCY_LABELS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Price-check language
            <textarea
              className="mt-1 w-full rounded border px-3 py-2"
              rows={4}
              value={report.priceCheck.language}
              onChange={(e) =>
                setReport({
                  ...report,
                  priceCheck: { ...report.priceCheck, language: e.target.value },
                })
              }
            />
          </label>
          <label className="block text-sm">
            Price-check rating
            <select
              className="mt-1 w-full rounded border px-3 py-2"
              value={report.priceCheck.rating}
              onChange={(e) =>
                setReport({
                  ...report,
                  priceCheck: {
                    ...report.priceCheck,
                    rating: e.target.value as CustomerReport["priceCheck"]["rating"],
                  },
                })
              }
            >
              {PRICE_CHECK_LABELS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Dealer script
            <textarea
              className="mt-1 w-full rounded border px-3 py-2"
              rows={5}
              value={report.dealerScript}
              onChange={(e) => setReport({ ...report, dealerScript: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Escalation
            <textarea
              className="mt-1 w-full rounded border px-3 py-2"
              rows={4}
              value={report.escalation}
              onChange={(e) => setReport({ ...report, escalation: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Next steps (one per line, max 5)
            <textarea
              className="mt-1 w-full rounded border px-3 py-2"
              rows={5}
              value={report.nextSteps.join("\n")}
              onChange={(e) =>
                setReport({
                  ...report,
                  nextSteps: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 5),
                })
              }
            />
          </label>
          <div className="rounded-xl border border-[var(--rule)] p-4">
            <p className="mb-2 text-sm font-medium">Preview</p>
            <ReportView report={report} />
          </div>
        </section>
      )}

      <section className="space-y-3">
        <label className="block text-sm">
          Reviewer notes
          <textarea
            className="mt-1 w-full rounded border px-3 py-2"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Status
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="rounded-full border px-4 py-2"
          >
            Save edits
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void analyze()}
            className="rounded-full border px-4 py-2"
          >
            Re-run analysis
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void approve()}
            className="rounded-full bg-[var(--copper)] px-4 py-2 text-white"
          >
            Approve and deliver
          </button>
        </div>
        {message && <p className="text-sm">{message}</p>}
      </section>
    </div>
  );
}
