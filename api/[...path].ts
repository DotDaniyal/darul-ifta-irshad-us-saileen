import { createScholarApi } from "../server/app";

/**
 * Vercel serverless adapter. The catch-all function preserves the existing
 * Express API paths, including protected Daily Posts and scholar workflows.
 */
const api = createScholarApi();

export default api;
