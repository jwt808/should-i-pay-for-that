# STATUS — Should I Pay That?

Last updated: 2026-09-19

## Completed

- Product specification locked (MVP: $149 one-time automotive repair investigation only)
- Project docs in repo root
- GitHub repo: https://github.com/jwt808/should-i-pay-for-that
- Deployable Next.js App Router + TypeScript + Tailwind + Prisma/SQLite app
- Landing, Privacy, Terms, Disclaimer
- Intake (files, VIN, mileage, ZIP, optional notes/email) + case record + disk storage
- NHTSA vPIC VIN decode + year/make/model (and VIN-attempt) recall lookup
- Stripe Checkout $149 + webhook; `DEV_BYPASS_CHECKOUT=1` local path
- Structured extraction schema (LLM if keyed, else heuristic/stub)
- Provider-neutral `decisionEngine` + deterministic rules (no fabricated prices)
- `coverage_programs` seed from documented public sources only
- Draft customer report with spec sections + safety disclaimer when triggered
- Admin password session, queue, view/edit, approve → DELIVERED
- Customer case token page, printable report, refund request, outcome form
- Analytics stubs for Meta Pixel / GA when IDs are set
- Sample anonymized estimate fixtures

## Currently working on

- First real test cases through admin → delivered report
- Stripe test-mode keys when the owner provides them

## Blockers

- Stripe keys (test + eventually live) — needed before real checkout
- Domain ShouldIPayThat.com DNS/hosting — production URL later
- Meta Pixel / Google Ads IDs — Priority 6 later
- Note: preferred name was should-i-pay-that; actual repo is should-i-pay-for-that

## Next three highest-priority actions

1. Add Stripe test keys and verify Checkout + webhook end-to-end
2. Run manual test cases (transmission fixture + brake fixture + a real VIN) through admin → delivered report
3. Point ShouldIPayThat.com at a production deploy once keys and domain are ready
