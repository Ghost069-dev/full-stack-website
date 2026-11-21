import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";

import confusedAsset from "@/assets/confused-report.png.asset.json";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/why-sehat-saathi")({
  head: () => ({
    meta: [
      { title: "Why Sehat Saathi — Built for Bharat, Doctor-First" },
      {
        name: "description",
        content:
          "Simple Hindi, elderly-friendly design, traffic-light zones and zero AI prescriptions. See how Sehat Saathi differs from generic health apps.",
      },
      { property: "og:title", content: "Why Sehat Saathi Is Different" },
      { property: "og:description", content: "A bridge between doctors and Bharat — simple Hindi, traffic-light zones, never a prescription." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WhyUs,
});

const ROWS = {
  hi: [
    ["भाषा", "आसान हिंदी में समझाना", "अंग्रेज़ी या मेडिकल जानकारी मान लेते हैं"],
    ["किसके लिए", "बुज़ुर्ग और गाँव के परिवार", "आम उपयोगकर्ता"],
    ["रिपोर्ट", "हरा-पीला-लाल ज़ोन से आसान समझ", "सिर्फ़ नंबर दिखाते हैं"],
    ["बुज़ुर्गों के लिए", "बड़े अक्षर, सुनने का बटन", "छोटे अक्षर, उलझी स्क्रीन"],
    ["दवाइयाँ", "कभी बिना अनुमति दवाई की सलाह नहीं", "ऐप पर निर्भर"],
    ["सोच", "डॉक्टर-पहले", "ऐप पर निर्भर"],
  ],
  en: [
    ["Language", "Simple Hindi explanations", "May assume English or medical literacy"],
    ["Who it's for", "Elderly and rural families", "General users"],
    ["Reports", "Easy traffic-light zones", "May show raw numbers"],
    ["Elderly-friendly", "Large text, read-aloud button", "Small text, busy screens"],
    ["Medicines", "Zero unauthorised prescriptions", "Varies by app"],
    ["Philosophy", "Doctor-first", "Varies by app"],
  ],
} as const;

const PROBLEMS = {
  hi: [
    "मेडिकल रिपोर्ट मुश्किल शब्दों से भरी होती हैं।",
    "गाँव और बुज़ुर्ग मरीज़ों को नतीजे समझने में दिक़्क़त होती है।",
    "लोग असामान्य नंबर देखकर घबरा जाते हैं या ख़ुद दवाई ले लेते हैं।",
  ],
  en: [
    "Medical reports are full of complicated terms.",
    "Rural and elderly patients struggle to understand test results.",
    "People panic or self-medicate after seeing abnormal values.",
  ],
} as const;

function WhyUs() {
  const { t, lang } = useLang();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="font-display text-lg font-bold uppercase tracking-wider text-saffron">{t("navWhy")}</p>
          <h1 className="font-display text-4xl font-extrabold text-primary sm:text-5xl">
            {lang === "hi" ? "मेडिकल रिपोर्ट मुश्किल हैं। सेहत को मुश्किल नहीं होना चाहिए।" : "Medical reports are complicated. Healthcare shouldn't be."}
          </h1>
          <ol className="mt-8 flex flex-col gap-4">
            {PROBLEMS[lang].map((p, i) => (
              <li key={p} className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-saffron font-display text-xl font-bold text-saffron-foreground">
                  {i + 1}
                </span>
                <span className="pt-1 text-lg">{p}</span>
              </li>
            ))}
          </ol>
        </div>
        <img
          src={confusedAsset.url}
          alt={lang === "hi" ? "रिपोर्ट देखकर उलझन में बुज़ुर्ग दंपति" : "An elderly couple confused by their lab report"}
          className="mx-auto w-full max-w-md rounded-[2rem] shadow-soft"
          width={820}
          height={725}
        />
      </section>

      <section className="mt-20">
        <h2 className="font-display text-3xl font-extrabold text-primary sm:text-4xl">
          {lang === "hi" ? "एक और हेल्थ ऐप नहीं — डॉक्टर और भारत के बीच का पुल।" : "Not another health app. A bridge between doctors and Bharat."}
        </h2>
        <div className="mt-8 overflow-hidden rounded-3xl border-2 border-border bg-card shadow-soft">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th scope="col" className="p-4 font-display text-lg sm:w-1/4">
                  <span className="sr-only">{lang === "hi" ? "पहलू" : "Aspect"}</span>
                </th>
                <th scope="col" className="p-4 font-display text-xl">{lang === "hi" ? "सेहत साथी" : "Sehat Saathi"}</th>
                <th scope="col" className="p-4 font-display text-lg font-semibold opacity-85">
                  {lang === "hi" ? "आम हेल्थ ऐप" : "A generic health app"}
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS[lang].map(([aspect, ours, theirs]) => (
                <tr key={aspect} className="border-t border-border align-top">
                  <th scope="row" className="p-4 font-bold">{aspect}</th>
                  <td className="bg-zone-green-soft p-4">
                    <span className="flex items-start gap-2 font-semibold text-zone-green-ink">
                      <Check className="mt-1 size-5 shrink-0" aria-hidden /> {ours}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    <span className="flex items-start gap-2">
                      <Minus className="mt-1 size-5 shrink-0" aria-hidden /> {theirs}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-muted-foreground">
          {lang === "hi" ? "यह हमारे डिज़ाइन लक्ष्य दिखाता है, किसी ख़ास ऐप की समीक्षा नहीं।" : "Reflects our design goals, not a review of specific apps."}
        </p>
      </section>

      <section className="mt-16 flex flex-col items-center gap-4 rounded-[2rem] bg-saffron-soft px-6 py-10 text-center">
        <p className="font-display text-2xl font-bold text-primary sm:text-3xl">{t("safetyMotto")}</p>
        <Button asChild variant="trust" size="lg">
          <Link to="/">{t("ctaSample")}</Link>
        </Button>
      </section>
    </div>
  );
}
