import { useLang } from "@/lib/i18n";

export function SiteFooter() {
  const { t, lang } = useLang();
  return (
    <footer className="mt-20 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10">
        <p className="font-display text-2xl font-bold">
          {lang === "hi" ? "सेहत साथी" : "Sehat Saathi"} · <span className="text-saffron">{t("heroTitle")}</span>
        </p>
        <p className="max-w-3xl text-primary-foreground/85">{t("footerNote")}</p>
        <p className="font-semibold">{t("footerEmergency")}</p>
      </div>
    </footer>
  );
}
