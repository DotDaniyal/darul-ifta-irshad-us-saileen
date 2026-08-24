import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const siteShell = readFileSync(new URL("./SiteShell.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../pages/Home.tsx", import.meta.url), "utf8");

describe("official WhatsApp Channel link", () => {
  it("keeps the supplied channel URL distinct from direct WhatsApp contact and exposes an accessible bilingual footer link", () => {
    expect(siteShell).toContain('const whatsappChannelUrl = "https://whatsapp.com/channel/0029VaCc5dK7T8bclVGHu20Q";');
    expect(siteShell).toContain('href={whatsappChannelUrl} target="_blank" rel="noreferrer"');
    expect(siteShell).toContain('language === "ur" ? "واٹس ایپ چینل" : "WhatsApp Channel"');
    expect(siteShell).toContain('href="https://wa.me/923332617671"');
  });

  it("exposes the same official Channel as an accessible homepage contact card without replacing direct WhatsApp contact", () => {
    expect(home).toContain('const whatsappChannelUrl = "https://whatsapp.com/channel/0029VaCc5dK7T8bclVGHu20Q";');
    expect(home).toContain('href={whatsappChannelUrl} target="_blank" rel="noreferrer"');
    expect(home).toContain('urdu ? "واٹس ایپ چینل" : "WhatsApp Channel"');
    expect(home).toContain('urdu ? "واٹس ایپ چینل کھولیں" : "Open WhatsApp Channel"');
    expect(home).toContain('href="https://wa.me/923332617671"');
  });

  it("offers the established Online Bayan Mixlr event as an accessible homepage contact card", () => {
    expect(home).toContain('const onlineBayanUrl = "https://faisal-hayat.mixlr.com/events/5246475?utm_source=new_broadcast_alert&utm_medium=email&utm_campaign=alert";');
    expect(home).toContain('href={onlineBayanUrl} target="_blank" rel="noreferrer"');
    expect(home).toContain('urdu ? "آن لائن بیان" : "Online Bayan"');
    expect(home).toContain('urdu ? "آن لائن بیان کھولیں" : "Open Online Bayan"');
  });
});
