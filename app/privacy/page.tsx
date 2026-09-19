export const metadata = { title: "Privacy — Should I Pay That?" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl text-[var(--navy)]">Privacy</h1>
      <p className="mt-4 text-[var(--muted)]">
        Should I Pay That? collects only what we need to investigate one repair
        case: the estimate you upload, VIN, mileage, ZIP, optional email, and
        any explanation you provide.
      </p>
      <h2 className="mt-8 font-serif text-2xl">What we store</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>Case files on disk for the investigation and human review.</li>
        <li>Vehicle data returned by NHTSA&apos;s public VIN decoder.</li>
        <li>Payment references from Stripe when you check out.</li>
        <li>
          Optional follow-up outcomes stored without extra identifying fields
          beyond the case link.
        </li>
      </ul>
      <h2 className="mt-8 font-serif text-2xl">Who we share with</h2>
      <p className="mt-3">
        Stripe processes payment. NHTSA public APIs receive VIN or year, make,
        and model for decode and recall lookup. We do not sell your estimate or
        VIN. We do not scrape or submit your documents to proprietary shop
        databases.
      </p>
      <h2 className="mt-8 font-serif text-2xl">Access</h2>
      <p className="mt-3">
        Your case is available through a secret link. Anyone with that link can
        view the case. Keep it private. Optional email is used only to help you
        find the case if you lose the link.
      </p>
      <p className="mt-8 text-sm text-[var(--muted)]">Last updated September 19, 2026.</p>
    </article>
  );
}
