import fs from "node:fs";
import path from "node:path";

const [manifestPath, slug, outputPath] = process.argv.slice(2);
if (!manifestPath || !slug || !outputPath) {
  throw new Error("Usage: node scripts/build-fatwa-public-derivative-subset.mjs <manifest.json> <slug> <output.json>");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const document = manifest.documents.find((item) => item.slug === slug);
if (!document) throw new Error(`Unknown redaction-manifest slug: ${slug}`);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({ ...manifest, sourceCount: 1, documents: [document] }, null, 2)}\n`);
console.log(`Built one-document redaction manifest for ${slug}.`);
