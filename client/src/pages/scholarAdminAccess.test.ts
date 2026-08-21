import { createServer } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../../server/app";

let server: ReturnType<typeof createServer>;
let baseUrl = "";

beforeAll(async () => {
  server = createServer(createApp());
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not bind to a TCP port.");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

describe("scholar management administrator access", () => {
  it("accepts the configured administrator access key through the lightweight session endpoint", async () => {
    const response = await fetch(`${baseUrl}/api/admin/scholar-session`, {
      headers: { "x-scholar-admin-key": process.env.SCHOLAR_ADMIN_ACCESS_KEY ?? "" },
    });
    expect(response.status).toBe(204);
  });

  it("rejects a missing administrator access key", async () => {
    const response = await fetch(`${baseUrl}/api/admin/scholar-session`);
    expect(response.status).toBe(401);
  });

  it("exposes only the published scholar records publicly", async () => {
    const response = await fetch(`${baseUrl}/api/scholars`);
    expect(response.status).toBe(200);
    const records = await response.json() as Array<{ slug: string; isPublished: boolean }>;
    expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ slug: "mufti-abdul-mannan", isPublished: true })]));
    expect(records.every(record => record.isPublished)).toBe(true);
  });

  it("protects the full scholar registry while allowing an authorised administrator to read it", async () => {
    const denied = await fetch(`${baseUrl}/api/admin/scholars`);
    expect(denied.status).toBe(401);

    const allowed = await fetch(`${baseUrl}/api/admin/scholars`, {
      headers: { "x-scholar-admin-key": process.env.SCHOLAR_ADMIN_ACCESS_KEY ?? "" },
    });
    expect(allowed.status).toBe(200);
    const records = await allowed.json() as Array<{ slug: string }>;
    expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ slug: "mufti-abdul-mannan" })]));
  });

  it("supports the protected create, edit, publish, unpublish, and delete lifecycle with a temporary record", async () => {
    const accessHeaders = {
      "content-type": "application/json",
      "x-scholar-admin-key": process.env.SCHOLAR_ADMIN_ACCESS_KEY ?? "",
    };
    const slug = `temporary-scholar-${Date.now()}`;
    let id: number | undefined;

    try {
      const created = await fetch(`${baseUrl}/api/admin/scholars`, {
        method: "POST",
        headers: accessHeaders,
        body: JSON.stringify({
          slug,
          nameEn: "Temporary Scholar",
          nameUr: "عارضی عالم",
          titleEn: "Temporary record",
          titleUr: "عارضی ریکارڈ",
          isPublished: false,
        }),
      });
      expect(created.status).toBe(201);
      const record = await created.json() as { id: number; isPublished: boolean };
      id = record.id;
      expect(record.isPublished).toBe(false);

      const unpublished = await fetch(`${baseUrl}/api/scholars/${slug}`);
      expect(unpublished.status).toBe(404);

      const published = await fetch(`${baseUrl}/api/admin/scholars/${id}`, {
        method: "PATCH",
        headers: accessHeaders,
        body: JSON.stringify({ titleEn: "Edited temporary record", isPublished: true }),
      });
      expect(published.status).toBe(200);
      expect(await published.json()).toEqual(expect.objectContaining({ titleEn: "Edited temporary record", isPublished: true }));

      const publiclyVisible = await fetch(`${baseUrl}/api/scholars/${slug}`);
      expect(publiclyVisible.status).toBe(200);

      const unpublishedAgain = await fetch(`${baseUrl}/api/admin/scholars/${id}`, {
        method: "PATCH",
        headers: accessHeaders,
        body: JSON.stringify({ isPublished: false }),
      });
      expect(unpublishedAgain.status).toBe(200);
      const hiddenAgain = await fetch(`${baseUrl}/api/scholars/${slug}`);
      expect(hiddenAgain.status).toBe(404);
    } finally {
      if (id) {
        const deleted = await fetch(`${baseUrl}/api/admin/scholars/${id}`, {
          method: "DELETE",
          headers: { "x-scholar-admin-key": process.env.SCHOLAR_ADMIN_ACCESS_KEY ?? "" },
        });
        expect(deleted.status).toBe(204);
      }
    }
  });
});
