import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const positional = args.filter((arg) => arg !== "--dry-run");
const [manifestPath, sanitizedDirectory, statePath] = positional;

if (!manifestPath || !sanitizedDirectory || !statePath) {
  throw new Error("Usage: node scripts/replace-fatwa-public-assets.mjs [--dry-run] <manifest.json> <sanitized-dir> <state.json>");
}

const forgeBaseUrl = process.env.BUILT_IN_FORGE_API_URL?.replace(/\/+$/, "");
const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
if (!forgeBaseUrl || !forgeKey) throw new Error("Managed storage is not configured.");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (!Array.isArray(manifest.documents) || manifest.sourceCount !== manifest.documents.length) {
  throw new Error("The public redaction manifest is incomplete.");
}

const records = manifest.documents.map((document) => {
  const key = String(document.rawPdfUrl || "").replace(/^\/manus-storage\//, "");
  const sanitizedPath = path.join(sanitizedDirectory, document.sanitizedFileName || "");
  if (!key || key === document.rawPdfUrl || !key.endsWith(".pdf")) throw new Error(`Invalid managed storage path for ${document.slug}`);
  if (!fs.existsSync(sanitizedPath) || fs.statSync(sanitizedPath).size < 100) throw new Error(`Missing sanitized derivative for ${document.slug}`);
  return { slug: document.slug, key, sanitizedPath };
});

if (new Set(records.map((record) => record.key)).size !== records.length) {
  throw new Error("The manifest maps multiple records to the same public storage key.");
}

if (dryRun) {
  console.log(JSON.stringify({ ready: records.length, first: records[0]?.slug, last: records.at(-1)?.slug }));
  process.exit(0);
}

const existing = fs.existsSync(statePath)
  ? JSON.parse(fs.readFileSync(statePath, "utf8"))
  : { startedAt: new Date().toISOString(), replaced: [] };
const completed = new Set(existing.replaced.map((record) => record.slug));
const pending = records.filter((record) => !completed.has(record.slug));
const concurrency = Math.max(1, Math.min(4, Number(process.env.FATWA_PRIVACY_REPLACE_CONCURRENCY || 3)));

async function presign(key) {
  const endpoint = new URL("v1/storage/presign/put", `${forgeBaseUrl}/`);
  endpoint.searchParams.set("path", key);
  const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${forgeKey}` } });
  if (!response.ok) throw new Error(`Unable to prepare managed storage replacement (${response.status}).`);
  const payload = await response.json();
  if (!payload?.url) throw new Error("Managed storage replacement URL was empty.");
  return payload.url;
}

async function replace(record) {
  const body = fs.readFileSync(record.sanitizedPath);
  const url = await presign(record.key);
  const response = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/pdf" }, body });
  if (!response.ok) throw new Error(`Managed storage replacement failed for ${record.slug} (${response.status}).`);
  return {
    slug: record.slug,
    key: record.key,
    bytes: body.length,
    sha256: crypto.createHash("sha256").update(body).digest("hex"),
    replacedAt: new Date().toISOString(),
  };
}

let next = 0;
let failures = 0;
async function worker() {
  while (next < pending.length) {
    const index = next;
    next += 1;
    const record = pending[index];
    try {
      const result = await replace(record);
      existing.replaced.push(result);
      fs.mkdirSync(path.dirname(statePath), { recursive: true });
      fs.writeFileSync(statePath, `${JSON.stringify(existing, null, 2)}\n`);
      console.log(`Replaced ${existing.replaced.length}/${records.length}: ${record.slug}`);
    } catch (error) {
      failures += 1;
      console.error(`Failed ${record.slug}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
if (failures || existing.replaced.length !== records.length) {
  throw new Error(`Public asset replacement incomplete: ${existing.replaced.length}/${records.length} replaced, ${failures} failures.`);
}
console.log(`Replaced all ${records.length} historical public Fatwa storage assets with sanitized derivatives.`);
