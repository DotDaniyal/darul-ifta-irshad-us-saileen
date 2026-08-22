import path from "node:path";
import fs from "node:fs";
import { auditFatwaPrivacyImage } from "./lib/fatwaPrivacyVision.mjs";

const [imagePath, outputPath] = process.argv.slice(2);

if (!imagePath || !outputPath) {
  throw new Error("Usage: node scripts/audit-fatwa-pdf-page.mjs <page.png> <result.json>");
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(await auditFatwaPrivacyImage(imagePath), null, 2)}\n`);
