import { useEffect, useState } from "react";
import { Check, FileText } from "lucide-react";

import { useLang, type DictKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const STEPS: DictKey[] = ["scan1", "scan2", "scan3", "scan4"];

export function ScanningState() {
  const { t } = useLang();
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 850);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-center gap-8 py-8 sm:flex-row sm:items-center sm:justify-center" role="status" aria-live="polite">
      <div className="scan-line relative grid h-56 w-44 place-items-center rounded-2xl border-2 border-primary/20 bg-card shadow-soft">
        <FileText className="size-16 text-primary/30" aria-hidden />
        <div className="absolute inset-x-6 top-8 flex flex-col gap-3">
          {[80, 60, 90, 50, 70, 65].map((w, i) => (
            <span key={i} className="h-2 rounded bg-muted" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
      <ol className="flex flex-col gap-3">
        {STEPS.map((k, i) => (
          <li key={k} className={cn("flex items-center gap-3 text-lg transition-opacity", i > step ? "opacity-35" : "opacity-100")}>
            <span
              className={cn(
                "grid size-8 place-items-center rounded-full border-2",
                i < step ? "border-zone-green bg-zone-green text-primary-foreground" : i === step ? "border-saffron animate-pulse" : "border-border",
              )}
            >
              {i < step ? <Check className="size-5" aria-hidden /> : null}
            </span>
            <span className={i === step ? "font-semibold" : ""}>{t(k)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
