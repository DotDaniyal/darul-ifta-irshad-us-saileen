import fs from "node:fs";

const root = "/home/ubuntu/darul-ifta-irshad-us-saileen";
const uploadOutput = fs.readFileSync(`${root}/.tmp/fatwa-public-sanitized-upload.txt`, "utf8");
const outputPath = `${root}/scripts/fatwa-public-sanitized-url-manifest.json`;

const entries = [...uploadOutput.matchAll(
  /Storage Path: (\/manus-storage\/sanitized-fatwa-([a-z]\d{4})-(\d+)_([^\s]+\.pdf))/g,
)].map((match) => ({
  slug: `${match[2]}-${match[3]}`,
  pdfUrl: match[1],
}));

if (entries.length !== 204) {
  throw new Error(`Expected 204 sanitized storage paths; found ${entries.length}.`);
}

const urlsBySlug = new Map();
for (const entry of entries) {
  if (urlsBySlug.has(entry.slug)) {
    throw new Error(`Duplicate sanitized asset for ${entry.slug}.`);
  }
  urlsBySlug.set(entry.slug, entry.pdfUrl);
}

const manifest = Object.fromEntries([...urlsBySlug.entries()].sort(([left], [right]) => left.localeCompare(right)));
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${Object.keys(manifest).length} sanitized public PDF paths.`);
