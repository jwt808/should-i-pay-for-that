import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--rule)] bg-[var(--paper)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="group">
          <p className="font-serif text-lg tracking-tight text-[var(--navy)] sm:text-xl">
            Should I Pay That?
          </p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
            Repair investigation
          </p>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/#how-it-works" className="hidden text-[var(--ink)] sm:inline hover:underline">
            How it works
          </Link>
          <Link
            href="/intake"
            className="rounded-full bg-[var(--copper)] px-4 py-2 font-medium text-white hover:bg-[var(--copper-dark)]"
          >
            Investigate My Repair — $149
          </Link>
        </nav>
      </div>
    </header>
  );
}
