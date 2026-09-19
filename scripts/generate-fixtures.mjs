import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "fixtures");
mkdirSync(outDir, { recursive: true });

function pdf(lines) {
  const escaped = lines.map((line) =>
    line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"),
  );
  let content = "BT\n/F1 11 Tf\n50 740 Td\n";
  escaped.forEach((line, i) => {
    content += i === 0 ? `(${line}) Tj\n` : `0 -14 Td (${line}) Tj\n`;
  });
  content += "ET\n";
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n",
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n`,
    `4 0 obj << /Length ${content.length} >> stream\n${content}endstream\nendobj\n`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Courier >> endobj\n",
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(body.length);
    body += obj;
  }
  const xrefStart = body.length;
  body += `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) {
    body += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return body;
}

const transmission = [
  "ANONYMIZED SAMPLE ESTIMATE — not a real shop or customer",
  "Independent Auto Care",
  "Estimate EST-88421   Date: 2026-03-12",
  "Vehicle: 2016 Nissan Altima (description on document)",
  "VIN: [REDACTED]   Mileage: 98400",
  "Customer concern: Transmission slipping, delayed engagement",
  "Diagnosis: Internal CVT failure; recommend replacement",
  "Remanufactured CVT assembly    Parts 4200.00   Labor 12.5 hrs 1875.00",
  "CVT fluid and cooler service                         185.00",
  "Shop supplies / environmental                         89.00",
  "Tax                                                  412.50",
  "TOTAL                                               6761.50",
  "Technician notes: no road test documented on this sample page",
];

const brakes = [
  "ANONYMIZED SAMPLE ESTIMATE — not a real shop or customer",
  "Metro Brakes and More",
  "Estimate EST-1022   Date: 03/02/2026",
  "Vehicle: 2016 Toyota Camry",
  "VIN: [REDACTED]   Mileage: 112200",
  "Customer concern: Pedal pulsation, grinding on front brakes",
  "Diagnosis: Front pads and rotors worn; inspect calipers",
  "Front brake pads                                     180.00",
  "Front rotors                                         240.00",
  "Labor                                                220.00",
  "Caliper (maybe, if seized)                           190.00",
  "Tax                                                   62.00",
  "TOTAL                                                892.00",
  "Technician notes: Recommend full front brake job. Safety-critical system.",
];

writeFileSync(join(outDir, "sample-estimate-transmission.pdf"), pdf(transmission));
writeFileSync(join(outDir, "sample-estimate-brakes.pdf"), pdf(brakes));
writeFileSync(
  join(outDir, "README.md"),
  `# Sample fixtures

Anonymized, fictional shop paperwork for local testing. Not real customer documents.

- \`sample-estimate-transmission.pdf\` — high-dollar CVT replacement (coverage + price-check paths)
- \`sample-estimate-brakes.pdf\` — brake job (safety disclaimer path)

Use either file on \`/intake\` with a real 17-character VIN (for example a VIN you own or a well-known test VIN) and \`DEV_BYPASS_CHECKOUT=1\`.
`,
);
console.log("Wrote fixtures/");
