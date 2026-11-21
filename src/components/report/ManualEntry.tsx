import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TEST_CATALOG, findTest, getTestByKey } from "@/lib/health/catalog";
import type { TestInput } from "@/lib/health/report";
import { useLang } from "@/lib/i18n";

interface Row {
  key: string; // catalog key or "other"
  customName: string;
  value: string;
  unit: string;
  low: string;
  high: string;
}

const OPEN_HIGH = 1_000_000_000;

function rowFromTest(t: TestInput): Row {
  const known = findTest(t.name);
  return {
    key: known?.key ?? "other",
    customName: known ? "" : t.name,
    value: String(t.value),
    unit: t.unit,
    low: String(t.low),
    high: t.high >= OPEN_HIGH ? "" : String(t.high),
  };
}

function emptyRow(key = "hemoglobin"): Row {
  const info = getTestByKey(key);
  return { key, customName: "", value: "", unit: info?.unit ?? "", low: info ? String(info.low) : "", high: info ? String(info.high) : "" };
}

export function ManualEntry({ initial, onSubmit }: { initial?: TestInput[] | undefined; onSubmit: (tests: TestInput[]) => void }) {
  const { t, lang } = useLang();
  const [rows, setRows] = useState<Row[]>(() => (initial?.length ? initial.map(rowFromTest) : [emptyRow()]));
  const [error, setError] = useState(false);

  function update(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function changeTest(i: number, key: string) {
    const info = getTestByKey(key);
    update(i, info ? { key, unit: info.unit, low: String(info.low), high: String(info.high) } : { key, unit: "", low: "", high: "" });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const tests: TestInput[] = [];
    for (const r of rows) {
      const info = getTestByKey(r.key);
      const name = info ? info.name.en : r.customName.trim();
      const value = Number.parseFloat(r.value);
      const low = r.low.trim() === "" ? 0 : Number.parseFloat(r.low);
      const high = r.high.trim() === "" ? OPEN_HIGH : Number.parseFloat(r.high);
      if (!name || !Number.isFinite(value) || !Number.isFinite(low) || !Number.isFinite(high) || low > high || (r.low.trim() === "" && r.high.trim() === "")) {
        setError(true);
        return;
      }
      tests.push({ name: name.slice(0, 80), value, unit: r.unit.trim().slice(0, 20), low, high });
    }
    setError(false);
    onSubmit(tests);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <p className="text-muted-foreground">{t("manualHint")}</p>
      {rows.map((r, i) => (
        <fieldset key={i} className="grid gap-4 rounded-2xl border-2 border-border bg-card p-4 sm:grid-cols-12">
          <legend className="sr-only">{`${t("manualTest")} ${i + 1}`}</legend>
          <div className="grid gap-2 sm:col-span-12">
            <Label htmlFor={`m-test-${i}`} className="text-lg">{t("manualTest")}</Label>
            <select
              id={`m-test-${i}`}
              value={r.key}
              onChange={(e) => changeTest(i, e.target.value)}
              className="h-14 rounded-xl border-2 border-input bg-background px-3 text-lg"
            >
              {TEST_CATALOG.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name[lang]}
                </option>
              ))}
              <option value="other">{t("manualOther")}</option>
            </select>
            {r.key === "other" && (
              <Input
                aria-label={t("manualOtherName")}
                placeholder={t("manualOtherName")}
                value={r.customName}
                onChange={(e) => update(i, { customName: e.target.value })}
                className="h-14 text-lg"
                maxLength={80}
              />
            )}
          </div>
          <div className="grid gap-2 sm:col-span-4">
            <Label htmlFor={`m-val-${i}`} className="text-lg">{t("manualValue")}</Label>
            <Input id={`m-val-${i}`} inputMode="decimal" value={r.value} onChange={(e) => update(i, { value: e.target.value })} className="h-14 text-xl font-bold" placeholder="0.0" />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor={`m-unit-${i}`} className="text-lg">{t("manualUnit")}</Label>
            <Input id={`m-unit-${i}`} value={r.unit} onChange={(e) => update(i, { unit: e.target.value })} className="h-14 text-lg" maxLength={20} />
          </div>
          <div className="grid gap-2 sm:col-span-3">
            <Label htmlFor={`m-low-${i}`} className="text-lg">{t("manualLow")}</Label>
            <Input id={`m-low-${i}`} inputMode="decimal" value={r.low} onChange={(e) => update(i, { low: e.target.value })} className="h-14 text-lg" />
          </div>
          <div className="grid gap-2 sm:col-span-3">
            <Label htmlFor={`m-high-${i}`} className="text-lg">{t("manualHigh")}</Label>
            <Input id={`m-high-${i}`} inputMode="decimal" value={r.high} onChange={(e) => update(i, { high: e.target.value })} className="h-14 text-lg" />
          </div>
          {rows.length > 1 && (
            <div className="sm:col-span-12">
              <Button type="button" variant="ghost" onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}>
                <Trash2 aria-hidden /> {t("manualRemove")}
              </Button>
            </div>
          )}
        </fieldset>
      ))}
      {error && <p className="rounded-xl bg-zone-red-soft px-4 py-3 font-medium text-zone-red-ink">{t("manualInvalid")}</p>}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="soft" size="lg" onClick={() => setRows((rs) => [...rs, emptyRow(TEST_CATALOG[rs.length % TEST_CATALOG.length]?.key)])}>
          <Plus aria-hidden /> {t("manualAdd")}
        </Button>
        <Button type="submit" variant="trust" size="lg" className="sm:ml-auto">
          {t("manualSubmit")}
        </Button>
      </div>
    </form>
  );
}
