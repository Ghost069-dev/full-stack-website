import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Ear, ShieldCheck, TrafficCone } from "lucide-react";

import heroAsset from "@/assets/family-hero.png.asset.json";
import { Button } from "@/components/ui/button";
import { ProfileFields } from "@/components/report/ProfileFields";
import { ReportInput } from "@/components/report/ReportInput";
import { ResultsDashboard } from "@/components/report/ResultsDashboard";
import { ScanningState } from "@/components/report/ScanningState";
import { prepareFile } from "@/components/report/file-utils";
import { HowItWorksSteps } from "@/components/site/HowItWorksSteps";
import type { Profile } from "@/lib/health/clinical-db";
import { SAMPLE_REPORT, analyse, type ReportSource, type TestInput } from "@/lib/health/report";
import { useLang } from "@/lib/i18n";
import { loadLastReport, saveLastReport, useOffline, type SavedReport } from "@/lib/offline";
import { extractReport } from "@/lib/report.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sehat Saathi — Lab Reports Explained in Hindi, Punjabi & Marathi" },
      {
        name: "description",
        content:
          "Upload a blood test and see Green, Yellow and Red zones from fixed, age and sex adjusted clinical rules — read aloud in Hindi, Punjabi, Marathi or English, with 1-click doctor referral.",
      },
      { property: "og:title", content: "Sehat Saathi — Report Samjho, Dawai Doctor Se Poochho" },
      { property: "og:description", content: "Deterministic clinical zones, regional voice and a doctor-in-the-loop referral. Never an AI prescription." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: heroAsset.url },
      { name: "twitter:image", content: heroAsset.url },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Phase = "input" | "scanning" | "results";

function Index() {
  const { t } = useLang();
  const { offline } = useOffline();
  const extract = useServerFn(extractReport);
  const [phase, setPhase] = useState<Phase>("input");
  const [mode, setMode] = useState<"upload" | "manual">("upload");
  const [error, setError] = useState<string | null>(null);
  const [inputs, setInputs] = useState<TestInput[]>([]);
  const [profile, setProfile] = useState<Profile>({ age: null, sex: null });
  const [source, setSource] = useState<ReportSource>({ kind: "manual" });
  const [last, setLast] = useState<SavedReport | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setLast(loadLastReport()), []);

  const results = useMemo(() => analyse(inputs, profile), [inputs, profile]);

  const scrollToTool = useCallback(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  function show(tests: TestInput[], src: ReportSource, prof: Profile) {
    const placed = analyse(tests, prof);
    if (!placed.length) {
      setError(t("errNoTests"));
      setPhase("input");
      return;
    }
    setInputs(tests);
    setProfile(prof);
    setSource(src);
    setPhase("results");
    setError(null);
    saveLastReport({ tests, profile: prof, source: src });
    requestAnimationFrame(scrollToTool);
  }

  function runSample() {
    setError(null);
    setPhase("scanning");
    scrollToTool();
    window.setTimeout(() => show(SAMPLE_REPORT.tests, SAMPLE_REPORT.source, SAMPLE_REPORT.profile), 3400);
  }

  async function runUpload(file: File) {
    setError(null);
    if (offline && file.type === "application/pdf") {
      setError(t("offlinePdf"));
      return;
    }
    setPhase("scanning");
    scrollToTool();
    try {
      if (offline) {
        const { readReportOnDevice } = await import("@/lib/local-ocr");
        const tests = await readReportOnDevice(file);
        if (!tests.length) throw new Error("no tests");
        show(tests, { kind: "upload", patientName: null }, profile);
        return;
      }
      const prepared = await prepareFile(file);
      const res = await extract({ data: prepared });
      if (res.ok) {
        show(res.tests, { kind: "upload", patientName: res.patientName }, { age: res.patientAge ?? profile.age, sex: res.patientSex ?? profile.sex });
        return;
      }
      setError(
        res.code === "no_tests" || res.code === "not_report" || res.code === "unreadable"
          ? t("errNoTests")
          : res.code === "credits"
            ? t("errCredits")
            : res.code === "rate_limited"
              ? t("errBusy")
              : t("errGeneric"),
      );
      setPhase("input");
    } catch (e) {
      console.error(e);
      setError(offline ? t("errNoTests") : t("errGeneric"));
      setPhase("input");
    }
  }

  return (
    <>
      <section className="border-b border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
          <p className="mb-2 flex items-center gap-2 text-lg font-semibold text-primary">
            <ShieldCheck className="size-5 shrink-0" aria-hidden /> {t("heroTrust3")}
          </p>
          <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">{t("brandName")}</h1>
          <p className="mt-2 max-w-3xl text-xl text-muted-foreground">{t("heroTitle")}</p>
        </div>
      </section>

      <section ref={sectionRef} className="mx-auto max-w-6xl scroll-mt-44 px-4 py-8 sm:px-6 sm:py-10">
        {phase !== "results" && <h2 className="mb-5 font-display text-2xl font-bold text-foreground sm:text-3xl">{t("step1Title")}</h2>}
        <div className={phase === "results" ? "" : "rounded-lg border border-border bg-card p-4 sm:p-6"}>
          {phase === "scanning" && <ScanningState />}
          {phase === "input" && (
            <div className="grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
              <aside className="flex flex-col gap-6 lg:border-r lg:border-border lg:pr-6">
                <ProfileFields profile={profile} onChange={setProfile} />
                <p className="hidden text-lg text-muted-foreground lg:block">{t("heroSub")}</p>
                <ul className="hidden flex-col gap-3 text-lg text-muted-foreground lg:flex">
                  <li className="flex items-center gap-2"><TrafficCone className="size-5 shrink-0 text-primary" aria-hidden />{t("heroTrust1")}</li>
                  <li className="flex items-center gap-2"><Ear className="size-5 shrink-0 text-primary" aria-hidden />{t("heroTrust2")}</li>
                </ul>
              </aside>
              <ReportInput
                ref={fileRef}
                mode={mode}
                onModeChange={(m) => {
                  setMode(m);
                  setError(null);
                }}
                onFile={runUpload}
                onSample={runSample}
                onManual={(tests) => show(tests, { kind: "manual", patientName: null }, profile)}
                onOpenLast={last && !inputs.length ? () => show(last.tests, last.source, last.profile) : undefined}
                manualInitial={inputs.length ? inputs : undefined}
                error={error}
                onError={setError}
              />
            </div>
          )}
          {phase === "results" && (
            <ResultsDashboard
              results={results}
              inputs={inputs}
              profile={profile}
              source={source}
              onEdit={() => {
                setMode("manual");
                setPhase("input");
              }}
              onReset={() => {
                setInputs([]);
                setProfile({ age: null, sex: null });
                setMode("upload");
                setPhase("input");
              }}
            />
          )}
        </div>
      </section>

      <section className="border-t border-border bg-secondary/40 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
          <img src={heroAsset.url} alt="" className="hidden size-20 rounded-lg object-cover sm:block" width={80} height={80} />
          <h2 className="max-w-2xl font-display text-3xl font-extrabold text-primary sm:text-4xl">{t("howTitle")}</h2>
          </div>
          <Button asChild variant="soft" size="lg">
            <Link to="/how-it-works">
              {t("howMore")} <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
        <HowItWorksSteps />
        </div>
      </section>
    </>
  );
}
