import { TRPCError } from "@trpc/server";
import type { User } from "../drizzle/schema";
import { protectedProcedure } from "./_core/trpc";

export type PlatformRole = User["role"];

function requireOneOf(roles: readonly PlatformRole[], message: string) {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!roles.includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN", message });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}

/** May draft, triage, or manage scholarly work depending on the individual procedure. */
export const scholarProcedure = requireOneOf(["scholar", "reviewer", "admin"], "Scholar permissions required");

/** May independently review, approve, or return a draft for revision. */
export const reviewerProcedure = requireOneOf(["reviewer", "admin"], "Reviewer permissions required");

/** May manage platform roles, taxonomy, published policy content, and settings. */
export const platformAdminProcedure = requireOneOf(["admin"], "Administrator permissions required");
