import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/darul-ifta-irshad-us-saileen";
const localDerivativeDirectory = "/home/ubuntu/webdev-static-assets/fatawa-public-sanitized";
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "scripts/fatwa-public-sanitized-url-manifest.json"), "utf8"),
);

const officialDigits = new Set(["03332617671", "923332617671"]);
const phonePattern = /(?:\+?92[\s-]?3\d{2}[\s-]?\d{7}|03\d{2}[\s-]?\d{7})/g;
const findings = [];
let extractedTextDocuments = 0;
let officialContactDocuments = 0;

for (const [slug, publicUrl] of Object.entries(manifest)) {
  const localPath = path.join(localDerivativeDirectory, `sanitized-fatwa-${slug}.pdf`);
  if (!fs.existsSync(localPath)) {
    findings.push({ slug, publicUrl, issue: "missing_local_sanitized_derivative" });
    continue;
  }

  const extraction = spawnSync("pdftotext", ["-layout", localPath, "-"], { encoding: "utf8" });
  if (extraction.status !== 0) {
    findings.push({ slug, publicUrl, issue: "text_extraction_failed" });
    continue;
  }

  extractedTextDocuments += 1;
  const matches = extraction.stdout.match(phonePattern) ?? [];
  const nonOfficialPhones = matches.filter((match) => !officialDigits.has(match.replace(/\D/g, "")));
  if (nonOfficialPhones.length) {
    findings.push({ slug, publicUrl, issue: "non_official_phone_in_extracted_text", values: nonOfficialPhones });
  }
  if (matches.some((match) => officialDigits.has(match.replace(/\D/g, "")))) {
    officialContactDocuments += 1;
  }
}

const summary = {
  publicCatalogEntries: Object.keys(manifest).length,
  extractedTextDocuments,
  officialContactDocuments,
  findings,
};

console.log(JSON.stringify(summary, null, 2));
if (summary.publicCatalogEntries !== 204 || extractedTextDocuments !== 204 || findings.length) {
  process.exitCode = 1;
}
