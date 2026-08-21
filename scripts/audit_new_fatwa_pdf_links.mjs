import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.FATWA_AUDIT_BASE_URL ?? "http://localhost:3000";
const manifestPath = path.join(import.meta.dirname, "new_fatwa_batch_a02.json");
const records = JSON.parse(await fs.readFile(manifestPath, "utf8"));

const results = await Promise.all(records.map(async ({ number, pdfUrl }) => {
  const response = await fetch(new URL(pdfUrl, baseUrl), { redirect: "follow" });
  return { number, pdfUrl, status: response.status, contentType: response.headers.get("content-type") ?? "" };
}));

const failures = results.filter(({ status, contentType }) => status !== 200 || !contentType.includes("application/pdf"));
if (failures.length > 0) {
  console.error(JSON.stringify({ baseUrl, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ baseUrl, verifiedPdfLinks: results.length, first: results[0], last: results.at(-1) }, null, 2));
