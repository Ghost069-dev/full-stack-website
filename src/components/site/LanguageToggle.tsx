import { LANGS, useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { lang, setLang, t } = useLang();
  return (
    <div role="radiogroup" aria-label={t("langLabel")} className="flex w-full items-center gap-1 rounded-2xl border-2 border-primary/25 bg-card p-1 sm:w-auto">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          role="radio"
          lang={code}
          aria-checked={lang === code}
          onClick={() => setLang(code)}
          className={cn(
            "min-h-12 flex-1 rounded-xl px-3 text-lg font-bold transition-colors sm:flex-none",
            lang === code ? "bg-primary text-primary-foreground" : "text-primary hover:bg-primary-soft",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
