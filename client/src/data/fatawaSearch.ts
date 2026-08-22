import type { Fatwa } from "./fatawa";
import { localizeFatwa, type FatwaLanguage } from "./fatwaLocalization";

export function readArchiveSearchQuery(search: string): string {
  return new URLSearchParams(search).get("q")?.trim() ?? "";
}

export function filterFatawa(
  items: readonly Fatwa[],
  query: string,
  category: "All" | Fatwa["category"],
  language: FatwaLanguage,
): Fatwa[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return items.filter((item) => {
    if (category !== "All" && item.category !== category) return false;
    if (!normalizedQuery) return true;

    const localized = localizeFatwa(item, language);
    return `${item.number} ${localized.title} ${localized.question} ${localized.answer} ${localized.scholar} ${localized.reference} ${localized.category} ${localized.topics.join(" ")}`
      .toLocaleLowerCase()
      .includes(normalizedQuery);
  });
}
