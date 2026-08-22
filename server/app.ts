import { timingSafeEqual } from "crypto";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getInstitutionalDateStatus } from "./institutionalDate";
import { createScholar, deleteScholar, getPublishedScholar, getScholarById, listAllScholars, listPublishedScholars, parseScholarInput, updateScholar } from "./scholars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createScholarApi() {
  const api = express.Router();
  api.use(express.json({ limit: "256kb" }));

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
