import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { auditFatwaPrivacyImage } from "./lib/fatwaPrivacyVision.mjs";

const [auditPath, ...targets] = process.argv.slice(2);
if (!auditPath || !targets.length) {
  throw new Error("Usage: node scripts/retry-fatwa-privacy-pages.mjs <audit.json> <slug:page> [...]");
}

const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "fatwa-privacy-retry-"));

function renderPage(pdfPath, pageNumber, imagePath) {
  const prefix = imagePath.replace(/\.png$/, "");
  const result = spawnSync("pdftoppm", ["-f", String(pageNumber), "-l", String(pageNumber), "-r", "175", "-png", pdfPath, prefix], { encoding: "utf8" });
  const rendered = fs.readdirSync(path.dirname(imagePath))
    .filter((file) => file.startsWith(`${path.basename(prefix)}-`) && file.endsWith(".png"));
  if (result.status !== 0 || rendered.length !== 1) throw new Error(`Unable to render page ${pageNumber} of ${pdfPath}`);
  fs.renameSync(path.join(path.dirname(imagePath), rendered[0]), imagePath);
}

async function auditWithRetry(imagePath) {
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

try {
  for (const target of targets) {
    const [slug, pageValue] = target.split(":");
    const page = Number(pageValue);
    const document = audit.documents.find((item) => item.slug === slug);
    if (!document || !Number.isInteger(page) || page < 1 || page > document.pages) {
      throw new Error(`Invalid privacy retry target: ${target}`);
    }

    const imagePath = path.join(scratch, `${slug}-${page}.png`);
    renderPage(document.sourcePdf, page, imagePath);
    const pageAudit = await auditWithRetry(imagePath);
    const index = document.pageAudits.findIndex((item) => item.page === page);
    if (index === -1) throw new Error(`Audit document ${slug} does not contain page ${page}`);
    document.pageAudits[index] = { page, ...pageAudit };
    document.status = document.pageAudits.every((item) => !item.error) ? "ok" : "failed";
    fs.writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
    console.log(`Completed retry for ${slug} page ${page}.`);
  }
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}
