import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

export const STORAGE_ROOT = path.join(process.cwd(), "storage");

const SAFE_NAME = /[^a-zA-Z0-9._-]+/g;

export function safeFileName(original: string) {
  const base = path.basename(original).replace(SAFE_NAME, "_").slice(0, 80);
  return base || "upload";
}

export async function saveCaseFile(
  caseId: string,
  originalName: string,
  buffer: Buffer,
) {
  const dir = path.join(STORAGE_ROOT, caseId);
  await mkdir(dir, { recursive: true });
  const storedName = `${randomBytes(6).toString("hex")}-${safeFileName(originalName)}`;
  const filePath = path.join(dir, storedName);
  await writeFile(filePath, buffer);
  return { storedName, path: filePath };
}

export function isPathInsideStorage(filePath: string) {
  const resolved = path.resolve(filePath);
  return resolved.startsWith(path.resolve(STORAGE_ROOT) + path.sep);
}
