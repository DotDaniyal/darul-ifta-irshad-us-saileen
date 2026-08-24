import { useEffect, useState } from "react";

export type DailyPostStatus = "draft" | "published" | "unpublished";

export type DailyPostCategory = {
  id: number;
  slug: string;
  nameEn: string;
  nameUr: string | null;
  nameAr: string | null;
  descriptionEn: string | null;
  descriptionUr: string | null;
  descriptionAr: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type DailyPost = {
  id: number;
  slug: string;
  status: DailyPostStatus;
  source: "manual" | "whatsapp_channel";
  sourcePostId: string | null;
  sourceMediaIdentifier: string | null;
  originalPostUrl: string | null;
  sourceCaption: string | null;
  sourcePublishedAt: string | null;
  importedAt: string | null;
  categoryId: number | null;
  category: Pick<DailyPostCategory, "id" | "slug" | "nameEn" | "nameUr" | "nameAr"> | null;
  authorName: string | null;
  titleEn: string | null;
  titleUr: string | null;
  titleAr: string | null;
  excerptEn: string | null;
  excerptUr: string | null;
  excerptAr: string | null;
  contentEn: string | null;
  contentUr: string | null;
  contentAr: string | null;
  featuredImageStorageKey: string | null;
  featuredImageUrl: string | null;
  featuredImageAltEn: string | null;
  featuredImageAltUr: string | null;
  featuredImageAltAr: string | null;
  attachmentStorageKey: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentMimeType: string | null;
  seoDescriptionEn: string | null;
  seoDescriptionUr: string | null;
  seoDescriptionAr: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DailyPostPage = { items: DailyPost[]; page: number; pageSize: number; total: number };
export type DailyPostUpload = { key: string; url: string; fileName: string; mimeType: string; byteSize: number };
export type WhatsappImportSettings = { id: number; channelUrl: string; importMode: "manual_only"; autoPublish: boolean; isEnabled: boolean; lastImportAt: string | null; importedPostsCount: number; failedImportsCount: number; lastFailureMessage: string | null; updatedAt: string };
export type WhatsappImportHistory = { id: number; dailyPostId: number | null; source: "whatsapp_channel"; sourcePostId: string; sourceMediaIdentifier: string | null; originalPostUrl: string | null; sourcePublishedAt: string | null; status: "imported" | "duplicate" | "failed"; errorMessage: string | null; importedAt: string };
export type WhatsappImportPayload = { sourcePostId: string; sourceMediaIdentifier?: string | null; originalPostUrl?: string | null; sourcePublishedAt?: string | null; language: "en" | "ur" | "ar"; title: string; content: string; caption?: string | null; categoryId?: number | null; authorName?: string | null; featuredImageStorageKey?: string | null; featuredImageUrl?: string | null; featuredImageAlt?: string | null };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) {
    const detail = await response.json().catch(() => ({ error: "Daily Posts are currently unavailable." }));
    throw new Error(typeof detail.error === "string" ? detail.error : "Daily Posts are currently unavailable.");
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

function queryString(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value !== undefined && value !== "") params.set(key, String(value));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const dailyPostsApi = {
  categories: () => request<DailyPostCategory[]>("/api/daily-posts/categories"),
  list: (input: { page?: number; pageSize?: number; q?: string; category?: string; sort?: "newest" | "oldest" } = {}) => request<DailyPostPage>(`/api/daily-posts${queryString(input)}`),
  get: (slug: string) => request<{ post: DailyPost; related: DailyPost[] }>(`/api/daily-posts/${encodeURIComponent(slug)}`),
};

async function adminRequest<T>(key: string, path: string, init: RequestInit = {}) {
  return request<T>(path, {
    ...init,
    headers: {
      "x-scholar-admin-key": key,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
}

export const dailyPostsAdminApi = {
  verify: (key: string) => adminRequest<void>(key, "/api/admin/daily-posts-session"),
  list: (key: string, input: { q?: string; status?: DailyPostStatus; categoryId?: number; sort?: "newest" | "oldest" } = {}) => adminRequest<DailyPost[]>(key, `/api/admin/daily-posts${queryString(input)}`),
  get: (key: string, id: number) => adminRequest<DailyPost>(key, `/api/admin/daily-posts/${id}`),
  create: (key: string, body: Record<string, unknown>) => adminRequest<DailyPost>(key, "/api/admin/daily-posts", { method: "POST", body: JSON.stringify(body) }),
  update: (key: string, id: number, body: Record<string, unknown>) => adminRequest<DailyPost>(key, `/api/admin/daily-posts/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove: (key: string, id: number) => adminRequest<void>(key, `/api/admin/daily-posts/${id}`, { method: "DELETE" }),
  duplicate: (key: string, id: number) => adminRequest<DailyPost>(key, `/api/admin/daily-posts/${id}/duplicate`, { method: "POST" }),
  categories: (key: string) => adminRequest<DailyPostCategory[]>(key, "/api/admin/daily-post-categories"),
  createCategory: (key: string, body: Record<string, unknown>) => adminRequest<DailyPostCategory>(key, "/api/admin/daily-post-categories", { method: "POST", body: JSON.stringify(body) }),
  updateCategory: (key: string, id: number, body: Record<string, unknown>) => adminRequest<DailyPostCategory>(key, `/api/admin/daily-post-categories/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  removeCategory: (key: string, id: number) => adminRequest<void>(key, `/api/admin/daily-post-categories/${id}`, { method: "DELETE" }),
  upload: (key: string, body: { kind: "image" | "attachment"; fileName: string; mimeType: string; base64: string }) => adminRequest<DailyPostUpload>(key, "/api/admin/daily-posts/upload", { method: "POST", body: JSON.stringify(body) }),
  whatsappImportStatus: (key: string) => adminRequest<{ settings: WhatsappImportSettings; history: WhatsappImportHistory[] }>(key, "/api/admin/daily-posts/whatsapp-import"),
  updateWhatsappImportSettings: (key: string, body: { autoPublish?: boolean; isEnabled?: boolean }) => adminRequest<WhatsappImportSettings>(key, "/api/admin/daily-posts/whatsapp-import/settings", { method: "PATCH", body: JSON.stringify(body) }),
  checkWhatsappImportCapability: (key: string) => adminRequest<{ mode: "manual_only"; settings: WhatsappImportSettings; message: string }>(key, "/api/admin/daily-posts/whatsapp-import/check", { method: "POST" }),
  importWhatsappPost: (key: string, body: WhatsappImportPayload) => adminRequest<{ kind: "imported" | "duplicate"; post: DailyPost }>(key, "/api/admin/daily-posts/whatsapp-import", { method: "POST", body: JSON.stringify(body) }),
};

export function useDailyPostCategories() {
  const [categories, setCategories] = useState<DailyPostCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    dailyPostsApi.categories().then(rows => { if (active) setCategories(rows); }).catch(() => { if (active) setFailed(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return { categories, loading, failed };
}
