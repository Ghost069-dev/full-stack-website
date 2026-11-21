import type { L10n, Lang } from "@/lib/i18n";
import { findTest, toCanonical, type Band, type ClinicalTest, type Profile } from "./clinical-db";
import { classifyBand, classifyZone, getDirection, overallZone, type Direction, type Zone } from "./zones";

export const OPEN_HIGH = 1_000_000_000;

export interface TestInput {
  name: string;
  value: number;
  unit: string;
  /** Lab's printed range — used only for tests missing from the clinical table. */
  labLow: number | null;
  labHigh: number | null;
}

export interface TestResult {
  id: string;
  key: string | null;
  name: string;
  value: number;
  unit: string;
  zone: Zone;
  direction: Direction;
  band: Band;
  source: "clinical_db" | "lab_range";
  severity: number;
  info?: ClinicalTest | undefined;
}

export interface ReportSource {
  kind: "sample" | "upload" | "manual";
  patientName?: string | null;
}

export function analyse(inputs: TestInput[], profile: Profile): TestResult[] {
  const out: TestResult[] = [];
  inputs.forEach((t, i) => {
    const info = findTest(t.name);
    const canon = info ? toCanonical(info, t.value, t.unit) : null;
    if (info && canon !== null) {
      const band = info.band(profile);
      const zone = classifyBand(canon, band);
      const direction = getDirection(canon, band.low, band.high);
      out.push({
        id: `${i}-${info.key}`,
        key: info.key,
        name: info.name.en,
        value: canon,
        unit: info.unit,
        zone,
        direction,
        band,
        source: "clinical_db",
        severity: severityOf(canon, band.low, band.high),
        info,
      });
      return;
    }
    if (t.labLow === null && t.labHigh === null) return; // no rule and no printed range: cannot place in a zone
    const low = t.labLow ?? 0;
    const high = t.labHigh ?? OPEN_HIGH;
    out.push({
      id: `${i}-${t.name}`,
      key: null,
      name: t.name,
      value: t.value,
      unit: t.unit,
      zone: classifyZone(t.value, low, high),
      direction: getDirection(t.value, low, high),
      band: { low, high, yellowLow: low, yellowHigh: high },
      source: "lab_range",
      severity: severityOf(t.value, low, high),
    });
  });
  return out;
}

function severityOf(value: number, low: number, high: number) {
  if (value > high) return (value - high) / (high || 1);
  if (value < low) return (low - value) / (low || 1);
  return 0;
}

const ZONE_ORDER: Record<Zone, number> = { red: 0, yellow: 1, green: 2 };
export function sortBySeverity(results: TestResult[]) {
  return [...results].sort((a, b) => ZONE_ORDER[a.zone] - ZONE_ORDER[b.zone] || b.severity - a.severity);
}

export const SAMPLE_PROFILE: Profile = { age: 62, sex: "M" };
export const SAMPLE_REPORT: { source: ReportSource; profile: Profile; tests: TestInput[] } = {
  source: { kind: "sample", patientName: "Ramesh Ji" },
  profile: SAMPLE_PROFILE,
  tests: [
    { name: "Hemoglobin", value: 13.5, unit: "g/dL", labLow: null, labHigh: null },
    { name: "Fasting Blood Sugar", value: 110, unit: "mg/dL", labLow: null, labHigh: null },
    { name: "HbA1c", value: 9.4, unit: "%", labLow: null, labHigh: null },
    { name: "Serum Creatinine", value: 3.4, unit: "mg/dL", labLow: null, labHigh: null },
  ],
};

export function displayName(t: TestResult, lang: Lang) {
  return t.info ? t.info.name[lang] : t.name;
}

function shortName(t: TestResult, lang: Lang) {
  return displayName(t, lang).replace(/\s*\(.*\)$/, "");
}

/** Short English flag used in the doctor queue, e.g. "Creatinine 3.4". */
export function flagLabel(t: TestResult) {
  return `${t.name.replace(/\s*\(.*\)$/, "").replace(/^Serum /, "")} ${fmt(t.value)}`;
}

export function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
}

type DirWords = Record<"high" | "low", L10n>;
const DIR: DirWords = {
  high: { hi: "बढ़ा हुआ", pa: "ਵਧਿਆ ਹੋਇਆ", mr: "वाढलेले", en: "high" },
  low: { hi: "कम", pa: "ਘੱਟ", mr: "कमी", en: "low" },
};

const OPENERS: Record<Zone, L10n> = {
  green: { hi: "आपका {name} बिल्कुल ठीक है।", pa: "ਤੁਹਾਡਾ {name} ਬਿਲਕੁਲ ਠੀਕ ਹੈ।", mr: "तुमचे {name} अगदी ठीक आहे.", en: "Your {name} is fine." },
  yellow: { hi: "आपका {name} थोड़ा {dir} है।", pa: "ਤੁਹਾਡਾ {name} ਥੋੜ੍ਹਾ {dir} ਹੈ।", mr: "तुमचे {name} थोडे {dir} आहे.", en: "Your {name} is slightly {dir}." },
  red: { hi: "आपका {name} काफ़ी {dir} है।", pa: "ਤੁਹਾਡਾ {name} ਕਾਫ਼ੀ {dir} ਹੈ।", mr: "तुमचे {name} खूप {dir} आहे.", en: "Your {name} is much too {dir}." },
};

