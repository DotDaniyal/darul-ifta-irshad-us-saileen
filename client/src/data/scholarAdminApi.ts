import type { ApiScholar } from "./scholarsApi";

async function adminRequest<T>(key: string, path: string, init: RequestInit = {}) {
  const response = await fetch(path, {
    ...init,
    headers: {
      "x-scholar-admin-key": key,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({ error: "Unable to complete the scholar management request." }));
    throw new Error(typeof detail.error === "string" ? detail.error : "Unable to complete the scholar management request.");
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

export const scholarAdminApi = {
  verify: (key: string) => adminRequest<void>(key, "/api/admin/scholar-session"),
  list: (key: string) => adminRequest<ApiScholar[]>(key, "/api/admin/scholars"),
  create: (key: string, body: Record<string, unknown>) => adminRequest<ApiScholar>(key, "/api/admin/scholars", { method: "POST", body: JSON.stringify(body) }),
  update: (key: string, id: number, body: Record<string, unknown>) => adminRequest<ApiScholar>(key, `/api/admin/scholars/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove: (key: string, id: number) => adminRequest<void>(key, `/api/admin/scholars/${id}`, { method: "DELETE" }),
};
