import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("public trust and intake safeguards", () => {
  it("registers the methodology route and exposes official email contact actions", () => {
    expect(read("../App.tsx")).toContain('path={"/methodology"}');
    expect(read("../components/SiteShell.tsx")).toContain("mailto:ask.darulifa.irshadussaaileen@gmail.com");
    expect(read("./Home.tsx")).toContain("mailto:ask.darulifa.irshadussaaileen@gmail.com");
  });

  it("does not present a local-only question form as a received request", () => {
    const intake = read("./AskFatwa.tsx");
    expect(intake).toContain("window.location.href");
    expect(intake).toContain("Your request is received only after you send that email.");
    expect(intake).not.toContain("setSent(true)");
  });

  it("records the email-draft confirmation before handing control to the mail client", () => {
    const intake = read("./AskFatwa.tsx");
    expect(intake).toContain("const mailtoUrl = `mailto:${officialEmail}");
    expect(intake.indexOf("setDraftOpened(true)")).toBeLessThan(intake.indexOf("window.setTimeout(() => { window.location.href = mailtoUrl; }, 0)"));
    expect(intake).toContain("toast.success");
  });

  it("uses the homepage search entry point to hand visitors into the archive with their query intact", () => {
    const home = read("./Home.tsx");
    const archive = read("./Fatawa.tsx");

    expect(home).toContain('id="fatawa"');
    expect(home).toContain('eyebrow={urdu ? "فتاویٰ" : "FATWA LIBRARY"}');
    expect(home).toContain("submitArchiveSearch");
    expect(home).toContain('`/fatawa?q=${encodeURIComponent(query)}`');
    expect(home).not.toContain("FATAWA.slice(0, 3)");
    expect(archive).toContain('import { Link, useLocation, useSearch } from "wouter";');
    expect(archive).toContain("const search = useSearch()");
    expect(archive).toContain("readArchiveSearchQuery(search)");
    expect(archive).toContain("<form onSubmit={submitArchiveSearch}");
    expect(archive).toContain("useEffect(() => setQuery(urlQuery), [urlQuery])");
  });

  it("handles unavailable or rejected clipboard access without an unhandled copy-action failure", () => {
    const home = read("./Home.tsx");

    expect(home).toContain("if (!navigator.clipboard?.writeText)");
    expect(home).toContain("await navigator.clipboard.writeText(value)");
    expect(home).toContain("toast.error");
  });

  it("publishes the supplied scholarly supervision profile through reusable directory and detail routes", () => {
    const app = read("../App.tsx");
    const home = read("./Home.tsx");
    const directory = read("./Scholars.tsx");
    const profile = read("./ScholarProfile.tsx");
    const types = read("../data/scholars.ts");
    const liveRegistry = read("../data/scholarsApi.ts");
    const scholarServer = read("../../../server/scholars.ts");
    const siteShell = read("../components/SiteShell.tsx");

    expect(app).toContain('path={"/scholars"}');
    expect(app).toContain('path={"/scholars/admin"}');
    expect(app).toContain('path={"/scholars/:slug"}');
    expect(app.indexOf('path={"/scholars/admin"}')).toBeLessThan(app.indexOf('path={"/scholars/:slug"}'));
    expect(home).toContain('href="/scholars"');
    expect(directory).toContain("usePublishedScholars");
    expect(directory).toContain("scholars.map");
    expect(profile).toContain('useRoute("/scholars/:slug")');
    expect(profile).toContain("usePublishedScholar");
    expect(liveRegistry).toContain('request<ApiScholar[]>("/api/scholars")');
    expect(liveRegistry).toContain("/api/scholars/${encodeURIComponent(slug)}");
    expect(siteShell).toContain('{ href: "/scholars", label: t.scholars }');
    expect(types).toContain("Scholar records themselves are database-backed");
    expect(types).not.toContain("export const SCHOLARS");
    expect(scholarServer).toContain("listPublishedScholars");
    expect(scholarServer).toContain("where(eq(scholars.isPublished, true))");
    expect(scholarServer).toContain("getPublishedScholar");
  });
});
