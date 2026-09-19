export const PRODUCT_NAME = "Should I Pay That?";
export const PRODUCT_LINE = "Repair Investigation";
export const PRICE_USD = 149;
export const PRICE_CENTS = 14900;
export const STRIPE_PRODUCT_NAME = "Should I Pay That? — Repair Investigation";

export const SPEC_STATUSES = [
  "PAID",
  "DOCUMENTS RECEIVED",
  "ANALYZING",
  "NEEDS INFORMATION",
  "NEEDS REVIEW",
  "READY",
  "DELIVERED",
  "RESOLVED",
  "REFUNDED",
] as const;

export const ALL_STATUSES = ["AWAITING_PAYMENT", ...SPEC_STATUSES] as const;

export type CaseStatus = (typeof ALL_STATUSES)[number];

export const BOTTOM_LINES = [
  "Worth challenging before paying",
  "Worth getting another estimate",
  "Possible manufacturer coverage found",
  "Quote appears generally consistent with available evidence",
  "More information needed",
] as const;

export type BottomLine = (typeof BOTTOM_LINES)[number];

export const CONSISTENCY_LABELS = [
  "appears consistent",
  "requires additional confirmation",
  "consider second diagnostic opinion",
  "insufficient information",
] as const;

export const PRICE_CHECK_LABELS = [
  "within expected range",
  "somewhat above",
  "substantially above",
  "insufficient data",
] as const;

export const COVERAGE_STATUSES = [
  "VERIFIED RELEVANT",
  "POSSIBLY RELEVANT",
  "NOT APPLICABLE",
  "NEEDS CONFIRMATION",
] as const;

export const SAFETY_COMPONENTS = [
  "brake",
  "brakes",
  "steering",
  "tire",
  "tires",
  "airbag",
  "airbags",
  "fuel",
  "fuel leak",
  "structural",
  "frame",
  "overheating",
  "overheat",
  "fire",
  "restraint",
  "restraints",
  "seatbelt",
  "seat belt",
] as const;

export const SAFETY_DISCLAIMER =
  "Do not delay a safety-critical repair or continue driving a potentially unsafe vehicle based solely on this report. Confirm vehicle safety with a qualified automotive professional.";

export const ACCEPTED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

export const ACCEPTED_EXT = [".pdf", ".jpg", ".jpeg", ".png"];

export const OUTCOME_OPTIONS = [
  "Paid the original shop the quoted amount",
  "Paid the original shop less than quoted",
  "Went to a different shop",
  "Manufacturer, dealer, or other coverage paid some or all",
  "Have not authorized the repair yet",
  "Declined the recommended work",
  "Other",
] as const;

export const HIGH_RISK_COVERAGE_USD = 2000;
export const HIGH_RISK_SAVINGS_USD = 2000;
