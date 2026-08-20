import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { platformAdminProcedure, reviewerProcedure, scholarProcedure } from "./platformPermissions";
import { publicCatalogueSearchInput } from "./publicCatalogueContract";
import { publicQuestionSubmissionInput, questionTrackingInput, submitPublicQuestion, trackPublicQuestion } from "./questionIntake";
import { fatwaDraftCreateInput, fatwaDraftUpdateInput, fatwaPublishInput, fatwaReviewApprovalInput, fatwaReviewReturnInput } from "./fatwaWorkflow";
import {
  approveFatwaDraft,
  claimQuestion,
  createFatwaDraft,
  getAssignedQuestionSummaries,
  getApprovedFatwaPublicationQueue,
  getClaimableQuestionSummaries,
  getFatwaReviewQueue,
  getMyFatwaDrafts,
  getMyQuestionSummaries,
  getPublicCatalogueTaxonomy,
  getPublishedFatwaBySlug,
  getPlatformOverview,
  publishApprovedFatwa,
  returnFatwaDraft,
  searchPublishedFatwas,
  updateFatwaDraft,
  updatePlatformUserRole,
} from "./platformQueries";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  publicCatalogue: router({
    taxonomy: publicProcedure.query(() => getPublicCatalogueTaxonomy()),
    search: publicProcedure.input(publicCatalogueSearchInput).query(({ input }) => searchPublishedFatwas(input)),
    bySlug: publicProcedure.input(z.object({ slug: z.string().trim().min(1).max(160) })).query(({ input }) => getPublishedFatwaBySlug(input.slug)),
  }),

  workspace: router({
    /** A minimal, role-safe contract used by later scholar and administrator dashboard routes. */
    summary: protectedProcedure.query(({ ctx }) => ({
      userId: ctx.user.id,
      displayName: ctx.user.name,
      role: ctx.user.role,
      permissions: {
        canSubmitQuestions: true,
        canDraftFatwas: ["scholar", "reviewer", "admin"].includes(ctx.user.role),
        canReviewFatwas: ["reviewer", "admin"].includes(ctx.user.role),
        canAdministerPlatform: ctx.user.role === "admin",
      },
    })),
  }),

  questions: router({
    submit: publicProcedure.input(publicQuestionSubmissionInput).mutation(({ input }) => submitPublicQuestion(input)),
    track: publicProcedure.input(questionTrackingInput).query(({ input }) => trackPublicQuestion(input)),
    /** A questioner may see only their own non-anonymous submission summaries. */
    mine: protectedProcedure.query(({ ctx }) => getMyQuestionSummaries(ctx.user.id)),
    /** Assigned private questions are visible only to scholars, reviewers, and administrators. */
    assigned: scholarProcedure.query(({ ctx }) => getAssignedQuestionSummaries(ctx.user.id)),
    /** Only non-sensitive case metadata is exposed until a scholar accepts the case. */
    claimable: scholarProcedure.query(() => getClaimableQuestionSummaries()),
    claim: scholarProcedure.input(z.object({ questionId: z.number().int().positive() })).mutation(({ ctx, input }) => claimQuestion(input.questionId, ctx.user.id)),
  }),

  fatwaDraft: router({
    mine: scholarProcedure.query(({ ctx }) => getMyFatwaDrafts(ctx.user.id)),
    create: scholarProcedure.input(fatwaDraftCreateInput).mutation(({ ctx, input }) => createFatwaDraft(input, ctx.user.id)),
    update: scholarProcedure.input(fatwaDraftUpdateInput).mutation(({ ctx, input }) => updateFatwaDraft(input, ctx.user.id)),
  }),

  review: router({
    /** The editorial review queue never exposes source-question contact information. */
    queue: reviewerProcedure.query(() => getFatwaReviewQueue()),
    approve: reviewerProcedure.input(fatwaReviewApprovalInput).mutation(({ ctx, input }) => approveFatwaDraft(input.fatwaId, ctx.user.id)),
    return: reviewerProcedure.input(fatwaReviewReturnInput).mutation(({ ctx, input }) => returnFatwaDraft(input, ctx.user.id)),
  }),

  fatwaPublish: router({
    queue: reviewerProcedure.query(() => getApprovedFatwaPublicationQueue()),
    publish: reviewerProcedure.input(fatwaPublishInput).mutation(({ ctx, input }) => publishApprovedFatwa(input, ctx.user.id)),
  }),

  administration: router({
    overview: platformAdminProcedure.query(() => getPlatformOverview()),
    setUserRole: platformAdminProcedure
      .input(z.object({ userId: z.number().int().positive(), role: z.enum(["user", "scholar", "reviewer", "admin"]) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.id === input.userId && input.role !== "admin") {
          throw new Error("Administrators cannot remove their own administrator access.");
        }
        return updatePlatformUserRole(input.userId, input.role);
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
