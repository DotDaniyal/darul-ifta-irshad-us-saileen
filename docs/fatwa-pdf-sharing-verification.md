# Sanitized Fatwa PDF Sharing Verification

The A0367 detail route was checked at desktop and phone widths after adding the PDF-sharing control. The action appears within the established document-action panel beside the existing sanitized PDF open action and remains readable and contained at 375px width.

The implementation shares only `fatwa.pdfUrl`, which is already governed by the catalog’s sanitized manifest boundary. On supported devices it invokes the native share sheet; if that is unavailable or rejected, it copies the identical public sanitized-document URL. A dismissed share sheet is treated as a normal cancellation, while missing share and clipboard support produces an explicit availability message rather than exposing or constructing an alternative raw document URL.
