import {
  HIGH_RISK_COVERAGE_USD,
  HIGH_RISK_SAVINGS_USD,
} from "../constants";
import { isSafetyCritical } from "../safety";
import type { BottomLine } from "../constants";
import type { HighRiskAssessment, InvestigationContext } from "./types";

export function assessHighRisk(context: InvestigationContext): HighRiskAssessment {
  const flags: string[] = [];
  const quote = context.extraction.total_quote;
  const relevantCoverage = context.coverage.filter((c) =>
    ["VERIFIED RELEVANT", "POSSIBLY RELEVANT", "NEEDS CONFIRMATION"].includes(
      c.status,
    ),
  );

  if (quote != null && quote > HIGH_RISK_COVERAGE_USD) {
    flags.push(`Quoted amount exceeds $${HIGH_RISK_COVERAGE_USD.toLocaleString()}.`);
  }
  if (relevantCoverage.some((c) => c.status !== "VERIFIED RELEVANT")) {
    flags.push("Coverage eligibility is unclear and needs human confirmation.");
  }
  if (isSafetyCritical({
    extraction: context.extraction,
    recalls: context.recalls,
    repairCategory: context.repairCategory,
    customerExplanation: context.customerExplanation,
    mechanicSaid: context.mechanicSaid,
  })) {
    flags.push("Safety-critical system language is present.");
  }
  if (context.vehicle.uncertain || !context.vehicle.confirmed) {
    flags.push("VIN applicability is unclear or not yet confirmed.");
  }
  if (context.extraction.extraction_uncertainties.length) {
    flags.push("Low extraction confidence or missing estimate fields.");
  }
  if (quote != null && quote > HIGH_RISK_SAVINGS_USD && relevantCoverage.length) {
    flags.push(
      `Possible savings discussion involves more than $${HIGH_RISK_SAVINGS_USD.toLocaleString()}; do not promise that amount.`,
    );
  }
  if (relevantCoverage.some((c) => /settlement/i.test(c.name + c.details))) {
    flags.push("Settlement language is present and must stay qualified.");
  }
  if (context.extractionMethod === "heuristic") {
    flags.push("Draft used heuristic/stub extraction rather than a reviewed vision model.");
  }

  const confidence: HighRiskAssessment["confidence"] =
    flags.length >= 3 ? "low" : flags.length === 0 ? "high" : "medium";

  return {
    flags,
    reviewRequired: true,
    confidence,
  };
}

export function chooseBottomLine(context: InvestigationContext): BottomLine {
  const quote = context.extraction.total_quote;
  const hasPossibleCoverage = context.coverage.some((c) =>
    ["VERIFIED RELEVANT", "POSSIBLY RELEVANT", "NEEDS CONFIRMATION"].includes(
      c.status,
    ),
  );
  const weakExtract = context.extraction.extraction_uncertainties.length > 2;
  if (weakExtract || context.vehicle.uncertain || quote == null) {
    return "More information needed";
  }
  if (hasPossibleCoverage) {
    return "Possible manufacturer coverage found";
  }
  if (quote >= 2500) {
    return "Worth getting another estimate";
  }
  return "Quote appears generally consistent with available evidence";
}

export function chooseConsistency(context: InvestigationContext) {
  if (context.extraction.extraction_uncertainties.length || !context.extraction.diagnosis.length) {
    return "insufficient information" as const;
  }
  if (context.vehicle.uncertain) {
    return "requires additional confirmation" as const;
  }
  if (context.extraction.diagnosis.length && context.extraction.recommended_repairs.length) {
    return "requires additional confirmation" as const;
  }
  return "insufficient information" as const;
}

export function priceCheckLanguage() {
  return {
    rating: "insufficient data" as const,
    language:
      "We do not have a licensed local labor/parts database for this ZIP. No shop-rate or parts price was invented. The price check is therefore insufficient data until a sourced local comparison is added during review.",
    sources: [
      {
        title: "NHTSA public vehicle data (not a pricing source)",
        url: "https://www.nhtsa.gov/nhtsa-datasets-and-apis",
      },
    ],
  };
}
