import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(role: "user" | "scholar" | "reviewer" | "admin"): TrpcContext {
  return {
    user: {
      id: 7,
      openId: "platform-test-user",
      name: "Platform Test",
      email: "platform@example.test",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("workspace.summary", () => {
  it("exposes only the correct capability flags for a scholar", async () => {
    const result = await appRouter.createCaller(createContext("scholar")).workspace.summary();

    expect(result.permissions).toEqual({
      canSubmitQuestions: true,
      canDraftFatwas: true,
      canReviewFatwas: false,
      canAdministerPlatform: false,
    });
  });

  it("grants approval and administration capabilities only to the correct roles", async () => {
    const reviewer = await appRouter.createCaller(createContext("reviewer")).workspace.summary();
    const admin = await appRouter.createCaller(createContext("admin")).workspace.summary();

    expect(reviewer.permissions.canReviewFatwas).toBe(true);
    expect(reviewer.permissions.canAdministerPlatform).toBe(false);
    expect(admin.permissions.canAdministerPlatform).toBe(true);
  });
});

describe("concrete role-protected platform actions", () => {
  it("prevents a questioner from reading assigned scholarly questions", async () => {
    await expect(appRouter.createCaller(createContext("user")).questions.assigned()).rejects.toMatchObject<Partial<TRPCError>>({
      code: "FORBIDDEN",
    });
  });

  it("prevents a scholar from opening the independent review queue", async () => {
    await expect(appRouter.createCaller(createContext("scholar")).review.queue()).rejects.toMatchObject<Partial<TRPCError>>({
      code: "FORBIDDEN",
    });
  });

  it("prevents a reviewer from opening platform administration data", async () => {
    await expect(appRouter.createCaller(createContext("reviewer")).administration.overview()).rejects.toMatchObject<Partial<TRPCError>>({
      code: "FORBIDDEN",
    });
  });

  it("prevents a scholar from changing account roles", async () => {
    await expect(
      appRouter.createCaller(createContext("scholar")).administration.setUserRole({ userId: 9, role: "reviewer" })
    ).rejects.toMatchObject<Partial<TRPCError>>({ code: "FORBIDDEN" });
  });
});
