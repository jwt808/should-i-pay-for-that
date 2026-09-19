import type { NhtsaRecall, VehicleDecode } from "./types";

const VPIC = "https://vpic.nhtsa.dot.gov/api";
const NHTSA = "https://api.nhtsa.gov";

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asYear(value: unknown): number | null {
  const n = Number.parseInt(asString(value), 10);
  return Number.isFinite(n) && n > 1970 && n < 2100 ? n : null;
}

export async function decodeVin(vin: string): Promise<VehicleDecode> {
  const clean = vin.trim().toUpperCase();
  const url = `${VPIC}/vehicles/DecodeVinValues/${encodeURIComponent(clean)}?format=json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`NHTSA vPIC request failed (${res.status})`);
  }
  const data = (await res.json()) as {
    Results?: Array<Record<string, string>>;
  };
  const raw = data.Results?.[0] ?? {};
  const errorCode = asString(raw.ErrorCode);
  const errorText = asString(raw.ErrorText);
  const year = asYear(raw.ModelYear);
  const make = asString(raw.Make) || null;
  const model = asString(raw.Model) || null;
  const uncertain =
    !year ||
    !make ||
    !model ||
    (errorCode !== "" && errorCode !== "0" && !errorCode.startsWith("0,"));

  return {
    year,
    make,
    model,
    trim: asString(raw.Trim) || asString(raw.Series) || null,
    engine:
      [
        asString(raw.DisplacementL) ? `${asString(raw.DisplacementL)}L` : "",
        asString(raw.EngineCylinders)
          ? `${asString(raw.EngineCylinders)}-cyl`
          : "",
        asString(raw.FuelTypePrimary),
      ]
        .filter(Boolean)
        .join(" ") || null,
    transmission: asString(raw.TransmissionStyle) || null,
    drivetrain: asString(raw.DriveType) || null,
    bodyClass: asString(raw.BodyClass) || null,
    plant: [asString(raw.PlantCity), asString(raw.PlantState), asString(raw.PlantCountry)]
      .filter(Boolean)
      .join(", ") || null,
    errorCode: errorCode || null,
    errorText: errorText || null,
    uncertain,
    raw,
  };
}

interface RecallRow {
  NHTSACampaignNumber?: string;
  Component?: string;
  Summary?: string;
  Consequence?: string;
  Remedy?: string;
  ReportReceivedDate?: string;
}

function mapRecalls(rows: RecallRow[], source: NhtsaRecall["source"]): NhtsaRecall[] {
  return rows
    .filter((row) => row.NHTSACampaignNumber)
    .map((row) => ({
      nhtsaCampaignNumber: asString(row.NHTSACampaignNumber),
      component: asString(row.Component),
      summary: asString(row.Summary),
      consequence: asString(row.Consequence),
      remedy: asString(row.Remedy),
      reportReceivedDate: asString(row.ReportReceivedDate),
      source,
    }));
}

export async function recallsByYearMakeModel(
  year: number,
  make: string,
  model: string,
): Promise<NhtsaRecall[]> {
  const params = new URLSearchParams({
    make,
    model,
    modelYear: String(year),
  });
  const url = `${NHTSA}/recalls/recallsByVehicle?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`NHTSA recalls request failed (${res.status})`);
  }
  const data = (await res.json()) as { results?: RecallRow[]; Results?: RecallRow[] };
  return mapRecalls(data.results ?? data.Results ?? [], "yearMakeModel");
}

export async function recallsByVin(vin: string): Promise<NhtsaRecall[] | null> {
  const url = `${NHTSA}/recalls/recallsByVehicleId?vin=${encodeURIComponent(vin)}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: RecallRow[]; Results?: RecallRow[] };
    const rows = data.results ?? data.Results ?? [];
    if (!rows.length) return [];
    return mapRecalls(rows, "vin");
  } catch {
    return null;
  }
}

export async function lookupRecalls(input: {
  vin: string;
  year: number | null;
  make: string | null;
  model: string | null;
}): Promise<{ recalls: NhtsaRecall[]; notes: string[] }> {
  const notes: string[] = [];
  const recalls: NhtsaRecall[] = [];
  const seen = new Set<string>();

  const vinRecalls = await recallsByVin(input.vin);
  if (vinRecalls === null) {
    notes.push(
      "NHTSA VIN-specific recall lookup is not available or did not respond; year/make/model search was used instead.",
    );
  } else {
    for (const recall of vinRecalls) {
      if (!seen.has(recall.nhtsaCampaignNumber)) {
        seen.add(recall.nhtsaCampaignNumber);
        recalls.push(recall);
      }
    }
  }

  if (input.year && input.make && input.model) {
    try {
      const ymm = await recallsByYearMakeModel(input.year, input.make, input.model);
      for (const recall of ymm) {
        if (!seen.has(recall.nhtsaCampaignNumber)) {
          seen.add(recall.nhtsaCampaignNumber);
          recalls.push(recall);
        }
      }
    } catch (error) {
      notes.push(
        `Year/make/model recall lookup failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  } else {
    notes.push("Year, make, and model were incomplete, so the standard NHTSA vehicle recall search was skipped.");
  }

  return { recalls, notes };
}
