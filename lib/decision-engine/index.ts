import { BOTTOM_LINES } from "../constants";
import { extractEstimate } from "../extraction";
import { openaiConfigured } from "../env";
import { isSafetyCritical, safetyDisclaimerIfNeeded } from "../safety";
import type { CustomerReport } from "../types";
import {
  chooseBottomLine,
  chooseConsistency,
  priceCheckLanguage,
} from "./rules";
import type { DecisionEngine, InvestigationContext } from "./types";

function clipSteps(steps: string[]) {
  return steps.filter(Boolean).slice(0, 5);
}

function deterministicReport(context: InvestigationContext): CustomerReport {
  const safetyCritical = isSafetyCritical({
    extraction: context.extraction,
    recalls: context.recalls,
    repairCategory: context.repairCategory,
    customerExplanation: context.customerExplanation,
    mechanicSaid: context.mechanicSaid,
  });
  const vehicleBits = [
    context.vehicle.year,
    context.vehicle.make,
    context.vehicle.model,
    context.vehicle.trim,
  ]
    .filter(Boolean)
    .join(" ");
  const quote = context.extraction.total_quote;
  const shop = context.extraction.shop_name || "the shop";
  const repairs = context.extraction.recommended_repairs
    .filter((r) => r.description)
    .map((r) => r.description)
    .slice(0, 8);
  const recallLines = context.recalls
    .slice(0, 8)
    .map(
      (r) =>
        `${r.nhtsaCampaignNumber} — ${r.component || "component not specified"}`,
    );

  const whatShopWants = [
    `${shop} recommended work related to ${context.repairCategory}.`,
    context.extraction.customer_complaint
      ? `Customer concern on the estimate: ${context.extraction.customer_complaint}.`
      : "",
    context.extraction.diagnosis.length
      ? `Diagnosis language: ${context.extraction.diagnosis.join("; ")}.`
      : "Diagnosis language was limited or not extracted.",
    repairs.length ? `Line items we could read: ${repairs.join("; ")}.` : "",
    quote != null ? `Quoted total on the document (as extracted): $${quote.toFixed(2)}.` : "Quoted total was not clearly extracted.",
    "This section restates the shop document. It is not a finding that the work is necessary or unnecessary.",
  ]
    .filter(Boolean)
    .join(" ");

  const dealerScript = [
    `I received an independent review of this estimate for my ${vehicleBits || "vehicle"} (${context.mileage.toLocaleString()} miles).`,
    `Please walk me through the diagnosis, the tests that support it, and whether any open recall, warranty extension, campaign, or assistance program applies to VIN ${context.vin}.`,
    context.coverage.length
      ? `Please specifically check: ${context.coverage.map((c) => c.name).join("; ")}.`
      : "Please check NHTSA recalls and any manufacturer campaigns for this VIN.",
    "Please put any coverage decision and the required diagnostic steps in writing before I authorize the repair.",
  ].join(" ");

  const escalation = [
    "If the service advisor says no coverage applies, ask for the written campaign/warranty search result and the name of the service manager.",
    "Ask the manufacturer customer-assistance line to open a case and search campaigns against the VIN.",
    "If the diagnosis is still unclear, get a second diagnostic opinion before authorizing major work.",
    "Do not rely on this report as a statement that the manufacturer is legally required to pay.",
  ].join(" ");

  const nextSteps = clipSteps([
    "Do not authorize major work until a person has confirmed the diagnosis and any VIN-specific coverage.",
    safetyCritical
      ? "If brakes, steering, tires, airbags, fuel, structure, overheating, fire, or restraints are involved, have a qualified professional assess whether the vehicle is safe to drive. This report does not say it is safe."
      : "Ask the shop for the diagnostic test results that support the recommendation.",
    "Ask the selling/servicing dealer to search recalls, warranty extensions, and campaigns by VIN.",
    context.coverage[0]
      ? `Review this documented program with the dealer: ${context.coverage[0].name} (${context.coverage[0].sourceUrl}).`
      : "Search NHTSA recalls for this year, make, and model and by VIN.",
    "If you want a second price, request a written estimate from another shop using the same diagnosis — we do not invent a market rate.",
  ]);

  const sources = [
    {
      title: "NHTSA vPIC VIN decoder",
      url: "https://vpic.nhtsa.dot.gov/api/",
    },
    {
      title: "NHTSA recalls API",
      url: "https://api.nhtsa.gov/",
    },
    ...context.coverage.map((c) => ({
      title: c.name,
      url: c.sourceUrl,
    })),
    ...context.recalls.slice(0, 5).map((r) => ({
      title: `NHTSA recall ${r.nhtsaCampaignNumber}`,
      url: `https://www.nhtsa.gov/recalls?nhtsaId=${encodeURIComponent(r.nhtsaCampaignNumber)}`,
    })),
  ];

  return {
    bottomLine: chooseBottomLine(context),
    vehicleSummary: vehicleBits || context.extraction.vehicle_description || "Vehicle details incomplete",
    mileage: context.mileage,
    quoteAmount: quote,
    whatShopWants,
    consistency: chooseConsistency(context),
    consistencyNotes:
      "We do not declare a repair unnecessary from automated review alone. Consistency here only describes whether the document, vehicle data, and public records line up enough to discuss next steps.",
    priceCheck: priceCheckLanguage(),
    coverage: context.coverage.length
      ? context.coverage
      : [
          {
            name: "Documented manufacturer programs in our seed database",
            status: "NOT APPLICABLE",
            details:
              "No seeded, sourced program matched this year/make/model closely enough to list. That is not proof that no program exists — it means we did not invent one.",
            sourceUrl: "https://www.nhtsa.gov/recalls",
            sourceOrganization: "NHTSA",
          },
        ],
    dealerScript,
    escalation,
    nextSteps,
    safetyCritical,
    safetyDisclaimer: safetyDisclaimerIfNeeded(safetyCritical),
    sources,
    generatedAt: new Date().toISOString(),
    draftNotes: [
      context.extractionMethod === "heuristic"
        ? "Draft extraction was heuristic/stub."
        : "Draft extraction used the configured model.",
      ...context.recallNotes,
      recallLines.length
        ? `NHTSA campaigns reviewed: ${recallLines.join("; ")}.`
        : "No NHTSA campaigns were returned for the available vehicle identifiers.",
    ].join(" "),
  };
}

