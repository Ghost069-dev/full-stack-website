import { useMemo, useState } from "react";
import { AlertTriangle, ListChecks, Pencil, Printer, RotateCcw, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { displayName, doctorQuestions, explain, summarise, type ReportSource, type TestResult } from "@/lib/health/report";
import { useLang } from "@/lib/i18n";
import { useSpeech } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { ConsultDialog } from "./ConsultDialog";
import { ZONE_STYLE, formatNumber, formatRange } from "./zone-style";

interface Props {
  results: TestResult[];
  source: ReportSource;
  onEdit: () => void;
  onReset: () => void;
}

export function ResultsDashboard({ results, source, onEdit, onReset }: Props) {
  const { t, lang } = useLang();
  const { speak, speakingId, supported } = useSpeech();
  const { zone, counts } = summarise(results);
  const questions = useMemo(() => doctorQuestions(results, lang), [results, lang]);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const summaryText = t(zone === "red" ? "summaryRed" : zone === "yellow" ? "summaryYellow" : "summaryGreen");
  const s = ZONE_STYLE[zone];
  const fullReading = [summaryText, ...results.map((r) => explain(r, lang)), t("safetyBody")].join(" ");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold text-primary sm:text-4xl">{t("resultsTitle")}</h2>
          {(source.patientName || source.patientAge) && (
            <p className="mt-1 text-lg">
              {t("resultsFor")}: <strong>{source.patientName ?? "—"}</strong>
              {source.patientAge ? ` · ${t("resultsAge")} ${source.patientAge}` : ""}
            </p>
          )}
          {source.kind === "sample" && (
            <span className="mt-2 inline-block rounded-full bg-saffron-soft px-3 py-1 font-semibold text-accent-foreground">
              {t("resultsSampleTag")}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Pencil aria-hidden /> {t("editValues")}
          </Button>
          <Button variant="outline" onClick={onReset}>
            <RotateCcw aria-hidden /> {t("startOver")}
          </Button>
        </div>
      </div>

      {source.kind === "upload" && (
        <p className="rounded-xl border-2 border-saffron/40 bg-saffron-soft px-4 py-3 font-medium text-accent-foreground">
          {t("resultsCheckValues")}
        </p>
      )}

      {/* Overall summary banner */}
      <section aria-live="polite" className={cn("animate-rise rounded-3xl border-[3px] p-5 sm:p-7", s.card)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="text-4xl" aria-hidden>
              {s.emoji}
            </span>
            <div>
              <p className={cn("font-display text-2xl font-bold sm:text-3xl", s.ink)}>{summaryText}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["green", "yellow", "red"] as const).map((z) => (
                  <span key={z} className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 font-bold", ZONE_STYLE[z].badge)}>
                    {t(z === "green" ? "countGreen" : z === "yellow" ? "countYellow" : "countRed")}: {counts[z]}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {supported && (
            <Button variant="trust" size="lg" onClick={() => speak("all", fullReading, lang)} aria-pressed={speakingId === "all"}>
              {speakingId === "all" ? t("stop") : t("listenAll")}
            </Button>
          )}
        </div>
      </section>

      {/* Safety guardrail */}
      <section role="note" className="rounded-3xl border-[3px] border-saffron bg-saffron-soft p-5 sm:p-6">
        <div className="flex gap-4">
          <AlertTriangle className="mt-1 size-9 shrink-0 text-saffron" aria-hidden />
          <div>
            <p className="font-display text-2xl font-extrabold text-accent-foreground">{t("safetyTitle")}</p>
            <p className="mt-1 text-lg font-medium">{t("safetyBody")}</p>
            <p className="mt-2 font-bold text-primary">{t("safetyMotto")}</p>
          </div>
        </div>
      </section>

      {/* Zone cards */}
      <div className="grid gap-5 md:grid-cols-2">
        {[...results]
          .sort((a, b) => ["red", "yellow", "green"].indexOf(a.zone) - ["red", "yellow", "green"].indexOf(b.zone))
          .map((r, idx) => {
            const zs = ZONE_STYLE[r.zone];
            const text = explain(r, lang);
            return (
              <article
                key={r.id}
                className={cn("animate-rise flex flex-col gap-4 rounded-3xl border-[3px] p-5 shadow-soft", zs.card)}
                style={{ animationDelay: `${idx * 90}ms` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-display text-2xl font-bold">{displayName(r, lang)}</h3>
                  <span className={cn("rounded-full px-3 py-1 text-base font-bold", zs.badge)}>{t(zs.title)}</span>
                </div>
                <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
                  <div>
                    <p className="text-muted-foreground">{t("yourValue")}</p>
                    <p className={cn("font-display text-5xl font-extrabold leading-none", zs.ink)}>
                      {formatNumber(r.value)} <span className="text-xl font-semibold">{r.unit}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("normalRange")}</p>
                    <p className="text-xl font-semibold">
                      {formatRange(r.low, r.high)} {r.unit}
                    </p>
                  </div>
                </div>
                <p className={cn("font-bold", zs.ink)}>{t(zs.label)}</p>
                <p className="text-lg leading-relaxed">{text}</p>
                {r.info && <p className="text-muted-foreground">{r.info.about[lang]}</p>}
                {supported && (
                  <Button
                    variant="soft"
                    className="self-start"
                    onClick={() => speak(r.id, `${displayName(r, lang)}. ${text}`, lang)}
                    aria-pressed={speakingId === r.id}
                  >
                    {speakingId === r.id ? t("stop") : t("listen")}
                  </Button>
                )}
              </article>
            );
          })}
      </div>
      {!supported && <p className="text-muted-foreground">{t("noVoice")}</p>}

      {/* Questions for doctor */}
      <section className="rounded-3xl border-2 border-primary/20 bg-card p-5 shadow-soft sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <ListChecks className="mt-1 size-8 text-primary" aria-hidden />
            <div>
              <h3 className="font-display text-2xl font-bold text-primary sm:text-3xl">{t("step3Title")}</h3>
              <p className="text-muted-foreground">{t("step3Sub")}</p>
            </div>
          </div>
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
                <label className={cn("flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-4 transition-colors", checked[i] ? "border-zone-green bg-zone-green-soft" : "border-border hover:border-primary/40")}>
                  <Checkbox
                    checked={!!checked[i]}
                    onCheckedChange={(v) => setChecked((c) => ({ ...c, [i]: v === true }))}
                    className="mt-1 size-7 rounded-md border-2"
                  />
                  <span className={cn("text-lg", checked[i] && "line-through opacity-70")}>{q}</span>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-lg">{t("step3None")}</p>
        )}
      </section>

      {/* Doctor escalation */}
      <section className="flex flex-col items-center gap-4 rounded-3xl bg-primary px-6 py-8 text-center text-primary-foreground shadow-lift">
        <Stethoscope className="size-12 text-saffron" aria-hidden />
        <p className="font-display text-2xl font-bold sm:text-3xl">{t("consultBand")}</p>
        <ConsultDialog
          defaultName={source.kind === "sample" ? null : (source.patientName ?? null)}
          defaultAge={source.kind === "sample" ? null : (source.patientAge ?? null)}
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
