import type {
  BottomLine,
  CONSISTENCY_LABELS,
  COVERAGE_STATUSES,
  PRICE_CHECK_LABELS,
} from "./constants";

export type ShopType = "dealer" | "independent" | "unknown";

export interface RecommendedRepair {
  description: string;
  component: string;
  part_numbers: string[];
  parts_cost: number | null;
  labor_hours: number | null;
  labor_cost: number | null;
  fees: number | null;
  subtotal: number | null;
  technician_notes: string;
}

export interface EstimateExtraction {
  shop_name: string;
  shop_type: ShopType;
  estimate_date: string;
  total_quote: number | null;
  vehicle_description: string;
  customer_complaint: string;
  diagnosis: string[];
  recommended_repairs: RecommendedRepair[];
  tax: number | null;
  misc_fees: { label: string; amount: number | null }[];
  extraction_uncertainties: string[];
}

export interface ReportSource {
  title: string;
  url: string;
  retrieved?: string;
}

export interface CoverageFinding {
  name: string;
  programNumber?: string;
  status: (typeof COVERAGE_STATUSES)[number];
  details: string;
  sourceUrl: string;
  sourceOrganization?: string;
}

export interface CustomerReport {
  bottomLine: BottomLine;
  vehicleSummary: string;
  mileage: number | null;
  quoteAmount: number | null;
  whatShopWants: string;
  consistency: (typeof CONSISTENCY_LABELS)[number];
  consistencyNotes: string;
  priceCheck: {
    rating: (typeof PRICE_CHECK_LABELS)[number];
    language: string;
    sources: ReportSource[];
  };
  coverage: CoverageFinding[];
  dealerScript: string;
  escalation: string;
  nextSteps: string[];
  safetyCritical: boolean;
  safetyDisclaimer: string | null;
  sources: ReportSource[];
  generatedAt: string;
  draftNotes?: string;
}

export interface VehicleDecode {
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  engine: string | null;
  transmission: string | null;
  drivetrain: string | null;
  bodyClass: string | null;
  plant: string | null;
  errorCode: string | null;
  errorText: string | null;
  uncertain: boolean;
  raw: Record<string, string>;
}

export interface NhtsaRecall {
  nhtsaCampaignNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  reportReceivedDate: string;
  source: "yearMakeModel" | "vin";
}

export function emptyExtraction(uncertainties: string[]): EstimateExtraction {
  return {
    shop_name: "",
    shop_type: "unknown",
    estimate_date: "",
    total_quote: null,
    vehicle_description: "",
    customer_complaint: "",
    diagnosis: [],
    recommended_repairs: [
      {
        description: "",
        component: "",
        part_numbers: [],
        parts_cost: null,
        labor_hours: null,
        labor_cost: null,
        fees: null,
        subtotal: null,
        technician_notes: "",
      },
    ],
    tax: null,
    misc_fees: [],
    extraction_uncertainties: uncertainties,
  };
}
