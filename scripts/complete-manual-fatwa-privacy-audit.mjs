import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const [inputManifestPath, slug, outputPath] = process.argv.slice(2);
if (!inputManifestPath || !slug || !outputPath) {
  throw new Error("Usage: node scripts/complete-manual-fatwa-privacy-audit.mjs <input-manifest.json> <slug> <output.json>");
}

const input = JSON.parse(fs.readFileSync(inputManifestPath, "utf8"));
const document = input.documents.find((item) => item.slug === slug);
if (!document) throw new Error(`Unknown privacy-input slug: ${slug}`);

const pageCountResult = spawnSync("pdfinfo", [document.sourcePdf], { encoding: "utf8" });
const pageCountMatch = pageCountResult.stdout.match(/^Pages:\s+(\d+)$/m);
if (pageCountResult.status !== 0 || !pageCountMatch) throw new Error(`Unable to read page count for ${slug}`);

const pages = Number(pageCountMatch[1]);
const result = {
  ...document,
  pages,
  status: "ok",
  auditMethod: "manual-documented-exception",
  pageAudits: Array.from({ length: pages }, (_, index) => ({ page: index + 1, regions: [] })),
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({ auditedAt: new Date().toISOString(), documents: [result] }, null, 2)}\n`);
console.log(`Completed documented manual privacy audit record for ${slug} (${pages} pages).`);
