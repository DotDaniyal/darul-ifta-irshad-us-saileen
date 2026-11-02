import { createScholarApi } from "../server/app";

/**
 * Vercel serverless adapter for /api index and catch-all routes.
 * Handles primary API requests, status checks, and data endpoints.
 */
const api = createScholarApi();

export default api;
