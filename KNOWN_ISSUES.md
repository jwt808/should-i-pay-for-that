# KNOWN ISSUES

- Stripe test/live keys are not in the environment. Card checkout is stubbed with a setup message unless `DEV_BYPASS_CHECKOUT=1`.
- HEIC uploads are not converted. Customers should submit PDF/JPG/JPEG/PNG.
- SQLite on a serverless host is not durable. Swap `DATABASE_URL` to Postgres before production traffic.
- Local disk `storage/` is not shared across multiple server instances. Move to object storage before multi-instance deploy.
- VIN-specific NHTSA recall lookup is best-effort (`recallsByVehicleId`). If it fails, the app uses year/make/model and records that in draft notes.
- Heuristic extraction from photos without `OPENAI_API_KEY` leaves numeric fields null and lists uncertainties. That is intentional.
- Price check is always `insufficient data` until a reviewer adds a sourced comparison. We do not invent local rates.
- Coverage seed is small on purpose. A miss does not mean no program exists; the report says so.
- Admin cookie is a single shared password. Fine for the first reviewer, not for a team.
- Browser "Save as PDF" is the customer download path. There is no separate PDF renderer.
- Outcome and refund forms require the delivered report. They do not email the owner yet.
- `AWAITING_PAYMENT` is an extra status used before Stripe; it will appear in admin if someone abandons checkout.
