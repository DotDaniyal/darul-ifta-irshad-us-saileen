import { createServer } from "node:http";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const { listPublishedScholars } = vi.hoisted(() => ({
  listPublishedScholars: vi.fn(),
}));

vi.mock("../../../server/scholars", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../server/scholars")>();
  return { ...actual, listPublishedScholars };
});

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

describe("scholar API error handling", () => {
  it("returns a service-unavailable JSON response when published-record lookup fails", async () => {
    listPublishedScholars.mockRejectedValueOnce(new Error("Database unavailable"));

    const response = await fetch(`${baseUrl}/api/scholars`);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "Scholar records are temporarily unavailable." });
  });
});
