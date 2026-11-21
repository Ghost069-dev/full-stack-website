import { Input } from "@/components/ui/input";
import type { Profile, Sex } from "@/lib/health/clinical-db";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function ProfileFields({ profile, onChange }: { profile: Profile; onChange: (p: Profile) => void }) {
  const { t } = useLang();
  const sexBtn = (s: Sex) =>
    cn(
      "min-h-14 flex-1 rounded-xl border-2 px-4 text-lg font-bold transition-colors",
      profile.sex === s ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-foreground hover:border-primary/50",
    );
  return (
    <div className="rounded-2xl border-2 border-border bg-card p-4">
      <p className="font-display text-xl font-bold text-primary">{t("profileTitle")}</p>
      <p className="text-base text-muted-foreground">{t("profileHint")}</p>
      <div className="mt-3 grid grid-cols-[7rem_1fr] gap-3">
        <label className="grid gap-1">
          <span className="text-lg">{t("fAge")}</span>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={120}
            value={profile.age ?? ""}
            onChange={(e) => {
              const n = Number.parseInt(e.target.value, 10);
              onChange({ ...profile, age: Number.isFinite(n) && n > 0 && n <= 120 ? n : null });
            }}
            className="h-14 text-xl font-bold"
          />
        </label>
        <fieldset className="grid gap-1">
          <legend className="mb-1 text-lg">{t("fSex")}</legend>
          <div className="flex gap-2">
            <button type="button" className={sexBtn("M")} aria-pressed={profile.sex === "M"} onClick={() => onChange({ ...profile, sex: "M" })}>
              {t("sexM")}
            </button>
            <button type="button" className={sexBtn("F")} aria-pressed={profile.sex === "F"} onClick={() => onChange({ ...profile, sex: "F" })}>
              {t("sexF")}
            </button>
          </div>
        </fieldset>
      </div>
    </div>
  );
}
