import type { Fatwa } from "./fatawa";

export function readArchiveSearchQuery(search: string): string {
  return new URLSearchParams(search).get("q")?.trim() ?? "";
}

export function filterFatawa(items: readonly Fatwa[], query: string, category: "All" | Fatwa["category"]): Fatwa[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return items.filter((item) => {
    if (category !== "All" && item.category !== category) return false;
    if (!normalizedQuery) return true;

    return `${item.number} ${item.titleEn} ${item.titleUr} ${item.questionEn} ${item.questionUr} ${item.topics.join(" ")}`
      .toLocaleLowerCase()
      .includes(normalizedQuery);
  });
}