const ACTIONS: Record<Zone, L10n> = {
  green: { hi: "चिंता की कोई बात नहीं।", pa: "ਫ਼ਿਕਰ ਦੀ ਕੋਈ ਗੱਲ ਨਹੀਂ।", mr: "काळजीचे कारण नाही.", en: "Nothing to worry about." },
  yellow: { hi: "अगली बार डॉक्टर से इस पर बात करें।", pa: "ਅਗਲੀ ਵਾਰ ਡਾਕਟਰ ਨਾਲ ਇਸ ਬਾਰੇ ਗੱਲ ਕਰੋ।", mr: "पुढच्या वेळी डॉक्टरांशी याबद्दल बोला.", en: "Talk to your doctor about this at your next visit." },
  red: { hi: "कृपया आज ही डॉक्टर से बात करें।", pa: "ਕਿਰਪਾ ਕਰਕੇ ਅੱਜ ਹੀ ਡਾਕਟਰ ਨਾਲ ਗੱਲ ਕਰੋ।", mr: "कृपया आजच डॉक्टरांशी बोला.", en: "Please talk to a doctor today." },
};

/** Card text: fixed, reviewed sentences — never AI-generated. */
export function explain(t: TestResult, lang: Lang): string {
  const dir = t.direction === "normal" ? "" : DIR[t.direction][lang];
  const parts = [OPENERS[t.zone][lang].replace("{name}", shortName(t, lang)).replace("{dir}", dir)];
  if (t.zone !== "green" && t.info) parts.push(t.direction === "high" ? t.info.high_meaning[lang] : t.info.low_meaning[lang]);
  parts.push(ACTIONS[t.zone][lang]);
  return parts.join(" ");
}

const SPEECH: Record<Zone, L10n> = {
  green: {
    hi: "आपका {name} {value} है, जो बिल्कुल सामान्य है। चिंता की कोई बात नहीं।",
    pa: "ਤੁਹਾਡਾ {name} {value} ਹੈ, ਜੋ ਬਿਲਕੁਲ ਠੀਕ ਹੈ। ਫ਼ਿਕਰ ਦੀ ਕੋਈ ਗੱਲ ਨਹੀਂ।",
    mr: "तुमचे {name} {value} आहे, जे अगदी सामान्य आहे. काळजी करण्याचे कारण नाही.",
    en: "Your {name} is {value}, which is completely normal. There is nothing to worry about.",
  },
  yellow: {
    hi: "आपका {name} {value} है, जो थोड़ा {dir} है। घबराइए मत — अगली बार डॉक्टर से इस पर बात कीजिए।",
    pa: "ਤੁਹਾਡਾ {name} {value} ਹੈ, ਜੋ ਥੋੜ੍ਹਾ {dir} ਹੈ। ਘਬਰਾਓ ਨਾ — ਅਗਲੀ ਵਾਰ ਡਾਕਟਰ ਨਾਲ ਇਸ ਬਾਰੇ ਗੱਲ ਕਰੋ।",
    mr: "तुमचे {name} {value} आहे, जे थोडे {dir} आहे. घाबरू नका — पुढच्या वेळी डॉक्टरांशी याबद्दल बोला.",
    en: "Your {name} is {value}, which is slightly {dir}. Don't worry — talk to your doctor about it at your next visit.",
  },
  red: {
    hi: "लेकिन आपका {name} {value} है, जो काफ़ी {dir} है — कृपया आज ही डॉक्टर से बात करें।",
    pa: "ਪਰ ਤੁਹਾਡਾ {name} {value} ਹੈ, ਜੋ ਕਾਫ਼ੀ {dir} ਹੈ — ਕਿਰਪਾ ਕਰਕੇ ਅੱਜ ਹੀ ਡਾਕਟਰ ਨਾਲ ਗੱਲ ਕਰੋ।",
    mr: "पण तुमचे {name} {value} आहे, जे खूप {dir} आहे — कृपया आजच डॉक्टरांशी बोला.",
    en: "But your {name} is {value}, which is much too {dir} — please talk to a doctor today.",
  },
};

