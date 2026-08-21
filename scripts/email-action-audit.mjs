import { chromium } from "playwright";

const baseUrl = process.env.EMAIL_AUDIT_BASE_URL ?? "https://3000-ij20lnue9hm28cz0q3v5x-450f78b6.us4.manus.computer";
const routes = ["/", "/ask-fatwa", "/methodology"];
const expectedHref = "mailto:ask.darulifa.irshadussaaileen@gmail.com";
const viewports = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "mobile", width: 375, height: 812 },
];

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  for (const route of routes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    const results = await page.evaluate(() => Array.from(document.querySelectorAll('a[data-email-fallback="copy"]')).map((link) => {
      if (!(link instanceof HTMLAnchorElement)) return { error: "fallback email link missing" };

      let defaultPreventedAtTarget = false;
      link.addEventListener("click", (event) => {
        defaultPreventedAtTarget = event.defaultPrevented;
        event.preventDefault();
      }, { once: true });
      link.click();

      return {
        href: link.getAttribute("href"),
        fallback: link.dataset.emailFallback,
        defaultPreventedAtTarget,
      };
    }));

    if (!results.length || results.some((result) => result.error || result.href !== expectedHref || result.fallback !== "copy" || result.defaultPreventedAtTarget)) {
      throw new Error(`${viewport.name} ${route}: ${JSON.stringify(results)}`);
    }
    console.log(`${viewport.name} ${route}: ${results.length} native mailto action(s) and copy fallback(s) available`);
  }
  await page.close();
}

await browser.close();
