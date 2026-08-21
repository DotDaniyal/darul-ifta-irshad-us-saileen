import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const uploadsDirectory = "/home/ubuntu/upload";
const cataloguePath = "/home/ubuntu/darul-ifta-irshad-us-saileen/client/src/data/fatawa.ts";
const reportPath = "/home/ubuntu/darul-ifta-irshad-us-saileen/scripts/a00_supplied_batch_audit.json";
const suppliedPattern = /^(A0\d{3})-(.+)\.pdf$/u;
const phonePattern = /(?:\+?92\s*[-()]?\s*0?3\d{2}|0?3\d{2})\s*[-()]?\s*\d{3}\s*[-()]?\s*\d{4}|0\d{2,4}\s*[-()]?\s*\d{5,8}/g;

const catalogue = readFileSync(cataloguePath, "utf8");
const existingNumbers = new Set([...catalogue.matchAll(/"number": "(A\d{4})"/g)].map((match) => match[1]));

const files = readdirSync(uploadsDirectory)
  .filter((filename) => suppliedPattern.test(filename))
  .map((filename) => {
    const match = filename.match(suppliedPattern);
    const number = match?.[1];
    if (!number || Number(number.slice(1)) > 100) return null;

    const fullPath = path.join(uploadsDirectory, filename);
    let text = "";
    try {
      text = execFileSync("pdftotext", ["-layout", fullPath, "-"], { encoding: "utf8", maxBuffer: 12 * 1024 * 1024 });
    } catch {
      text = "";
    }

    const numbers = [...new Set(text.match(phonePattern) ?? [])].map((value) => value.replace(/\s+/g, " ").trim());
    return {
      filename,
      number,
      title: match[2],
      bytes: statSync(fullPath).size,
      sha256: createHash("sha256").update(readFileSync(fullPath)).digest("hex"),
      existingArchiveRecord: existingNumbers.has(number),
      extractedPhoneNumbers: numbers,
      textExtracted: text.length > 0,
    };
  })
  .filter(Boolean)
  .sort((left, right) => left.number.localeCompare(right.number) || left.filename.localeCompare(right.filename));

const groups = new Map();
for (const file of files) groups.set(file.number, [...(groups.get(file.number) ?? []), file.filename]);

const report = {
  generatedAt: new Date().toISOString(),
  filesReviewed: files.length,
  distinctFatwaNumbers: groups.size,
  duplicateNumbers: [...groups.entries()].filter(([, filenames]) => filenames.length > 1).map(([number, filenames]) => ({ number, filenames })),
  existingArchiveRecords: files.filter((file) => file.existingArchiveRecord).length,
  missingArchiveRecords: files.filter((file) => !file.existingArchiveRecord).map((file) => file.number),
  filesWithExtractedPhoneNumbers: files.filter((file) => file.extractedPhoneNumbers.length > 0).map((file) => ({ filename: file.filename, phoneNumbers: file.extractedPhoneNumbers })),
  files,
};

writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  filesReviewed: report.filesReviewed,
  distinctFatwaNumbers: report.distinctFatwaNumbers,
  duplicateNumbers: report.duplicateNumbers,
  existingArchiveRecords: report.existingArchiveRecords,
  missingArchiveRecords: report.missingArchiveRecords,
  filesWithExtractedPhoneNumbers: report.filesWithExtractedPhoneNumbers,
}, null, 2));
