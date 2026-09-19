import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--rule)] bg-[var(--navy)] text-[var(--paper)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-serif text-lg">Should I Pay That?</p>
          <p className="mt-1 max-w-sm text-sm text-white/70">
            Independent review of an expensive automotive repair estimate. We
            don&apos;t work for the repair shop. We work for you.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80">
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
          <Link href="/disclaimer" className="hover:text-white">
            Disclaimer
          </Link>
          <Link href="/admin/login" className="hover:text-white">
            Reviewer
          </Link>
        </div>
      </div>
    </footer>
  );
}
