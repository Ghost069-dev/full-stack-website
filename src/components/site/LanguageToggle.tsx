import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { lang, setLang, t } = useLang();
  return (
    <div
      role="radiogroup"
      aria-label={t("langLabel")}
      className="inline-flex shrink-0 items-center rounded-full border-2 border-primary/30 bg-card p-1 shadow-soft"
    >
      {(
        [
          ["hi", "हिंदी"],
          ["en", "English"],
        ] as const
      ).map(([code, label]) => (
        <button
          key={code}
          type="button"
          role="radio"
          aria-checked={lang === code}
          onClick={() => setLang(code)}
          className={cn(
            "min-h-10 rounded-full px-4 text-base font-bold transition-colors",
            lang === code ? "bg-primary text-primary-foreground" : "text-primary hover:bg-primary-soft",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
