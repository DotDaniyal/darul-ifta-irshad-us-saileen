import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/darul-ifta-irshad-us-saileen";
const inputPath = process.argv[2] || path.join(root, ".tmp/fatwa-title-translation-output.jsonl");
const outputPath = process.argv[3] || path.join(root, "client/src/data/fatwaTranslationDrafts.ts");
const rows = fs
  .readFileSync(inputPath, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line));

if (rows.length !== 204 || rows.some((row) => row.error || !row.output)) {
  throw new Error("The English title draft batch is incomplete or contains failed rows.");
}

const drafts = Object.fromEntries(
  rows.map((row) => {
    const input = JSON.parse(row.input);
    const output = JSON.parse(row.output);
    if (!input.slug || !output.titleEn) throw new Error("A title draft is missing a required slug or English title.");
    return [input.slug, { titleEn: output.titleEn, reviewStatus: "draft-pending-review" }];
  }),
);

if (Object.keys(drafts).length !== 204) throw new Error("English title drafts must map one-to-one to all 204 Fatwa records.");

const source = `/**\n * Review-required English Fatwa title drafts.\n * Urdu originals and privacy-sanitized PDFs remain the authoritative source records.\n * Do not change reviewStatus to approved without qualified scholarly review.\n */\nimport type { FatwaTranslationDraft } from "./fatwaLocalization";\n\nexport const FATWA_TRANSLATION_DRAFTS: Record<string, FatwaTranslationDraft> = ${JSON.stringify(drafts, null, 2)};\n`;

fs.writeFileSync(outputPath, source);
console.log(`Generated ${Object.keys(drafts).length} review-required English Fatwa title drafts.`);
