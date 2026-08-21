import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const auditPath = "/home/ubuntu/darul-ifta-irshad-us-saileen/scripts/a00_supplied_batch_audit.json";
const cataloguePath = "/home/ubuntu/darul-ifta-irshad-us-saileen/client/src/data/fatawa.ts";
const outputPath = "/home/ubuntu/darul-ifta-irshad-us-saileen/scripts/a00_public_document_verification.json";
const baseUrl = process.env.FATWA_ARCHIVE_BASE_URL ?? "http://localhost:3000";

const audit = JSON.parse(readFileSync(auditPath, "utf8"));
const catalogue = readFileSync(cataloguePath, "utf8");
const documentByNumber = new Map(
  [...catalogue.matchAll(/"number": "(A\d{4})"[\s\S]*?"pdfUrl": "([^"]+)"/g)].map((match) => [match[1], match[2]]),
);

const uniqueFiles = [...new Map(audit.files.map((file) => [file.number, file])).values()];
const records = [];
for (const file of uniqueFiles) {
  const pdfUrl = documentByNumber.get(file.number);
  if (!pdfUrl) {
    records.push({ number: file.number, available: false, reason: "No public catalogue URL found." });
    continue;
  }

  try {
    const response = await fetch(`${baseUrl}${pdfUrl}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const sha256 = createHash("sha256").update(buffer).digest("hex");
    records.push({
      number: file.number,
      url: pdfUrl,
      available: response.ok,
      status: response.status,
      contentType: response.headers.get("content-type"),
      publicBytes: buffer.length,
      publicSha256: sha256,
      matchesSuppliedDocument: response.ok && sha256 === file.sha256,
    });
  } catch (error) {
    records.push({ number: file.number, url: pdfUrl, available: false, reason: error instanceof Error ? error.message : String(error) });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  documentsReviewed: records.length,
  allAvailable: records.every((record) => record.available),
  allMatchSupplied: records.every((record) => record.matchesSuppliedDocument),
  unavailable: records.filter((record) => !record.available),
  mismatches: records.filter((record) => record.available && !record.matchesSuppliedDocument),
  records,
};

writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  documentsReviewed: report.documentsReviewed,
  allAvailable: report.allAvailable,
  allMatchSupplied: report.allMatchSupplied,
  unavailable: report.unavailable,
  mismatches: report.mismatches.map((record) => ({ number: record.number, url: record.url })),
}, null, 2));
