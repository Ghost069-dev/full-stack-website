import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";

import { createLovableAiGatewayRunIdFetch } from "./run-id.server";

const MODEL = "openai/gpt-6-astra";

const extractionSchema = z.object({
  is_lab_report: z.boolean(),
  patient_name: z.string().nullable(),
  patient_age: z.number().nullable(),
  tests: z.array(
    z.object({
      name: z.string(),
      value: z.number().nullable(),
      unit: z.string().nullable(),
      ref_low: z.number().nullable(),
      ref_high: z.number().nullable(),
    }),
  ),
});

export type Extraction = z.infer<typeof extractionSchema>;

const INSTRUCTIONS = `You read Indian medical lab reports (blood tests) from a photo or PDF.
Your ONLY job is to copy numbers accurately. Do not interpret, diagnose, or advise.

Rules:
- Set is_lab_report to false if the file is not a lab test report.
- For each numeric test result, return: the test name as printed (English), the numeric result value,
  the unit as printed, and the lab's reference range as ref_low / ref_high numbers.
- If the reference range is "< X" or "up to X", set ref_low to 0 and ref_high to X.
- If it is "> X", set ref_low to X and ref_high to null.
- If no range is printed, set both to null. If a value is not a plain number (e.g. "Positive"), skip the test.
- patient_name and patient_age only if clearly printed; otherwise null.
- Never invent values that are not visible in the document.`;

export type ExtractErrorCode = "credits" | "rate_limited" | "unavailable" | "unreadable" | "failed";

export async function extractWithAI(file: {
  base64: string;
  mimeType: string;
  fileName: string;
}): Promise<{ ok: true; data: Extraction } | { ok: false; code: ExtractErrorCode }> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    console.error("LOVABLE_API_KEY is not configured");
    return { ok: false, code: "unavailable" };
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const mediaPart =
    file.mimeType === "application/pdf"
      ? ({ type: "file", filename: file.fileName, data: file.base64, mediaType: "application/pdf" } as const)
      : ({ type: "image", image: new URL(`data:${file.mimeType};base64,${file.base64}`) } as const);

  try {
    const result = streamText({
      model: provider.responses(MODEL),
      instructions: INSTRUCTIONS,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: "Extract the test results from this lab report." }, mediaPart],
        },
      ],
      output: Output.object({ schema: extractionSchema }),
      maxRetries: 1,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    // Drain the stream, then read the validated object.
    for await (const _ of result.textStream) {
      void _;
    }
    const data = await result.output;
    return { ok: true, data };
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.error("Report extraction returned no valid object", error.text);
      return { ok: false, code: "unreadable" };
    }
    const status = APICallError.isInstance(error)
      ? error.statusCode
      : (error as { cause?: { statusCode?: number } })?.cause?.statusCode;
    console.error("Report extraction failed", status, error);
    if (status === 402) return { ok: false, code: "credits" };
    if (status === 429) return { ok: false, code: "rate_limited" };
    if (status === 403 || status === 404) return { ok: false, code: "unavailable" };
    return { ok: false, code: "failed" };
  }
}
