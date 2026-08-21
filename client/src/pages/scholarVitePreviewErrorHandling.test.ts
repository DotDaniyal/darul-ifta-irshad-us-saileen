import { createServer as createHttpServer } from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { createServer as createViteServer } from "vite";

const { listPublishedScholars } = vi.hoisted(() => ({
  listPublishedScholars: vi.fn(),
}));

vi.mock("../../../server/scholars", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../server/scholars")>();
  return { ...actual, listPublishedScholars };
});

import { vitePluginScholarApi } from "../../../vite.config";

describe("Vite scholar API preview middleware", () => {
  it("returns the controlled JSON response when the live-preview records lookup fails", async () => {
    listPublishedScholars.mockRejectedValueOnce(new Error("Database unavailable"));
    const cacheDir = await mkdtemp(join(tmpdir(), "darul-ifta-vite-preview-"));

    const viteServer = await createViteServer({
      configFile: false,
      appType: "custom",
      cacheDir,
      plugins: [vitePluginScholarApi()],
      server: { middlewareMode: true },
    });
    const httpServer = createHttpServer(viteServer.middlewares);

    await new Promise<void>((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
    const address = httpServer.address();
    if (!address || typeof address === "string") throw new Error("Preview test server did not bind to a TCP port.");

    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/api/scholars`);

      expect(response.status).toBe(503);
      await expect(response.json()).resolves.toEqual({ error: "Scholar records are temporarily unavailable." });
    } finally {
      await new Promise<void>((resolve, reject) => httpServer.close((error) => error ? reject(error) : resolve()));
      await viteServer.close();
      await rm(cacheDir, { recursive: true, force: true });
    }
  });
});