const GREETING: L10n = { hi: "नमस्ते {patient}।", pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ {patient}।", mr: "नमस्कार {patient}.", en: "Namaste {patient}." };
const CLOSING: L10n = {
  hi: "याद रखिए, सेहत साथी कोई दवाई नहीं बताता। हमेशा डॉक्टर से पूछिए।",
  pa: "ਯਾਦ ਰੱਖੋ, ਸਿਹਤ ਸਾਥੀ ਕੋਈ ਦਵਾਈ ਨਹੀਂ ਦੱਸਦਾ। ਹਮੇਸ਼ਾ ਡਾਕਟਰ ਨੂੰ ਪੁੱਛੋ।",
  mr: "लक्षात ठेवा, सेहत साथी कोणतेही औषध सांगत नाही. नेहमी डॉक्टरांना विचारा.",
  en: "Remember, Sehat Saathi never suggests medicines. Always ask your doctor.",
};

/** Comforting, elder-friendly line for one test (for read-aloud). */
export function speechLine(t: TestResult, lang: Lang): string {
  const dir = t.direction === "normal" ? "" : DIR[t.direction][lang];
  const line = SPEECH[t.zone][lang].replace("{name}", shortName(t, lang)).replace("{value}", fmt(t.value)).replace("{dir}", dir);
  // "But …" only makes sense after a calmer line; strip it when read on its own.
  return t.zone === "red" ? line.replace(/^(लेकिन|ਪਰ|पण|But) /, "").replace(/^your/, "Your") : line;
}

/** Full summary read-aloud: greeting, calm results first, red ones last, safety closing. */
export function speechSummary(results: TestResult[], lang: Lang, patientName?: string | null): string {
  const ordered = [...results].sort((a, b) => ZONE_ORDER[b.zone] - ZONE_ORDER[a.zone]);
  const lines = ordered.map((r) => {
    const dir = r.direction === "normal" ? "" : DIR[r.direction][lang];
    return SPEECH[r.zone][lang].replace("{name}", shortName(r, lang)).replace("{value}", fmt(r.value)).replace("{dir}", dir);
  });
  const greet = patientName ? GREETING[lang].replace("{patient}", patientName) : GREETING[lang].replace(" {patient}", "");
  return [greet, ...lines, CLOSING[lang]].join(" ");
}

const GENERIC_Q: Record<"yellow" | "red", L10n> = {
  yellow: {
    hi: "मेरा {name} सीमा से थोड़ा बाहर है — क्या दोबारा जाँच करानी चाहिए?",
    pa: "ਮੇਰਾ {name} ਹੱਦ ਤੋਂ ਥੋੜ੍ਹਾ ਬਾਹਰ ਹੈ — ਕੀ ਦੁਬਾਰਾ ਜਾਂਚ ਕਰਾਉਣੀ ਚਾਹੀਦੀ ਹੈ?",
    mr: "माझे {name} मर्यादेबाहेर थोडे आहे — पुन्हा तपासणी करावी का?",
    en: "My {name} is slightly outside the range — should I repeat the test?",
  },
  red: {
    hi: "मेरा {name} सीमा से काफ़ी बाहर है — इसका क्या मतलब है?",
    pa: "ਮੇਰਾ {name} ਹੱਦ ਤੋਂ ਕਾਫ਼ੀ ਬਾਹਰ ਹੈ — ਇਸ ਦਾ ਕੀ ਮਤਲਬ ਹੈ?",
    mr: "माझे {name} मर्यादेबाहेर खूप आहे — याचा अर्थ काय?",
    en: "My {name} is far outside the range — what does it mean?",
  },
};
const EXTRA_Q: L10n[] = [
  { hi: "क्या मुझे खान-पान या दिनचर्या बदलनी चाहिए?", pa: "ਕੀ ਮੈਨੂੰ ਖਾਣ-ਪੀਣ ਜਾਂ ਰੋਜ਼ਾਨਾ ਆਦਤਾਂ ਬਦਲਣੀਆਂ ਚਾਹੀਦੀਆਂ ਹਨ?", mr: "मी आहार किंवा दिनचर्या बदलावी का?", en: "Should I change my food habits or daily routine?" },
  { hi: "अगली जाँच कब करानी चाहिए?", pa: "ਅਗਲੀ ਜਾਂਚ ਕਦੋਂ ਕਰਾਉਣੀ ਚਾਹੀਦੀ ਹੈ?", mr: "पुढची तपासणी कधी करावी?", en: "When should I get tested again?" },
];

export function doctorQuestions(results: TestResult[], lang: Lang): string[] {
  const out: string[] = [];
  const flagged = sortBySeverity(results).filter((r) => r.zone !== "green");
  for (const r of flagged) {
    const specific = r.info ? (r.direction === "low" ? r.info.questions.low : r.info.questions.high) : [];
    if (specific.length) specific.forEach((q) => out.push(q[lang]));
    else out.push(GENERIC_Q[r.zone as "yellow" | "red"][lang].replace("{name}", shortName(r, lang)));
  }
  if (flagged.length) EXTRA_Q.forEach((q) => out.push(q[lang]));
  return Array.from(new Set(out));
}

export function summarise(results: TestResult[]) {
  const zone = overallZone(results.map((r) => r.zone));
  const counts = { green: 0, yellow: 0, red: 0 } as Record<Zone, number>;
  results.forEach((r) => counts[r.zone]++);
  return { zone, counts };
}

export function profileLabel(p: Profile) {
  return `${p.age ?? "?"}${p.sex ?? ""}`;
}
