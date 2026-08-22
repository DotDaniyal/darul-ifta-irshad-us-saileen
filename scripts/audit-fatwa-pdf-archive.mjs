import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { auditFatwaPrivacyImage } from "./lib/fatwaPrivacyVision.mjs";

const [inputManifestPath, outputPath] = process.argv.slice(2);
if (!inputManifestPath || !outputPath) throw new Error("Usage: node scripts/audit-fatwa-pdf-archive.mjs <input-manifest.json> <audit-output.json>");

const input = JSON.parse(fs.readFileSync(inputManifestPath, "utf8"));
if (!Array.isArray(input.documents) || !input.documents.length) throw new Error("The privacy input manifest has no documents.");

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "fatwa-privacy-audit-"));
const priorAudit = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, "utf8")) : null;
const completed = new Map((priorAudit?.documents || []).filter((document) => document.status === "ok").map((document) => [document.slug, document]));
const audit = { auditedAt: new Date().toISOString(), documents: [...completed.values()] };
const pending = input.documents.filter((document) => !completed.has(document.slug));
const concurrency = Math.max(1, Math.min(4, Number(process.env.FATWA_PRIVACY_AUDIT_CONCURRENCY || 4)));

function pageCount(pdfPath) {
  const result = spawnSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  const match = result.stdout.match(/^Pages:\s+(\d+)$/m);
  if (result.status !== 0 || !match) throw new Error(`Unable to read page count for ${pdfPath}`);
  return Number(match[1]);
}

function renderPage(pdfPath, pageNumber, imagePath) {
  const prefix = imagePath.replace(/\.png$/, "");
  const result = spawnSync("pdftoppm", ["-f", String(pageNumber), "-l", String(pageNumber), "-r", "200", "-png", pdfPath, prefix], { encoding: "utf8" });
  const rendered = fs.readdirSync(path.dirname(imagePath))
    .filter((file) => file.startsWith(`${path.basename(prefix)}-`) && file.endsWith(".png"));
  if (result.status !== 0 || rendered.length !== 1) throw new Error(`Unable to render page ${pageNumber} of ${pdfPath}`);
  fs.renameSync(path.join(path.dirname(imagePath), rendered[0]), imagePath);
}

async function auditPageWithRetry(imagePath) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await auditFatwaPrivacyImage(imagePath);
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
    }
  }
  throw lastError;
}

async function auditDocument(document) {
  const pages = pageCount(document.sourcePdf);
  const result = { ...document, pages, status: "ok", pageAudits: [] };
  for (let page = 1; page <= pages; page += 1) {
    const imagePath = path.join(scratch, `${document.slug}-${page}.png`);
    renderPage(document.sourcePdf, page, imagePath);
    try {
      const pageAudit = await auditPageWithRetry(imagePath);
      result.pageAudits.push({ page, ...pageAudit });
    } catch (error) {
      result.status = "failed";
      result.pageAudits.push({ page, error: error instanceof Error ? error.message : String(error), regions: [] });
    } finally {
      fs.rmSync(imagePath, { force: true });
    }
  }
  return result;
}

let nextPendingIndex = 0;
let completedCount = audit.documents.length;

async function worker() {
  while (true) {
    const currentIndex = nextPendingIndex;
    nextPendingIndex += 1;
    if (currentIndex >= pending.length) return;
    const result = await auditDocument(pending[currentIndex]);
    audit.documents.push(result);
    completedCount += 1;
    audit.documents.sort((left, right) => input.documents.findIndex((item) => item.slug === left.slug) - input.documents.findIndex((item) => item.slug === right.slug));
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(audit, null, 2)}\n`);
    const regions = audit.documents.reduce((total, item) => total + item.pageAudits.reduce((pageTotal, entry) => pageTotal + entry.regions.length, 0), 0);
    console.log(`Audited ${completedCount}/${input.documents.length} PDFs; detected ${regions} redactable regions so far.`);
  }
}

try {
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}

const failures = audit.documents.filter((document) => document.status !== "ok");
if (failures.length) throw new Error(`Privacy audit failed for ${failures.length} document(s).`);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(audit, null, 2)}\n`);
console.log(`Completed full-page privacy audit for ${audit.documents.length} PDFs.`);
