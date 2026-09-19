import { decodeVin } from "@/lib/nhtsa";

export async function POST(request: Request) {
  const body = (await request.json()) as { vin?: string };
  const vin = (body.vin || "").trim().toUpperCase();
  if (vin.length !== 17) {
    return Response.json({ error: "VIN must be 17 characters." }, { status: 400 });
  }
  try {
    const decoded = await decodeVin(vin);
    return Response.json(decoded);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "VIN decode failed" },
      { status: 502 },
    );
  }
}
