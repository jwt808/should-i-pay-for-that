/** Pull printable strings from a simple text PDF. Not a full PDF parser. */
export function extractPdfStrings(buffer: Buffer): string {
  const raw = buffer.toString("latin1");
  const matches = [...raw.matchAll(/\((?:\\.|[^\\)])*\)/g)].map((m) =>
    m[0]
      .slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "")
      .replace(/\\t/g, " ")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\"),
  );
  return matches.join("\n").trim();
}

export function looksLikePdf(buffer: Buffer) {
  return buffer.subarray(0, 5).toString("utf8") === "%PDF-";
}
