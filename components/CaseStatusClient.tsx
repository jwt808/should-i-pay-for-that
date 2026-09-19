"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics-client";
import { OUTCOME_OPTIONS } from "@/lib/constants";
import type { CustomerReport } from "@/lib/types";

type CasePayload = {
  status: string;
  vin: string;
  mileage: number;
  zip: string;
  vehicleYear: number | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vinUncertain: boolean;
  vehicleConfirmed: boolean;
  quotedPrice: number | null;
  refundRequestedAt: string | null;
  report: CustomerReport | null;
  files: Array<{ id: string; originalName: string }>;
  hasOutcome: boolean;
};

export function CaseStatusClient({ token, paid }: { token: string; paid?: boolean }) {
  const [data, setData] = useState<CasePayload | null>(null);
  const [error, setError] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [whatHappened, setWhatHappened] = useState<(typeof OUTCOME_OPTIONS)[number]>(
    OUTCOME_OPTIONS[0],
  );
  const [amountPaid, setAmountPaid] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch(`/api/cases/${token}`);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Case not found");
      return;
    }
    setData(json);
    setYear(json.vehicleYear ? String(json.vehicleYear) : "");
    setMake(json.vehicleMake || "");
    setModel(json.vehicleModel || "");
  }

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 4000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (paid) track("purchase", { value: 149 });
  }, [paid]);

  useEffect(() => {
    if (data?.status === "DELIVERED" || data?.status === "RESOLVED") {
      track("report_delivered");
    }
  }, [data?.status]);

  if (error) {
    return <p className="mx-auto max-w-2xl px-4 py-12 text-[var(--flag)]">{error}</p>;
  }
  if (!data) {
    return <p className="mx-auto max-w-2xl px-4 py-12">Loading your case…</p>;
  }

  const delivered = data.status === "DELIVERED" || data.status === "RESOLVED";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--copper)]">Your case</p>
      <h1 className="mt-2 font-serif text-3xl text-[var(--navy)]">
        {[data.vehicleYear, data.vehicleMake, data.vehicleModel].filter(Boolean).join(" ") ||
          "Repair investigation"}
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        Status: <strong>{data.status}</strong> · VIN {data.vin} · {data.mileage.toLocaleString()} miles · {data.zip}
      </p>

      <ul className="mt-4 text-sm">
        {data.files.map((f) => (
          <li key={f.id}>
            <a className="underline" href={`/api/cases/${token}/files/${f.id}`} target="_blank" rel="noreferrer">
              {f.originalName}
            </a>
          </li>
        ))}
      </ul>

      {data.status === "NEEDS INFORMATION" || (data.vinUncertain && !data.vehicleConfirmed) ? (
        <form
          className="mt-8 space-y-3 rounded-xl border border-[var(--rule)] bg-white p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await fetch(`/api/cases/${token}/confirm-vehicle`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ year, make, model }),
            });
            const json = await res.json();
            setMessage(res.ok ? "Vehicle confirmed. We will refresh the investigation." : json.error);
            void load();
          }}
        >
          <h2 className="font-serif text-xl">Confirm the vehicle</h2>
          <p className="text-sm text-[var(--muted)]">
            The VIN decode was uncertain. Correct the year, make, and model so we can search the right records.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <input className="rounded border px-3 py-2" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" />
            <input className="rounded border px-3 py-2" value={make} onChange={(e) => setMake(e.target.value)} placeholder="Make" />
            <input className="rounded border px-3 py-2" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model" />
          </div>
          <button className="rounded-full bg-[var(--navy)] px-4 py-2 text-white" type="submit">
            Confirm vehicle
          </button>
        </form>
      ) : null}

      {!delivered && (
        <p className="mt-8 rounded-xl bg-[var(--paper-strong)] p-4 text-sm">
          {data.status === "AWAITING_PAYMENT"
            ? "Payment has not been recorded yet."
            : "A person is reviewing the draft investigation. You will see the report here when it is delivered."}
        </p>
      )}

      {delivered && data.report && (
        <div className="mt-8">
          <div className="mb-4 flex gap-3">
            <Link className="underline" href={`/case/${token}/report`}>
              Open printable report
            </Link>
          </div>
          <p className="font-serif text-2xl">{data.report.bottomLine}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Open the printable page for the full sourced report.
          </p>
        </div>
      )}

      {delivered && (
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const res = await fetch(`/api/cases/${token}/refund`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: refundReason }),
              });
              const json = await res.json();
              if (res.ok) {
                track("refund_requested");
                setMessage("Refund request recorded. The owner must approve the actual refund.");
              } else {
                setMessage(json.error);
              }
              void load();
            }}
          >
            <h2 className="font-serif text-xl">7-day money-back request</h2>
            <p className="text-sm text-[var(--muted)]">
              If you received your completed report and genuinely believe it
              wasn&apos;t worth the $149 price, contact us within 7 days and
              we&apos;ll refund your purchase. This form records your reason. It
              does not automatically refund Stripe.
            </p>
            {data.refundRequestedAt ? (
              <p className="text-sm">A refund request is already on file.</p>
            ) : (
              <>
                <textarea
                  className="w-full rounded border px-3 py-2"
                  rows={4}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Why wasn't the report worth $149?"
                />
                <button className="rounded-full border border-[var(--navy)] px-4 py-2" type="submit">
                  Request refund review
                </button>
              </>
            )}
          </form>

          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const res = await fetch(`/api/cases/${token}/outcome`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ whatHappened, amountPaid }),
              });
              const json = await res.json();
              if (res.ok) {
                track("outcome_reported");
                setMessage("Outcome saved. Thank you.");
              } else {
                setMessage(json.error);
              }
              void load();
            }}
          >
            <h2 className="font-serif text-xl">What happened with your repair?</h2>
            <select
              className="w-full rounded border px-3 py-2"
              value={whatHappened}
              onChange={(e) => setWhatHappened(e.target.value as (typeof OUTCOME_OPTIONS)[number])}
            >
              {OUTCOME_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <label className="block text-sm">
              What did you ultimately pay? (optional)
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                inputMode="decimal"
              />
            </label>
            <button
              className="rounded-full bg-[var(--navy)] px-4 py-2 text-white disabled:opacity-40"
              type="submit"
              disabled={data.hasOutcome}
            >
              {data.hasOutcome ? "Outcome already recorded" : "Save outcome"}
            </button>
          </form>
        </div>
      )}

      {message && <p className="mt-6 text-sm">{message}</p>}
    </div>
  );
}
