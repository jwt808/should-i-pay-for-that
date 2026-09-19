import { readFile } from "node:fs/promises";
import { inferRepairCategory, matchCoveragePrograms } from "./coverage";
import { decisionEngine, assessHighRisk } from "./decision-engine";
import { decodeVin, lookupRecalls } from "./nhtsa";
import { prisma } from "./prisma";
import type { CustomerReport, EstimateExtraction } from "./types";

export async function markPaid(caseId: string, payment?: {
  sessionId?: string;
  paymentIntentId?: string | null;
}) {
  const existing = await prisma.case.findUnique({
    where: { id: caseId },
    include: { files: true },
  });
  if (!existing) throw new Error("Case not found");
  if (existing.paidAt) return existing;

  const hasFiles = existing.files.length > 0;
  return prisma.case.update({
    where: { id: caseId },
    data: {
      status: hasFiles ? "DOCUMENTS RECEIVED" : "PAID",
      paidAt: new Date(),
      stripeCheckoutSessionId: payment?.sessionId ?? existing.stripeCheckoutSessionId,
      stripePaymentIntentId:
        payment?.paymentIntentId ?? existing.stripePaymentIntentId,
    },
    include: { files: true },
  });
}

export async function runInvestigation(caseId: string) {
  const record = await prisma.case.findUnique({
    where: { id: caseId },
    include: { files: true },
  });
  if (!record) throw new Error("Case not found");

  await prisma.case.update({
    where: { id: caseId },
    data: { status: "ANALYZING" },
  });

  let year = record.vehicleYear;
  let make = record.vehicleMake;
  let model = record.vehicleModel;
  let trim = record.vehicleTrim;
  let engine = record.vehicleEngine;
  let transmission = record.vehicleTransmission;
  let drivetrain = record.vehicleDrivetrain;
  let bodyClass = record.vehicleBodyClass;
  let plant = record.vehiclePlant;
  let uncertain = record.vinUncertain;
  let vinDecodeJson = record.vinDecodeJson;

  if (!make || !model || !year) {
    try {
      const decoded = await decodeVin(record.vin);
      year = year ?? decoded.year;
      make = make ?? decoded.make;
      model = model ?? decoded.model;
      trim = trim ?? decoded.trim;
      engine = engine ?? decoded.engine;
      transmission = transmission ?? decoded.transmission;
      drivetrain = drivetrain ?? decoded.drivetrain;
      bodyClass = bodyClass ?? decoded.bodyClass;
      plant = plant ?? decoded.plant;
      uncertain = decoded.uncertain;
      vinDecodeJson = JSON.stringify(decoded);
    } catch (error) {
      uncertain = true;
      vinDecodeJson = JSON.stringify({
        error: error instanceof Error ? error.message : "VIN decode failed",
      });
    }
  }

  const buffers = await Promise.all(
    record.files.map(async (file) => ({
      originalName: file.originalName,
      mimeType: file.mimeType,
      buffer: await readFile(file.path),
    })),
  );

  const { extraction, method } = await decisionEngine.extractEstimate(buffers);
  const repairCategory = inferRepairCategory(extraction);
  const { recalls, notes } = await lookupRecalls({
    vin: record.vin,
    year,
    make,
    model,
  });
  const coverage = await matchCoveragePrograms({
    make,
    model,
    year,
    engine,
    extraction,
    repairCategory,
  });

  const context = {
    vin: record.vin,
    mileage: record.mileage,
    zip: record.zip,
    customerExplanation: record.customerExplanation,
    mechanicSaid: record.mechanicSaid,
    vehicle: {
      year: year ?? null,
      make: make ?? null,
      model: model ?? null,
      trim: trim ?? null,
      engine: engine ?? null,
      transmission: transmission ?? null,
      confirmed: record.vehicleConfirmed,
      uncertain,
    },
    extraction,
    extractionMethod: method,
    recalls,
    recallNotes: notes,
    coverage,
    repairCategory,
  };

  const report = await decisionEngine.generateReport(context);
  const risk = assessHighRisk(context);
  const needsInfo = uncertain && !record.vehicleConfirmed;
  const status = needsInfo ? "NEEDS INFORMATION" : "NEEDS REVIEW";

  return prisma.case.update({
    where: { id: caseId },
    data: {
      status,
      vehicleYear: year,
      vehicleMake: make,
      vehicleModel: model,
      vehicleTrim: trim,
      vehicleEngine: engine,
      vehicleTransmission: transmission,
      vehicleDrivetrain: drivetrain,
      vehicleBodyClass: bodyClass,
      vehiclePlant: plant,
      vinUncertain: uncertain,
      vinDecodeJson,
      extractionJson: JSON.stringify(extraction),
      extractionConfidence: method === "llm" ? 0.7 : 0.35,
      recallsJson: JSON.stringify({ recalls, notes }),
      coverageMatchesJson: JSON.stringify(coverage),
      reportJson: JSON.stringify(report),
      quotedPrice: extraction.total_quote,
      repairCategory,
      potentialCoverage: coverage[0]?.name ?? null,
      reportConfidence: risk.confidence,
      reviewRequired: true,
      highRiskFlags: JSON.stringify(risk.flags),
    },
    include: { files: true },
  });
}

export function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function parseExtraction(value: string | null): EstimateExtraction | null {
  return parseJson(value, null);
}

export function parseReport(value: string | null): CustomerReport | null {
  return parseJson(value, null);
}
