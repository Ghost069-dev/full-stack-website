import { forwardRef, useRef, useState } from "react";
import { FileUp, Keyboard, ShieldCheck, Sparkles, Upload } from "lucide-react";

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
  manualInitial?: TestInput[] | undefined;
  error: string | null;
  onError: (msg: string) => void;
}

export const ReportInput = forwardRef<HTMLInputElement, Props>(function ReportInput(
  { mode, onModeChange, onFile, onSample, onManual, manualInitial, error, onError },
  fileRef,
) {
  const { t } = useLang();
  const [dragging, setDragging] = useState(false);
  const localRef = useRef<HTMLInputElement | null>(null);

  function setRefs(el: HTMLInputElement | null) {
    localRef.current = el;
    if (typeof fileRef === "function") fileRef(el);
    else if (fileRef) fileRef.current = el;
  }

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
    <div className="flex flex-col gap-6">
      <div role="tablist" className="flex gap-2 rounded-2xl border-2 border-primary/20 bg-card p-1.5">
        <button role="tab" aria-selected={mode === "upload"} className={tabCls(mode === "upload")} onClick={() => onModeChange("upload")}>
          <Upload className="size-5" aria-hidden /> {t("tabUpload")}
        </button>
        <button role="tab" aria-selected={mode === "manual"} className={tabCls(mode === "manual")} onClick={() => onModeChange("manual")}>
          <Keyboard className="size-5" aria-hidden /> {t("tabManual")}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border-2 border-zone-red/40 bg-zone-red-soft px-4 py-3 font-medium text-zone-red-ink">
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
              "flex cursor-pointer flex-col items-center gap-3 rounded-3xl border-[3px] border-dashed px-6 py-10 text-center transition-colors",
              dragging ? "border-saffron bg-saffron-soft" : "border-primary/30 bg-card hover:border-primary/60",
            )}
          >
            <span className="grid size-16 place-items-center rounded-2xl bg-primary-soft text-primary">
              <FileUp className="size-8" aria-hidden />
            </span>
            <span className="font-display text-2xl font-bold">{t("dropTitle")}</span>
            <span className="text-muted-foreground">{t("dropOr")}</span>
            <span className="inline-flex min-h-14 items-center rounded-xl bg-saffron px-7 text-lg font-bold text-saffron-foreground shadow-soft">
              {t("dropChoose")}
            </span>
            <span className="text-muted-foreground">{t("dropHint")}</span>
            <input
              ref={setRefs}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              onChange={(e) => {
                handle(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          <Button variant="soft" size="xl" onClick={onSample} className="justify-center">
            <Sparkles className="text-saffron" aria-hidden /> {t("sampleBtn")}
          </Button>
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
