import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/darul-ifta-irshad-us-saileen";
const catalogPath = path.join(root, "client/src/data/fatawa.ts");
const outputPath = process.argv[2] || path.join(root, ".tmp/fatwa-privacy-input-manifest.json");
const catalogSource = fs.readFileSync(catalogPath, "utf8");
const declaration = "export const FATAWA: Fatwa[] = ";
const start = catalogSource.indexOf(declaration);
const arrayStart = start + declaration.length;
const arrayEnd = catalogSource.lastIndexOf("];\n");

if (start < 0 || catalogSource[arrayStart] !== "[" || arrayEnd < 0) throw new Error("Unable to read the generated Fatwa catalog.");

const records = JSON.parse(catalogSource.slice(arrayStart, arrayEnd + 1));
if (records.length !== 204) throw new Error(`Expected 204 current Fatwa records, found ${records.length}.`);

const a03VariantKeys = new Map([["A0361", ["A0361-coerced-writing", "A0361-written-statement"]]]);
const a03VariantOffsets = new Map();

function sourceForRecord(record, index) {
  if (index < 74) return path.join("/home/ubuntu/webdev-static-assets/fatawa", `fatwa-${String(index + 1).padStart(3, "0")}.pdf`);
  if (index < 106) return path.join("/home/ubuntu/webdev-static-assets/fatawa-a02-ascii", `${record.number}.pdf`);
  if (index < 165) {
    const variants = a03VariantKeys.get(record.number);
    if (!variants) return path.join("/home/ubuntu/webdev-static-assets/fatawa-a03", `${record.number}.pdf`);
    const offset = a03VariantOffsets.get(record.number) || 0;
    a03VariantOffsets.set(record.number, offset + 1);
    return path.join("/home/ubuntu/webdev-static-assets/fatawa-a03", `${variants[offset]}.pdf`);
  }
  if (index < 202) return path.join("/home/ubuntu/webdev-static-assets/fatawa-a04", `${record.number}.pdf`);
  return path.join("/home/ubuntu/webdev-static-assets/fatawa-a05", `${record.number}.pdf`);
}

const documents = records.map((record, index) => {
  const sourcePdf = sourceForRecord(record, index);
  if (!fs.existsSync(sourcePdf)) throw new Error(`Missing staged source PDF for ${record.slug}: ${sourcePdf}`);
  return {
    slug: record.slug,
    number: record.number,
    rawPdfUrl: record.pdfUrl,
    sourcePdf,
    sourceSha256: crypto.createHash("sha256").update(fs.readFileSync(sourcePdf)).digest("hex"),
  };
});

const duplicateSlugs = documents.filter((document, index) => documents.findIndex((candidate) => candidate.slug === document.slug) !== index);
if (duplicateSlugs.length) throw new Error("The public Fatwa catalog contains duplicate slugs.");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), documents }, null, 2)}\n`);
console.log(`Created privacy input manifest for ${documents.length} published Fatwa PDFs.`);
