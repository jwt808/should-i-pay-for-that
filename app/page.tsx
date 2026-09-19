"use client";

import Link from "next/link";
import { useEffect } from "react";
import { track } from "@/lib/analytics-client";

export default function HomePage() {
  useEffect(() => {
    track("landing_view");
  }, []);

  return (
    <div>
      <section className="border-b border-[var(--rule)] bg-[var(--navy)] text-[var(--paper)]">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <p className="text-xs uppercase tracking-[0.22em] text-white/60">
            One repair investigation. One-time payment.
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.1] sm:text-6xl">
            Got a big car repair quote?
            <span className="block text-[var(--paper)]">Don&apos;t approve it yet.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80 sm:text-xl">
            Send us the estimate. We&apos;ll investigate the repair, the pricing,
            and whether a recall, warranty extension, manufacturer program,
            settlement, or other coverage may apply.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/intake"
              className="inline-flex items-center justify-center rounded-full bg-[var(--copper)] px-6 py-3 text-base font-semibold text-white hover:bg-[var(--copper-dark)]"
            >
              Investigate My Repair — $149
            </Link>
            <p className="text-sm text-white/65">
              One purchase = one case. No subscription.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <blockquote className="border-l-4 border-[var(--copper)] pl-5 font-serif text-2xl text-[var(--navy)] sm:text-3xl">
          We don&apos;t work for the repair shop. We work for you.
        </blockquote>
        <p className="mt-4 max-w-2xl text-[var(--muted)]">
          An independent review of the document you already have — before you
          authorize expensive work. We are not the shop, the dealer, or the
          manufacturer.
        </p>
      </section>

      <section id="how-it-works" className="border-y border-[var(--rule)] bg-[var(--paper-strong)]">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-14 sm:grid-cols-3">
          {[
            {
              n: "1",
              t: "Send the quote",
              d: "Upload the estimate, VIN, mileage, and ZIP. Add what the mechanic told you if you want.",
            },
            {
              n: "2",
              t: "We investigate",
              d: "We review the recommended work, look at public recall and program records, and draft a sourced report for human review.",
            },
            {
              n: "3",
              t: "Know what to do next",
              d: "You get a plain-English bottom line, a dealer script, and up to five specific next steps.",
            },
          ].map((step) => (
            <div key={step.n}>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--copper)]">
                Step {step.n}
              </p>
              <h2 className="mt-2 font-serif text-2xl text-[var(--navy)]">{step.t}</h2>
              <p className="mt-2 text-[var(--muted)]">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
          Illustrative example — not a real customer case
        </p>
        <div className="mt-4 grid gap-6 rounded-2xl border border-[var(--rule)] bg-[var(--paper-strong)] p-6 sm:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl text-[var(--navy)]">
              Example: $6,700 transmission quote
            </h2>
            <p className="mt-3 text-[var(--muted)]">
              A shop recommends replacing a CVT on a mid-mileage Nissan. The
              illustrative report would restate the diagnosis in plain English,
              mark the price check as insufficient data unless sourced local
              rates exist, and check whether a documented CVT warranty
              extension could still apply — without inventing a savings number
              or calling the vehicle safe to drive.
            </p>
          </div>
          <ol className="space-y-3 text-sm">
            <li>
              <strong>Bottom line (example):</strong> Possible manufacturer
              coverage found — confirm by VIN.
            </li>
            <li>
              <strong>Price check (example):</strong> Insufficient data. No
              fabricated local labor rate.
            </li>
            <li>
              <strong>Next move (example):</strong> Ask the dealer to search
              campaigns against the VIN and put the answer in writing.
            </li>
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="rounded-2xl bg-[var(--navy)] px-6 py-10 text-[var(--paper)] sm:px-10">
          <h2 className="font-serif text-3xl">What you receive</h2>
          <ul className="mt-5 grid gap-3 text-white/85 sm:grid-cols-2">
            <li>What the shop is recommending, in plain English</li>
            <li>Whether the write-up is consistent enough to act on</li>
            <li>A price check that cites sources — or says data is insufficient</li>
            <li>Coverage investigation with verified / possible / not applicable / needs confirmation</li>
            <li>Exact language to use with the dealer or shop</li>
            <li>If they say no — escalation steps</li>
          </ul>
          <Link
            href="/intake"
            className="mt-8 inline-flex rounded-full bg-[var(--copper)] px-6 py-3 font-semibold text-white hover:bg-[var(--copper-dark)]"
          >
            Investigate My Repair — $149
          </Link>
        </div>
        <p className="mt-6 max-w-3xl text-sm text-[var(--muted)]">
          This is not a promise of savings, a mechanic-scam detector, or a
          diagnosis. Safety-critical systems (brakes, steering, tires, airbags,
          fuel leaks, structural damage, overheating, fire, restraints) require
          a qualified professional. We will never tell you the vehicle is safe
          to drive.
        </p>
      </section>
    </div>
  );
}
