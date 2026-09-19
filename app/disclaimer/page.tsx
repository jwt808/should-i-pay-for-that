import { SAFETY_DISCLAIMER } from "@/lib/constants";

export const metadata = { title: "Disclaimer — Should I Pay That?" };

export default function DisclaimerPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl text-[var(--navy)]">Disclaimer</h1>
      <p className="mt-4 rounded-xl border border-[var(--flag)]/30 bg-red-50 p-4 text-[var(--flag)]">
        {SAFETY_DISCLAIMER}
      </p>
      <p className="mt-6">
        Reports may discuss brakes, steering, tires, airbags, fuel leaks,
        structural concerns, overheating, fire, or restraints. Those topics are
        safety-critical. This service does not inspect the vehicle and does not
        certify that any vehicle is safe to operate.
      </p>
      <p className="mt-4">
        We do not declare a repair unnecessary based only on automated review.
        Coverage statuses are not a legal conclusion that a manufacturer must
        pay unless the cited evidence independently establishes that.
      </p>
      <p className="mt-4">
        Price comments are limited to sourced data. If we do not have a reliable
        local comparison, the report will say insufficient data rather than
        invent a number.
      </p>
      <p className="mt-8 text-sm text-[var(--muted)]">Last updated September 19, 2026.</p>
    </article>
  );
}
