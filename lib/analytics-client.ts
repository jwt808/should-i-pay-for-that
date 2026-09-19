"use client";

type EventName =
  | "landing_view"
  | "upload_started"
  | "estimate_uploaded"
  | "checkout_started"
  | "purchase"
  | "analysis_started"
  | "report_delivered"
  | "outcome_reported"
  | "refund_requested";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: EventName, extra?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  if (!pixel && !ga) return;

  if (pixel && window.fbq) {
    if (event === "purchase") {
      window.fbq("track", "Purchase", {
        value: 149,
        currency: "USD",
        ...extra,
      });
    } else {
      window.fbq("trackCustom", event, extra);
    }
  }
  if (ga && window.gtag) {
    window.gtag("event", event, {
      value: event === "purchase" ? 149 : undefined,
      currency: event === "purchase" ? "USD" : undefined,
      ...extra,
    });
  }
}
