import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const siteShell = readFileSync(new URL("./SiteShell.tsx", import.meta.url), "utf8");

describe("official WhatsApp Channel link", () => {
  it("keeps the supplied channel URL distinct from direct WhatsApp contact and exposes an accessible bilingual footer link", () => {
    expect(siteShell).toContain('const whatsappChannelUrl = "https://whatsapp.com/channel/0029VaCc5dK7T8bclVGHu20Q";');
    expect(siteShell).toContain('href={whatsappChannelUrl} target="_blank" rel="noreferrer"');
    expect(siteShell).toContain('language === "ur" ? "واٹس ایپ چینل" : "WhatsApp Channel"');
    expect(siteShell).toContain('href="https://wa.me/923332617671"');
  });
});
