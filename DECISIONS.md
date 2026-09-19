# DECISIONS — Should I Pay That?

Record material architectural and product defaults here. Do not silently change offer, price, positioning, or safety rules.

## 2026-09-18 — Stack and delivery

- **App**: Next.js (App Router) + TypeScript + Tailwind. Single deployable web app for marketing + customer + admin.
- **Repo**: New private Cursor Origin repository (greenfield). Source of truth stays on Origin.
- **Database**: SQLite via Prisma for zero-config local/MVP deployability; schema designed so Postgres swap is a connection-string change later.
- **Auth (customer)**: Magic-link / email + case access token after purchase (no heavy account system). Case ID + secret token in URL for report access.
- **Auth (admin)**: Single admin password via env `ADMIN_PASSWORD` + session cookie. Adequate for first customers; multi-user later.
- **Payments**: Stripe Checkout Session, one-time $149 USD, product name "Should I Pay That? — Repair Investigation". Webhook creates/updates case to PAID.
- **Files**: Local disk `/uploads` (or project `storage/`) for MVP; S3-compatible later. Accept PDF/JPG/JPEG/PNG; HEIC convert when possible.
- **AI**: Provider-neutral `decisionEngine` + separate extraction/reasoning calls via OpenAI-compatible API (env keys). Deterministic eligibility rules in TypeScript. No Jev dependency.
- **Evidence**: NHTSA public APIs first (VIN decode, recalls). `coverage_programs` seeded from documented public sources only, with source URLs.
- **Hosting target**: Vercel (or Origin-connected Vercel) when credentials/domain available; app must run locally with `npm run dev` and `npm run build` always green.
- **Analytics**: Env-driven Meta Pixel + gtag stubs; fire events only when IDs present.
- **Money-back copy**: 7-day “not worth it” refund request form → status REFUNDED request for owner approval (no automatic Stripe refunds).

## Non-negotiables (from owner)

- Price remains $149 one-time
- Automotive repair investigation only
- No fabricated pricing or coverage programs
- No scraping proprietary shop databases
- Safety-critical disclaimer language required where applicable
- Do not market as an AI product

## 2026-09-18 — Repository location

- GitHub repo: https://github.com/jwt808/should-i-pay-for-that (created by owner while signing in; name includes "for"; visibility Public as created). Origin namespace still unavailable for greenfield new_repo.

## 2026-09-19 — MVP implementation

- **GitHub repo confirmed**: [jwt808/should-i-pay-for-that](https://github.com/jwt808/should-i-pay-for-that) is the working repository for this product.
- **Framework versions**: Next.js 16 App Router, React 19, Tailwind 4, Prisma 6, SQLite. Chosen because `create-next-app` current defaults stay buildable; no reason to pin an older major.
- **Pre-payment status**: Cases are created as `AWAITING_PAYMENT` (not in the spec enum) so an unpaid upload exists before Stripe. Spec statuses apply from `PAID` onward. Documented here so we do not pretend the spec enum was complete for checkout.
- **Human review**: Every paid investigation ends in `NEEDS REVIEW` or `NEEDS INFORMATION`. High-risk flags always keep `reviewRequired=true`. Admin approve sets `DELIVERED`.
- **Price check**: Deterministic rule returns `insufficient data` unless a reviewer edits in a sourced comparison. No invented shop rates.
- **Coverage seed**: Seven sourced programs only (Hyundai TXXM, Hyundai TXXI/settlement comms, Kia settlement, Kia Soul KSDS letter, Nissan CVT 84/84 bulletin, Toyota MY2020+ hybrid battery warranty, Takata recall spotlight). Fewer is correct; nothing unverified was added.
- **Files**: Stored under project `storage/{caseId}/`.
- **LLM**: Optional OpenAI-compatible vision/JSON. If `OPENAI_API_KEY` is missing, heuristic/stub extraction still emits valid schema JSON with `extraction_uncertainties`.
- **Stripe bypass**: `DEV_BYPASS_CHECKOUT=1` marks the case paid and runs investigation without Stripe. Used for local E2E.
- **Refunds**: Customer form stores reason + timestamp. Does not call Stripe refunds. Admin may set status `REFUNDED` after owner approval.
- **Outcomes**: Non-identifying `Outcome` rows (year/make/model/category/quoted/what happened/amount paid). No extra PII fields.
- **HEIC**: Not converted in this MVP (accepted types are PDF/JPG/JPEG/PNG as required).
