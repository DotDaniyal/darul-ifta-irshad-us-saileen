import fs from "node:fs";
import path from "node:path";

const apiBase = process.env.OPENAI_API_BASE;
const apiKey = process.env.OPENAI_API_KEY;

if (!apiBase || !apiKey) {
  throw new Error("OPENAI_API_BASE and OPENAI_API_KEY are required for the privacy audit.");
}

export async function auditFatwaPrivacyImage(imagePath) {
  const image = fs.readFileSync(imagePath).toString("base64");
  const response = await fetch(`${apiBase.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemini-3-flash-preview",
      max_tokens: 1024,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "fatwa_pdf_privacy_regions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              regions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    kind: { type: "string", enum: ["customer_name", "customer_phone"] },
                    leftPercent: { type: "number" },
                    topPercent: { type: "number" },
                    widthPercent: { type: "number" },
                    heightPercent: { type: "number" },
                    confidence: { type: "number" },
                  },
                  required: [
                    "kind",
                    "leftPercent",
                    "topPercent",
                    "widthPercent",
                    "heightPercent",
                    "confidence",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["regions"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "system",
          content:
            "You are a precise privacy auditor for scanned Urdu Fatwa PDFs. Identify only regions that expose a question submitter’s name or a non-official customer/mobile phone number. Do not flag names within the substantive legal question, answer, references, scholarly signatory, institutional logo, address, or footer. Do not flag the Darul Ifta official contact number in any printed form, including 03332617671, 0332617671, or +92 333 2617671. Return at most eight tight boxes. If more text occurs in one customer-detail line, use one box that covers that line. Bounding boxes must use percentages of the full image from the top-left, with a 1–2% safety margin.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Audit this single Fatwa PDF page for public-privacy redaction regions." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/${path.extname(imagePath).slice(1) || "png"};base64,${image}`,
                detail: "high",
              },
            },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!response.ok) {
    throw new Error(`Privacy audit request failed: ${response.status} ${await response.text()}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Privacy audit did not return structured text output.");
  return JSON.parse(content);
}
