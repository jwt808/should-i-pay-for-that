import type { CustomerReport } from "@/lib/types";

export function ReportView({
  report,
  printable,
}: {
  report: CustomerReport;
  printable?: boolean;
}) {
  return (
    <article className={`space-y-8 ${printable ? "print-report" : ""}`}>
      <header className="border-b border-[var(--rule)] pb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--copper)]">
          Should I Pay That? · Repair Investigation
        </p>
        <h1 className="mt-2 font-serif text-3xl text-[var(--navy)]">
          {report.vehicleSummary}
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          {report.mileage != null ? `${report.mileage.toLocaleString()} miles` : "Mileage not on file"}
          {report.quoteAmount != null
            ? ` · quoted $${report.quoteAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            : " · quote not extracted"}
        </p>
      </header>

      {report.safetyCritical && report.safetyDisclaimer ? (
        <aside className="rounded-xl border border-[var(--flag)] bg-red-50 p-4 text-[var(--flag)]">
          <p className="font-semibold">Safety notice</p>
          <p className="mt-1">{report.safetyDisclaimer}</p>
        </aside>
      ) : null}

      <section>
        <h2 className="font-serif text-2xl text-[var(--navy)]">Our bottom line</h2>
        <p className="mt-2 text-xl font-medium">{report.bottomLine}</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-[var(--navy)]">
          What the shop wants to do
        </h2>
        <p className="mt-2 whitespace-pre-wrap">{report.whatShopWants}</p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Consistency: {report.consistency}. {report.consistencyNotes}
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-[var(--navy)]">Price check</h2>
        <p className="mt-2 font-medium">{report.priceCheck.rating}</p>
        <p className="mt-2">{report.priceCheck.language}</p>
        <ul className="mt-3 list-disc pl-5 text-sm">
          {report.priceCheck.sources.map((s) => (
            <li key={s.url}>
              <a className="underline" href={s.url} target="_blank" rel="noreferrer">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-[var(--navy)]">
          Coverage we investigated
        </h2>
        <ul className="mt-3 space-y-4">
          {report.coverage.map((c) => (
            <li key={c.name + c.status} className="rounded-lg border border-[var(--rule)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--copper)]">
                {c.status}
              </p>
              <p className="font-medium">{c.name}</p>
              <p className="mt-1 text-sm">{c.details}</p>
              <a className="mt-2 inline-block text-sm underline" href={c.sourceUrl} target="_blank" rel="noreferrer">
                Source
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-[var(--navy)]">
          What to say to the dealer or shop
        </h2>
        <blockquote className="mt-3 whitespace-pre-wrap rounded-lg bg-[var(--paper-strong)] p-4">
          {report.dealerScript}
        </blockquote>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-[var(--navy)]">If they say no</h2>
        <p className="mt-2 whitespace-pre-wrap">{report.escalation}</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-[var(--navy)]">Recommended next move</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          {report.nextSteps.slice(0, 5).map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-[var(--navy)]">Sources</h2>
        <ul className="mt-3 list-disc pl-5 text-sm">
          {report.sources.map((s) => (
            <li key={s.url + s.title}>
              <a className="underline" href={s.url} target="_blank" rel="noreferrer">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
