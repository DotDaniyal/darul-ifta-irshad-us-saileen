import { beforeEach, describe, expect, it, vi } from "vitest";
import { fatwaRecords } from "../drizzle/schema";

const mocks = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("./db", () => ({ getDb: mocks.getDb }));

import { publishApprovedFatwa } from "./platformQueries";

function publicationDb(record: Record<string, any>) {
  const updates: Record<string, unknown>[] = [];
  const inserts: Record<string, unknown>[] = [];
  const db: any = {
    select: vi.fn((projection?: Record<string, unknown>) => ({
      from: vi.fn(() => ({
        where: vi.fn(() => {
          const rows = projection && "latest" in projection ? [{ latest: 0 }] : [record];
          return Object.assign(Promise.resolve(rows), { limit: vi.fn().mockResolvedValue([record]) });
        }),
      })),
    })),
    update: vi.fn((table: unknown) => ({
      set: vi.fn((values: Record<string, unknown>) => {
        updates.push(values);
        if (table === fatwaRecords) Object.assign(record, values);
        return { where: vi.fn().mockResolvedValue([{ affectedRows: 1 }]) };
      }),
    })),
    insert: vi.fn(() => ({
      values: vi.fn((values: Record<string, unknown>) => {
        inserts.push(values);
        return Promise.resolve([{ insertId: 1 }]);
      }),
    })),
    transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback(db)),
  };
  return { db, updates, inserts };
}

describe("governed Fatwa publication procedure", () => {
  beforeEach(() => vi.clearAllMocks());

  it("publishes only after approval, redacts obvious contact data, and persists both revision and audit evidence", async () => {
    const record = {
      id: 91, slug: "private-case", referenceNumber: "DI-F-2026-TEST", sourceQuestionId: 41, categoryId: null, methodologyId: null,
      authorId: 7, approverId: 8, status: "approved", titleEn: "Private enquiry", titleUr: null, titleAr: null,
      summaryEn: "Please contact case@example.test", summaryUr: null, summaryAr: null,
      bodyEn: "Call +92 333 2617671 or see https://private.example.test/case", bodyUr: null, bodyAr: null,
      tags: [], publicPdfUrl: null, publishedAt: null, createdAt: new Date(), updatedAt: new Date(),
    };
    const fake = publicationDb(record);
    mocks.getDb.mockResolvedValue(fake.db);

    const result = await publishApprovedFatwa({ fatwaId: 91, publicationTreatment: "anonymized" }, 8);

    expect(result.status).toBe("published");
    expect(fake.updates[0]).toMatchObject({ status: "published" });
    expect(JSON.stringify(fake.updates[0])).not.toContain("case@example.test");
    expect(JSON.stringify(fake.updates[0])).not.toContain("2617671");
    const revision = fake.inserts.find(row => row.revisionNumber === 1);
    expect(revision).toMatchObject({ fatwaId: 91, editorId: 8, snapshot: expect.objectContaining({ status: "published", publicationTreatment: "anonymized" }) });
    expect(JSON.stringify(revision)).not.toContain("private.example.test");
    const audit = fake.inserts.find(row => row.action === "fatwa_published");
    expect(audit).toMatchObject({ actorId: 8, metadata: expect.objectContaining({ publicationTreatment: "anonymized", sourceQuestionId: 41 }) });
  });

  it("rejects publication by the drafting scholar even where the record is approved", async () => {
    const record = {
      id: 92, slug: "self-review", referenceNumber: "DI-F-2026-SELF", sourceQuestionId: null, categoryId: null, methodologyId: null,
      authorId: 7, approverId: 8, status: "approved", titleEn: "A draft", titleUr: null, titleAr: null, summaryEn: null, summaryUr: null, summaryAr: null,
      bodyEn: "This controlled scholarly answer is long enough.", bodyUr: null, bodyAr: null, tags: [], publicPdfUrl: null, publishedAt: null, createdAt: new Date(), updatedAt: new Date(),
    };
    const fake = publicationDb(record);
    mocks.getDb.mockResolvedValue(fake.db);

    await expect(publishApprovedFatwa({ fatwaId: 92, publicationTreatment: "generalized" }, 7)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(fake.db.transaction).not.toHaveBeenCalled();
  });
});
