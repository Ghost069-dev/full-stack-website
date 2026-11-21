import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenCheck, Cpu, FileSearch, Languages, ShieldAlert, Smartphone } from "lucide-react";

import doctorAsset from "@/assets/family-doctor.png.asset.json";
import { Button } from "@/components/ui/button";
import { ConsultDialog } from "@/components/report/ConsultDialog";
import { HowItWorksSteps } from "@/components/site/HowItWorksSteps";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Sehat Saathi Works — From Report to Doctor" },
      {
        name: "description",
        content:
          "Upload a report, see values sorted into Green, Yellow and Red zones, hear them in simple Hindi, and take your questions to a qualified doctor.",
      },
      { property: "og:title", content: "How Sehat Saathi Works" },
      { property: "og:description", content: "Four simple steps from a confusing lab report to a clear conversation with your doctor." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

const LAYERS = [
  { icon: Smartphone, hi: ["मोबाइल-फ्रेंडली ऐप", "बड़े अक्षर, साफ़ बटन, हिंदी-अंग्रेज़ी"], en: ["Mobile-friendly app", "Large text, clear buttons, Hindi & English"] },
  { icon: FileSearch, hi: ["रिपोर्ट पढ़ना", "फ़ोटो या PDF से जाँच के नंबर निकालना"], en: ["Report reading", "Pulling test values from a photo or PDF"] },
  { icon: BookOpenCheck, hi: ["सामान्य सीमा", "लैब की छपी सीमा से हर नंबर का मिलान"], en: ["Reference ranges", "Each value compared with the lab's printed range"] },
  { icon: Cpu, hi: ["ज़ोन तय करना", "सीमा के अंदर = हरा, थोड़ा बाहर = पीला, काफ़ी बाहर = लाल"], en: ["Zone sorting", "Inside range = green, slightly out = yellow, far out = red"] },
  { icon: ShieldAlert, hi: ["सुरक्षा परत", "कोई दवाई नहीं, कोई निदान नहीं — सिर्फ़ डॉक्टर के पास भेजना"], en: ["Safety layer", "No medicines, no diagnosis — only guidance to a doctor"] },
  { icon: Languages, hi: ["आसान भाषा", "हिंदी में समझाना, सुनने का बटन, डॉक्टर के सवाल"], en: ["Simple language", "Hindi explanations, read-aloud, doctor questions"] },
] as const;

function HowItWorks() {
  const { t, lang } = useLang();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10 max-w-3xl">
        <p className="font-display text-lg font-bold uppercase tracking-wider text-saffron">{t("navHow")}</p>
        <h1 className="font-display text-4xl font-extrabold text-primary sm:text-5xl">{t("howTitle")}</h1>
      </header>
      <HowItWorksSteps />

      <section className="mt-20">
        <h2 className="font-display text-3xl font-extrabold text-primary sm:text-4xl">
          {lang === "hi" ? "अंदर क्या होता है?" : "What happens inside?"}
        </h2>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          {lang === "hi" ? "AI समझाता है। यह कभी निदान नहीं करता, दवाई नहीं लिखता, और डॉक्टर की जगह नहीं लेता।" : "AI explains. It never diagnoses, prescribes, or replaces a doctor."}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LAYERS.map((l, i) => {
            const [title, desc] = l[lang];
            return (
              <div key={title} className="flex gap-4 rounded-3xl border-2 border-border bg-card p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-saffron-soft text-accent-foreground">
                  <l.icon className="size-6" aria-hidden />
                </span>
                <div>
                  <p className="font-display text-xl font-bold">
                    {i + 1}. {title}
                  </p>
                  <p className="text-muted-foreground">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-20 grid items-center gap-10 rounded-[2rem] bg-primary-soft p-6 sm:p-10 md:grid-cols-[1fr_1.1fr]">
        <img
          src={doctorAsset.url}
          alt={lang === "hi" ? "डॉक्टर के साथ एक भारतीय परिवार" : "An Indian family with their doctor"}
          className="mx-auto w-full max-w-xs rounded-[2rem] shadow-lift"
          width={820}
          height={940}
          loading="lazy"
        />
        <div className="flex flex-col gap-5">
          <h2 className="font-display text-3xl font-extrabold text-primary sm:text-4xl">{t("consultBand")}</h2>
          <p className="text-lg">{t("safetyBody")}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="hero" size="lg">
              <Link to="/">{t("navCheck")}</Link>
            </Button>
            <ConsultDialog />
          </div>
        </div>
      </section>
    </div>
  );
}
