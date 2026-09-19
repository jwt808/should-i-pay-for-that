import type {
  CoverageFinding,
  CustomerReport,
  EstimateExtraction,
  NhtsaRecall,
  VehicleDecode,
} from "../types";

export interface InvestigationContext {
  vin: string;
  mileage: number;
  zip: string;
  customerExplanation?: string | null;
  mechanicSaid?: string | null;
  vehicle: Partial<VehicleDecode> & {
    year: number | null;
    make: string | null;
    model: string | null;
    confirmed: boolean;
    uncertain: boolean;
  };
  extraction: EstimateExtraction;
  extractionMethod: "llm" | "heuristic";
  recalls: NhtsaRecall[];
  recallNotes: string[];
  coverage: CoverageFinding[];
  repairCategory: string;
}

export interface DecisionEngine {
  extractEstimate(files: Array<{
    originalName: string;
    mimeType: string;
    buffer: Buffer;
  }>): Promise<{ extraction: EstimateExtraction; method: "llm" | "heuristic" }>;
  generateReport(context: InvestigationContext): Promise<CustomerReport>;
}

export interface HighRiskAssessment {
  flags: string[];
  reviewRequired: boolean;
  confidence: "low" | "medium" | "high";
}
