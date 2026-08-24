# Vercel Deployment

The GitHub repository must contain the complete current project, including `package.json`, `pnpm-lock.yaml`, `patches/wouter@3.7.1.patch` when it is referenced, `api/[...path].ts`, and `vercel.json`. The previously deployed GitHub snapshot referenced the Wouter patch in the lockfile but omitted the patch file; the corrected repository state removes that stale patch reference and includes the current source.

Vercel builds the Vite client into `dist/public`, serves the React application from that directory, and routes `/api/*` to the Express API catch-all. The catch-all retains the established Daily Posts, scholar, date, and protected administrator routes. Existing managed `/manus-storage/*` public assets are rewritten to the current public managed-hosting origin so the established logos, calligraphy, backgrounds, and sanitized public Fatwa PDFs remain reachable after migration.

## Required Vercel Environment Variables

Add these values under **Project Settings → Environment Variables** for Production, Preview, and Development as appropriate. Do not commit a `.env` file.

| Variable | Required purpose |
|---|---|
| `DATABASE_URL` | Persistent MySQL/TiDB database used by scholars and Daily Posts. |
| `SCHOLAR_ADMIN_ACCESS_KEY` | Server-side key protecting scholar and Daily Posts administration. |
| `JWT_SECRET` | Secure session signing value if the configured authentication flow is enabled. |
| `BLOB_READ_WRITE_TOKEN` | Recommended server-only Vercel Blob fallback credential for Daily Posts images and PDFs. Connecting a Vercel Blob store can instead provide `BLOB_STORE_ID` and a rotating `VERCEL_OIDC_TOKEN` automatically. |
| `BUILT_IN_FORGE_API_URL` | Optional current managed-storage endpoint used by existing Daily Posts uploads outside Vercel. |
| `BUILT_IN_FORGE_API_KEY` | Optional server-side credential for the current managed-storage endpoint outside Vercel. |

For Vercel, create a **public Vercel Blob** store and connect it to this project. The server then uses Vercel’s short-lived OIDC credentials when available, or `BLOB_READ_WRITE_TOKEN` outside that environment. Do not expose Blob, database, or administrator secrets with a `VITE_` prefix. Server uploads remain limited by the function request size; the existing 5 MB image and 8 MB PDF controls are retained, so use Vercel client uploads before increasing attachment limits.

## Deployment Steps

1. Push the corrected `main` branch to GitHub.
2. In Vercel, select **Framework Preset: Vite**, **Root Directory: `./`**, and leave the build command to the repository configuration.
3. Add the required environment variables without exposing their values in source control.
4. Redeploy the latest `main` commit. The prior `ENOENT` for `patches/wouter@3.7.1.patch` will not recur after the current repository is synchronized.
