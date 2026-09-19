import { randomBytes } from "node:crypto";
import { ACCEPTED_MIME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { saveCaseFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const vin = String(form.get("vin") || "")
    .trim()
    .toUpperCase();
  const mileage = Number.parseInt(String(form.get("mileage") || ""), 10);
  const zip = String(form.get("zip") || "").trim();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);

  if (vin.length !== 17) {
    return Response.json({ error: "VIN must be 17 characters." }, { status: 400 });
  }
  if (!Number.isFinite(mileage) || mileage <= 0) {
    return Response.json({ error: "Mileage is required." }, { status: 400 });
  }
  if (!/^\d{5}$/.test(zip)) {
    return Response.json({ error: "ZIP must be 5 digits." }, { status: 400 });
  }
  if (!files.length) {
    return Response.json({ error: "Upload at least one estimate file." }, { status: 400 });
  }

  const yearRaw = String(form.get("vehicleYear") || "");
  const vehicleYear = yearRaw ? Number.parseInt(yearRaw, 10) : null;

  const record = await prisma.case.create({
    data: {
      accessToken: randomBytes(24).toString("hex"),
      status: "AWAITING_PAYMENT",
      email: String(form.get("email") || "") || null,
      vin,
      mileage,
      zip,
      customerExplanation: String(form.get("customerExplanation") || "") || null,
      mechanicSaid: String(form.get("mechanicSaid") || "") || null,
      vehicleYear: Number.isFinite(vehicleYear) ? vehicleYear : null,
      vehicleMake: String(form.get("vehicleMake") || "") || null,
      vehicleModel: String(form.get("vehicleModel") || "") || null,
      vehicleConfirmed: String(form.get("vehicleConfirmed") || "") === "1",
    },
  });

  for (const file of files) {
    if (!ACCEPTED_MIME.includes(file.type) && !/\.(pdf|jpe?g|png)$/i.test(file.name)) {
      continue;
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > 15 * 1024 * 1024) continue;
    const saved = await saveCaseFile(record.id, file.name, buffer);
    await prisma.caseFile.create({
      data: {
        caseId: record.id,
        storedName: saved.storedName,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: buffer.byteLength,
        path: saved.path,
      },
    });
  }

  return Response.json({ id: record.id, accessToken: record.accessToken });
}
