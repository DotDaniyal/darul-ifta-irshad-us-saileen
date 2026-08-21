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
});
