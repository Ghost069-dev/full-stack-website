import type { Lang } from "@/lib/i18n";
import { findTest, type Bilingual, type TestInfo } from "./catalog";
import { classifyZone, getDirection, overallZone, type Direction, type Zone } from "./zones";

export interface TestInput {
  name: string;
  value: number;
  unit: string;
  low: number;
  high: number;
}

export interface TestResult extends TestInput {
  id: string;
  zone: Zone;
  direction: Direction;
  info?: TestInfo | undefined;
}

export interface ReportSource {
  kind: "sample" | "upload" | "manual";
  patientName?: string | null;
  patientAge?: number | null;
}

export function analyse(inputs: TestInput[]): TestResult[] {
  return inputs.map((t, i) => {
    const info = findTest(t.name);
    return {
      ...t,
      id: `${i}-${t.name}`,
      zone: classifyZone(t.value, t.low, t.high),
      direction: getDirection(t.value, t.low, t.high),
      info,
    };
  });
}

export const SAMPLE_REPORT: { source: ReportSource; tests: TestInput[] } = {
  source: { kind: "sample", patientName: "Ramesh Ji", patientAge: 62 },
  tests: [
    { name: "Hemoglobin", value: 13.5, unit: "g/dL", low: 13.0, high: 17.0 },
    { name: "Fasting Blood Sugar", value: 128, unit: "mg/dL", low: 70, high: 100 },
    { name: "HbA1c", value: 9.4, unit: "%", low: 4.0, high: 5.6 },
    { name: "Serum Creatinine", value: 3.4, unit: "mg/dL", low: 0.7, high: 1.3 },
  ],
};

export function displayName(t: TestResult, lang: Lang) {
  return t.info ? t.info.name[lang] : t.name;
}

const ZONE_OPENERS: Record<Zone, Record<Direction, Bilingual>> = {
  green: {
    normal: { hi: "आपका {name} बिल्कुल ठीक है।", en: "Your {name} is fine." },
    high: { hi: "आपका {name} ठीक है।", en: "Your {name} is fine." },
    low: { hi: "आपका {name} ठीक है।", en: "Your {name} is fine." },
  },
  yellow: {
    normal: { hi: "", en: "" },
    high: { hi: "आपका {name} थोड़ा बढ़ा हुआ है।", en: "Your {name} is slightly high." },
    low: { hi: "आपका {name} थोड़ा कम है।", en: "Your {name} is slightly low." },
  },
  red: {
    normal: { hi: "", en: "" },
    high: { hi: "आपका {name} काफ़ी बढ़ा हुआ है।", en: "Your {name} is much higher than normal." },
    low: { hi: "आपका {name} काफ़ी कम है।", en: "Your {name} is much lower than normal." },
  },
};

const ZONE_ACTIONS: Record<Zone, Bilingual> = {
  green: { hi: "यह लैब की सामान्य सीमा के अंदर है।", en: "It is inside the lab's normal range." },
  yellow: { hi: "अगली बार डॉक्टर से इस पर बात करें।", en: "Talk to your doctor about this at your next visit." },
  red: { hi: "कृपया जल्द से जल्द डॉक्टर को दिखाएँ।", en: "Please see a doctor as soon as possible." },
};

const GREEN_SPECIFIC: Record<string, Bilingual> = {
  hemoglobin: { hi: "खून की कमी नहीं है।", en: "There is no sign of low blood." },
};

/** Plain-language, non-diagnostic explanation built from fixed, reviewed sentences. */
export function explain(t: TestResult, lang: Lang): string {
  const name = displayName(t, lang).replace(/\s*\(.*\)$/, "");
  const opener = ZONE_OPENERS[t.zone][t.direction][lang].replace("{name}", name);
  const parts = [opener];
  if (t.zone === "green") {
    const specific = t.info ? GREEN_SPECIFIC[t.info.key] : undefined;
    parts.push(specific ? specific[lang] : ZONE_ACTIONS.green[lang]);
  } else {
    if (t.info) parts.push(t.direction === "high" ? t.info.high_meaning[lang] : t.info.low_meaning[lang]);
    parts.push(ZONE_ACTIONS[t.zone][lang]);
  }
  return parts.filter(Boolean).join(" ");
}

const GENERIC_QUESTIONS: Record<"yellow" | "red", Bilingual> = {
  yellow: {
    hi: "मेरा {name} सामान्य सीमा से थोड़ा बाहर है — क्या मुझे दोबारा जाँच करानी चाहिए?",
    en: "My {name} is slightly outside the range — should I repeat the test?",
  },
  red: {
    hi: "मेरा {name} सामान्य सीमा से काफ़ी बाहर है — इसका क्या मतलब है और आगे क्या करना चाहिए?",
    en: "My {name} is far outside the range — what does it mean and what should I do next?",
  },
};

export function doctorQuestions(results: TestResult[], lang: Lang): string[] {
  const out: string[] = [];
  const flagged = [...results]
    .filter((r) => r.zone !== "green")
    .sort((a, b) => (a.zone === b.zone ? 0 : a.zone === "red" ? -1 : 1));
  for (const r of flagged) {
    const name = displayName(r, lang).replace(/\s*\(.*\)$/, "");
    const specific = r.info ? (r.direction === "low" ? r.info.questions.low : r.info.questions.high) : [];
    if (specific.length) specific.forEach((q) => out.push(q[lang]));
    else out.push(GENERIC_QUESTIONS[r.zone as "yellow" | "red"][lang].replace("{name}", name));
  }
  if (flagged.length) {
    out.push(
      lang === "hi"
        ? "क्या मुझे अपना खान-पान या दिनचर्या बदलनी चाहिए?"
        : "Should I change my food habits or daily routine?",
    );
    out.push(lang === "hi" ? "मुझे अगली जाँच कब करानी चाहिए?" : "When should I get tested again?");
  }
  return Array.from(new Set(out));
}

export function summarise(results: TestResult[]) {
  const zone = overallZone(results.map((r) => r.zone));
  const counts = { green: 0, yellow: 0, red: 0 } as Record<Zone, number>;
  results.forEach((r) => counts[r.zone]++);
  return { zone, counts };
}
