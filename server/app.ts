import { timingSafeEqual } from "crypto";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createDailyPostStorageKey, storagePut } from "./storage";
import { createDailyPost, createDailyPostCategory, deleteDailyPost, deleteDailyPostCategory, duplicateDailyPost, getAdminDailyPost, getPublicDailyPost, getWhatsappChannelImportSettings, importWhatsappChannelPost, listAdminDailyPostCategories, listAdminDailyPosts, listPublicDailyPostCategories, listPublicDailyPosts, listRelatedPublicDailyPosts, listWhatsappChannelImportHistory, parseDailyPostCategoryInput, parseDailyPostInput, parseWhatsappImportInput, recordWhatsappImportFailure, updateDailyPost, updateDailyPostCategory, updateWhatsappChannelImportSettings } from "./dailyPosts";
import { getInstitutionalDateStatus } from "./institutionalDate";
import { createScholar, deleteScholar, getPublishedScholar, getScholarById, listAllScholars, listPublishedScholars, parseScholarInput, updateScholar } from "./scholars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createScholarApi() {
  const api = express.Router();
  api.use((_req, res, next) => {
    res.removeHeader("X-Powered-By");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
    return next();
  });
  // 3,000,000 raw bytes produce a base64 JSON body below Vercel Functions' 4.5 MB cap.
  // The parser limit also bounds malformed JSON before any allocation for file storage.
  api.use(express.json({ limit: "4mb" }));

  api.get("/api/institutional-date", async (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    return res.json(await getInstitutionalDateStatus());
  });

  const hasAdministratorAccess = (req: express.Request) => {
    const configuredKey = process.env.SCHOLAR_ADMIN_ACCESS_KEY;
    const suppliedKey = req.get("x-scholar-admin-key");

    if (!configuredKey || !suppliedKey) return false;
    const expected = Buffer.from(configuredKey);
    const supplied = Buffer.from(suppliedKey);
    return expected.length === supplied.length && timingSafeEqual(expected, supplied);
  };

  const requireAdministrator = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!hasAdministratorAccess(req)) return res.status(401).json({ error: "Administrator access is required." });
    return next();
  };

  const validFileName = (value: unknown) => typeof value === "string" && value.trim().length > 0 && value.trim().length <= 255 ? value.trim() : undefined;
  const uploadDailyPostFile = async (req: express.Request, res: express.Response) => {
    const body = req.body as { kind?: unknown; fileName?: unknown; mimeType?: unknown; base64?: unknown };
    const kind = body.kind === "image" || body.kind === "attachment" ? body.kind : undefined;
    const fileName = validFileName(body.fileName);
    const mimeType = typeof body.mimeType === "string" ? body.mimeType.toLowerCase() : "";
    const allowedImage = ["image/jpeg", "image/png", "image/webp"];
    const allowedAttachment = ["application/pdf"];
    const isAllowed = kind === "image" ? allowedImage.includes(mimeType) : kind === "attachment" ? allowedAttachment.includes(mimeType) : false;
    if (!kind || !fileName || !isAllowed || typeof body.base64 !== "string" || !/^[a-z0-9+/]+=*$/i.test(body.base64)) return res.status(400).json({ error: "Provide a supported image or PDF file." });
    const bytes = Buffer.from(body.base64, "base64");
    const maximum = 3_000_000;
    if (!bytes.length || bytes.length > maximum) return res.status(400).json({ error: "Images and PDF attachments must be 3 MB or smaller." });
    try {
      const upload = await storagePut(createDailyPostStorageKey(kind === "image" ? "images" : "attachments", fileName), bytes, mimeType);
      return res.status(201).json({ ...upload, fileName, mimeType, byteSize: bytes.length });
    } catch {
      return res.status(503).json({ error: "The selected file could not be uploaded at this time." });
    }
  };

  api.get("/api/scholars", async (_req, res) => {
    try {
      return res.json(await listPublishedScholars());
    } catch {
      return res.status(503).json({ error: "Scholar records are temporarily unavailable." });
    }
  });

  api.get("/api/scholars/:slug", async (req, res) => {
    try {
      const scholar = await getPublishedScholar(req.params.slug);
      return scholar ? res.json(scholar) : res.status(404).json({ error: "Scholar profile not found." });
    } catch {
      return res.status(503).json({ error: "Scholar records are temporarily unavailable." });
    }
  });

  api.get("/api/admin/scholar-session", requireAdministrator, (_req, res) => res.status(204).end());

  api.get("/api/admin/scholars", requireAdministrator, async (_req, res) => {
    try {
      return res.json(await listAllScholars());
    } catch {
      return res.status(503).json({ error: "Scholar records are temporarily unavailable." });
    }
  });

  api.post("/api/admin/scholars", requireAdministrator, async (req, res) => {
    const scholar = parseScholarInput(req.body);
    if (!scholar || !scholar.slug || !scholar.nameEn || !scholar.nameUr) return res.status(400).json({ error: "A slug and bilingual scholar names are required." });
    try {
      return res.status(201).json(await createScholar(scholar as Parameters<typeof createScholar>[0]));
    } catch {
      return res.status(409).json({ error: "A scholar record with this slug already exists." });
    }
  });

  api.patch("/api/admin/scholars/:id", requireAdministrator, async (req, res) => {
    const id = Number(req.params.id);
    const changes = parseScholarInput(req.body, true);
    if (!Number.isInteger(id) || id < 1 || !changes || !Object.keys(changes).length) return res.status(400).json({ error: "Valid scholar changes are required." });
    try {
      const scholar = await updateScholar(id, changes);
      return scholar ? res.json(scholar) : res.status(404).json({ error: "Scholar record not found." });
    } catch {
      return res.status(409).json({ error: "The requested scholar change could not be saved." });
    }
  });

  api.delete("/api/admin/scholars/:id", requireAdministrator, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1 || !await getScholarById(id)) return res.status(404).json({ error: "Scholar record not found." });
    await deleteScholar(id);
    return res.status(204).end();
  });

  api.get("/api/daily-posts/categories", async (_req, res) => {
    try { return res.json(await listPublicDailyPostCategories()); }
    catch { return res.status(503).json({ error: "Daily Post categories are temporarily unavailable." }); }
  });

  api.get("/api/daily-posts", async (req, res) => {
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);
    const sort = req.query.sort === "oldest" ? "oldest" : "newest";
    const query = typeof req.query.q === "string" ? req.query.q : undefined;
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    try { return res.json(await listPublicDailyPosts({ page, pageSize, query, category, sort })); }
    catch { return res.status(503).json({ error: "Daily Posts are temporarily unavailable." }); }
  });

  api.get("/api/daily-posts/:slug", async (req, res) => {
    try {
      const post = await getPublicDailyPost(req.params.slug);
      if (!post) return res.status(404).json({ error: "Daily Post not found." });
      const relatedPost = post as typeof post & { id: number; categoryId: number | null };
      return res.json({ post, related: await listRelatedPublicDailyPosts({ id: relatedPost.id, categoryId: relatedPost.categoryId }) });
    } catch { return res.status(503).json({ error: "Daily Post is temporarily unavailable." }); }
  });

  api.get("/api/admin/daily-posts-session", requireAdministrator, (_req, res) => res.status(204).end());
  api.get("/api/admin/daily-posts/whatsapp-import", requireAdministrator, async (_req, res) => {
    try { return res.json({ settings: await getWhatsappChannelImportSettings(), history: await listWhatsappChannelImportHistory() }); }
    catch { return res.status(503).json({ error: "WhatsApp-origin import settings are temporarily unavailable." }); }
  });
  api.patch("/api/admin/daily-posts/whatsapp-import/settings", requireAdministrator, async (req, res) => {
    const body = req.body as { autoPublish?: unknown; isEnabled?: unknown };
    const input = { autoPublish: typeof body.autoPublish === "boolean" ? body.autoPublish : undefined, isEnabled: typeof body.isEnabled === "boolean" ? body.isEnabled : undefined };
    if (input.autoPublish === undefined && input.isEnabled === undefined) return res.status(400).json({ error: "Choose an import setting to update." });
    try { return res.json(await updateWhatsappChannelImportSettings(input)); }
    catch { return res.status(503).json({ error: "Import settings could not be updated." }); }
  });
  api.post("/api/admin/daily-posts/whatsapp-import/check", requireAdministrator, async (_req, res) => {
    try { return res.json({ mode: "manual_only", settings: await getWhatsappChannelImportSettings(), message: "WhatsApp Channel post reading is not available through the supported API boundary; use the guided import form." }); }
    catch { return res.status(503).json({ error: "Import status could not be checked." }); }
  });
  api.post("/api/admin/daily-posts/whatsapp-import", requireAdministrator, async (req, res) => {
    const input = parseWhatsappImportInput(req.body);
    if (!input) {
      const reference = typeof (req.body as { sourcePostId?: unknown })?.sourcePostId === "string" ? (req.body as { sourcePostId: string }).sourcePostId : "invalid-reference";
      await recordWhatsappImportFailure(reference, "Provide a source reference, language, title, and content; any image must first be uploaded through managed storage.");
      return res.status(400).json({ error: "Provide a source reference, language, title, and content. Use managed storage for optional images." });
    }
    try {
      const result = await importWhatsappChannelPost(input);
      if (result.kind === "disabled") return res.status(409).json({ error: "The WhatsApp-origin import queue is currently switched off." });
      return res.status(result.kind === "imported" ? 201 : 200).json(result);
    } catch {
      await recordWhatsappImportFailure(input.sourcePostId, "The import could not be completed. No partial Daily Post was published.");
      return res.status(503).json({ error: "The import could not be completed. No partial Daily Post was published." });
    }
  });
  api.get("/api/admin/daily-posts", requireAdministrator, async (req, res) => {
    const status = req.query.status === "draft" || req.query.status === "published" || req.query.status === "unpublished" ? req.query.status : undefined;
    const categoryId = Number(req.query.categoryId);
    const sort = req.query.sort === "oldest" ? "oldest" : "newest";
    const query = typeof req.query.q === "string" ? req.query.q : undefined;
    try { return res.json(await listAdminDailyPosts({ status, categoryId: Number.isInteger(categoryId) && categoryId > 0 ? categoryId : undefined, sort, query })); }
    catch { return res.status(503).json({ error: "Daily Post records are temporarily unavailable." }); }
  });
  api.get("/api/admin/daily-posts/:id", requireAdministrator, async (req, res) => {
    const id = Number(req.params.id);
    const post = Number.isInteger(id) && id > 0 ? await getAdminDailyPost(id) : undefined;
    return post ? res.json(post) : res.status(404).json({ error: "Daily Post not found." });
  });
  api.post("/api/admin/daily-posts", requireAdministrator, async (req, res) => {
    const input = parseDailyPostInput(req.body);
    if (!input) return res.status(400).json({ error: "Provide a title and content in at least one language." });
    try { return res.status(201).json(await createDailyPost(input as Parameters<typeof createDailyPost>[0])); }
    catch { return res.status(409).json({ error: "A Daily Post with this URL slug already exists." }); }
  });
  api.patch("/api/admin/daily-posts/:id", requireAdministrator, async (req, res) => {
    const id = Number(req.params.id);
    const input = parseDailyPostInput(req.body, true);
    if (!Number.isInteger(id) || id < 1 || !input) return res.status(400).json({ error: "Valid Daily Post changes are required." });
    try {
      const post = await updateDailyPost(id, input);
      return post ? res.json(post) : res.status(404).json({ error: "Daily Post not found." });
    } catch { return res.status(409).json({ error: "The requested Daily Post change could not be saved." }); }
  });
  api.delete("/api/admin/daily-posts/:id", requireAdministrator, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1 || !await getAdminDailyPost(id)) return res.status(404).json({ error: "Daily Post not found." });
    await deleteDailyPost(id);
    return res.status(204).end();
  });
  api.post("/api/admin/daily-posts/:id/duplicate", requireAdministrator, async (req, res) => {
    const id = Number(req.params.id);
    const post = Number.isInteger(id) && id > 0 ? await duplicateDailyPost(id) : undefined;
    return post ? res.status(201).json(post) : res.status(404).json({ error: "Daily Post not found." });
  });
  api.post("/api/admin/daily-posts/upload", requireAdministrator, uploadDailyPostFile);

  api.get("/api/admin/daily-post-categories", requireAdministrator, async (_req, res) => {
    try { return res.json(await listAdminDailyPostCategories()); }
    catch { return res.status(503).json({ error: "Daily Post categories are temporarily unavailable." }); }
  });
  api.post("/api/admin/daily-post-categories", requireAdministrator, async (req, res) => {
    const input = parseDailyPostCategoryInput(req.body);
    if (!input) return res.status(400).json({ error: "A category URL slug and English name are required." });
    try { return res.status(201).json(await createDailyPostCategory(input as Parameters<typeof createDailyPostCategory>[0])); }
    catch { return res.status(409).json({ error: "A Daily Post category with this URL slug already exists." }); }
  });
  api.patch("/api/admin/daily-post-categories/:id", requireAdministrator, async (req, res) => {
    const id = Number(req.params.id);
    const input = parseDailyPostCategoryInput(req.body, true);
    if (!Number.isInteger(id) || id < 1 || !input) return res.status(400).json({ error: "Valid category changes are required." });
    const category = await updateDailyPostCategory(id, input);
    return category ? res.json(category) : res.status(404).json({ error: "Daily Post category not found." });
  });
  api.delete("/api/admin/daily-post-categories/:id", requireAdministrator, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "A valid category is required." });
    await deleteDailyPostCategory(id);
    return res.status(204).end();
  });

  return api;
}

export function createApp() {
  const app = express();
  const staticPath = process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "public")
    : path.resolve(__dirname, "..", "dist", "public");

  app.disable("x-powered-by");
  app.use(createScholarApi());
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html")));
  return app;
}
