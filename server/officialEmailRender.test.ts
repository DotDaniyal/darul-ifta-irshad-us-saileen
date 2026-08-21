import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContextualEmailCard } from "../client/src/components/OfficialEmailCallout";
import { OFFICIAL_ENQUIRY_EMAIL } from "../client/src/components/officialEmailCopy";
import SiteShell from "../client/src/components/SiteShell";
import Home from "../client/src/pages/Home";
import AskFatwa from "../client/src/pages/AskFatwa";
import Methodology from "../client/src/pages/Methodology";

vi.mock("@/lib/trpc", () => ({
  trpc: {
    publicTrust: {
      scholars: { useQuery: () => ({ data: [] }) },
      policies: { useQuery: () => ({ data: [] }) },
    },
    publicCatalogue: { taxonomy: { useQuery: () => ({ data: { categories: [] } }) } },
    questions: { submit: { useMutation: () => ({ mutate: () => undefined, isPending: false }) } },
  },
}));

function renderEmailSurfaces(language: "ur" | "en") {
  const localStorage = { getItem: () => language, setItem: () => undefined };
  vi.stubGlobal("React", React);
  vi.stubGlobal("window", { localStorage, location: { pathname: "/" }, addEventListener: () => undefined, removeEventListener: () => undefined });
  vi.stubGlobal("location", { pathname: "/", search: "", hash: "" });
  vi.stubGlobal("localStorage", localStorage);
  const contextualSurface = renderToStaticMarkup(createElement(ContextualEmailCard));
  const sharedShell = renderToStaticMarkup(createElement(SiteShell, { children: createElement("main") }));
  return `${contextualSurface}${sharedShell}`;
}

function renderRoute(Component: React.ComponentType, language: "ur" | "en") {
  const localStorage = { getItem: () => language, setItem: () => undefined };
  vi.stubGlobal("React", React);
  vi.stubGlobal("window", { localStorage, location: { pathname: "/" }, addEventListener: () => undefined, removeEventListener: () => undefined });
  vi.stubGlobal("location", { pathname: "/", search: "", hash: "" });
  vi.stubGlobal("localStorage", localStorage);
  return renderToStaticMarkup(createElement(Component));
}

afterEach(() => vi.unstubAllGlobals());

describe("rendered official enquiry-email surfaces", () => {
  it("renders English shared-shell and email-only contextual links with the approved mailto target and labels", () => {
    const markup = renderEmailSurfaces("en");
    expect(markup).toContain(`href="mailto:${OFFICIAL_ENQUIRY_EMAIL}"`);
    expect(markup).toContain(`aria-label="Written enquiries by email: ${OFFICIAL_ENQUIRY_EMAIL}"`);
    expect(markup).toContain(`aria-label="Email: ${OFFICIAL_ENQUIRY_EMAIL}"`);
    expect(markup).toContain('class="contact-card "');
    expect(markup).toContain("lucide-mail");
    expect(markup.match(new RegExp(`href=\"mailto:${OFFICIAL_ENQUIRY_EMAIL}\"`, "g"))?.length).toBeGreaterThanOrEqual(3);
  });

  it("renders Urdu shared-shell and email-only contextual links with the same mailto target and Urdu labels", () => {
    const markup = renderEmailSurfaces("ur");
    expect(markup).toContain(`href="mailto:${OFFICIAL_ENQUIRY_EMAIL}"`);
    expect(markup).toContain(`aria-label="تحریری رہنمائی کے لیے ای میل: ${OFFICIAL_ENQUIRY_EMAIL}"`);
    expect(markup).toContain(`aria-label="ای میل: ${OFFICIAL_ENQUIRY_EMAIL}"`);
    expect(markup).toContain('class="contact-card "');
    expect(markup).toContain("lucide-mail");
    expect(markup.match(new RegExp(`href=\"mailto:${OFFICIAL_ENQUIRY_EMAIL}\"`, "g"))?.length).toBeGreaterThanOrEqual(3);
  });
});

describe("rendered official enquiry-email route surfaces", () => {
  const routes = [
    ["homepage", Home],
    ["Ask Fatwa", AskFatwa],
    ["Methodology", Methodology],
  ] as const;

  for (const [name, Component] of routes) {
    it(`renders approved bilingual email links on the ${name} route`, () => {
      const english = renderRoute(Component, "en");
      const urdu = renderRoute(Component, "ur");
      const href = `href="mailto:${OFFICIAL_ENQUIRY_EMAIL}"`;

      expect(english.match(new RegExp(href, "g"))?.length).toBeGreaterThanOrEqual(3);
      expect(urdu.match(new RegExp(href, "g"))?.length).toBeGreaterThanOrEqual(3);
      expect(english).toContain(`aria-label="Written enquiries by email: ${OFFICIAL_ENQUIRY_EMAIL}"`);
      expect(urdu).toContain(`aria-label="تحریری رہنمائی کے لیے ای میل: ${OFFICIAL_ENQUIRY_EMAIL}"`);
      expect(english).toContain(`aria-label="Email: ${OFFICIAL_ENQUIRY_EMAIL}"`);
      expect(urdu).toContain(`aria-label="ای میل: ${OFFICIAL_ENQUIRY_EMAIL}"`);
    });
  }
});
