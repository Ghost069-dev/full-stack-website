import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { RefreshCw, ShieldCheck, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ZONE_STYLE } from "@/components/report/zone-style";
import { analyse, speechSummary } from "@/lib/health/report";
import { LANGS, useLang } from "@/lib/i18n";
import { getTriageQueue, type TriageItem } from "@/lib/referral.functions";
import { useSpeech } from "@/lib/speech";
import { cn } from "@/lib/utils";

const queueQuery = queryOptions({ queryKey: ["triage-queue"], queryFn: () => getTriageQueue() });

export const Route = createFileRoute("/doctor")({
  head: () => ({
    meta: [
      { title: "Doctor Triage Dashboard — Sehat Saathi" },
      { name: "description", content: "Anonymised tele-triage queue: patients with red-zone lab results appear first for a human doctor to review." },
      { property: "og:title", content: "Sehat Saathi Doctor Triage Dashboard" },
      { property: "og:description", content: "Human-in-the-loop queue for red-flag lab reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(queueQuery),
  component: DoctorDashboard,
});

function DoctorDashboard() {
  const { t } = useLang();
  const { data, refetch, isFetching } = useSuspenseQuery(queueQuery);
  const [open, setOpen] = useState<TriageItem | null>(null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wider text-saffron">
            <span className="size-3 animate-pulse rounded-full bg-zone-red" aria-hidden /> {t("docLive")}
          </p>
          <h1 className="font-display text-4xl font-extrabold text-primary">{t("docTitle")}</h1>
          <p className="text-lg text-muted-foreground">{t("docSub")}</p>
        </div>
        <Button variant="outline" size="lg" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn(isFetching && "animate-spin")} aria-hidden /> {t("docRefresh")}
        </Button>
      </div>
      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-primary-soft p-4 text-base">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden /> {t("docAnonNote")}
      </p>

      {data.length === 0 ? (
        <p className="mt-8 text-xl">{t("docEmpty")}</p>
      ) : (
        <ol className="mt-6 flex flex-col gap-4">
          {data.map((item, i) => (
            <li
              key={item.id}
              className={cn(
                "flex flex-col gap-3 rounded-3xl border-[3px] bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between",
                item.redCount > 0 ? "border-zone-red" : item.yellowCount > 0 ? "border-zone-yellow" : "border-border",
              )}
            >
              <div>
                <p className="font-display text-2xl font-bold">
                  {i + 1}. {item.label} ({item.age ?? "?"}
                  {item.sex ?? ""}) — {item.redCount} {t("docRed")}
                  {item.redFlags.length > 0 && <span className="text-zone-red-ink"> ({item.redFlags.join(", ")})</span>}
                </p>
                <p className="text-base text-muted-foreground">
                  {LANGS.find((l) => l.code === item.language)?.label} · {item.yellowCount} {t("docYellow")}
                  {item.isDemo && ` · ${t("docDemo")}`}
                </p>
              </div>
              <Button variant="trust" size="lg" onClick={() => setOpen(item)}>
                <Stethoscope aria-hidden /> {t("docStart")}
              </Button>
            </li>
          ))}
        </ol>
      )}
      {open && <ConsultPanel item={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function ConsultPanel({ item, onClose }: { item: TriageItem; onClose: () => void }) {
  const { t } = useLang();
  const { speak, speakingId, supported } = useSpeech();
  const [advice, setAdvice] = useState("");
  const [issued, setIssued] = useState(false);
  const results = analyse(
    item.tests.map((x) => ({ name: x.name, value: x.value, unit: x.unit, labLow: x.low, labHigh: x.high })),
    { age: item.age, sex: item.sex },
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl sm:max-w-xl">
        <DialogTitle className="font-display text-3xl text-primary">
          {item.label} ({item.age ?? "?"}
          {item.sex ?? ""})
        </DialogTitle>
        <DialogDescription className="text-lg">{LANGS.find((l) => l.code === item.language)?.label}</DialogDescription>
        <ul className="flex flex-col gap-2">
          {item.tests.map((x) => (
            <li key={x.name} className={cn("flex justify-between rounded-xl border-2 px-4 py-2 text-lg", ZONE_STYLE[x.zone].card)}>
              <span>{ZONE_STYLE[x.zone].emoji} {x.name}</span>
              <strong>
                {x.value} {x.unit}
              </strong>
            </li>
          ))}
        </ul>
        {supported && (
          <Button variant="soft" size="lg" onClick={() => speak("doc", speechSummary(results, item.language, null), item.language)}>
            {speakingId === "doc" ? t("stop") : t("docPlay")}
          </Button>
        )}
        <label className="grid gap-2">
          <span className="text-lg font-medium">{t("docAdvice")}</span>
          <Textarea rows={4} value={advice} onChange={(e) => setAdvice(e.target.value)} className="text-lg" maxLength={2000} />
        </label>
        {issued ? (
          <p role="status" className="rounded-xl bg-zone-green-soft p-3 text-lg font-semibold text-zone-green-ink">{t("docIssued")}</p>
        ) : (
          <Button variant="trust" size="lg" disabled={!advice.trim()} onClick={() => setIssued(true)}>
            {t("docIssue")}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
