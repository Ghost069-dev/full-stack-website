import { Link, useRouterState } from "@tanstack/react-router";
import { HeartPulse, Stethoscope, UserRound } from "lucide-react";

import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "./LanguageToggle";
import { OfflineBadge, OfflineToggle } from "./OfflineToggle";

export function SiteHeader() {
  const { t } = useLang();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const doctor = pathname.startsWith("/doctor");
  const viewCls = (active: boolean) =>
    cn(
      "flex min-h-14 items-center gap-2 rounded-md px-3 text-lg font-semibold transition-colors",
      active ? "bg-primary-soft text-primary" : "text-primary hover:bg-primary-soft",
    );

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-0 px-4 py-2 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground">
              <HeartPulse className="size-7" aria-hidden />
            </span>
            <span className="font-display text-2xl font-extrabold leading-none text-primary">{t("brandName")}</span>
          </Link>
          <nav aria-label="View" className="flex gap-1">
            <Button asChild variant="ghost" className={viewCls(!doctor)}>
            <Link to="/" aria-label={t("viewPatient")} aria-current={!doctor ? "page" : undefined}>
              <UserRound className="size-5" aria-hidden />
              <span className="hidden sm:inline">{t("viewPatient")}</span>
            </Link>
            </Button>
            <Button asChild variant="ghost" className={viewCls(doctor)}>
            <Link to="/doctor" aria-label={t("viewDoctor")} aria-current={doctor ? "page" : undefined}>
              <Stethoscope className="size-5 sm:hidden" aria-hidden />
              <span className="hidden sm:inline">{t("viewDoctor")}</span>
            </Link>
            </Button>
          </nav>
        </div>
        <div className="flex flex-col gap-0 sm:flex-row sm:items-center sm:justify-between">
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
