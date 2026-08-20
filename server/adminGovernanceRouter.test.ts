import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("./db", () => ({ getDb: mocks.getDb }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function adminContext(): TrpcContext { return { user: { id: 4, openId: "admin-test", name: "Platform Admin", email: "admin@example.test", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] }; }
function dbFor(rows: Record<string, unknown>[][] = []) {
  const inserts: Record<string, unknown>[] = [];
  const query = () => { const result: any = {}; result.limit = vi.fn().mockResolvedValue(rows.shift() ?? []); result.orderBy = vi.fn().mockResolvedValue(rows.shift() ?? []); result.where = vi.fn(() => result); result.from = vi.fn(() => result); result.innerJoin = vi.fn(() => result); result.then = (resolve: any, reject: any) => Promise.resolve(rows.shift() ?? []).then(resolve, reject); return result; };
  const db: any = { select: vi.fn(query), insert: vi.fn(() => ({ values: vi.fn((value: Record<string, unknown>) => { inserts.push(value); return Promise.resolve([{ insertId: 1 }]); }) })), update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn().mockResolvedValue([{ affectedRows: 1 }]) })) })) };
  return { db, inserts };
}

describe("administrator governance router", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the governed overview for an administrator", async () => {
    const fake = dbFor([[], [], [], []]); mocks.getDb.mockResolvedValue(fake.db);
    await expect(appRouter.createCaller(adminContext()).administration.governance()).resolves.toEqual({ profiles: [], categories: [], methodologies: [], policies: [] });
  });

  it("routes every managed administration write through its audit-recording helper", async () => {
    const caller = appRouter.createCaller(adminContext());
    let fake = dbFor(); mocks.getDb.mockResolvedValue(fake.db);
    await caller.administration.saveCategory({ slug: "worship", nameEn: "Worship" });
    expect(fake.inserts.some(value => value.action === "category_created")).toBe(true);

    fake = dbFor(); mocks.getDb.mockResolvedValue(fake.db);
    await caller.administration.saveMethodology({ slug: "hanafi", nameEn: "Hanafi", methodologyStatement: "Guided by authorised scholarly methodology." });
    expect(fake.inserts.some(value => value.action === "methodology_created")).toBe(true);

    fake = dbFor([[]]); mocks.getDb.mockResolvedValue(fake.db);
    await caller.administration.savePolicy({ key: "publication", titleEn: "Publication standard", titleUr: "اشاعت کا معیار", bodyEn: "Each public record follows drafting, review, approval, and controlled publication.", bodyUr: "ہر عوامی اندراج مسودے، نظرِ ثانی، منظوری اور ذمہ دار اشاعت کے مراحل سے گزرتا ہے۔" });
    expect(fake.inserts.some(value => value.action === "public_policy_updated")).toBe(true);

    fake = dbFor([[{ id: 9, role: "scholar" }], []]); mocks.getDb.mockResolvedValue(fake.db);
    await caller.administration.saveScholarProfile({ userId: 9, slug: "mufti-test", displayNameEn: "Mufti Test", qualifications: ["Dars-e-Nizami"], isPublished: false });
    expect(fake.inserts.some(value => value.action === "scholar_profile_created")).toBe(true);
  });
});
