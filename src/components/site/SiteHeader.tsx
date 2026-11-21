import { Link, useRouterState } from "@tanstack/react-router";
import { HeartPulse, Stethoscope, UserRound } from "lucide-react";

import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "./LanguageToggle";
import { OfflineBadge, OfflineToggle } from "./OfflineToggle";

export function SiteHeader() {
  const { t } = useLang();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const doctor = pathname.startsWith("/doctor");
  const viewCls = (active: boolean) =>
    cn(
      "flex min-h-12 items-center gap-2 rounded-xl px-3 text-lg font-bold transition-colors",
      active ? "bg-primary text-primary-foreground" : "text-primary hover:bg-primary-soft",
    );

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lift">
              <HeartPulse className="size-7" aria-hidden />
            </span>
            <span className="font-display text-2xl font-extrabold leading-none text-primary">{t("brandName")}</span>
          </Link>
          <nav aria-label="View" className="flex gap-1 rounded-2xl border-2 border-primary/25 bg-card p-1">
            <Link to="/" className={viewCls(!doctor)} aria-current={!doctor ? "page" : undefined}>
              <UserRound className="size-5" aria-hidden />
              <span className="hidden sm:inline">{t("viewPatient")}</span>
            </Link>
            <Link to="/doctor" className={viewCls(doctor)} aria-current={doctor ? "page" : undefined}>
              <Stethoscope className="size-5 sm:hidden" aria-hidden />
              <span className="hidden sm:inline">{t("viewDoctor")}</span>
            </Link>
          </nav>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <LanguageToggle />
          <div className="flex items-center gap-2">
            <nav aria-label="Pages" className="hidden items-center gap-1 lg:flex">
              <Link to="/how-it-works" className="rounded-lg px-3 py-2 text-lg font-semibold text-foreground/80 hover:bg-accent" activeProps={{ className: "text-primary" }}>
                {t("navHow")}
              </Link>
              <Link to="/why-sehat-saathi" className="rounded-lg px-3 py-2 text-lg font-semibold text-foreground/80 hover:bg-accent" activeProps={{ className: "text-primary" }}>
                {t("navWhy")}
              </Link>
            </nav>
            <OfflineToggle />
          </div>
        </div>
      </div>
      <OfflineBadge />
    </header>
  );
}
