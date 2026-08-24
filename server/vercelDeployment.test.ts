import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const vercel = readFileSync(new URL("../vercel.json", import.meta.url), "utf8");
const adapter = readFileSync(new URL("../api/[...path].ts", import.meta.url), "utf8");
const packageJson = readFileSync(new URL("../package.json", import.meta.url), "utf8");
const storage = readFileSync(new URL("./storage.ts", import.meta.url), "utf8");
const deploymentGuide = readFileSync(new URL("../docs/vercel-deployment.md", import.meta.url), "utf8");

describe("Vercel deployment configuration", () => {
  it("builds the existing Vite output and preserves the Express API through a catch-all serverless adapter", () => {
    expect(vercel).toContain('"buildCommand": "pnpm build"');
    expect(vercel).toContain('"outputDirectory": "dist/public"');
    expect(vercel).toContain('"api/[...path].ts"');
    expect(vercel).toContain('"source": "/manus-storage/:path*"');
    expect(vercel).toContain('"destination": "https://darulifta-bkfbzf6u.manus.space/manus-storage/:path*"');
    expect(adapter).toContain('import { createScholarApi } from "../server/app"');
    expect(adapter).toContain("export default api");
  });

  it("does not retain the stale GitHub Wouter patch reference that caused Vercel installation to fail", () => {
    expect(packageJson).not.toContain("patchedDependencies");
    expect(packageJson).not.toContain("patches/wouter@3.7.1.patch");
  });

  it("keeps Vercel upload credentials server-only and supports Vercel Blob without discarding the managed-hosting fallback", () => {
    expect(packageJson).toContain('"@vercel/blob"');
    expect(storage).toContain('import { put } from "@vercel/blob"');
    expect(storage).toContain("process.env.BLOB_READ_WRITE_TOKEN");
    expect(storage).toContain("process.env.BLOB_STORE_ID");
    expect(storage).toContain("storageConfiguration()");
    expect(deploymentGuide).toContain("`DATABASE_URL`");
    expect(deploymentGuide).toContain("`SCHOLAR_ADMIN_ACCESS_KEY`");
    expect(deploymentGuide).toContain("`BLOB_READ_WRITE_TOKEN`");
    expect(deploymentGuide).not.toContain("`VITE_BLOB_READ_WRITE_TOKEN`");
  });
});
