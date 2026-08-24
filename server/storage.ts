import crypto from "crypto";
import path from "path";
import { put } from "@vercel/blob";

type ManagedUpload = {
  key: string;
  url: string;
};

function storageConfiguration() {
  const baseUrl = process.env.BUILT_IN_FORGE_API_URL?.replace(/\/+$/, "");
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
  if (!baseUrl || !apiKey) throw new Error("Managed storage is not configured.");
  return { baseUrl, apiKey };
}

function safeFilename(fileName: string) {
  const extension = path.extname(fileName).toLowerCase().replace(/[^.a-z0-9]/g, "").slice(0, 12);
  const base = path.basename(fileName, path.extname(fileName)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72);
  return `${base || "upload"}${extension || ".bin"}`;
}

export function createDailyPostStorageKey(kind: "images" | "attachments", fileName: string) {
  const datePartition = new Date().toISOString().slice(0, 10);
  return `daily-posts/${kind}/${datePartition}/${crypto.randomUUID()}-${safeFilename(fileName)}`;
}

export async function storagePut(key: string, bytes: Uint8Array, contentType: string): Promise<ManagedUpload> {
  const vercelBlobAvailable = Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
    (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN),
  );

  if (vercelBlobAvailable) {
    const blob = await put(key, bytes, {
      access: "public",
      addRandomSuffix: false,
      contentType,
    });
    return { key: blob.pathname, url: blob.url };
  }

  const { baseUrl, apiKey } = storageConfiguration();
  const presignUrl = new URL("v1/storage/presign/put", `${baseUrl}/`);
  presignUrl.searchParams.set("path", key);
  const presignResponse = await fetch(presignUrl, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!presignResponse.ok) throw new Error("Unable to prepare managed file storage.");
  const payload = await presignResponse.json() as { url?: string };
  if (!payload.url) throw new Error("Managed file storage did not return an upload URL.");
  const uploadResponse = await fetch(payload.url, { method: "PUT", headers: { "Content-Type": contentType }, body: bytes });
  if (!uploadResponse.ok) throw new Error("Unable to upload the selected file.");
  return { key, url: `/manus-storage/${key}` };
}
