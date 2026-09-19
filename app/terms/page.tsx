export const metadata = { title: "Terms — Should I Pay That?" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl text-[var(--navy)]">Terms</h1>
      <p className="mt-4">
        Should I Pay That? sells a one-time automotive repair investigation for
        $149 USD. One purchase is one case. There is no subscription.
      </p>
      <h2 className="mt-8 font-serif text-2xl">What you are buying</h2>
      <p className="mt-3">
        A sourced written investigation of the estimate and vehicle information
        you submit, reviewed by a person before it is delivered. It is
        information, not a repair, not a warranty, and not legal advice.
      </p>
      <h2 className="mt-8 font-serif text-2xl">Money-back</h2>
      <p className="mt-3">
        If you receive your completed report and genuinely believe it wasn&apos;t
        worth the $149 price, contact us within 7 days and we&apos;ll refund your
        purchase, subject to owner approval of the actual Stripe refund. Use
        the refund request form on your case page. Submitting the form records
        your reason; it does not automatically refund the charge.
      </p>
      <h2 className="mt-8 font-serif text-2xl">Your responsibilities</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>Provide a complete, readable estimate and an accurate VIN.</li>
        <li>Do not delay a safety-critical repair based on this service.</li>
        <li>
          Confirm vehicle safety with a qualified automotive professional. We
          will never tell you a vehicle is safe to drive.
        </li>
      </ul>
      <p className="mt-8 text-sm text-[var(--muted)]">Last updated September 19, 2026.</p>
    </article>
  );
}
