import { describe, expect, it } from "vitest";
import { buildQuestionSubmissionNotification, createTrackingSecret, hashTrackingSecret, matchesDeclaredAttachmentType, publicQuestionSubmissionInput } from "./questionIntake";

const question = {
  isAnonymous: false,
  requesterName: "A concerned questioner",
  requesterEmail: "questioner@example.com",
  preferredLanguage: "ur" as const,
  subject: "A question about worship",
  questionBody: "This is a detailed question that meets the secure intake minimum length.",
  attachments: [],
};

describe("confidential question intake contract", () => {
  it("requires contact details unless anonymity is explicitly selected", () => {
    expect(publicQuestionSubmissionInput.safeParse(question).success).toBe(true);
    expect(publicQuestionSubmissionInput.safeParse({ ...question, requesterEmail: undefined, requesterPhone: undefined }).success).toBe(false);
    expect(publicQuestionSubmissionInput.safeParse({ ...question, isAnonymous: true, requesterEmail: undefined }).success).toBe(true);
  });

  it("limits attachments to the approved private intake file types", () => {
    const invalid = publicQuestionSubmissionInput.safeParse({
      ...question,
      attachments: [{ fileName: "script.exe", mimeType: "application/x-msdownload", base64: "YWJjZA==" }],
    });
    expect(invalid.success).toBe(false);
  });

  it("verifies a private attachment's bytes match its declared type before storage", () => {
    expect(matchesDeclaredAttachmentType(Buffer.from("%PDF-1.7\n"), "application/pdf")).toBe(true);
    expect(matchesDeclaredAttachmentType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "image/png")).toBe(true);
    expect(matchesDeclaredAttachmentType(Buffer.from("not a PDF"), "application/pdf")).toBe(false);
    expect(matchesDeclaredAttachmentType(Buffer.from("%PDF-1.7\n"), "image/jpeg")).toBe(false);
  });

  it("creates a non-reversible tracking secret and a content-free owner notification", () => {
    const secret = createTrackingSecret();
    expect(secret.length).toBeGreaterThan(20);
    expect(hashTrackingSecret(secret)).not.toBe(secret);
    const notice = buildQuestionSubmissionNotification("DI-2026-ABCD1234");
    expect(notice.content).toContain("DI-2026-ABCD1234");
    expect(notice.content.toLowerCase()).not.toContain("question about worship");
  });
});
