# SHOULD I PAY THAT? — PRODUCT SPECIFICATION (AUTHORITATIVE)

Product website: ShouldIPayThat.com
Price: $149 one-time per repair case
Offer: Investigate expensive automotive repair estimates before the consumer authorizes the work.

## THE ONLY OFFER (MVP)
Customer uploads: mechanic/dealer repair estimate, VIN, current mileage, ZIP code, optional explanation.
NOT: subscription, membership, medical/home/insurance software, general financial assistant.

## CORE PROMISE
Primary: Got a big car repair quote? Don't approve it yet.
Secondary: Send us the estimate. We'll investigate the repair, the pricing, and whether a recall, warranty extension, manufacturer program, settlement or other coverage may apply.
CTA: Investigate My Repair — $149
Do not market as an AI product. AI is infrastructure.

## WHAT THE CUSTOMER RECEIVES
1. WHAT IS THE SHOP RECOMMENDING? — extract diagnosis, components, parts, labor, fees, total, technician comments; plain English.
2. CONSISTENCY — appears consistent / requires additional confirmation / consider second diagnostic opinion / insufficient information. NEVER declare unnecessary based only on AI. NEVER state vehicle is safe to drive.
3. PRICE CHECK — within expected range / somewhat above / substantially above / insufficient data. Do not fabricate local pricing. Show sources.
4. COVERAGE INVESTIGATION — recalls, TSBs, manufacturer communications, warranty/policy extensions, CSPs, campaigns, settlements, emissions warranty, assistance programs. Statuses: VERIFIED RELEVANT | POSSIBLY RELEVANT | NOT APPLICABLE | NEEDS CONFIRMATION. Never claim manufacturer legally required to pay unless evidence establishes it.

## DATA SOURCES (priority)
NHTSA VIN decoding, recalls, manufacturer communications, TSB data; OEM sites/warranty docs; public campaigns/settlements/filings; reliable repair pricing sources.
DO NOT scrape: ALLDATA, Mitchell1, Identifix, proprietary shop software, authenticated paid DBs. No access control bypass.

## coverage_programs DATABASE
Fields: manufacturer, vehicle models, model years, engine, transmission, component, failure/symptom, program type, program name, program number, eligibility conditions, mileage/age limits, VIN limitations, required diagnostic procedure, coverage description, reimbursement availability, source URL, source organization, source publication date, last verified date, notes, confidence level. Every program must have a source. Never invent programs. Priority: engine, transmission/CVT, major AC, hybrid battery, major electronic modules, expensive emissions, known extended-warranty issues.

## DOCUMENT UPLOAD
PDF, JPG, JPEG, PNG, HEIC where practical. Handle phone screenshots, photos, rotated docs, multi-page, imperfect scans. Low extraction confidence → ask customer to confirm before analysis.

## STRUCTURED EXTRACTION SCHEMA
{
  "shop_name": "",
  "shop_type": "dealer|independent|unknown",
  "estimate_date": "",
  "total_quote": null,
  "vehicle_description": "",
  "customer_complaint": "",
  "diagnosis": [],
  "recommended_repairs": [{
    "description": "", "component": "", "part_numbers": [],
    "parts_cost": null, "labor_hours": null, "labor_cost": null,
    "fees": null, "subtotal": null, "technician_notes": ""
  }],
  "tax": null,
  "misc_fees": [],
  "extraction_uncertainties": []
}
Missing numbers remain null. Never guess.

## VEHICLE DATA
Decode VIN: year, make, model, trim, engine, transmission, drivetrain, manufacturing info. Confirm with user if uncertain.

## AI ARCHITECTURE
- Vision/extraction model for estimate
- Retrieval layer for authoritative evidence
- decisionEngine provider-neutral interface (LLM structured output + deterministic rules; Jev later optional — MVP must NOT depend on Jev)
- Deterministic rules in code for explicit eligibility math
- Final reasoning model produces customer-facing analysis

## HUMAN REVIEW
AI draft → admin review → approve/edit → customer receives. High-risk auto-require review: coverage >$2k, unclear eligibility, safety-critical, conflicting sources, unclear VIN applicability, savings claim >$2k, ambiguous settlement, low AI confidence.

## CUSTOMER REPORT
Header SHOULD I PAY THAT? / Repair Investigation with vehicle, mileage, quote.
OUR BOTTOM LINE — one of: Worth challenging before paying | Worth getting another estimate | Possible manufacturer coverage found | Quote appears generally consistent with available evidence | More information needed
Sections: What the shop wants to do | Price check (with sources) | Coverage we investigated | What to say to the dealer/shop (exact script) | If they say no (escalation) | Recommended next move (max 5 specific steps)

## SAFETY
For brakes, steering, tires, airbags, fuel leaks, structural, overheating, fire, restraints — prominent disclaimer: Do not delay a safety-critical repair or continue driving a potentially unsafe vehicle based solely on this report. Confirm vehicle safety with a qualified automotive professional. Never tell customer vehicle is safe to drive.

## PAYMENT
Stripe. Product: Should I Pay That? — Repair Investigation. $149 one-time. One purchase = one case. No recurring.

## MONEY-BACK
If you receive your completed report and genuinely believe it wasn't worth the $149 price, contact us within 7 days and we'll refund your purchase. Track refund reason. (Owner must approve actual refunds.)

## LANDING PAGE
Hero: Got a big car repair quote? / Don't approve it yet. / Send us the estimate... / Investigate My Repair — $149 / One repair investigation. One-time payment.
How it works: 1 Send quote 2 We investigate 3 Know what to do next
Positioning: We don't work for the repair shop. We work for you.
Avoid: AI-powered, revolutionary AI, AI mechanic, guaranteed savings, beat your mechanic, mechanic scam detector, we'll save you thousands.
Include clearly labeled illustrative example.

## ACCOUNT FLOW
Active case, analysis status, upload requested docs, read/download/share report, follow-up info, report outcome. Simple — no elaborate dashboard.

## ADMIN DASHBOARD
customer, estimate, vehicle, mileage, repair category, quoted price, purchase status, analysis status, potential coverage, report confidence, review required, reviewer notes, customer outcome.
Statuses: PAID | DOCUMENTS RECEIVED | ANALYZING | NEEDS INFORMATION | NEEDS REVIEW | READY | DELIVERED | RESOLVED | REFUNDED

## OUTCOME DATABASE
Non-identifying structured outcomes for every completed case. Follow-up: What happened with your repair? + What did you ultimately pay?

## ANALYTICS
Meta Pixel, Google Ads conversion, Analytics. Events: landing_view, upload_started, estimate_uploaded, checkout_started, purchase (value 149), analysis_started, report_delivered, outcome_reported, refund_requested.

## LAUNCH REQUIREMENTS
Stranger can upload; VIN decode; payment works; extraction works; NHTSA/public search; AI draft report; admin review/edit; customer receives report; sources displayed; Meta Pixel purchase; refund flow; privacy/terms/disclaimer; mobile works; ≥10 test cases through full pipeline.

## PRIORITY ORDER
1 Customer can buy → 2 upload → 3 investigate → 4 human verify → 5 high-quality report → 6 ads measure purchases. Everything else waits.

## OWNER APPROVAL REQUIRED
Do NOT: spend ad money, publish ads, change $149, send refunds, sign commercial data agreements, buy expensive third-party software, make legal representations, publish fabricated testimonials, access proprietary auto DBs without authorization.
