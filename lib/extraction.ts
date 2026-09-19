import { extractPdfStrings, looksLikePdf } from "./pdf-text";
import { emptyExtraction, type EstimateExtraction, type RecommendedRepair } from "./types";
import { openaiConfigured } from "./env";

const MONEY = /\$?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+\.[0-9]{2})/g;
const VIN_RE = /\b[A-HJ-NPR-Z0-9]{17}\b/i;

function parseMoney(text: string): number | null {
  const matches = [...text.matchAll(MONEY)].map((m) =>
    Number.parseFloat(m[1].replace(/,/g, "")),
  );
  if (!matches.length) return null;
  return matches[matches.length - 1] ?? null;
}

function largestMoney(text: string): number | null {
  const matches = [...text.matchAll(MONEY)].map((m) =>
    Number.parseFloat(m[1].replace(/,/g, "")),
  );
  if (!matches.length) return null;
  return Math.max(...matches);
}

function inferShopType(text: string): EstimateExtraction["shop_type"] {
  const t = text.toLowerCase();
  if (/\b(dealer|dealership|honda of|toyota of|ford of|chevrolet|service department)\b/.test(t)) {
    return "dealer";
  }
  if (/\b(independent|auto care|repair shop|garage)\b/.test(t)) {
    return "independent";
  }
  return "unknown";
}

function guessComponent(line: string): string {
  const t = line.toLowerCase();
  if (/trans|cvt/.test(t)) return "transmission";
  if (/engine|short block|long block/.test(t)) return "engine";
  if (/hybrid|inverter|hv battery/.test(t)) return "hybrid battery";
  if (/brake|rotor|caliper|pad/.test(t)) return "brakes";
  if (/steer|rack/.test(t)) return "steering";
  if (/airbag|inflator/.test(t)) return "airbags";
  if (/ac |a\/c|compressor/.test(t)) return "air conditioning";
  return "";
}

function heuristicFromText(text: string, extra: string[]): EstimateExtraction {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const totalLine =
    lines.find((l) => /\b(total|amount due|grand total)\b/i.test(l)) ?? "";
  const total = parseMoney(totalLine) ?? largestMoney(text);
  const shop =
    lines.find((l) => /auto|honda|toyota|ford|dealer|motors|care|brakes/i.test(l)) ??
    "";
  const complaint =
    lines.find((l) => /concern|complaint|customer says|slipping|noise|leak/i.test(l)) ??
    "";
  const diagnosis = lines.filter((l) =>
    /diagnos|failure|recommend|internal|replace/i.test(l),
  );
  const repairLines = lines.filter((l) =>
    /\$|labor|parts|hrs|hour|replace|reman|pad|rotor|transmission|engine/i.test(l),
  );
  const recommended: RecommendedRepair[] = repairLines.slice(0, 8).map((line) => ({
    description: line,
    component: guessComponent(line),
    part_numbers: [],
    parts_cost: /parts/i.test(line) ? parseMoney(line) : null,
    labor_hours: /([\d.]+)\s*(hrs?|hours)/i.test(line)
      ? Number.parseFloat(line.match(/([\d.]+)\s*(hrs?|hours)/i)?.[1] ?? "")
      : null,
    labor_cost: /labor/i.test(line) ? parseMoney(line) : null,
    fees: null,
    subtotal: parseMoney(line),
    technician_notes: "",
  }));

  const uncertainties = [...extra];
  if (!total) uncertainties.push("Could not confidently read a total quote; left null.");
  if (!shop) uncertainties.push("Shop name was not clearly identified.");
  if (!recommended.length) {
    uncertainties.push("Line items could not be structured from the document text.");
  }
  uncertainties.push(
    "Heuristic extraction only. Amounts that were not clearly printed were left null and were not guessed.",
  );

  return {
    shop_name: shop.slice(0, 120),
    shop_type: inferShopType(text),
    estimate_date: (text.match(/\b(20\d{2}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})\b/) ?? [
      "",
    ])[0],
    total_quote: total,
    vehicle_description: lines.find((l) => /20\d{2}|honda|toyota|ford|vin/i.test(l)) ?? "",
    customer_complaint: complaint,
    diagnosis: diagnosis.slice(0, 6),
    recommended_repairs: recommended.length
      ? recommended
      : emptyExtraction([]).recommended_repairs,
    tax: (() => {
      const line = lines.find((l) => /\btax\b/i.test(l));
      return line ? parseMoney(line) : null;
    })(),
    misc_fees: lines
      .filter((l) => /fee|supplies|environmental/i.test(l))
      .slice(0, 6)
      .map((l) => ({ label: l, amount: parseMoney(l) })),
    extraction_uncertainties: uncertainties,
  };
}

