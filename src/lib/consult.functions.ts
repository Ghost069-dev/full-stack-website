import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";

export const consultSchema = z.object({
  patientName: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+ -]{8,16}$/),
  age: z.number().int().min(1).max(120).nullable(),
  mode: z.enum(["video", "phone", "clinic"]),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  slot: z.enum(["morning", "afternoon", "evening"]),
  language: z.enum(["hi", "en"]),
  concerns: z.string().trim().max(2000).nullable(),
});

export type ConsultInput = z.infer<typeof consultSchema>;

export const submitConsultation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => consultSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true; reference: string } | { ok: false }> => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) {
      console.error("Backend is not configured");
      return { ok: false };
    }
    const supabase = createClient<Database>(url, key, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const id = crypto.randomUUID();
    const { error } = await supabase.from("consultation_requests").insert({
      id,
      patient_name: data.patientName,
      phone: data.phone,
      age: data.age,
      consult_mode: data.mode,
      preferred_date: data.preferredDate,
      preferred_slot: data.slot,
      language: data.language,
      concerns: data.concerns,
    });
    if (error) {
      console.error("Consultation insert failed", error.message);
      return { ok: false };
    }
    return { ok: true, reference: `SS-${id.slice(0, 6).toUpperCase()}` };
  });
