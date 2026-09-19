# Should I Pay That?

Independent investigation of expensive automotive repair estimates. **$149 one-time.** Domain target: [ShouldIPayThat.com](https://shouldipaythat.com).

This repository is [jwt808/should-i-pay-for-that](https://github.com/jwt808/should-i-pay-for-that).

Product rules live in `PRODUCT_SPEC.md`. Stack and material choices live in `DECISIONS.md`.

## What this app does

A visitor can upload a repair estimate, enter VIN / mileage / ZIP, pay $149 (or use the local bypass), get an investigation draft, wait for admin review, then read a sourced customer report.

It does **not** sell subscriptions, other verticals, or ads. It does not scrape ALLDATA / Mitchell1 / Identifix. It does not invent prices or coverage programs. It never says a vehicle is safe to drive.

## Setup

```bash
cp .env.example .env
# edit .env — at minimum set ADMIN_PASSWORD and DEV_BYPASS_CHECKOUT=1
npm install
npm run db:setup
npm run dev
```

Open http://localhost:3000

`npm run db:setup` runs `prisma db push` and seeds documented `coverage_programs` only.

## Environment

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Prisma connection. Default `file:./dev.db` (SQLite). |
| `NEXT_PUBLIC_APP_URL` | Yes in prod | Public origin for Stripe redirects. |
| `ADMIN_PASSWORD` | Yes for `/admin` | Shared reviewer password. |
| `STRIPE_SECRET_KEY` | For real checkout | Stripe secret. |
| `STRIPE_WEBHOOK_SECRET` | For real checkout | Webhook signing secret. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For Stripe.js later | Publishable key (Checkout Session redirect does not require it). |
| `DEV_BYPASS_CHECKOUT` | Local E2E | Set to `1` to mark paid without Stripe. |
| `OPENAI_API_KEY` | Optional | Vision/LLM extraction + report polish. Compatible `OPENAI_BASE_URL` / `OPENAI_MODEL` supported. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Optional | Meta Pixel. Events fire only when set. |
| `NEXT_PUBLIC_GA_ID` | Optional | gtag / Google Analytics. |

## Local Stripe webhook

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Put the CLI signing secret in `STRIPE_WEBHOOK_SECRET`. Checkout success is `checkout.session.completed`, which marks the case **PAID** (then **DOCUMENTS RECEIVED** if files exist) and runs the investigation.

Without Stripe keys the pay step shows a setup message. The rest of the UI still works.

## Test a case with `DEV_BYPASS_CHECKOUT`

1. Set `DEV_BYPASS_CHECKOUT=1` and `ADMIN_PASSWORD` in `.env`.
2. `npm run db:setup && npm run dev`
3. Open `/intake`.
4. Upload `fixtures/sample-estimate-transmission.pdf` (or the brakes fixture).
5. Enter a real 17-character VIN (your own, or any VIN you are allowed to decode). Mileage and a 5-digit ZIP are required. Confirm year/make/model if NHTSA is uncertain.
6. On the review step choose **Complete test payment (dev bypass)**.
7. You land on `/case/{token}`. Status should move to **NEEDS REVIEW** (or **NEEDS INFORMATION** if the VIN is still uncertain).
8. Sign in at `/admin/login` and open the case. Review the estimate, extraction, vehicle, and draft. Edit if needed. **Approve and deliver**.
9. Reload the customer case link. Open the printable report. Try the refund-request and outcome forms (refund does **not** call Stripe).

## Scripts

- `npm run dev` — local server
- `npm run build` — production build (`prisma generate` + `next build`)
- `npm run db:push` — sync SQLite schema
- `npm run db:seed` — replace coverage seed with the sourced programs
- `npm run db:setup` — push + seed

## Product docs

- `PRODUCT_SPEC.md` — offer, report, safety, statuses
- `DECISIONS.md` — stack and non-negotiables
- `STATUS.md` — completed / blockers / next three
- `DATA_SOURCES.md` — NHTSA and seeded program URLs
- `LAUNCH_CHECKLIST.md`
- `KNOWN_ISSUES.md`
- `AD_TESTS.md` — draft only; do not publish ads without owner approval
