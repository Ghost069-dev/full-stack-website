import type { Lang } from "@/lib/i18n";

export type Bilingual = Record<Lang, string>;

export interface TestInfo {
  key: string;
  name: Bilingual;
  aliases: string[];
  unit: string;
  low: number;
  high: number;
  /** What the test looks at, in everyday words */
  about: Bilingual;
  /** What a high / low value can point to — never a diagnosis */
  high_meaning: Bilingual;
  low_meaning: Bilingual;
  questions: { high: Bilingual[]; low: Bilingual[] };
}

export const TEST_CATALOG: TestInfo[] = [
  {
    key: "hemoglobin",
    name: { hi: "हीमोग्लोबिन", en: "Hemoglobin" },
    aliases: ["hemoglobin", "haemoglobin", "hb", "hgb"],
    unit: "g/dL",
    low: 13.0,
    high: 17.0,
    about: {
      hi: "यह बताता है कि खून में ऑक्सीजन ले जाने वाला तत्व कितना है।",
      en: "It shows how much oxygen-carrying substance is in your blood.",
    },
    high_meaning: {
      hi: "यह पानी की कमी या कुछ और कारणों से बढ़ सकता है।",
      en: "It can rise with low water intake or other reasons.",
    },
    low_meaning: {
      hi: "यह खून की कमी (एनीमिया) की ओर इशारा कर सकता है।",
      en: "It can point to low blood (anaemia).",
    },
    questions: {
      high: [{ hi: "मेरा हीमोग्लोबिन ज़्यादा क्यों है?", en: "Why is my hemoglobin high?" }],
      low: [
        { hi: "क्या मुझे खून की कमी है? इसका कारण क्या हो सकता है?", en: "Do I have anaemia? What could be causing it?" },
        { hi: "मुझे खाने में क्या बदलाव करने चाहिए?", en: "What changes should I make to my diet?" },
      ],
    },
  },
  {
    key: "fasting_sugar",
    name: { hi: "खाली पेट शुगर", en: "Fasting Blood Sugar" },
    aliases: ["fasting blood sugar", "fbs", "fasting glucose", "glucose fasting", "blood sugar fasting", "fasting plasma glucose", "fpg"],
    unit: "mg/dL",
    low: 70,
    high: 100,
    about: {
      hi: "यह सुबह खाली पेट खून में शुगर की मात्रा है।",
      en: "It is the sugar level in your blood in the morning before eating.",
    },
    high_meaning: {
      hi: "बढ़ी हुई शुगर डायबिटीज़ या उसकी शुरुआत की ओर इशारा कर सकती है।",
      en: "High sugar can point to diabetes or early signs of it.",
    },
    low_meaning: {
      hi: "कम शुगर से चक्कर या कमज़ोरी हो सकती है।",
      en: "Low sugar can cause dizziness or weakness.",
    },
    questions: {
      high: [
        { hi: "क्या मेरी खाली पेट शुगर की फिर से जाँच होनी चाहिए?", en: "Should my fasting sugar be tested again?" },
        { hi: "क्या मुझे डायबिटीज़ का ख़तरा है?", en: "Am I at risk of diabetes?" },
      ],
      low: [{ hi: "मेरी शुगर कम क्यों है? मुझे क्या ध्यान रखना चाहिए?", en: "Why is my sugar low? What should I watch for?" }],
    },
  },
  {
    key: "hba1c",
    name: { hi: "HbA1c (3 महीने की औसत शुगर)", en: "HbA1c (3-month average sugar)" },
    aliases: ["hba1c", "glycated hemoglobin", "glycosylated hemoglobin", "a1c", "hb a1c"],
    unit: "%",
    low: 4.0,
    high: 5.6,
    about: {
      hi: "यह पिछले 2–3 महीनों की औसत शुगर बताता है।",
      en: "It shows your average sugar over the last 2–3 months.",
    },
    high_meaning: {
      hi: "यह बताता है कि लंबे समय से शुगर ज़्यादा रही है।",
      en: "It shows sugar has stayed high for a long time.",
    },
    low_meaning: {
      hi: "यह आमतौर पर चिंता की बात नहीं, पर डॉक्टर से पूछें।",
      en: "This is usually not a worry, but ask your doctor.",
    },
    questions: {
      high: [
        { hi: "मेरा HbA1c इतना ज़्यादा है — मेरी शुगर कितनी नियंत्रित है?", en: "My HbA1c is high — how well controlled is my sugar?" },
        { hi: "मुझे कितनी बार शुगर की जाँच करानी चाहिए?", en: "How often should I get my sugar checked?" },
        { hi: "क्या मेरी आँखों, पैरों या किडनी की भी जाँच होनी चाहिए?", en: "Should my eyes, feet or kidneys also be checked?" },
      ],
      low: [{ hi: "क्या मेरा कम HbA1c किसी बात का संकेत है?", en: "Does my low HbA1c mean anything?" }],
    },
  },
  {
    key: "creatinine",
    name: { hi: "सीरम क्रिएटिनिन (किडनी)", en: "Serum Creatinine (kidney)" },
    aliases: ["creatinine", "serum creatinine", "s. creatinine", "s creatinine", "creat"],
    unit: "mg/dL",
    low: 0.7,
    high: 1.3,
    about: {
      hi: "यह बताता है कि आपकी किडनी खून को कितनी अच्छी तरह साफ़ कर रही है।",
      en: "It shows how well your kidneys are cleaning your blood.",
    },
    high_meaning: {
      hi: "बढ़ा हुआ क्रिएटिनिन किडनी पर दबाव की ओर इशारा कर सकता है।",
      en: "High creatinine can point to stress on the kidneys.",
    },
    low_meaning: {
      hi: "कम क्रिएटिनिन आमतौर पर कम मांसपेशियों से जुड़ा होता है।",
      en: "Low creatinine is usually linked to lower muscle mass.",
    },
    questions: {
      high: [
        { hi: "क्या मेरी किडनी ठीक से काम कर रही है?", en: "Are my kidneys working properly?" },
        { hi: "क्या मुझे किडनी के डॉक्टर (नेफ्रोलॉजिस्ट) को दिखाना चाहिए?", en: "Should I see a kidney specialist (nephrologist)?" },
        { hi: "क्या मेरी अभी की दवाइयाँ किडनी के लिए ठीक हैं?", en: "Are my current medicines safe for my kidneys?" },
      ],
      low: [{ hi: "क्या मेरा कम क्रिएटिनिन चिंता की बात है?", en: "Is my low creatinine a concern?" }],
    },
  },
  {
    key: "total_cholesterol",
    name: { hi: "कुल कोलेस्ट्रॉल", en: "Total Cholesterol" },
    aliases: ["total cholesterol", "cholesterol", "cholesterol total", "serum cholesterol"],
    unit: "mg/dL",
    low: 125,
    high: 200,
    about: { hi: "यह खून में चर्बी (कोलेस्ट्रॉल) की मात्रा है।", en: "It is the amount of fat (cholesterol) in your blood." },
    high_meaning: {
      hi: "ज़्यादा कोलेस्ट्रॉल दिल की सेहत पर असर डाल सकता है।",
      en: "High cholesterol can affect heart health.",
    },
    low_meaning: { hi: "कम कोलेस्ट्रॉल के बारे में डॉक्टर से पूछें।", en: "Ask your doctor about low cholesterol." },
    questions: {
      high: [{ hi: "क्या मेरे दिल की जाँच होनी चाहिए?", en: "Should my heart be checked?" }],
      low: [{ hi: "मेरा कोलेस्ट्रॉल कम क्यों है?", en: "Why is my cholesterol low?" }],
    },
  },
  {
    key: "tsh",
    name: { hi: "TSH (थायरॉइड)", en: "TSH (thyroid)" },
    aliases: ["tsh", "thyroid stimulating hormone", "ultrasensitive tsh"],
    unit: "µIU/mL",
    low: 0.4,
    high: 4.5,
    about: { hi: "यह आपकी थायरॉइड ग्रंथि के काम को दिखाता है।", en: "It shows how your thyroid gland is working." },
    high_meaning: { hi: "ज़्यादा TSH थायरॉइड के धीमे काम की ओर इशारा कर सकता है।", en: "High TSH can point to a slow thyroid." },
    low_meaning: { hi: "कम TSH थायरॉइड के तेज़ काम की ओर इशारा कर सकता है।", en: "Low TSH can point to an overactive thyroid." },
    questions: {
      high: [{ hi: "क्या मुझे थायरॉइड की और जाँच करानी चाहिए?", en: "Do I need more thyroid tests?" }],
      low: [{ hi: "क्या मुझे थायरॉइड की और जाँच करानी चाहिए?", en: "Do I need more thyroid tests?" }],
    },
  },
  {
    key: "vitamin_d",
    name: { hi: "विटामिन D", en: "Vitamin D" },
    aliases: ["vitamin d", "vit d", "25-oh vitamin d", "25 hydroxy vitamin d", "vitamin d3", "25(oh)d"],
    unit: "ng/mL",
    low: 30,
    high: 100,
    about: { hi: "यह हड्डियों और मांसपेशियों के लिए ज़रूरी विटामिन है।", en: "It is a vitamin needed for bones and muscles." },
    high_meaning: { hi: "बहुत ज़्यादा विटामिन D के बारे में डॉक्टर से बात करें।", en: "Talk to your doctor about very high vitamin D." },
    low_meaning: { hi: "कम विटामिन D से हड्डियाँ कमज़ोर हो सकती हैं।", en: "Low vitamin D can weaken bones." },
    questions: {
      high: [{ hi: "मेरा विटामिन D ज़्यादा क्यों है?", en: "Why is my vitamin D high?" }],
      low: [{ hi: "मेरा विटामिन D कैसे ठीक हो सकता है?", en: "How can my vitamin D be improved?" }],
    },
  },
  {
    key: "vitamin_b12",
    name: { hi: "विटामिन B12", en: "Vitamin B12" },
    aliases: ["vitamin b12", "vit b12", "b12", "cobalamin", "cyanocobalamin"],
    unit: "pg/mL",
    low: 200,
    high: 900,
    about: { hi: "यह नसों और खून बनने के लिए ज़रूरी विटामिन है।", en: "It is a vitamin needed for nerves and making blood." },
    high_meaning: { hi: "ज़्यादा B12 के बारे में डॉक्टर से पूछें।", en: "Ask your doctor about high B12." },
    low_meaning: { hi: "कम B12 से थकान या हाथ-पैर में झुनझुनी हो सकती है।", en: "Low B12 can cause tiredness or tingling in hands and feet." },
    questions: {
      high: [{ hi: "मेरा B12 ज़्यादा क्यों है?", en: "Why is my B12 high?" }],
      low: [{ hi: "मेरा B12 कम क्यों है?", en: "Why is my B12 low?" }],
    },
  },
  {
    key: "platelets",
    name: { hi: "प्लेटलेट्स", en: "Platelet Count" },
    aliases: ["platelet", "platelets", "platelet count", "plt"],
    unit: "lakh/µL",
    low: 1.5,
    high: 4.5,
    about: { hi: "ये खून को जमने में मदद करते हैं।", en: "They help your blood to clot." },
    high_meaning: { hi: "ज़्यादा प्लेटलेट्स के बारे में डॉक्टर से बात करें।", en: "Talk to your doctor about high platelets." },
    low_meaning: { hi: "कम प्लेटलेट्स से खून आसानी से बह सकता है।", en: "Low platelets can make bleeding easier." },
    questions: {
      high: [{ hi: "मेरे प्लेटलेट्स ज़्यादा क्यों हैं?", en: "Why are my platelets high?" }],
      low: [{ hi: "मेरे प्लेटलेट्स कम क्यों हैं? क्या दोबारा जाँच ज़रूरी है?", en: "Why are my platelets low? Is a repeat test needed?" }],
    },
  },
  {
    key: "uric_acid",
    name: { hi: "यूरिक एसिड", en: "Uric Acid" },
    aliases: ["uric acid", "serum uric acid"],
    unit: "mg/dL",
    low: 3.5,
    high: 7.2,
    about: { hi: "यह शरीर का एक अपशिष्ट पदार्थ है जो किडनी से निकलता है।", en: "It is a waste product that leaves the body through the kidneys." },
    high_meaning: { hi: "ज़्यादा यूरिक एसिड से जोड़ों में दर्द हो सकता है।", en: "High uric acid can cause joint pain." },
    low_meaning: { hi: "कम यूरिक एसिड आमतौर पर चिंता की बात नहीं।", en: "Low uric acid is usually not a worry." },
    questions: {
      high: [{ hi: "क्या मेरे जोड़ों के दर्द का कारण यूरिक एसिड है?", en: "Could uric acid be causing my joint pain?" }],
      low: [{ hi: "क्या मेरा कम यूरिक एसिड चिंता की बात है?", en: "Is my low uric acid a concern?" }],
    },
  },
];

function normalise(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9()% ]+/g, " ").replace(/\s+/g, " ").trim();
}

export function findTest(name: string): TestInfo | undefined {
  const n = normalise(name);
  if (!n) return undefined;
  // exact alias match first, then "contains" match (longest alias wins)
  const exact = TEST_CATALOG.find((t) => t.aliases.some((a) => normalise(a) === n));
  if (exact) return exact;
  let best: { test: TestInfo; len: number } | undefined;
  for (const t of TEST_CATALOG) {
    for (const a of t.aliases) {
      const na = normalise(a);
      if (na.length >= 3 && n.includes(na) && (!best || na.length > best.len)) best = { test: t, len: na.length };
    }
  }
  return best?.test;
}

export function getTestByKey(key: string): TestInfo | undefined {
  return TEST_CATALOG.find((t) => t.key === key);
}
