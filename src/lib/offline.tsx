import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import type { ReferralInput } from "@/lib/referral.functions";

const MODE_KEY = "sehat-saathi-offline";
const QUEUE_KEY = "sehat-saathi-referral-queue";
const LAST_REPORT_KEY = "sehat-saathi-last-report";

interface OfflineValue {
  offline: boolean;
  setOffline: (v: boolean) => void;
  engine: "idle" | "preparing" | "ready" | "error";
  queued: number;
  queueReferral: (r: ReferralInput) => void;
}

const Ctx = createContext<OfflineValue | null>(null);

function readQueue(): ReferralInput[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(QUEUE_KEY) ?? "[]");
    return Array.isArray(v) ? (v as ReferralInput[]) : [];
  } catch {
    return [];
  }
}

export function OfflineProvider({
  children,
  sendReferral,
}: {
  children: ReactNode;
  sendReferral: (r: ReferralInput) => Promise<boolean>;
}) {
  const [offline, setOfflineState] = useState(false);
  const [engine, setEngine] = useState<OfflineValue["engine"]>("idle");
  const [queued, setQueued] = useState(0);
  const flushing = useRef(false);

  const prepare = useCallback(async () => {
    setEngine("preparing");
    try {
      const { prepareLocalOcr } = await import("@/lib/local-ocr");
      await prepareLocalOcr();
      setEngine("ready");
    } catch (e) {
      console.error("Offline engine failed to load", e);
      setEngine("error");
    }
  }, []);

  const flush = useCallback(async () => {
    if (flushing.current) return;
    flushing.current = true;
    try {
      const items = readQueue();
      const left: ReferralInput[] = [];
      for (const item of items) {
        const ok = await sendReferral(item).catch(() => false);
        if (!ok) left.push(item);
      }
      window.localStorage.setItem(QUEUE_KEY, JSON.stringify(left));
      setQueued(left.length);
    } finally {
      flushing.current = false;
    }
  }, [sendReferral]);

  useEffect(() => {
    const saved = window.localStorage.getItem(MODE_KEY) === "1";
    setOfflineState(saved);
    setQueued(readQueue().length);
    if (saved) void prepare();
    else void flush();
  }, [prepare, flush]);

  const setOffline = useCallback(
    (v: boolean) => {
      setOfflineState(v);
      window.localStorage.setItem(MODE_KEY, v ? "1" : "0");
      if (v) void prepare();
      else void flush();
    },
    [prepare, flush],
  );

  const queueReferral = useCallback((r: ReferralInput) => {
    const items = [...readQueue(), r].slice(-20);
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
    setQueued(items.length);
  }, []);

  return <Ctx.Provider value={{ offline, setOffline, engine, queued, queueReferral }}>{children}</Ctx.Provider>;
}

export function useOffline() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOffline must be used inside OfflineProvider");
  return ctx;
}

export interface SavedReport {
  tests: import("@/lib/health/report").TestInput[];
  profile: import("@/lib/health/clinical-db").Profile;
  source: import("@/lib/health/report").ReportSource;
  savedAt: string;
}

export function saveLastReport(r: Omit<SavedReport, "savedAt">) {
  try {
    window.localStorage.setItem(LAST_REPORT_KEY, JSON.stringify({ ...r, savedAt: new Date().toISOString() }));
  } catch {
    /* storage full or blocked — not critical */
  }
}

export function loadLastReport(): SavedReport | null {
  try {
    const v = JSON.parse(window.localStorage.getItem(LAST_REPORT_KEY) ?? "null");
    return v && Array.isArray(v.tests) ? (v as SavedReport) : null;
  } catch {
    return null;
  }
}
