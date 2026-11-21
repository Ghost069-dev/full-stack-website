import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
  language: z.enum(["hi", "pa", "mr", "en"]),
  concerns: z.string().trim().max(2000).nullable(),
});

export type ConsultInput = z.infer<typeof consultSchema>;

export const submitConsultation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => consultSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true; reference: string } | { ok: false }> => {
    const { createPublicClient } = await import("@/lib/server/public-db.server");
    const supabase = createPublicClient();
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
