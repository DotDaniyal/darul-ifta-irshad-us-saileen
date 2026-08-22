import fs from "node:fs";
import path from "node:path";

const [inputPath, currentAuditPath, additionAuditPath, outputPath] = process.argv.slice(2);
if (!inputPath || !currentAuditPath || !additionAuditPath || !outputPath) {
  throw new Error("Usage: node scripts/merge-fatwa-privacy-audits.mjs <input.json> <current.json> <addition.json> <output.json>");
}

const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const current = JSON.parse(fs.readFileSync(currentAuditPath, "utf8"));
const addition = JSON.parse(fs.readFileSync(additionAuditPath, "utf8"));
const mergedBySlug = new Map(current.documents.map((document) => [document.slug, document]));
for (const document of addition.documents) mergedBySlug.set(document.slug, document);

const documents = input.documents.map((source) => mergedBySlug.get(source.slug)).filter(Boolean);
if (documents.length !== input.documents.length || new Set(documents.map((document) => document.slug)).size !== documents.length) {
  throw new Error("Merged audit does not contain exactly one result for every source document.");
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({ auditedAt: new Date().toISOString(), documents }, null, 2)}\n`);
console.log(`Merged privacy audit results for ${documents.length} Fatwa PDFs.`);
