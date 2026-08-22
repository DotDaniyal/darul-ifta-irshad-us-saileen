import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/darul-ifta-irshad-us-saileen";
const catalogPath = path.join(root, "client/src/data/fatawa.ts");
const outputPath = process.argv[2] || path.join(root, ".tmp/fatwa-title-translation-input.json");
const source = fs.readFileSync(catalogPath, "utf8");
const declaration = "export const FATAWA: Fatwa[] = ";
const start = source.indexOf(declaration);
const arrayStart = start + declaration.length;
const arrayEnd = source.lastIndexOf("];\n");

if (start < 0 || source[arrayStart] !== "[" || arrayEnd < 0) {
  throw new Error("Unable to read the current Fatwa catalog.");
}

const records = JSON.parse(source.slice(arrayStart, arrayEnd + 1));
if (records.length !== 204) throw new Error(`Expected 204 Fatwa records; found ${records.length}.`);

const input = records.map((record) =>
  JSON.stringify({
    slug: record.slug,
    number: record.number,
    category: record.category,
    titleUr: record.titleUr,
  }),
);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(input, null, 2)}\n`);
console.log(`Exported ${input.length} preserved Urdu Fatwa titles for review-required English drafting.`);
