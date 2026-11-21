import { findTest } from "@/lib/health/clinical-db";
import type { TestInput } from "@/lib/health/report";

type Worker = { recognize: (img: Blob | File) => Promise<{ data: { text: string } }>; terminate: () => Promise<unknown> };
let workerPromise: Promise<Worker> | null = null;

/** Loads the on-device text reader once (downloads its language file the first time, then works from cache). */
export function prepareLocalOcr(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = import("tesseract.js")
      .then(({ createWorker }) => createWorker("eng") as unknown as Promise<Worker>)
      .catch((e) => {
        workerPromise = null;
        throw e;
      });
  }
  return workerPromise;
}

const NUM = /^\d+(?:\.\d+)?$/;
const RANGE = /^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)$/;

/** Turns raw report text into test rows, matching names against the clinical table only. */
export function parseReportText(text: string): TestInput[] {
  const out: TestInput[] = [];
  const seen = new Set<string>();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/[|:]/g, " ").replace(/\s+/g, " ").trim();
    if (!line) continue;
    const tokens = line.split(" ");
    const idx = tokens.findIndex((tok) => NUM.test(tok));
    if (idx <= 0) continue;
    const test = findTest(tokens.slice(0, idx).join(" "));
    if (!test || seen.has(test.key)) continue;
    const value = Number.parseFloat(tokens[idx]!);
    const next = tokens[idx + 1] ?? "";
    const unit = /[a-zA-Z%/µ]/.test(next) && !NUM.test(next) ? next : "";
    const rest = tokens.slice(idx + (unit ? 2 : 1)).join(" ");
    const range = rest.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
    const r = range ? RANGE.exec(`${range[1]}-${range[2]}`) : null;
    seen.add(test.key);
    out.push({
      name: test.name.en,
      value,
      unit,
      labLow: r ? Number.parseFloat(r[1]!) : null,
      labHigh: r ? Number.parseFloat(r[2]!) : null,
    });
  }
  return out;
}

export async function readReportOnDevice(file: File): Promise<TestInput[]> {
  const worker = await prepareLocalOcr();
  const { data } = await worker.recognize(file);
  return parseReportText(data.text);
}
