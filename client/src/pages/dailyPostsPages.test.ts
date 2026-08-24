import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const app = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const shell = readFileSync(new URL("../components/SiteShell.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");
const listing = readFileSync(new URL("./DailyPosts.tsx", import.meta.url), "utf8");
const detail = readFileSync(new URL("./DailyPostDetail.tsx", import.meta.url), "utf8");
const admin = readFileSync(new URL("./DailyPostsAdmin.tsx", import.meta.url), "utf8");
const content = readFileSync(new URL("../components/DailyPostContent.tsx", import.meta.url), "utf8");

describe("Daily Posts public and management UI", () => {
  it("registers lazy-loaded public listing, detail, and protected management routes", () => {
    expect(app).toContain('const DailyPosts = lazy(() => import("./pages/DailyPosts"));');
    expect(app).toContain('const DailyPostDetail = lazy(() => import("./pages/DailyPostDetail"));');
    expect(app).toContain('const DailyPostsAdmin = lazy(() => import("./pages/DailyPostsAdmin"));');
    expect(app).toContain('<Route path={"/daily-posts"} component={DailyPosts} />');
    expect(app).toContain('<Route path={"/daily-posts/:slug"} component={DailyPostDetail} />');
    expect(app).toContain('<Route path={"/admin/daily-posts"} component={DailyPostsAdmin} />');
  });

  it("adds a bilingual Daily Posts navigation entry and homepage integration without placeholder posts", () => {
    expect(shell).toContain('dailyPosts: "Daily Posts"');
    expect(shell).toContain('dailyPosts: "روزانہ پوسٹس"');
    expect(shell).toContain('{ href: "/daily-posts", label: t.dailyPosts }');
    expect(home).toContain("function LatestDailyPosts()");
    expect(home).toContain("dailyPostsApi.list({ pageSize: 3 })");
    expect(home).toContain("if (!posts.length) return null;");
  });

  it("provides searchable filters, pagination, safe reader rendering, sharing, related posts, and PDFs", () => {
    expect(listing).toContain('dailyPostsApi.list({ page: nextPage, pageSize: 9');
    expect(listing).toContain('setLocation(`/daily-posts${suffix ? `?${suffix}` : ""}`)');
    expect(listing).toContain("Math.ceil(result.total / result.pageSize)");
    expect(detail).toContain("navigator.share");
    expect(detail).toContain("navigator.clipboard.writeText");
    expect(detail).toContain("post.attachmentUrl");
    expect(detail).toContain("related.length > 0");
    expect(content).toContain("function safeUrl");
    expect(content).toContain('value.startsWith("/manus-storage/") || /^https:\\/\\//i.test(value)');
    expect(content).not.toContain("dangerouslySetInnerHTML");
  });

  it("keeps the editor protected and offers publish, schedule, duplicate, image, PDF, category, preview, and multilingual controls", () => {
    expect(admin).toContain('sessionStorage.getItem("scholar-admin-key")');
    expect(admin).toContain('dailyPostsAdminApi.verify(accessKey)');
    expect(admin).toContain('value="published"');
    expect(admin).toContain('value="scheduled"');
    expect(admin).toContain('dailyPostsAdminApi.duplicate(accessKey, post.id)');
    expect(admin).toContain('void upload("image", event.target.files?.[0])');
    expect(admin).toContain('void upload("attachment", event.target.files?.[0])');
    expect(admin).toContain('dailyPostsAdminApi.createCategory');
    expect(admin).toContain('DailyPostContent');
    expect(admin).toContain('(["En", "Ur", "Ar"] as const)');
  });
});
