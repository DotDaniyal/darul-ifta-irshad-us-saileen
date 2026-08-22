import fs from "node:fs";
import path from "node:path";
import { manualPrivacyOverrides, manualPublicPageSelection } from "./lib/fatwaPrivacyManualOverrides.mjs";

const [inputManifestPath, auditPath, outputPath] = process.argv.slice(2);
if (!inputManifestPath || !auditPath || !outputPath) {
  throw new Error("Usage: node scripts/build-fatwa-public-redaction-manifest.mjs <input-manifest.json> <audit.json> <output.json>");
}

const input = JSON.parse(fs.readFileSync(inputManifestPath, "utf8"));
const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
const auditedBySlug = new Map(audit.documents.map((document) => [document.slug, document]));

const documents = input.documents.map((source) => {
  const audited = auditedBySlug.get(source.slug);
  if (!audited || audited.pageAudits.length !== audited.pages) {
    throw new Error(`Missing complete audit result for ${source.slug}`);
  }
  const failedPages = audited.pageAudits.filter((page) => page.error);
  const overrides = manualPrivacyOverrides[source.slug] || {};
  const publicPages = manualPublicPageSelection[source.slug] || audited.pageAudits.map((page) => page.page);
  const unresolved = failedPages.filter((page) => !overrides[page.page]);
  if (unresolved.length) {
    throw new Error(`Unresolved audit page(s) for ${source.slug}: ${unresolved.map((page) => page.page).join(", ")}`);
  }
  if (!publicPages.length || publicPages.some((page) => !Number.isInteger(page) || page < 1 || page > audited.pages)) {
    throw new Error(`Invalid public page selection for ${source.slug}`);
  }

  return {
    ...source,
    sanitizedFileName: `sanitized-fatwa-${source.slug}.pdf`,
    publicPages,
    pages: audited.pageAudits.map((page) => ({
      page: page.page,
      regions: [...(page.regions || []), ...(overrides[page.page] || [])],
    })),
  };
});

if (documents.length !== input.documents.length || new Set(documents.map((document) => document.sanitizedFileName)).size !== documents.length) {
  throw new Error("The public redaction manifest does not contain one unique output file per source document.");
}

const output = {
  generatedAt: new Date().toISOString(),
  sourceCount: documents.length,
  documents,
};
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Built privacy redaction manifest for ${documents.length} Fatwa PDFs.`);