async function llmPolish(context: InvestigationContext, draft: CustomerReport) {
  if (!openaiConfigured()) return draft;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write customer-facing automotive repair investigation reports. Never say the vehicle is safe to drive. Never invent prices, labor hours, or coverage programs. Never say a manufacturer is legally required to pay unless the supplied evidence already establishes that. Do not market AI. Keep nextSteps to at most 5 items. bottomLine must be one of the supplied enums. Return JSON only.",
        },
        {
          role: "user",
          content: JSON.stringify({
            allowedBottomLines: BOTTOM_LINES,
            draft,
            context: {
              mileage: context.mileage,
              zip: context.zip,
              explanation: context.customerExplanation,
              mechanicSaid: context.mechanicSaid,
              extraction: context.extraction,
              recalls: context.recalls,
              coverage: context.coverage,
            },
          }),
        },
      ],
    }),
  });
  if (!res.ok) return draft;
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) return draft;
  try {
    const parsed = JSON.parse(raw) as CustomerReport;
    parsed.nextSteps = (parsed.nextSteps || []).slice(0, 5);
    if (!BOTTOM_LINES.includes(parsed.bottomLine)) {
      parsed.bottomLine = draft.bottomLine;
    }
    if (!parsed.priceCheck?.sources?.length) {
      parsed.priceCheck = draft.priceCheck;
    }
    parsed.safetyCritical = draft.safetyCritical;
    parsed.safetyDisclaimer = draft.safetyDisclaimer;
    return parsed;
  } catch {
    return draft;
  }
}

export const decisionEngine: DecisionEngine = {
  extractEstimate,
  async generateReport(context) {
    const draft = deterministicReport(context);
    return llmPolish(context, draft);
  },
};

export { assessHighRisk } from "./rules";
