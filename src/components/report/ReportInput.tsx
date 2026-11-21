import { forwardRef, useState } from "react";
import { FileUp, History, Keyboard, ShieldCheck, Sparkles, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TestInput } from "@/lib/health/report";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ACCEPTED_TYPES, MAX_FILE_BYTES } from "./file-utils";
import { ManualEntry } from "./ManualEntry";

interface Props {
  mode: "upload" | "manual";
  onModeChange: (m: "upload" | "manual") => void;
  onFile: (f: File) => void;
  onSample: () => void;
  onManual: (tests: TestInput[]) => void;
  onOpenLast?: (() => void) | undefined;
  manualInitial?: TestInput[] | undefined;
  error: string | null;
  onError: (msg: string) => void;
}

export const ReportInput = forwardRef<HTMLInputElement, Props>(function ReportInput(
  { mode, onModeChange, onFile, onSample, onManual, onOpenLast, manualInitial, error, onError },
  fileRef,
) {
  const { t } = useLang();
  const [dragging, setDragging] = useState(false);

  function handle(file: File | undefined) {
    if (!file) return;
    if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) return onError(t("errFileType"));
    if (file.size > MAX_FILE_BYTES) return onError(t("errFileSize"));
    onFile(file);
  }

  const tabCls = (active: boolean) =>
    cn(
      "flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-lg font-bold transition-colors",
      active ? "bg-primary text-primary-foreground shadow-lift" : "text-primary hover:bg-primary-soft",
    );

  return (
    <div className="flex flex-col gap-5">
      <Button variant="hero" size="xl" onClick={onSample} className="justify-center">
        <Sparkles aria-hidden /> {t("sampleBtn")}
      </Button>
      {onOpenLast && (
        <Button variant="soft" size="lg" onClick={onOpenLast} className="justify-center">
          <History aria-hidden /> {t("openLast")}
        </Button>
      )}

      <div role="tablist" className="flex gap-2 rounded-2xl border-2 border-primary/20 bg-card p-1.5">
        <button role="tab" aria-selected={mode === "upload"} className={tabCls(mode === "upload")} onClick={() => onModeChange("upload")}>
          <Upload className="size-6" aria-hidden /> {t("tabUpload")}
        </button>
        <button role="tab" aria-selected={mode === "manual"} className={tabCls(mode === "manual")} onClick={() => onModeChange("manual")}>
          <Keyboard className="size-6" aria-hidden /> {t("tabManual")}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border-2 border-zone-red/40 bg-zone-red-soft px-4 py-3 text-lg font-medium text-zone-red-ink">
          {error}
        </p>
      )}

      {mode === "upload" ? (
        <>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handle(e.dataTransfer.files[0]);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-3 rounded-3xl border-[3px] border-dashed px-6 py-8 text-center transition-colors",
              dragging ? "border-saffron bg-saffron-soft" : "border-primary/30 bg-card hover:border-primary/60",
            )}
          >
            <span className="grid size-20 place-items-center rounded-3xl bg-primary-soft text-primary">
              <FileUp className="size-10" aria-hidden />
            </span>
            <span className="font-display text-2xl font-bold">{t("dropTitle")}</span>
            <span className="inline-flex min-h-14 items-center rounded-xl bg-primary px-8 text-xl font-bold text-primary-foreground shadow-lift">
              {t("dropChoose")}
            </span>
            <span className="text-muted-foreground">{t("dropHint")}</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              onChange={(e) => {
                handle(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          <p className="flex items-center justify-center gap-2 text-muted-foreground">
            <ShieldCheck className="size-5 text-primary" aria-hidden /> {t("privacyNote")}
          </p>
        </>
      ) : (
        <ManualEntry initial={manualInitial} onSubmit={onManual} />
      )}
    </div>
  );
});
