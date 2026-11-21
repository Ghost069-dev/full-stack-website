import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Circle, Loader2, Send, Siren, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { Profile } from "@/lib/health/clinical-db";
import { flagLabel, sortBySeverity, type ReportSource, type TestInput, type TestResult } from "@/lib/health/report";
import { LANGS, useLang, type DictKey } from "@/lib/i18n";
import { useOffline } from "@/lib/offline";
import { submitReferral, type ReferralInput } from "@/lib/referral.functions";
import { cn } from "@/lib/utils";

interface Props {
  results: TestResult[];
  inputs: TestInput[];
  profile: Profile;
  source: ReportSource;
}

const PACKET: DictKey[] = ["refItemValues", "refItemFlags", "refItemLang", "refItemConsent"];

export function ReferralCard({ results, inputs, profile, source }: Props) {
  const { t, lang } = useLang();
  const { offline, queueReferral } = useOffline();
  const send = useServerFn(submitReferral);
  const [consent, setConsent] = useState(false);
  const [anonymized, setAnonymized] = useState(true);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "queued" | "error">("idle");
  const [reference, setReference] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState(false);

  const red = sortBySeverity(results).filter((r) => r.zone === "red");
  const done = status === "sent" || status === "queued";

  async function onSend() {
    const cleanPhone = phone.trim();
    if (!anonymized && cleanPhone && !/^[0-9+ -]{8,16}$/.test(cleanPhone)) return setPhoneError(true);
    setPhoneError(false);
    const payload: ReferralInput = {
      tests: inputs,
      age: profile.age,
      sex: profile.sex,
      language: lang,
      source: source.kind,
      consent: true,
      anonymized,
      patientName: anonymized ? null : (source.patientName ?? null),
      phone: anonymized || !cleanPhone ? null : cleanPhone,
    };
    if (offline) {
      queueReferral(payload);
      setStatus("queued");
      return;
    }
    setStatus("sending");
    try {
      const res = await send({ data: payload });
      if (res.ok) {
        setReference(res.reference);
        setStatus("sent");
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section aria-labelledby="ref-title" className="animate-rise overflow-hidden rounded-3xl border-[3px] border-zone-red bg-card shadow-lift">
      <div className="flex items-center gap-3 bg-zone-red px-5 py-4 text-destructive-foreground">
        <Siren className="size-9 shrink-0" aria-hidden />
        <div>
          <h3 id="ref-title" className="font-display text-2xl font-extrabold">{t("refTitle")}</h3>
          <p className="text-lg">{t("refSub")}</p>
        </div>
      </div>
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {red.map((r) => (
            <span key={r.id} className="rounded-full border-2 border-zone-red bg-zone-red-soft px-4 py-1.5 text-lg font-bold text-zone-red-ink">
              🔴 {flagLabel(r)}
            </span>
          ))}
        </div>

        <div className="rounded-2xl bg-muted p-4">
          <p className="font-display text-xl font-bold">{t("refPacket")}</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {PACKET.map((k, i) => (
              <li key={k} className="flex items-center gap-3 text-lg" style={done ? { animation: `rise 0.4s ${i * 150}ms both` } : undefined}>
                {done ? <CheckCircle2 className="size-7 shrink-0 text-zone-green" aria-hidden /> : <Circle className="size-7 shrink-0 text-muted-foreground" aria-hidden />}
                <span>
                  {t(k)}
                  {k === "refItemLang" && ` — ${LANGS.find((l) => l.code === lang)?.label}`}
                </span>
              </li>
            ))}
          </ul>
          {source.kind === "upload" && (
            <p className="mt-3 flex items-center gap-2 text-base text-muted-foreground">
              <Smartphone className="size-5" aria-hidden /> {t("refFileNote")}
            </p>
          )}
        </div>

        {!done && (
          <>
            <label className="flex cursor-pointer items-start gap-4 rounded-2xl border-2 border-border p-4">
              <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-1 size-7 rounded-md border-2" />
              <span className="text-lg font-medium">{t("refConsent")}</span>
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border-2 border-border p-4">
              <span className="text-lg font-medium">{t("refAnon")}</span>
              <Switch checked={anonymized} onCheckedChange={setAnonymized} className="h-8 w-14 [&>span]:size-7 [&>span]:data-[state=checked]:translate-x-6" />
            </label>
            {!anonymized && (
              <label className="grid gap-2">
                <span className="text-lg">{t("refPhone")}</span>
                <Input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-14 text-lg" placeholder="98765 43210" maxLength={16} aria-invalid={phoneError} />
                {phoneError && <span className="text-zone-red-ink">{t("errPhone")}</span>}
              </label>
            )}
            {status === "error" && <p role="alert" className="text-lg font-medium text-zone-red-ink">{t("refError")}</p>}
            <Button variant="trust" size="xl" className={cn("justify-center", consent && "glow-pulse")} disabled={!consent || status === "sending"} onClick={onSend}>
              {status === "sending" ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
              {status === "sending" ? t("refSending") : t("refBtn")}
            </Button>
          </>
        )}

        {done && (
          <div role="status" className="flex flex-col items-start gap-3 rounded-2xl border-2 border-zone-green bg-zone-green-soft p-4">
            <p className="font-display text-2xl font-bold text-zone-green-ink">{status === "sent" ? t("refSent") : t("refQueued")}</p>
            {reference && <p className="font-display text-2xl font-bold tracking-wider">{reference}</p>}
            {status === "sent" && (
              <Button asChild variant="soft" size="lg">
                <Link to="/doctor">{t("refViewQueue")}</Link>
              </Button>
            )}
          </div>
        )}
        <p className="text-base text-muted-foreground">{t("refNote")}</p>
      </div>
    </section>
  );
}
