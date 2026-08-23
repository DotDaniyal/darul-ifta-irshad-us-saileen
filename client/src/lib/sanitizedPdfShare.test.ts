import { describe, expect, it, vi } from "vitest";
import { shareSanitizedPdf } from "./sanitizedPdfShare";

const sanitizedPdfUrl = "/manus-storage/sanitized-fatwa-a0367.pdf";

describe("shareSanitizedPdf", () => {
  it("uses the native share sheet with the supplied sanitized document URL", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const copy = vi.fn();

    await expect(
      shareSanitizedPdf({
        title: "Fatwa A0367",
        pdfUrl: sanitizedPdfUrl,
        environment: { baseUrl: "https://darulifta.example", share, copy },
      }),
    ).resolves.toBe("shared");

    expect(share).toHaveBeenCalledWith(expect.objectContaining({
      title: "Fatwa A0367",
      url: "https://darulifta.example/manus-storage/sanitized-fatwa-a0367.pdf",
    }));
    expect(copy).not.toHaveBeenCalled();
  });

  it("copies the identical sanitized URL when native sharing is unavailable or rejected", async () => {
    const copy = vi.fn().mockResolvedValue(undefined);

    await expect(
      shareSanitizedPdf({
        title: "Fatwa A0367",
        pdfUrl: sanitizedPdfUrl,
        environment: { baseUrl: "https://darulifta.example", share: vi.fn().mockRejectedValue(new Error("blocked")), copy },
      }),
    ).resolves.toBe("copied");

    expect(copy).toHaveBeenCalledWith("https://darulifta.example/manus-storage/sanitized-fatwa-a0367.pdf");
  });

  it("treats a dismissed native share sheet and missing copy capability as non-errors", async () => {
    await expect(
      shareSanitizedPdf({
        title: "Fatwa A0367",
        pdfUrl: sanitizedPdfUrl,
        environment: { baseUrl: "https://darulifta.example", share: vi.fn().mockRejectedValue({ name: "AbortError" }) },
      }),
    ).resolves.toBe("cancelled");

    await expect(
      shareSanitizedPdf({
        title: "Fatwa A0367",
        pdfUrl: sanitizedPdfUrl,
        environment: { baseUrl: "https://darulifta.example" },
      }),
    ).resolves.toBe("unavailable");
  });
});
