import { useMemo, useState } from "react";
import { AlertTriangle, AudioLines, ListChecks, Pencil, Printer, RotateCcw, ShieldCheck, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Profile } from "@/lib/health/clinical-db";
import {
  displayName,
  doctorQuestions,
  explain,
  profileLabel,
  sortBySeverity,
  speechLine,
  speechSummary,
  summarise,
  type ReportSource,
  type TestInput,
  type TestResult,
} from "@/lib/health/report";
import { useLang } from "@/lib/i18n";
import { useSpeech } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { ConsultDialog } from "./ConsultDialog";
import { ReferralCard } from "./ReferralCard";
import { ZONE_STYLE, bandRule, formatNumber, formatRange } from "./zone-style";

interface Props {
  results: TestResult[];
  inputs: TestInput[];
  profile: Profile;
  source: ReportSource;
  onEdit: () => void;
  onReset: () => void;
}

function Wave() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {[0, 120, 240, 360, 480].map((d) => (
        <span key={d} className="wave-bar" style={{ animationDelay: `${d}ms` }} />
      ))}
    </span>
  );
}

export function ResultsDashboard({ results, inputs, profile, source, onEdit, onReset }: Props) {
  const { t, lang } = useLang();
  const { speak, speakingId, supported } = useSpeech();
  const { zone, counts } = summarise(results);
  const ordered = useMemo(() => sortBySeverity(results), [results]);
  const questions = useMemo(() => doctorQuestions(results, lang), [results, lang]);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const summaryText = t(zone === "red" ? "summaryRed" : zone === "yellow" ? "summaryYellow" : "summaryGreen");
  const s = ZONE_STYLE[zone];
  const pl = profileLabel(profile);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold text-primary sm:text-4xl">{t("resultsTitle")}</h2>
          <p className="mt-1 text-xl">
            <strong>{source.patientName ?? "—"}</strong> · {pl}
          </p>
          {source.kind === "sample" && (
            <span className="mt-2 inline-block rounded-full bg-saffron-soft px-3 py-1 font-semibold text-accent-foreground">{t("resultsSampleTag")}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="lg" onClick={onEdit}>
            <Pencil aria-hidden /> {t("editValues")}
          </Button>
          <Button variant="outline" size="lg" onClick={onReset}>
            <RotateCcw aria-hidden /> {t("startOver")}
          </Button>
        </div>
      </div>

      {source.kind === "upload" && (
        <p className="rounded-xl border-2 border-saffron/40 bg-saffron-soft px-4 py-3 text-lg font-medium text-accent-foreground">{t("resultsCheckValues")}</p>
      )}

      {/* Summary + voice */}
      <section aria-live="polite" className={cn("animate-rise rounded-3xl border-[3px] p-5 sm:p-7", s.card, speakingId === "all" && "speaking-ring")}>
        <div className="flex items-start gap-4">
          <span className="text-5xl leading-none" aria-hidden>{s.emoji}</span>
          <div className="flex-1">
            <p className={cn("font-display text-2xl font-bold sm:text-3xl", s.ink)}>{summaryText}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["red", "yellow", "green"] as const).map((z) => (
                <span key={z} className={cn("inline-flex min-h-10 items-center rounded-full px-4 text-lg font-bold", ZONE_STYLE[z].badge)}>
                  {t(z === "green" ? "countGreen" : z === "yellow" ? "countYellow" : "countRed")} {counts[z]}
                </span>
              ))}
            </div>
          </div>
        </div>
        {supported ? (
          <div className="mt-5 flex flex-col gap-2">
            <Button
              variant="hero"
              size="xl"
              className={cn("justify-center", speakingId !== "all" && "glow-pulse")}
              onClick={() => speak("all", speechSummary(results, lang, source.patientName), lang)}
              aria-pressed={speakingId === "all"}
            >
              {speakingId === "all" ? (
                <>
                  <Wave /> {t("stop")}
                </>
              ) : (
                t("listenDialect")
              )}
            </Button>
            <p className="flex flex-wrap items-center justify-center gap-2 text-base text-muted-foreground">
              <AudioLines className="size-5 text-saffron" aria-hidden />
              <span className="font-bold text-foreground">{t("voiceBadge")}</span> · {t("voiceNote")}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-muted-foreground">{t("noVoice")}</p>
        )}
      </section>

      {counts.red > 0 && <ReferralCard results={results} inputs={inputs} profile={profile} source={source} />}

      <section role="note" className="flex gap-4 rounded-3xl border-[3px] border-saffron bg-saffron-soft p-5">
        <AlertTriangle className="mt-1 size-9 shrink-0 text-saffron" aria-hidden />
        <div>
          <p className="font-display text-2xl font-extrabold text-accent-foreground">{t("safetyTitle")}</p>
          <p className="mt-1 text-lg font-medium">{t("safetyBody")}</p>
          <p className="mt-1 font-bold text-primary">{t("safetyMotto")}</p>
        </div>
      </section>

      {/* Zone cards */}
      <div className="grid gap-5 md:grid-cols-2">
        {ordered.map((r, idx) => {
          const zs = ZONE_STYLE[r.zone];
          const speaking = speakingId === r.id;
          return (
            <article
              key={r.id}
              className={cn("animate-rise flex flex-col gap-4 rounded-3xl border-[3px] p-5 shadow-soft transition-shadow", zs.card, speaking && "speaking-ring")}
              style={{ animationDelay: `${idx * 90}ms` }}
            >
              <span className={cn("self-start rounded-full px-4 py-1 text-lg font-bold", zs.badge)}>
                {zs.emoji} {t(zs.title)}
              </span>
              <h3 className="font-display text-2xl font-bold">{displayName(r, lang)}</h3>
              <p className={cn("font-display text-6xl font-extrabold leading-none", zs.ink)}>
                {formatNumber(r.value)} <span className="text-2xl font-semibold">{r.unit}</span>
              </p>
              <div className="rounded-2xl bg-card/70 p-3">
                <p className="text-lg">
                  <span className="text-muted-foreground">{t("normalRange")} ({r.source === "clinical_db" ? pl : t("ruleLab")}):</span>{" "}
                  <strong>
                    {formatRange(r.band.low, r.band.high)} {r.unit}
                  </strong>
                </p>
                {r.source === "clinical_db" && <p className="mt-1 text-base text-muted-foreground">{bandRule(r.band)}</p>}
              </div>
              <p className="text-xl leading-relaxed">{explain(r, lang)}</p>
              <div className="mt-auto flex flex-wrap items-center gap-3">
                {supported && (
                  <Button
                    variant="soft"
                    size="lg"
                    className={cn(!speaking && r.zone === "red" && "glow-pulse")}
                    onClick={() => speak(r.id, speechLine(r, lang), lang)}
                    aria-pressed={speaking}
                  >
                    {speaking ? (
                      <>
                        <Wave /> {t("stop")}
                      </>
                    ) : (
                      t("listen")
                    )}
                  </Button>
                )}
              </div>
              <p className="inline-flex items-center gap-1.5 self-start rounded-full border border-primary/25 bg-card px-3 py-1 text-sm font-semibold text-primary">
                <ShieldCheck className="size-4" aria-hidden /> {t("trustPill")}
              </p>
            </article>
          );
        })}
      </div>

      {/* Questions for doctor */}
      <section className="rounded-3xl border-2 border-primary/20 bg-card p-5 shadow-soft sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-3 font-display text-2xl font-bold text-primary sm:text-3xl">
            <ListChecks className="size-8" aria-hidden /> {t("step3Title")}
          </h3>
          {questions.length > 0 && (
            <Button variant="outline" onClick={() => window.print()}>
              <Printer aria-hidden /> {t("printList")}
            </Button>
          )}
        </div>
        {questions.length ? (
          <ul className="mt-5 flex flex-col gap-3">
            {questions.map((q, i) => (
              <li key={q}>
                <label className={cn("flex min-h-14 cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-colors", checked[i] ? "border-zone-green bg-zone-green-soft" : "border-border hover:border-primary/40")}>
                  <Checkbox checked={!!checked[i]} onCheckedChange={(v) => setChecked((c) => ({ ...c, [i]: v === true }))} className="size-7 rounded-md border-2" />
                  <span className={cn("text-xl", checked[i] && "line-through opacity-70")}>{q}</span>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-xl">{t("step3None")}</p>
        )}
      </section>

      <section className="flex flex-col items-center gap-4 rounded-3xl bg-primary px-6 py-8 text-center text-primary-foreground shadow-lift">
        <Stethoscope className="size-12 text-saffron" aria-hidden />
        <p className="font-display text-2xl font-bold sm:text-3xl">{t("consultBand")}</p>
        <ConsultDialog
          defaultName={source.kind === "sample" ? null : (source.patientName ?? null)}
          defaultAge={source.kind === "sample" ? null : profile.age}
          defaultConcerns={questions.join("\n")}
          trigger={
            <Button variant="hero" size="xl" className="justify-center">
              <Stethoscope aria-hidden /> {t("consultCta")}
            </Button>
          }
        />
      </section>
    </div>
  );
}
