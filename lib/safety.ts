import { SAFETY_COMPONENTS, SAFETY_DISCLAIMER } from "./constants";
import type { EstimateExtraction, NhtsaRecall } from "./types";

export function isSafetyCritical(input: {
  extraction: EstimateExtraction | null;
  recalls: NhtsaRecall[];
  repairCategory: string;
  customerExplanation?: string | null;
  mechanicSaid?: string | null;
}) {
  const blob = [
    input.repairCategory,
    input.customerExplanation ?? "",
    input.mechanicSaid ?? "",
    input.extraction?.customer_complaint ?? "",
    ...(input.extraction?.diagnosis ?? []),
    ...(input.extraction?.recommended_repairs ?? []).map(
      (r) => `${r.description} ${r.component}`,
    ),
    ...input.recalls.map((r) => `${r.component} ${r.summary}`),
  ]
    .join(" ")
    .toLowerCase();

  return SAFETY_COMPONENTS.some((term) => blob.includes(term));
}

export function safetyDisclaimerIfNeeded(critical: boolean) {
  return critical ? SAFETY_DISCLAIMER : null;
}
