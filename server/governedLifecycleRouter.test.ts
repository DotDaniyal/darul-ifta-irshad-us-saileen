import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const events: string[] = [];
const mocks = vi.hoisted(() => ({
  approveFatwaDraft: vi.fn(async () => { events.push("approved"); return { fatwaId: 41, status: "approved" }; }),
  claimQuestion: vi.fn(async () => { events.push("claimed"); return { questionId: 21, status: "in_review" }; }),
  createFatwaDraft: vi.fn(async () => { events.push("draft-created"); return { fatwaId: 41, referenceNumber: "DI-F-2026-TEST", status: "draft" }; }),
  getAssignedQuestionSummaries: vi.fn(async () => []),
  getApprovedFatwaPublicationQueue: vi.fn(async () => []),
  getClaimableQuestionSummaries: vi.fn(async () => []),
  getFatwaReviewQueue: vi.fn(async () => []),
  getMyFatwaDrafts: vi.fn(async () => []),
  getMyQuestionSummaries: vi.fn(async () => []),
  getPublicCatalogueTaxonomy: vi.fn(async () => ({ categories: [], methodologies: [] })),
  getPlatformOverview: vi.fn(async () => ({ users: [], questions: [], fatwas: [] })),
  publishApprovedFatwa: vi.fn(async () => { events.push("published"); return { fatwaId: 41, status: "published", publishedAt: new Date() }; }),
  returnFatwaDraft: vi.fn(async () => { events.push("returned"); return { fatwaId: 41, status: "research" }; }),
  searchPublishedFatwas: vi.fn(async () => ({ records: [], total: 0 })),
  upsertPublicPolicy: vi.fn(async () => ({ id: 1, key: "publication" })),
  updateFatwaDraft: vi.fn(async () => { events.push("submitted-for-review"); return { fatwaId: 41, status: "review", updatedAt: new Date() }; }),
  updatePlatformUserRole: vi.fn(async () => ({ userId: 1, role: "scholar" })),
}));

vi.mock("./platformQueries", () => mocks);

import { appRouter } from "./routers";

function context(role: "scholar" | "reviewer" | "admin", id: number): TrpcContext {
  return {
    user: { id, openId: `workflow-${role}`, name: `Workflow ${role}`, email: `${role}@example.test`, loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("governed role workflow router", () => {
  it("routes a scholarly draft through independent review, controlled publication, and administrator policy governance", async () => {
    events.length = 0;
    const scholar = appRouter.createCaller(context("scholar", 7));
    const reviewer = appRouter.createCaller(context("reviewer", 8));
    const admin = appRouter.createCaller(context("admin", 9));

    await scholar.questions.claim({ questionId: 21 });
    await scholar.fatwaDraft.create({ questionId: 21, titleEn: "A governed worship question", bodyEn: "This scholarly answer contains enough detail to satisfy the controlled drafting contract." });
    await scholar.fatwaDraft.update({ fatwaId: 41, targetStatus: "review" });
    await reviewer.review.return({ fatwaId: 41, feedback: "Please cite the relevant source." });
    await reviewer.review.approve({ fatwaId: 41 });
    await reviewer.fatwaPublish.publish({ fatwaId: 41, publicationTreatment: "generalized" });
    await admin.administration.savePolicy({ key: "publication", titleEn: "Publication standard", titleUr: "اشاعت کا معیار", bodyEn: "Every public record follows independent scholarly review and controlled publication.", bodyUr: "ہر عوامی اندراج آزاد علمی نظرِ ثانی اور ذمہ دار اشاعت کے مراحل سے گزرتا ہے۔" });

    expect(events).toEqual(["claimed", "draft-created", "submitted-for-review", "returned", "approved", "published"]);
    expect(mocks.createFatwaDraft).toHaveBeenCalledWith(expect.objectContaining({ questionId: 21 }), 7);
    expect(mocks.approveFatwaDraft).toHaveBeenCalledWith(41, 8);
    expect(mocks.publishApprovedFatwa).toHaveBeenCalledWith({ fatwaId: 41, publicationTreatment: "generalized" }, 8);
  });
});
