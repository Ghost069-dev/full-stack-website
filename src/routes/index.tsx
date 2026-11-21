import { useCallback, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Ear, ShieldCheck, Sparkles, TrafficCone, Upload } from "lucide-react";

import heroAsset from "@/assets/family-hero.png.asset.json";
import { Button } from "@/components/ui/button";
import { ReportInput } from "@/components/report/ReportInput";
import { ResultsDashboard } from "@/components/report/ResultsDashboard";
import { ScanningState } from "@/components/report/ScanningState";
import { prepareFile } from "@/components/report/file-utils";
import { HowItWorksSteps } from "@/components/site/HowItWorksSteps";
import { SAMPLE_REPORT, analyse, type ReportSource, type TestInput, type TestResult } from "@/lib/health/report";
import { useLang } from "@/lib/i18n";
import { extractReport } from "@/lib/report.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sehat Saathi — Understand Your Lab Report in Simple Hindi" },
      {
        name: "description",
        content:
          "Upload a blood test report or enter values and see Green, Yellow and Red zones explained in simple Hindi, with read-aloud and doctor consultation.",
      },
      { property: "og:title", content: "Sehat Saathi — Report Samjho, Dawai Doctor Se Poochho" },
      {
        property: "og:description",
        content: "Lab reports explained in simple Hindi with traffic-light zones. AI explains, doctors decide.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Phase = "input" | "scanning" | "results";

function Index() {
  const { t, lang } = useLang();
  const extract = useServerFn(extractReport);
  const [phase, setPhase] = useState<Phase>("input");
  const [mode, setMode] = useState<"upload" | "manual">("upload");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [inputs, setInputs] = useState<TestInput[]>([]);
  const [source, setSource] = useState<ReportSource>({ kind: "manual" });
  const sectionRef = useRef<HTMLElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const scrollToTool = useCallback(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  function show(tests: TestInput[], src: ReportSource) {
    setInputs(tests);
    setResults(analyse(tests));
    setSource(src);
    setPhase("results");
    setError(null);
    requestAnimationFrame(scrollToTool);
  }

  function runSample() {
    setError(null);
    setPhase("scanning");
    scrollToTool();
    window.setTimeout(() => show(SAMPLE_REPORT.tests, SAMPLE_REPORT.source), 3400);
  }

  async function runUpload(file: File) {
    setError(null);
    setPhase("scanning");
    scrollToTool();
    try {
      const prepared = await prepareFile(file);
      const res = await extract({ data: prepared });
      if (res.ok) {
        show(res.tests, { kind: "upload", patientName: res.patientName, patientAge: res.patientAge });
        return;
      }
      const msg =
        res.code === "no_tests" || res.code === "not_report" || res.code === "unreadable"
          ? t("errNoTests")
          : res.code === "credits"
            ? lang === "hi"
              ? "रिपोर्ट पढ़ने की सुविधा अभी उपलब्ध नहीं है। कृपया नंबर ख़ुद डालें।"
              : "Report reading is unavailable right now. Please enter the values yourself."
            : res.code === "rate_limited"
              ? lang === "hi"
                ? "अभी बहुत लोग रिपोर्ट भेज रहे हैं। एक मिनट बाद कोशिश करें।"
                : "Many people are sending reports right now. Please try again in a minute."
              : t("errGeneric");
      setError(msg);
      setPhase("input");
    } catch (e) {
      console.error(e);
      setError(t("errGeneric"));
      setPhase("input");
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="paper-texture overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-[1.15fr_1fr] md:py-16">
          <div className="animate-rise flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-primary/20 bg-card px-4 py-1.5 font-semibold text-primary">
              <ShieldCheck className="size-5" aria-hidden /> {t("heroEyebrow")}
            </span>
            <h1 className="font-display text-4xl font-extrabold text-primary sm:text-5xl lg:text-6xl">
              {lang === "hi" ? (
                <>
                  रिपोर्ट समझो, <span className="text-saffron">दवाई डॉक्टर से</span> पूछो।
                </>
              ) : (
                <>
                  Report Samjho, <span className="text-saffron">Dawai Doctor Se</span> Poochho.
                </>
              )}
            </h1>
            <p className="max-w-xl text-xl text-foreground/85">{t("heroSub")}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="trust"
                size="xl"
                className="justify-center"
                onClick={() => {
                  setMode("upload");
                  setPhase("input");
                  scrollToTool();
                  window.setTimeout(() => fileRef.current?.click(), 450);
                }}
              >
                <Upload aria-hidden /> {t("ctaUpload")}
              </Button>
              <Button variant="hero" size="xl" className="justify-center" onClick={runSample}>
                <Sparkles aria-hidden /> {t("ctaSample")}
              </Button>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-base font-semibold text-foreground/80">
              <li className="flex items-center gap-2">
                <TrafficCone className="size-5 text-saffron" aria-hidden /> {t("heroTrust1")}
              </li>
              <li className="flex items-center gap-2">
                <Ear className="size-5 text-saffron" aria-hidden /> {t("heroTrust2")}
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-saffron" aria-hidden /> {t("heroTrust3")}
              </li>
            </ul>
          </div>
          <div className="relative mx-auto w-full max-w-sm md:max-w-md">
            <img
              src={heroAsset.url}
              alt={lang === "hi" ? "एक भारतीय परिवार अपनी लैब रिपोर्ट के साथ मुस्कुराता हुआ" : "An Indian family smiling with their lab report"}
              className="w-full rounded-[2rem] shadow-lift"
              width={820}
              height={940}
            />
            <div className="absolute -bottom-5 left-4 right-4 flex flex-col gap-2 rounded-2xl border-2 border-border bg-card p-3 shadow-soft sm:left-auto sm:right-[-1.5rem] sm:w-64">
              {(
                [
                  ["green", "zoneGreenTitle"],
                  ["yellow", "zoneYellowTitle"],
                  ["red", "zoneRedTitle"],
                ] as const
              ).map(([z, k]) => (
                <span key={z} className="flex items-center gap-2 text-base font-semibold">
                  <span className={`size-4 shrink-0 rounded-full ${z === "green" ? "bg-zone-green" : z === "yellow" ? "bg-zone-yellow" : "bg-zone-red"}`} />
                  {t(k)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tool */}
      <section ref={sectionRef} className="mx-auto max-w-5xl scroll-mt-28 px-4 pt-16">
        {phase !== "results" && (
          <div className="mb-6">
            <h2 className="font-display text-3xl font-extrabold text-primary sm:text-4xl">{t("step1Title")}</h2>
            <p className="mt-1 text-lg text-muted-foreground">{t("step1Sub")}</p>
          </div>
        )}
        <div className="rounded-[2rem] border-2 border-border bg-background p-4 shadow-soft sm:p-8">
          {phase === "scanning" && <ScanningState />}
          {phase === "input" && (
            <ReportInput
              ref={fileRef}
              mode={mode}
              onModeChange={(m) => {
                setMode(m);
                setError(null);
              }}
              onFile={runUpload}
              onSample={runSample}
              onManual={(tests) => show(tests, { kind: "manual" })}
              manualInitial={inputs.length ? inputs : undefined}
              error={error}
              onError={setError}
            />
          )}
          {phase === "results" && (
            <ResultsDashboard
              results={results}
              source={source}
              onEdit={() => {
                setMode("manual");
                setPhase("input");
              }}
              onReset={() => {
                setInputs([]);
                setResults([]);
                setMode("upload");
                setPhase("input");
              }}
            />
          )}
        </div>
      </section>

      {/* How it works preview */}
      <section className="mx-auto max-w-6xl px-4 pt-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-2xl font-display text-3xl font-extrabold text-primary sm:text-4xl">{t("howTitle")}</h2>
          <Button asChild variant="soft">
            <Link to="/how-it-works">
              {t("howMore")} <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
        <HowItWorksSteps />
      </section>
    </>
  );
}
