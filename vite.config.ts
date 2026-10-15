import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { type Plugin, type ViteDevServer } from "vite";
import { defineConfig } from "vitest/config";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
import { createScholarApi } from "./server/app";
import { inMemoryStorage } from "./server/storage";

if (!process.env.SCHOLAR_ADMIN_ACCESS_KEY) {
  process.env.SCHOLAR_ADMIN_ACCESS_KEY = "darul-ifta-admin-access-key-2026";
}

const PROJECT_ROOT = import.meta.dirname;

function vitePluginStorageProxy(): Plugin {
  return {
    name: "manus-storage-proxy",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/manus-storage", async (req, res) => {
        const key = req.url?.replace(/^\//, "");
        if (!key) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Missing storage key");
          return;
        }

        const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
        const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;

        if (!forgeBaseUrl || !forgeKey) {
          const inMem = inMemoryStorage.get(key);
          if (inMem) {
            res.writeHead(200, { "Content-Type": inMem.contentType });
            res.end(Buffer.from(inMem.bytes));
            return;
          }
          res.writeHead(307, {
            Location: `https://darulifta-bkfbzf6u.manus.space/manus-storage/${key}`,
            "Cache-Control": "no-store",
          });
          res.end();
          return;
        }

        try {
          const forgeUrl = new URL("v1/storage/presign/get", forgeBaseUrl + "/");
          forgeUrl.searchParams.set("path", key);

          const forgeResp = await fetch(forgeUrl, {
            headers: { Authorization: `Bearer ${forgeKey}` },
          });

          if (!forgeResp.ok) {
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.end("Storage backend error");
            return;
          }

          const { url } = (await forgeResp.json()) as { url: string };
          if (!url) {
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.end("Empty signed URL");
            return;
          }

          res.writeHead(307, { Location: url, "Cache-Control": "no-store" });
          res.end();
        } catch {
          res.writeHead(502, { "Content-Type": "text/plain" });
          res.end("Storage proxy error");
        }
      });
    },
  };
}

export function vitePluginScholarApi(): Plugin {
  return {
    name: "scholar-api",
    configureServer(server: ViteDevServer) {
      const apiApp = express();
      apiApp.use(createScholarApi());
      server.middlewares.use(apiApp);
    },
  };
}

// The managed runtime powers this project's local preview and visual editing. It is not
// required by the standalone Vite app and would add its preview tooling to Vercel output.
const isExternalVercelBuild = process.env.VERCEL === "1";
const plugins = [react(), tailwindcss(), jsxLocPlugin(), ...(isExternalVercelBuild ? [] : [vitePluginManusRuntime()]), vitePluginStorageProxy(), vitePluginScholarApi()];

export default defineConfig({
  plugins,
  test: {
    include: [
      path.resolve(PROJECT_ROOT, "client", "src", "**", "*.test.ts"),
      path.resolve(PROJECT_ROOT, "server", "**", "*.test.ts"),
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
