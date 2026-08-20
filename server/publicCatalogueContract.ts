import { z } from "zod";

/**
 * Boundary contract for public catalogue filters. Values are intentionally
 * optional: only active, administrator-managed taxonomies are meaningful.
 */
export const publicCatalogueSearchInput = z.object({
  query: z.string().trim().max(120).optional(),
  category: z.string().trim().max(96).optional(),
  methodology: z.string().trim().max(96).optional(),
  tag: z.string().trim().max(96).optional(),
});

export type PublicCatalogueSearchInput = z.infer<typeof publicCatalogueSearchInput>;
