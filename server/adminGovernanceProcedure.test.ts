import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("./db", () => ({ getDb: mocks.getDb }));

import { upsertCategory, upsertPublicPolicy, upsertScholarProfile } from "./platformQueries";

function writeDb(selectRows: Record<string, unknown>[][] = []) {
  const inserts: Record<string, unknown>[] = [];
  const db: any = {
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue(selectRows.shift() ?? []) })) })) })),
    insert: vi.fn(() => ({ values: vi.fn((value: Record<string, unknown>) => { inserts.push(value); return Promise.resolve([{ insertId: 1 }]); }) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn().mockResolvedValue([{ affectedRows: 1 }]) })) })),
  };
  return { db, inserts };
}

describe("governed administration write procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a category and records its administrative event", async () => {
    const fake = writeDb(); mocks.getDb.mockResolvedValue(fake.db);
    await upsertCategory({ slug: "family-life", nameEn: "Family Life", nameUr: "خاندانی زندگی", sortOrder: 8, isActive: true }, 4);
    expect(fake.inserts[0]).toMatchObject({ slug: "family-life", nameEn: "Family Life", isActive: true });
    expect(fake.inserts[1]).toMatchObject({ actorId: 4, action: "category_created", entityType: "fatwa_category" });
  });

  it("creates a verified scholarly profile and records publication visibility without exposing private user data", async () => {
    const fake = writeDb([[{ id: 12, role: "scholar" }], []]); mocks.getDb.mockResolvedValue(fake.db);
    await upsertScholarProfile({ userId: 12, slug: "mufti-example", honorific: "Mufti", displayNameEn: "Mufti Example", displayNameUr: "مفتی مثال", biographyEn: "Verified biography information for the public scholar profile.", biographyUr: "عوامی علمی پروفائل کے لیے مستند تعارفی معلومات۔", qualifications: ["Dars-e-Nizami"], scholarlyLineage: "Verified scholarly lineage", isPublished: true }, 4);
    expect(fake.inserts[0]).toMatchObject({ userId: 12, slug: "mufti-example", isPublished: true, qualifications: ["Dars-e-Nizami"] });
    expect(fake.inserts[1]).toMatchObject({ actorId: 4, action: "scholar_profile_created", metadata: { userId: 12, isPublished: true } });
  });

  it("upserts a constrained public trust policy and records the audit event", async () => {
    const fake = writeDb([[]]); mocks.getDb.mockResolvedValue(fake.db);
    await upsertPublicPolicy({ key: "privacy", titleEn: "Confidentiality", titleUr: "رازداری", bodyEn: "Private question details remain limited to authorised scholarly personnel.", bodyUr: "نجی سوالات کی تفصیل صرف مجاز علمی عملے تک محدود رہتی ہے۔" }, 4);
    expect(fake.inserts[0]).toMatchObject({ settingKey: "policy.privacy", updatedById: 4, value: expect.objectContaining({ titleEn: "Confidentiality" }) });
    expect(fake.inserts[1]).toMatchObject({ actorId: 4, action: "public_policy_updated", entityId: "policy.privacy" });
  });
});
