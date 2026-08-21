import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const home = readFileSync(resolve(import.meta.dirname, "../client/src/pages/Home.tsx"), "utf8");

describe("homepage hero content contract", () => {
  it("keeps the institution identity and actions while omitting the removed supporting line", () => {
    expect(home).toContain("Darul Ifta");
    expect(home).toContain("دارالافتاء ارشاد السائلین کراچی");
    expect(home).toContain('className="mt-8 flex flex-wrap gap-3"');
    expect(home).not.toContain("hero-support-copy");
    expect(home).not.toContain("Providing authentic Islamic guidance based on the Qur’an and Sunnah");
  });
});
