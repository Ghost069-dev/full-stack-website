import { useState } from "react";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CLINICAL_DB, findTest, getTestByKey } from "@/lib/health/clinical-db";
import { OPEN_HIGH, type TestInput } from "@/lib/health/report";
import { useLang } from "@/lib/i18n";

interface Row {
  key: string; // clinical table key or "other"
  customName: string;
  value: string;
  unit: string;
  low: string;
  high: string;
}

function rowFromTest(t: TestInput): Row {
  const known = findTest(t.name);
  return {
    key: known?.key ?? "other",
    customName: known ? "" : t.name,
    value: String(t.value),
    unit: t.unit,
    low: t.labLow === null ? "" : String(t.labLow),
    high: t.labHigh === null || t.labHigh >= OPEN_HIGH ? "" : String(t.labHigh),
  };
}

function emptyRow(key = "hemoglobin"): Row {
  return { key, customName: "", value: "", unit: getTestByKey(key)?.unit ?? "", low: "", high: "" };
}

export function ManualEntry({ initial, onSubmit }: { initial?: TestInput[] | undefined; onSubmit: (tests: TestInput[]) => void }) {
  const { t, lang } = useLang();
  const [rows, setRows] = useState<Row[]>(() => (initial?.length ? initial.map(rowFromTest) : [emptyRow()]));
  const [error, setError] = useState(false);

  const update = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const tests: TestInput[] = [];
    for (const r of rows) {
      const info = getTestByKey(r.key);
      const value = Number.parseFloat(r.value.replace(",", "."));
      if (!Number.isFinite(value)) return setError(true);
      if (info) {
        tests.push({ name: info.name.en, value, unit: r.unit || info.unit, labLow: null, labHigh: null });
        continue;
      }
      const name = r.customName.trim();
      const low = r.low.trim() === "" ? null : Number.parseFloat(r.low);
      const high = r.high.trim() === "" ? null : Number.parseFloat(r.high);
      if (!name || (low === null && high === null) || (low !== null && !Number.isFinite(low)) || (high !== null && !Number.isFinite(high))) return setError(true);
      tests.push({ name: name.slice(0, 80), value, unit: r.unit.trim().slice(0, 20), labLow: low, labHigh: high });
    }
    setError(false);
    onSubmit(tests);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      {rows.map((r, i) => {
        const info = getTestByKey(r.key);
        return (
          <fieldset key={i} className="grid gap-3 rounded-2xl border-2 border-border bg-card p-4 sm:grid-cols-[1.4fr_1fr_auto] sm:items-end">
            <legend className="sr-only">{`${t("manualTest")} ${i + 1}`}</legend>
            <div className="grid gap-2">
              <Label htmlFor={`m-test-${i}`} className="text-lg">{t("manualTest")}</Label>
              <select
                id={`m-test-${i}`}
                value={r.key}
                onChange={(e) => update(i, { key: e.target.value, unit: getTestByKey(e.target.value)?.unit ?? "", low: "", high: "" })}
                className="h-14 rounded-xl border-2 border-input bg-background px-3 text-lg"
              >
                {CLINICAL_DB.map((c) => (
                  <option key={c.key} value={c.key}>{c.name[lang]}</option>
                ))}
                <option value="other">{t("manualOther")}</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`m-val-${i}`} className="text-lg">
                {t("manualValue")} {info && <span className="text-muted-foreground">({info.unit})</span>}
              </Label>
              <Input id={`m-val-${i}`} inputMode="decimal" value={r.value} onChange={(e) => update(i, { value: e.target.value })} className="h-14 text-2xl font-bold" placeholder="0.0" />
            </div>
            {rows.length > 1 ? (
              <Button type="button" variant="ghost" size="icon" className="size-14" aria-label={t("manualRemove")} onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}>
                <Trash2 aria-hidden />
              </Button>
            ) : (
              <span className="hidden sm:block sm:w-14" />
            )}
            {info ? (
              <p className="flex items-center gap-2 text-base text-zone-green-ink sm:col-span-3">
                <ShieldCheck className="size-5" aria-hidden /> {t("manualRuleNote")}
              </p>
            ) : (
              <div className="grid gap-3 sm:col-span-3 sm:grid-cols-4">
                <Input aria-label={t("manualOtherName")} placeholder={t("manualOtherName")} value={r.customName} onChange={(e) => update(i, { customName: e.target.value })} className="h-14 text-lg sm:col-span-4" maxLength={80} />
                <Input aria-label={t("manualUnit")} placeholder={t("manualUnit")} value={r.unit} onChange={(e) => update(i, { unit: e.target.value })} className="h-14 text-lg" maxLength={20} />
                <Input aria-label={t("manualLow")} placeholder={t("manualLow")} inputMode="decimal" value={r.low} onChange={(e) => update(i, { low: e.target.value })} className="h-14 text-lg" />
                <Input aria-label={t("manualHigh")} placeholder={t("manualHigh")} inputMode="decimal" value={r.high} onChange={(e) => update(i, { high: e.target.value })} className="h-14 text-lg" />
              </div>
            )}
          </fieldset>
        );
      })}
      {error && <p role="alert" className="rounded-xl bg-zone-red-soft px-4 py-3 font-medium text-zone-red-ink">{t("manualInvalid")}</p>}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="soft" size="lg" onClick={() => setRows((rs) => [...rs, emptyRow(CLINICAL_DB[rs.length % CLINICAL_DB.length]?.key)])}>
          <Plus aria-hidden /> {t("manualAdd")}
        </Button>
        <Button type="submit" variant="trust" size="lg" className="sm:ml-auto">
          {t("manualSubmit")}
        </Button>
      </div>
    </form>
  );
}
