import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  storagePut: vi.fn(),
  notifyOwner: vi.fn(),
}));

vi.mock("./db", () => ({ getDb: mocks.getDb }));
vi.mock("./storage", () => ({ storagePut: mocks.storagePut }));
vi.mock("./_core/notification", () => ({ notifyOwner: mocks.notifyOwner }));

import { createTrackingSecret, hashTrackingSecret, submitPublicQuestion, trackPublicQuestion } from "./questionIntake";

const baseQuestion = {
  isAnonymous: false,
  requesterName: "A private questioner",
  requesterEmail: "questioner@example.com",
  preferredLanguage: "ur" as const,
  subject: "A confidential question",
  questionBody: "This private question body is intentionally long enough for the governed intake workflow.",
};

function insertMock() {
  return vi.fn().mockImplementation(() => ({
    values: vi.fn().mockResolvedValue([{ insertId: 42 }]),
  }));
}

describe("confidential intake procedure behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.notifyOwner.mockResolvedValue(undefined);
    mocks.storagePut.mockResolvedValue({ key: "private/questions/DI-2026-TEST/file.png", url: "https://private.invalid/file.png" });
  });

  it("returns only safe tracking fields for a valid reference-secret pair", async () => {
    const secret = createTrackingSecret();
    const record = {
      referenceCode: "DI-2026-TRACK01",
      status: "received",
      preferredLanguage: "ur",
      submittedAt: new Date("2026-08-20T00:00:00Z"),
      updatedAt: new Date("2026-08-20T00:10:00Z"),
      trackingSecretHash: hashTrackingSecret(secret),
    };
    const db = {
      select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue([record]) })) })) })),
    };
    mocks.getDb.mockResolvedValue(db);

    const result = await trackPublicQuestion({ referenceCode: record.referenceCode, trackingSecret: secret });

    expect(result).toEqual({
      referenceCode: record.referenceCode,
      status: "received",
      preferredLanguage: "ur",
      submittedAt: record.submittedAt,
      updatedAt: record.updatedAt,
    });
    expect(result).not.toHaveProperty("trackingSecretHash");
    expect(result).not.toHaveProperty("requesterEmail");
  });

  it("rejects invalid reference-secret combinations without revealing a record", async () => {
    const db = {
      select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue([]) })) })) })),
    };
    mocks.getDb.mockResolvedValue(db);

    await expect(trackPublicQuestion({ referenceCode: "DI-2026-NOPE", trackingSecret: createTrackingSecret() }))
      .rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects mismatched and oversized attachment bytes before storage or database persistence", async () => {
    const insert = insertMock();
    mocks.getDb.mockResolvedValue({ insert });

    await expect(submitPublicQuestion({
      ...baseQuestion,
      attachments: [{ fileName: "wrong.pdf", mimeType: "application/pdf", base64: Buffer.from("not a PDF").toString("base64") }],
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });

    await expect(submitPublicQuestion({
      ...baseQuestion,
      attachments: [{ fileName: "large.pdf", mimeType: "application/pdf", base64: Buffer.alloc(2 * 1024 * 1024 + 1).toString("base64") }],
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });

    expect(mocks.storagePut).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("stores only attachment metadata and sends a content-free owner notification", async () => {
    const insert = insertMock();
    mocks.getDb.mockResolvedValue({ insert });
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString("base64");

    const submitted = await submitPublicQuestion({
      ...baseQuestion,
      attachments: [{ fileName: "evidence.png", mimeType: "image/png", base64: pngHeader }],
    });

    const persistedValues = insert.mock.results.map(result => result.value.values.mock.calls[0]?.[0]);
    const attachmentRow = persistedValues.find((row: unknown) => Array.isArray(row))?.[0] as Record<string, unknown>;
    expect(attachmentRow).toMatchObject({
      questionId: 42,
      storageKey: "private/questions/DI-2026-TEST/file.png",
      fileName: "evidence.png",
      mimeType: "image/png",
      byteSize: 8,
    });
    expect(JSON.stringify(attachmentRow)).not.toContain(pngHeader);
    expect(mocks.notifyOwner).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.stringContaining(submitted.referenceCode),
    }));
    expect(mocks.notifyOwner.mock.calls[0]?.[0]?.content).not.toContain(baseQuestion.questionBody);
  });
});
