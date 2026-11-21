import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { analyse, flagLabel, sortBySeverity } from "@/lib/health/report";

const testInput = z.object({
  name: z.string().trim().min(1).max(80),
  value: z.number().finite(),
  unit: z.string().max(20),
  labLow: z.number().finite().nullable(),
  labHigh: z.number().finite().nullable(),
});

export const referralSchema = z.object({
  tests: z.array(testInput).min(1).max(40),
  age: z.number().int().min(1).max(120).nullable(),
  sex: z.enum(["M", "F"]).nullable(),
  language: z.enum(["hi", "pa", "mr", "en"]),
  source: z.enum(["sample", "upload", "manual"]),
  consent: z.literal(true),
  anonymized: z.boolean(),
  patientName: z.string().trim().max(100).nullable(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+ -]{8,16}$/)
    .nullable(),
});

export type ReferralInput = z.infer<typeof referralSchema>;

/** Zones and flags are recomputed here from the clinical rules — the browser's copy is never trusted. */
export const submitReferral = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => referralSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true; reference: string } | { ok: false }> => {
    const results = sortBySeverity(analyse(data.tests, { age: data.age, sex: data.sex }));
    if (!results.length) return { ok: false };
    const red = results.filter((r) => r.zone === "red");
    const yellow = results.filter((r) => r.zone === "yellow");

    const { createPublicClient } = await import("@/lib/server/public-db.server");
    const supabase = createPublicClient();
    const id = crypto.randomUUID();
    const { error } = await supabase.from("referrals").insert({
      id,
      age: data.age,
      sex: data.sex,
      language: data.language,
      source: data.source,
      tests: results.map((r) => ({
        key: r.key,
        name: r.name,
        value: r.value,
        unit: r.unit,
        zone: r.zone,
        low: r.band.low,
        high: r.band.high,
      })),
      red_flags: red.map(flagLabel),
      red_count: red.length,
      yellow_count: yellow.length,
      consent: true,
      anonymized: data.anonymized,
      patient_name: data.anonymized ? null : data.patientName || null,
      phone: data.anonymized ? null : data.phone,
    });
    if (error) {
      console.error("Referral insert failed", error.message);
      return { ok: false };
    }
    return { ok: true, reference: `REF-${id.replace(/-/g, "").slice(0, 4).toUpperCase()}` };
  });

export interface TriageTest {
  key: string | null;
  name: string;
  value: number;
  unit: string;
  zone: "green" | "yellow" | "red";
  low: number;
  high: number;
}

export interface TriageItem {
  id: string;
  label: string;
  isDemo: boolean;
  age: number | null;
  sex: "M" | "F" | null;
  language: "hi" | "pa" | "mr" | "en";
  source: string;
  tests: TriageTest[];
  redFlags: string[];
  redCount: number;
  yellowCount: number;
  status: string;
  createdAt: string;
}

/** Public, anonymised queue: real patients never come back with name or phone. */
export const getTriageQueue = createServerFn({ method: "GET" }).handler(async (): Promise<TriageItem[]> => {
  const { createPublicClient } = await import("@/lib/server/public-db.server");
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("get_triage_queue");
  if (error) {
    console.error("Triage queue failed", error.message);
    throw new Error("Could not load the queue");
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    label: r.display_label,
    isDemo: r.is_demo,
    age: r.age,
    sex: r.sex === "M" || r.sex === "F" ? r.sex : null,
    language: (["hi", "pa", "mr", "en"].includes(r.language) ? r.language : "hi") as TriageItem["language"],
    source: r.source,
    tests: Array.isArray(r.tests) ? (r.tests as unknown as TriageTest[]) : [],
    redFlags: r.red_flags ?? [],
    redCount: r.red_count,
    yellowCount: r.yellow_count,
    status: r.status,
    createdAt: r.created_at,
  }));
});
