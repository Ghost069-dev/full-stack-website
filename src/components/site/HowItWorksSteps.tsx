import { Brain, FileUp, Languages, Stethoscope } from "lucide-react";

import { useLang } from "@/lib/i18n";

const STEPS = [
  { icon: FileUp, title: "how1", desc: "how1d" },
  { icon: Brain, title: "how2", desc: "how2d" },
  { icon: Languages, title: "how3", desc: "how3d" },
  { icon: Stethoscope, title: "how4", desc: "how4d" },
] as const;

export function HowItWorksSteps() {
  const { t } = useLang();
  return (
    <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((s, i) => (
        <li key={s.title} className="relative flex flex-col gap-3 rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
          <span className="font-display text-base font-bold uppercase tracking-wider text-saffron">
            {t("stepLabel")} {i + 1}
          </span>
          <span className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
            <s.icon className="size-7" aria-hidden />
          </span>
          <h3 className="font-display text-2xl font-bold">{t(s.title)}</h3>
          <p className="text-muted-foreground">{t(s.desc)}</p>
          {i < STEPS.length - 1 && (
            <span aria-hidden className="absolute -right-4 top-1/2 hidden font-display text-3xl text-saffron lg:block">
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
