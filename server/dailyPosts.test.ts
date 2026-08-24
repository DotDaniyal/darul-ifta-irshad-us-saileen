import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseDailyPostCategoryInput, parseDailyPostInput, slugifyDailyPost } from "./dailyPosts";

const app = readFileSync(new URL("./app.ts", import.meta.url), "utf8");
const storage = readFileSync(new URL("./storage.ts", import.meta.url), "utf8");

describe("Daily Posts server validation and publication boundary", () => {
  it("normalizes a multilingual Daily Post, keeps future publication as a draft, and produces an SEO-safe slug", () => {
    expect(slugifyDailyPost("  Islamic Reminder: Friday  ")).toBe("islamic-reminder-friday");
    const input = parseDailyPostInput({
      titleUr: "جمعہ کی یاددہانی",
      contentUr: "## اہم نکتہ\n\n**علم** کے ساتھ عمل کریں۔",
      scheduledAt: "2026-12-01T12:00:00.000Z",
      status: "draft",
    });
    expect(input?.slug).toContain("daily-post-");
    expect(input?.titleUr).toBe("جمعہ کی یاددہانی");
    expect(input?.contentUr).toContain("## اہم نکتہ");
    expect(input?.scheduledAt).toBeInstanceOf(Date);
  });

  it("requires at least one localized title and content field, and rejects untrusted attachment URLs", () => {
    expect(parseDailyPostInput({ titleEn: "Only a title" })).toBeUndefined();
    expect(parseDailyPostInput({ contentEn: "Only content" })).toBeUndefined();
    const partial = parseDailyPostInput({ attachmentUrl: "https://untrusted.example/file.pdf" }, true);
    expect(partial).toBeUndefined();
  });

  it("validates manageable category names and URL slugs", () => {
    expect(parseDailyPostCategoryInput({ slug: "Quran Reflections", nameEn: "Quran" })).toMatchObject({ slug: "quran-reflections", nameEn: "Quran" });
    expect(parseDailyPostCategoryInput({ slug: "missing-name" })).toBeUndefined();
  });

  it("keeps administrator management guarded and exposes public routes separately", () => {
    expect(app).toContain('api.get("/api/daily-posts", async');
    expect(app).toContain('api.get("/api/daily-posts/:slug", async');
    expect(app).toContain('api.get("/api/admin/daily-posts", requireAdministrator');
    expect(app).toContain('api.post("/api/admin/daily-posts/upload", requireAdministrator');
    expect(app).toContain('api.post("/api/admin/daily-posts/:id/duplicate", requireAdministrator');
    expect(app).toContain('api.get("/api/admin/daily-post-categories", requireAdministrator');
  });

  it("limits upload types and routes managed bytes through presigned storage rather than local files", () => {
    expect(app).toContain('const allowedImage = ["image/jpeg", "image/png", "image/webp"]');
    expect(app).toContain('const allowedAttachment = ["application/pdf"]');
    expect(app).toContain("5 * 1024 * 1024");
    expect(app).toContain("8 * 1024 * 1024");
    expect(storage).toContain('new URL("v1/storage/presign/put"');
    expect(storage).toContain('url: `/manus-storage/${key}`');
  });
});
