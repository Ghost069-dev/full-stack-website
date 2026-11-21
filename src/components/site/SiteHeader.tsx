import { Link } from "@tanstack/react-router";
import { HeartPulse } from "lucide-react";

import { useLang } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

export function SiteHeader() {
  const { t, lang } = useLang();
  const linkCls =
    "rounded-lg px-3 py-2 text-base font-semibold text-foreground/80 transition-colors hover:bg-accent hover:text-foreground";
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lift">
            <HeartPulse className="size-6" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-2xl font-extrabold text-primary">
              {lang === "hi" ? "सेहत साथी" : "Sehat Saathi"}
            </span>
            <span className="hidden text-sm text-muted-foreground sm:block">{t("brandTagline")}</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          <Link to="/" className={linkCls} activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>
            {t("navCheck")}
          </Link>
          <Link to="/how-it-works" className={linkCls} activeProps={{ className: "text-primary" }}>
            {t("navHow")}
          </Link>
          <Link to="/why-sehat-saathi" className={linkCls} activeProps={{ className: "text-primary" }}>
            {t("navWhy")}
          </Link>
        </nav>
        <LanguageToggle />
      </div>
      <nav className="flex justify-center gap-1 border-t border-border/60 px-2 py-1 md:hidden" aria-label="Main mobile">
        <Link to="/" className={linkCls} activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }}>
          {t("navCheck")}
        </Link>
        <Link to="/how-it-works" className={linkCls} activeProps={{ className: "text-primary" }}>
          {t("navHow")}
        </Link>
        <Link to="/why-sehat-saathi" className={linkCls} activeProps={{ className: "text-primary" }}>
          {t("navWhy")}
        </Link>
      </nav>
    </header>
  );
}
