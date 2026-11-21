import { useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, Phone, Stethoscope, Video, Building2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitConsultation, type ConsultInput } from "@/lib/consult.functions";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Props {
  trigger?: ReactNode;
  defaultName?: string | null;
  defaultAge?: number | null;
  defaultConcerns?: string;
}

const choiceCls = (active: boolean) =>
  cn(
    "flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-base font-semibold transition-colors",
    active ? "border-primary bg-primary-soft text-primary" : "border-input bg-card hover:border-primary/50",
  );

export function ConsultDialog({ trigger, defaultName, defaultAge, defaultConcerns }: Props) {
  const { t, lang } = useLang();
  const submit = useServerFn(submitConsultation);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean }>({});

  const [name, setName] = useState(defaultName ?? "");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState(defaultAge ? String(defaultAge) : "");
  const [mode, setMode] = useState<ConsultInput["mode"]>("phone");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<ConsultInput["slot"]>("morning");
  const [concerns, setConcerns] = useState(defaultConcerns ?? "");

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setReference(null);
      setErrors({});
      if (defaultName && !name) setName(defaultName);
      if (defaultAge && !age) setAge(String(defaultAge));
      if (defaultConcerns && !concerns) setConcerns(defaultConcerns);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanPhone = phone.trim();
    const nextErrors = {
      name: name.trim().length < 2,
      phone: !/^[0-9+ -]{8,16}$/.test(cleanPhone),
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.phone) return;

    const ageNum = Number.parseInt(age, 10);
    setSending(true);
    try {
      const res = await submit({
        data: {
          patientName: name.trim(),
          phone: cleanPhone,
          age: Number.isFinite(ageNum) && ageNum > 0 && ageNum <= 120 ? ageNum : null,
          mode,
          preferredDate: date || null,
          slot,
          language: lang,
          concerns: concerns.trim() ? concerns.trim().slice(0, 2000) : null,
        },
      });
      if (res.ok) setReference(res.reference);
      else toast.error(lang === "hi" ? "बुकिंग नहीं भेजी जा सकी। कृपया दोबारा कोशिश करें।" : "Couldn't send the booking. Please try again.");
    } catch {
      toast.error(lang === "hi" ? "बुकिंग नहीं भेजी जा सकी। कृपया दोबारा कोशिश करें।" : "Couldn't send the booking. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="trust" size="lg">
            <Stethoscope aria-hidden /> {t("consultCta")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border-2 border-primary/20 bg-background p-6 sm:max-w-xl">
        {reference ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 className="size-16 text-zone-green" aria-hidden />
            <DialogTitle className="font-display text-3xl text-primary">{t("bookedTitle")}</DialogTitle>
            <DialogDescription className="text-lg text-foreground">{t("bookedBody")}</DialogDescription>
            <p className="rounded-2xl bg-saffron-soft px-6 py-3 font-display text-3xl font-bold tracking-wider text-accent-foreground">
              {reference}
            </p>
            <p className="rounded-xl border-2 border-zone-red/40 bg-zone-red-soft px-4 py-3 text-zone-red-ink">
              {t("bookedEmergency")}
            </p>
            <Button variant="trust" size="lg" onClick={() => setOpen(false)}>
              {t("close")}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="text-left">
              <DialogTitle className="font-display text-3xl text-primary">{t("consultTitle")}</DialogTitle>
              <DialogDescription className="text-lg text-muted-foreground">{t("consultSub")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="mt-2 flex flex-col gap-5" noValidate>
              <div className="grid gap-2">
                <Label htmlFor="c-name" className="text-lg">{t("fName")}</Label>
                <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} className="h-14 text-lg" autoComplete="name" maxLength={100} aria-invalid={errors.name} />
                {errors.name && <p className="text-zone-red-ink">{t("errName")}</p>}
              </div>
              <div className="grid grid-cols-[1fr_7rem] gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="c-phone" className="text-lg">{t("fPhone")}</Label>
                  <Input id="c-phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-14 text-lg" autoComplete="tel" placeholder="98765 43210" maxLength={16} aria-invalid={errors.phone} />
                  {errors.phone && <p className="text-zone-red-ink">{t("errPhone")}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c-age" className="text-lg">{t("fAge")}</Label>
                  <Input id="c-age" type="number" inputMode="numeric" min={1} max={120} value={age} onChange={(e) => setAge(e.target.value)} className="h-14 text-lg" />
                </div>
              </div>
              <fieldset className="grid gap-2">
                <legend className="mb-2 text-lg font-medium">{t("fMode")}</legend>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button type="button" className={choiceCls(mode === "phone")} onClick={() => setMode("phone")} aria-pressed={mode === "phone"}>
                    <Phone aria-hidden className="size-5" /> {t("modePhone")}
                  </button>
                  <button type="button" className={choiceCls(mode === "video")} onClick={() => setMode("video")} aria-pressed={mode === "video"}>
                    <Video aria-hidden className="size-5" /> {t("modeVideo")}
                  </button>
                  <button type="button" className={choiceCls(mode === "clinic")} onClick={() => setMode("clinic")} aria-pressed={mode === "clinic"}>
                    <Building2 aria-hidden className="size-5" /> {t("modeClinic")}
                  </button>
                </div>
              </fieldset>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="c-date" className="text-lg">{t("fDate")}</Label>
                  <Input id="c-date" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className="h-14 text-lg" />
                </div>
                <fieldset className="grid gap-2">
                  <legend className="mb-2 text-lg font-medium">{t("fSlot")}</legend>
                  <div className="flex gap-2">
                    {(["morning", "afternoon", "evening"] as const).map((s) => (
                      <button key={s} type="button" className={choiceCls(slot === s)} onClick={() => setSlot(s)} aria-pressed={slot === s}>
                        {t(s === "morning" ? "slotMorning" : s === "afternoon" ? "slotAfternoon" : "slotEvening")}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-concerns" className="text-lg">{t("fConcerns")}</Label>
                <Textarea id="c-concerns" rows={5} value={concerns} onChange={(e) => setConcerns(e.target.value)} className="text-lg" maxLength={2000} />
              </div>
              <Button type="submit" variant="trust" size="lg" disabled={sending}>
                {sending ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden /> {t("fSending")}
                  </>
                ) : (
                  t("fSubmit")
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
