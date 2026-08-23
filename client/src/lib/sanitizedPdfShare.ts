export type SanitizedPdfShareOutcome = "shared" | "copied" | "cancelled" | "unavailable";

type SharePayload = {
  title: string;
  text: string;
  url: string;
};

type ShareEnvironment = {
  baseUrl: string;
  share?: (payload: SharePayload) => Promise<void>;
  copy?: (value: string) => Promise<void>;
};

type ShareSanitizedPdfOptions = {
  title: string;
  pdfUrl: string;
  environment?: ShareEnvironment;
};

function isDismissedShare(error: unknown) {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

function getBrowserShareEnvironment(): ShareEnvironment | null {
  if (typeof window === "undefined") return null;

  return {
    baseUrl: window.location.origin,
    share: navigator.share ? (payload) => navigator.share(payload) : undefined,
    copy: navigator.clipboard?.writeText ? (value) => navigator.clipboard.writeText(value) : undefined,
  };
}

/**
 * Shares only a catalog-provided, privacy-sanitized PDF URL. The share sheet is
 * preferred on supported devices; copying the same URL is a deliberate fallback.
 */
export async function shareSanitizedPdf({ title, pdfUrl, environment }: ShareSanitizedPdfOptions): Promise<SanitizedPdfShareOutcome> {
  const browserEnvironment = environment ?? getBrowserShareEnvironment();
  if (!browserEnvironment) return "unavailable";

  const url = new URL(pdfUrl, browserEnvironment.baseUrl).toString();
  const payload = {
    title,
    text: "Darul Ifta Irshad-us-Saileen — privacy-sanitized Fatwa PDF",
    url,
  };

  if (browserEnvironment.share) {
    try {
      await browserEnvironment.share(payload);
      return "shared";
    } catch (error) {
      if (isDismissedShare(error)) return "cancelled";
    }
  }

  if (!browserEnvironment.copy) return "unavailable";

  try {
    await browserEnvironment.copy(url);
    return "copied";
  } catch {
    return "unavailable";
  }
}
