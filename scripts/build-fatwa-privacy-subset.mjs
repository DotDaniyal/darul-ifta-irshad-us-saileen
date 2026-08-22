import fs from "node:fs";
import path from "node:path";

const [inputPath, outputPath, ...slugs] = process.argv.slice(2);
if (!inputPath || !outputPath || !slugs.length) {
  throw new Error("Usage: node scripts/build-fatwa-privacy-subset.mjs <input.json> <output.json> <slug...>");
}

const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const wanted = new Set(slugs);
const documents = input.documents.filter((document) => wanted.has(document.slug));
if (documents.length !== wanted.size) {
  const found = new Set(documents.map((document) => document.slug));
  throw new Error(`Unknown privacy audit slug(s): ${[...wanted].filter((slug) => !found.has(slug)).join(", ")}`);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({ documents }, null, 2)}\n`);
console.log(`Built a ${documents.length}-document privacy audit subset.`);
