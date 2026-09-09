import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  imageDataUrl: z.string().min(32),
});

const FIELDS = [
  "productName",
  "mrp",
  "netQuantity",
  "manufacturer",
  "packingDate",
  "consumerCare",
] as const;

type Extracted = { rawText: string } & Record<(typeof FIELDS)[number], string | null>;

export const extractLabelFields = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<Extracted> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this app.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          {
            role: "system",
            content:
              "You are an OCR and Legal Metrology label reader for Indian packaged commodities. Read every printed declaration on the package image. Return the exact printed text for each field, or null when the field is genuinely absent or illegible. Never invent values.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract the mandatory declarations from this package label. rawText must contain all text you can read on the label, line by line.",
              },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "label_declarations",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["rawText", ...FIELDS],
              properties: {
                rawText: { type: "string" },
                productName: { type: ["string", "null"] },
                mrp: { type: ["string", "null"] },
                netQuantity: { type: ["string", "null"] },
                manufacturer: { type: ["string", "null"] },
                packingDate: { type: ["string", "null"] },
                consumerCare: { type: ["string", "null"] },
              },
            },
          },
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("AI is busy right now. Please try again in a moment.");
      if (res.status === 402)
        throw new Error("AI credits are exhausted for this workspace. Please top up to continue.");
      throw new Error(`Label analysis failed (${res.status}). ${body.slice(0, 200)}`);
    }

    const payload = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("The label could not be read. Please recapture the image.");

    const parsed = JSON.parse(content) as Extracted;
    return parsed;
  });
