import type { CoverageProgram } from "@prisma/client";
import { prisma } from "./prisma";
import type { CoverageFinding, EstimateExtraction } from "./types";

function modelsList(value: string): string[] {
  return value
    .split(/[|,]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function yearInRange(year: number | null, start: number | null, end: number | null) {
  if (!year) return false;
  if (start && year < start) return false;
  if (end && year > end) return false;
  return true;
}

function textBlob(extraction: EstimateExtraction | null) {
  if (!extraction) return "";
  return [
    extraction.customer_complaint,
    extraction.diagnosis.join(" "),
    ...extraction.recommended_repairs.map((r) => `${r.description} ${r.component}`),
  ]
    .join(" ")
    .toLowerCase();
}

function componentOverlap(program: CoverageProgram, blob: string, repairCategory: string) {
  const needles = [
    program.component,
    program.failureSymptom,
    ...program.programName.split(" "),
  ]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);
  const hay = `${blob} ${repairCategory}`.toLowerCase();
  return needles.some((n) => hay.includes(n));
}

export async function matchCoveragePrograms(input: {
  make: string | null;
  model: string | null;
  year: number | null;
  engine: string | null;
  extraction: EstimateExtraction | null;
  repairCategory: string;
}): Promise<CoverageFinding[]> {
  const programs = await prisma.coverageProgram.findMany();
  const blob = textBlob(input.extraction);
  const findings: CoverageFinding[] = [];

  for (const program of programs) {
    const makeHit =
      !!input.make &&
      program.manufacturer.toLowerCase() === input.make.toLowerCase();
    const modelHit =
      !!input.model &&
      modelsList(program.vehicleModels).some(
        (m) =>
          input.model!.toLowerCase().includes(m) ||
          m.includes(input.model!.toLowerCase()),
      );
    const yearHit = yearInRange(
      input.year,
      program.modelYearsStart,
      program.modelYearsEnd,
    );
    const engineHit =
      !program.engine ||
      !input.engine ||
      input.engine.toLowerCase().includes(program.engine.toLowerCase().slice(0, 6));
    const topicHit = componentOverlap(program, blob, input.repairCategory);

    let status: CoverageFinding["status"] = "NOT APPLICABLE";
    let details = program.coverageDescription;

    if (makeHit && modelHit && yearHit) {
      if (topicHit) {
        status = "NEEDS CONFIRMATION";
        details = `${program.coverageDescription} Eligibility still depends on VIN, mileage/age, required diagnostics, and the program's stated conditions. This is not a determination that the manufacturer must pay.`;
      } else if (blob) {
        status = "POSSIBLY RELEVANT";
        details = `${program.coverageDescription} The uploaded estimate does not clearly describe this component. Confirm whether the recommended work matches this program.`;
      } else {
        status = "POSSIBLY RELEVANT";
        details = `${program.coverageDescription} Vehicle year/make/model overlap this documented program; estimate text was too limited to score relevance.`;
      }
      if (!engineHit && program.engine) {
        status = "NEEDS CONFIRMATION";
        details += ` Program engine note: ${program.engine}.`;
      }
    } else if (makeHit && (modelHit || yearHit) && topicHit) {
      status = "NEEDS CONFIRMATION";
      details = `${program.coverageDescription} Year/model match is incomplete. Verify VIN applicability on the source page.`;
    }

    if (status === "NOT APPLICABLE") continue;

    findings.push({
      name: program.programName,
      programNumber: program.programNumber ?? undefined,
      status,
      details,
      sourceUrl: program.sourceUrl,
      sourceOrganization: program.sourceOrganization,
    });
  }

  return findings;
}

export function inferRepairCategory(extraction: EstimateExtraction | null): string {
  if (!extraction) return "unknown";
  const blob = textBlob(extraction);
  if (/trans|cvt/.test(blob)) return "transmission";
  if (/engine|short block|rod bearing/.test(blob)) return "engine";
  if (/hybrid|hv battery|inverter/.test(blob)) return "hybrid battery";
  if (/brake|rotor|caliper/.test(blob)) return "brakes";
  if (/airbag|inflator/.test(blob)) return "airbags";
  if (/steer/.test(blob)) return "steering";
  if (/ac |a\/c|compressor/.test(blob)) return "air conditioning";
  return "unspecified";
}
