import { LANGS, useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { lang, setLang, t } = useLang();
  return (
    <div role="radiogroup" aria-label={t("langLabel")} className="flex w-full items-center gap-0.5 sm:w-auto">
      {LANGS.map(({ code, label }) => (
        <Button
          variant="ghost"
          key={code}
          type="button"
          role="radio"
          lang={code}
          aria-checked={lang === code}
          onClick={() => setLang(code)}
          className={cn(
            "min-h-14 flex-1 rounded-md px-2.5 text-lg font-semibold transition-colors sm:flex-none",
            lang === code ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-primary",
          )}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
