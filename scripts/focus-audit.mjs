import { chromium } from "playwright";

const baseUrl = process.env.FOCUS_AUDIT_BASE_URL ?? "http://127.0.0.1:3000";
const scenarios = [
  { name: "homepage navigation", path: "/", selector: 'a[href="/fatawa"]' },
  { name: "archive discovery field", path: "/fatawa", selector: 'input[aria-label]' },
  { name: "confidential intake control", path: "/ask-fatwa", selector: 'input[type="checkbox"]' },
  { name: "methodology guidance action", path: "/methodology", selector: 'a[href="/ask-fatwa"]' },
];

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const results = [];

try {
  for (const scenario of scenarios) {
    await page.goto(`${baseUrl}${scenario.path}`, { waitUntil: "networkidle" });
    await page.locator("body").focus();

    let active = null;
    for (let step = 0; step < 80; step += 1) {
      await page.keyboard.press("Tab");
      active = await page.evaluate(selector => {
        const element = document.activeElement;
        if (!(element instanceof HTMLElement) || !element.matches(selector)) return null;
        const styles = getComputedStyle(element);
        return {
          tag: element.tagName.toLowerCase(),
          text: (element.getAttribute("aria-label") || element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 100),
          className: element.className,
          parentClassName: element.parentElement?.className ?? "",
          matchesFocusVisible: element.matches(":focus-visible"),
          matchesGenericFocusRule: element.matches("a[href]:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible, [tabindex]:focus-visible"),
          matchesInstitutionalFocusRule: element.matches(".royal-nav a[href]:focus-visible, .royal-nav button:focus-visible, .bismillah-bar a[href]:focus-visible, .bismillah-bar button:focus-visible, .site-footer a[href]:focus-visible, .site-footer button:focus-visible"),
          outlineStyle: styles.outlineStyle,
          outlineWidth: styles.outlineWidth,
          outlineColor: styles.outlineColor,
          boxShadow: styles.boxShadow,
        };
      }, scenario.selector);
      if (active) break;
    }

    if (!active) throw new Error(`${scenario.name}: keyboard focus did not reach ${scenario.selector}`);
    await page.waitForTimeout(260);
    active = await page.evaluate(selector => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement) || !element.matches(selector)) return null;
      const styles = getComputedStyle(element);
      return {
        tag: element.tagName.toLowerCase(),
        text: (element.getAttribute("aria-label") || element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 100),
        className: element.className,
        parentClassName: element.parentElement?.className ?? "",
        matchesFocusVisible: element.matches(":focus-visible"),
        matchesGenericFocusRule: element.matches("a[href]:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible, [tabindex]:focus-visible"),
        matchesInstitutionalFocusRule: element.matches(".royal-nav a[href]:focus-visible, .royal-nav button:focus-visible, .bismillah-bar a[href]:focus-visible, .bismillah-bar button:focus-visible, .site-footer a[href]:focus-visible, .site-footer button:focus-visible"),
        outlineStyle: styles.outlineStyle,
        outlineWidth: styles.outlineWidth,
        outlineColor: styles.outlineColor,
        boxShadow: styles.boxShadow,
      };
    }, scenario.selector);
    if (active.outlineStyle !== "solid" || Number.parseFloat(active.outlineWidth) < 3) {
      throw new Error(`${scenario.name}: expected a visible 3px solid focus outline, received ${active.outlineWidth} ${active.outlineStyle}`);
    }
    results.push({ ...scenario, ...active });
  }

  console.log(JSON.stringify({ status: "passed", baseUrl, results }, null, 2));
} finally {
  await browser.close();
}
