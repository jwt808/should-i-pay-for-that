import type { Case, CaseFile } from "@prisma/client";
import { parseJson } from "./investigation";

export type SerializedCase = ReturnType<typeof serializeCase>;

export function serializeCase(
  record: Case & { files?: CaseFile[] },
  opts?: { includeEmail?: boolean },
) {
  return {
    id: record.id,
    accessToken: record.accessToken,
    status: record.status,
    email: opts?.includeEmail ? record.email : undefined,
    vin: record.vin,
    mileage: record.mileage,
    zip: record.zip,
    customerExplanation: record.customerExplanation,
    mechanicSaid: record.mechanicSaid,
    vehicleYear: record.vehicleYear,
    vehicleMake: record.vehicleMake,
    vehicleModel: record.vehicleModel,
    vehicleTrim: record.vehicleTrim,
    vehicleEngine: record.vehicleEngine,
    vehicleTransmission: record.vehicleTransmission,
    vehicleDrivetrain: record.vehicleDrivetrain,
    vehicleBodyClass: record.vehicleBodyClass,
    vehiclePlant: record.vehiclePlant,
    vehicleConfirmed: record.vehicleConfirmed,
    vinUncertain: record.vinUncertain,
    quotedPrice: record.quotedPrice,
    repairCategory: record.repairCategory,
    potentialCoverage: record.potentialCoverage,
    reportConfidence: record.reportConfidence,
    reviewRequired: record.reviewRequired,
    highRiskFlags: parseJson<string[]>(record.highRiskFlags, []),
    reviewerNotes: record.reviewerNotes,
    paidAt: record.paidAt?.toISOString() ?? null,
    deliveredAt: record.deliveredAt?.toISOString() ?? null,
    refundRequestedAt: record.refundRequestedAt?.toISOString() ?? null,
    refundReason: record.refundReason,
    createdAt: record.createdAt.toISOString(),
    extraction: parseJson(record.extractionJson, null),
    recalls: parseJson(record.recallsJson, null),
    coverage: parseJson(record.coverageMatchesJson, null),
    report: parseJson(record.reportJson, null),
    files: (record.files ?? []).map((f) => ({
      id: f.id,
      originalName: f.originalName,
      mimeType: f.mimeType,
      sizeBytes: f.sizeBytes,
    })),
  };
}
