import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { findTest } from "@/lib/health/catalog";
import type { TestInput } from "@/lib/health/report";

const MAX_BASE64_LENGTH = 11_500_000; // ~8 MB file

const inputSchema = z.object({
  base64: z.string().min(100).max(MAX_BASE64_LENGTH),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]),
  fileName: z.string().min(1).max(200),
});

export type ExtractReportResult =
  | {
      ok: true;
      patientName: string | null;
      patientAge: number | null;
      tests: TestInput[];
    }
  | { ok: false; code: "credits" | "rate_limited" | "unavailable" | "unreadable" | "failed" | "not_report" | "no_tests" };

/** Upper bound used when a lab prints only a lower limit (e.g. "> 40"). */
export const OPEN_HIGH = 1_000_000_000;

export const extractReport = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<ExtractReportResult> => {
    const { extractWithAI } = await import("@/lib/server/report-ai.server");
    const res = await extractWithAI(data);
    if (!res.ok) return res;

    const { data: ex } = res;
    if (!ex.is_lab_report) return { ok: false, code: "not_report" };

    const tests: TestInput[] = [];
    for (const t of ex.tests) {
      if (t.value === null || !Number.isFinite(t.value) || !t.name.trim()) continue;
      const known = findTest(t.name);
      let low = t.ref_low;
      let high = t.ref_high;
      if (low === null && high === null) {
        if (!known) continue; // cannot place in a zone without any range
        low = known.low;
        high = known.high;
      }
      low ??= 0;
      high ??= OPEN_HIGH;
      if (low > high) [low, high] = [high, low];
      tests.push({
        name: t.name.trim().slice(0, 80),
        value: t.value,
        unit: (t.unit ?? known?.unit ?? "").trim().slice(0, 20),
        low,
        high,
      });
    }

    if (!tests.length) return { ok: false, code: "no_tests" };

    const age = ex.patient_age;
    return {
      ok: true,
      patientName: ex.patient_name?.trim().slice(0, 80) || null,
      patientAge: age !== null && age > 0 && age < 130 ? Math.round(age) : null,
      tests: tests.slice(0, 40),
    };
  });