async function llmExtract(params: {
  texts: string[];
  imageDataUrls: string[];
}): Promise<EstimateExtraction | null> {
  if (!openaiConfigured()) return null;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const schemaHint = `Return ONLY JSON matching this schema. Missing numbers must be null. Never invent prices, hours, or part numbers.
{
  "shop_name": "",
  "shop_type": "dealer|independent|unknown",
  "estimate_date": "",
  "total_quote": null,
  "vehicle_description": "",
  "customer_complaint": "",
  "diagnosis": [],
  "recommended_repairs": [{
    "description": "", "component": "", "part_numbers": [],
    "parts_cost": null, "labor_hours": null, "labor_cost": null,
    "fees": null, "subtotal": null, "technician_notes": ""
  }],
  "tax": null,
  "misc_fees": [{"label": "", "amount": null}],
  "extraction_uncertainties": []
}`;

  const content: Array<Record<string, unknown>> = [
    { type: "text", text: `${schemaHint}\n\nDocument text:\n${params.texts.join("\n\n---\n\n")}` },
  ];
  for (const url of params.imageDataUrls) {
    content.push({ type: "image_url", image_url: { url } });
  }

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You extract automotive repair estimates. If a value is not clearly present, use null or empty string. Never guess numbers.",
        },
        { role: "user", content },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as EstimateExtraction;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.extraction_uncertainties)) {
      parsed.extraction_uncertainties = [];
    }
    if (!Array.isArray(parsed.recommended_repairs)) {
      parsed.recommended_repairs = emptyExtraction([]).recommended_repairs;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function extractEstimate(files: Array<{
  originalName: string;
  mimeType: string;
  buffer: Buffer;
}>): Promise<{ extraction: EstimateExtraction; method: "llm" | "heuristic" }> {
  const texts: string[] = [];
  const imageDataUrls: string[] = [];
  const notes: string[] = [];

  if (!files.length) {
    return {
      extraction: emptyExtraction([
        "No files were available for extraction.",
      ]),
      method: "heuristic",
    };
  }

  for (const file of files) {
    if (file.mimeType === "application/pdf" || looksLikePdf(file.buffer)) {
      const text = extractPdfStrings(file.buffer);
      if (text) texts.push(`File ${file.originalName}:\n${text}`);
      else notes.push(`${file.originalName}: PDF had no extractable text.`);
    } else if (file.mimeType.startsWith("image/")) {
      imageDataUrls.push(
        `data:${file.mimeType};base64,${file.buffer.toString("base64")}`,
      );
    } else {
      notes.push(`${file.originalName}: unsupported type ${file.mimeType}.`);
    }
    const maybeVin = file.originalName.match(VIN_RE);
    if (maybeVin) texts.push(`Filename VIN hint: ${maybeVin[0]}`);
  }

  const llm = await llmExtract({ texts, imageDataUrls });
  if (llm) {
    llm.extraction_uncertainties = [
      ...llm.extraction_uncertainties,
      ...notes,
    ];
    return { extraction: llm, method: "llm" };
  }

  if (imageDataUrls.length && !texts.length) {
    notes.push(
      "Image-only estimate and no OPENAI_API_KEY: structured fields left empty rather than guessed.",
    );
  }

  const combined = texts.join("\n\n");
  return {
    extraction: combined
      ? heuristicFromText(combined, notes)
      : emptyExtraction([
          ...notes,
          "Stub/heuristic extraction produced no readable text. All numeric fields remain null.",
        ]),
    method: "heuristic",
  };
}
