"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics-client";
import type { VehicleDecode } from "@/lib/types";

type Config = {
  stripeEnabled: boolean;
  bypassEnabled: boolean;
  price: number;
};

const ACCEPT = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

export function IntakeWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [vin, setVin] = useState("");
  const [mileage, setMileage] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [explanation, setExplanation] = useState("");
  const [mechanicSaid, setMechanicSaid] = useState("");
  const [decode, setDecode] = useState<VehicleDecode | null>(null);
  const [decodeError, setDecodeError] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [config, setConfig] = useState<Config>({
    stripeEnabled: false,
    bypassEnabled: false,
    price: 149,
  });

  useEffect(() => {
    track("upload_started");
    fetch("/api/config")
      .then((r) => r.json())
      .then((data: Config) => setConfig(data))
      .catch(() => undefined);
  }, []);

  const vinClean = vin.trim().toUpperCase();
  const canStep2 = files.length > 0;
  const canStep3 = vinClean.length === 17 && Number(mileage) > 0 && /^\d{5}$/.test(zip);

  const vehicleLabel = useMemo(() => {
    const y = year || decode?.year;
    const mk = make || decode?.make;
    const md = model || decode?.model;
    return [y, mk, md].filter(Boolean).join(" ") || "Not confirmed yet";
  }, [year, make, model, decode]);

  async function lookupVin() {
    setDecodeError("");
    if (vinClean.length !== 17) {
      setDecodeError("VIN must be 17 characters.");
      return;
    }
    const res = await fetch("/api/vin/decode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vin: vinClean }),
    });
    const data = await res.json();
    if (!res.ok) {
      setDecodeError(data.error || "VIN lookup failed");
      return;
    }
    setDecode(data as VehicleDecode);
    if (data.year) setYear(String(data.year));
    if (data.make) setMake(data.make);
    if (data.model) setModel(data.model);
  }

  function onFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, 8);
    setFiles(next);
    if (next.length) track("estimate_uploaded");
  }

  async function submit(mode: "stripe" | "bypass") {
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      for (const file of files) body.append("files", file);
      body.append("vin", vinClean);
      body.append("mileage", mileage);
      body.append("zip", zip);
      body.append("email", email);
      body.append("customerExplanation", explanation);
      body.append("mechanicSaid", mechanicSaid);
      body.append("vehicleYear", year);
      body.append("vehicleMake", make);
      body.append("vehicleModel", model);
      body.append("vehicleConfirmed", confirmed ? "1" : "0");
      const intake = await fetch("/api/intake", { method: "POST", body });
      const created = await intake.json();
      if (!intake.ok) throw new Error(created.error || "Could not create case");

      track("checkout_started", { caseId: created.id });
      if (mode === "bypass") {
        const bypass = await fetch("/api/checkout/bypass", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: created.accessToken }),
        });
        const paid = await bypass.json();
        if (!bypass.ok) throw new Error(paid.error || "Bypass failed");
        track("purchase", { value: 149 });
        track("analysis_started");
        router.push(`/case/${created.accessToken}?paid=1`);
        return;
      }

      const checkout = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: created.accessToken }),
      });
      const session = await checkout.json();
      if (!checkout.ok) throw new Error(session.error || "Checkout failed");
      if (session.url) {
        window.location.href = session.url;
        return;
      }
      throw new Error("Stripe did not return a checkout URL.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--copper)]">
        Step {step} of 4
      </p>
      <h1 className="mt-2 font-serif text-3xl text-[var(--navy)]">
        Investigate this repair
      </h1>
      <p className="mt-2 text-[var(--muted)]">$149 one-time. One case.</p>

      {step === 1 && (
        <section className="mt-8 space-y-4">
          <h2 className="font-serif text-xl">Upload the estimate</h2>
          <p className="text-sm text-[var(--muted)]">PDF, JPG, JPEG, or PNG.</p>
          <label className="flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-[var(--rule)] bg-[var(--paper-strong)] px-6 py-10 text-center">
            <span className="font-medium">Drop files or tap to choose</span>
            <input
              type="file"
              accept={ACCEPT}
              multiple
              className="sr-only"
              onChange={(e) => onFiles(e.target.files)}
            />
          </label>
          <ul className="text-sm">
            {files.map((f) => (
              <li key={f.name + f.size}>
                {f.name} ({Math.round(f.size / 1024)} KB)
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={!canStep2}
            onClick={() => setStep(2)}
            className="rounded-full bg-[var(--navy)] px-5 py-2 text-white disabled:opacity-40"
          >
            Continue
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="mt-8 space-y-4">
          <h2 className="font-serif text-xl">Vehicle</h2>
          <label className="block text-sm font-medium">
            VIN
            <input
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              onBlur={() => void lookupVin()}
              maxLength={17}
              className="mt-1 w-full rounded-lg border border-[var(--rule)] bg-white px-3 py-2 uppercase"
              autoComplete="off"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Current mileage
              <input
                value={mileage}
                onChange={(e) => setMileage(e.target.value.replace(/[^\d]/g, ""))}
                inputMode="numeric"
                className="mt-1 w-full rounded-lg border border-[var(--rule)] bg-white px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium">
              ZIP
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/[^\d]/g, "").slice(0, 5))}
                inputMode="numeric"
                className="mt-1 w-full rounded-lg border border-[var(--rule)] bg-white px-3 py-2"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={() => void lookupVin()}
            className="text-sm underline"
          >
            Decode VIN with NHTSA
          </button>
          {decodeError && <p className="text-sm text-[var(--flag)]">{decodeError}</p>}
          {decode && (
            <div className="rounded-xl border border-[var(--rule)] bg-white p-4 text-sm">
              <p>
                NHTSA returned: {[decode.year, decode.make, decode.model, decode.trim]
                  .filter(Boolean)
                  .join(" ") || "incomplete"}
              </p>
              {decode.engine && <p>Engine: {decode.engine}</p>}
              {decode.uncertain && (
                <p className="mt-2 text-[var(--flag)]">
                  This decode looks uncertain. Confirm or correct the fields below
                  before we investigate.
                </p>
              )}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              Year
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--rule)] bg-white px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Make
              <input
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--rule)] bg-white px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Model
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--rule)] bg-white px-3 py-2"
              />
            </label>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I confirm this is the correct vehicle (or I corrected it above).
          </label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="underline">
              Back
            </button>
            <button
              type="button"
              disabled={!canStep3}
              onClick={() => setStep(3)}
              className="rounded-full bg-[var(--navy)] px-5 py-2 text-white disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="mt-8 space-y-4">
          <h2 className="font-serif text-xl">Anything else? (optional)</h2>
          <label className="block text-sm">
            What is going on with the car?
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-[var(--rule)] bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            What did the mechanic or advisor say?
            <textarea
              value={mechanicSaid}
              onChange={(e) => setMechanicSaid(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-[var(--rule)] bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Email (optional — so you can find this case)
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--rule)] bg-white px-3 py-2"
            />
          </label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="underline">
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="rounded-full bg-[var(--navy)] px-5 py-2 text-white"
            >
              Review & pay
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="mt-8 space-y-4">
          <h2 className="font-serif text-xl">Review</h2>
          <dl className="space-y-2 rounded-xl border border-[var(--rule)] bg-white p-4 text-sm">
            <div>
              <dt className="text-[var(--muted)]">Files</dt>
              <dd>{files.map((f) => f.name).join(", ")}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Vehicle</dt>
              <dd>
                {vehicleLabel} · VIN {vinClean} · {mileage} miles · {zip}
              </dd>
            </div>
          </dl>
          <p className="text-lg font-semibold">
            Should I Pay That? — Repair Investigation · $149
          </p>
          {!config.stripeEnabled && (
            <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
              Stripe keys are not configured. Checkout cannot charge a card
              until STRIPE_SECRET_KEY and the publishable key are set.
              {config.bypassEnabled
                ? " DEV_BYPASS_CHECKOUT is on, so you can complete a local test payment."
                : " Set DEV_BYPASS_CHECKOUT=1 for local end-to-end testing."}
            </p>
          )}
          {error && <p className="text-sm text-[var(--flag)]">{error}</p>}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => setStep(3)} className="underline">
              Back
            </button>
            {config.stripeEnabled && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void submit("stripe")}
                className="rounded-full bg-[var(--copper)] px-5 py-2 font-semibold text-white disabled:opacity-50"
              >
                {busy ? "Starting checkout…" : "Pay $149 with Stripe"}
              </button>
            )}
            {config.bypassEnabled && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void submit("bypass")}
                className="rounded-full bg-[var(--navy)] px-5 py-2 text-white disabled:opacity-50"
              >
                {busy ? "Working…" : "Complete test payment (dev bypass)"}
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
