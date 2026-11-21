import { Link } from "@tanstack/react-router";
import { Ban, Lock, Ruler, Smartphone } from "lucide-react";

import { useLang } from "@/lib/i18n";

const PILLARS = [
  { icon: Ban, key: "priv1" },
  { icon: Ruler, key: "priv2" },
  { icon: Smartphone, key: "priv3" },
  { icon: Lock, key: "priv4" },
] as const;

export function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="mt-20">
      <section aria-labelledby="priv-title" className="border-y-2 border-primary/15 bg-primary-soft">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h2 id="priv-title" className="font-display text-2xl font-extrabold text-primary">
            {t("privTitle")}
          </h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p, i) => (
              <li key={p.key} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <p.icon className="size-6" aria-hidden />
                </span>
                <span className="text-lg font-bold leading-snug">
                  {i + 1}. {t(p.key)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10">
          <p className="font-display text-2xl font-bold">
            {t("brandName")} · <span className="text-saffron">{t("heroTitle")}</span>
          </p>
          <nav className="flex flex-wrap gap-4 text-lg font-semibold">
            <Link to="/how-it-works" className="underline-offset-4 hover:underline">{t("navHow")}</Link>
            <Link to="/why-sehat-saathi" className="underline-offset-4 hover:underline">{t("navWhy")}</Link>
            <Link to="/doctor" className="underline-offset-4 hover:underline">{t("viewDoctor")}</Link>
          </nav>
          <p className="max-w-3xl text-primary-foreground/85">{t("footerNote")}</p>
          <p className="font-semibold">{t("footerEmergency")}</p>
        </div>
      </div>
    </footer>
  );
}
