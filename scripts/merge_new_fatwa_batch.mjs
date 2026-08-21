import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const cataloguePath = path.join(projectRoot, "client/src/data/fatawa.ts");
const manifestPath = path.join(import.meta.dirname, "new_fatwa_batch_a02.json");
const source = await fs.readFile(cataloguePath, "utf8");
const match = source.match(/export const FATAWA: Fatwa\[\] = (\[[\s\S]*?\n\]);/);

if (!match) throw new Error("Could not parse the Fatwa catalogue array.");

const existing = JSON.parse(match[1]);
const additions = JSON.parse(await fs.readFile(manifestPath, "utf8"));
if (additions.length !== 32) throw new Error(`Expected 32 new Fatwa records, received ${additions.length}.`);

const requiredCategories = new Set(["Worship", "Transactions", "Marriage & Divorce", "Inheritance & Wills", "Belief & Conduct"]);
for (const item of additions) {
  if (!item.slug || !item.number || !item.titleUr || !requiredCategories.has(item.category) || !item.pdfUrl.startsWith("/manus-storage/")) {
    throw new Error(`Invalid new Fatwa manifest item: ${JSON.stringify(item)}`);
  }
}

const existingNumbers = new Set(existing.map((item) => item.number));
const duplicate = additions.find((item) => existingNumbers.has(item.number));
if (duplicate) throw new Error(`Fatwa ${duplicate.number} already exists in the catalogue.`);

const archiveCopy = {
  date: "PDF Archive",
  scholar: "دارالافتاء ارشاد السائلین",
  questionEn: "Open the original PDF for the complete question, researched answer, and supporting detail.",
  questionUr: "مکمل سوال، جواب اور تحقیقی تفصیل کے لیے اصل پی ڈی ایف فتویٰ ملاحظہ کریں۔",
  answerEn: "Open the original PDF for the complete question, researched answer, and supporting detail.",
  answerUr: "مکمل سوال، جواب اور تحقیقی تفصیل کے لیے اصل پی ڈی ایف فتویٰ ملاحظہ کریں۔",
  reference: "Original Darul Ifta PDF document; non-approved phone numbers redacted and approved institutional number retained.",
};

const records = additions.map((item) => ({
  ...item,
  ...archiveCopy,
  titleEn: `Fatwa Archive · ${item.number}`,
  topics: [item.category, item.number],
}));

const merged = [...existing, ...records];
const nextSource = source.replace(match[1], JSON.stringify(merged, null, 2));
await fs.writeFile(cataloguePath, nextSource);
console.log(`Merged ${records.length} new Fatwa records. Catalogue total: ${merged.length}.`);
