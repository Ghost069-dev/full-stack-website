import type { L10n } from "@/lib/i18n";

export type Sex = "M" | "F";
export interface Profile {
  age: number | null;
  sex: Sex | null;
}

/**
 * Zone bands. Green: low ≤ v ≤ high.
 * Yellow: yellowLow ≤ v < low, or high < v ≤ yellowHigh.
 * Red: v < yellowLow, or v > yellowHigh.
 */
export interface Band {
  low: number;
  high: number;
  yellowLow: number;
  yellowHigh: number;
}

export interface ClinicalTest {
  key: string;
  name: L10n;
  aliases: string[];
  unit: string;
  /** Unit spellings already in the canonical unit (lower-case, no spaces, µ written as u). */
  units: string[];
  /** Other units and how to convert them to the canonical unit. */
  conversions?: { units: string[]; toCanonical: (v: number) => number }[];
  band: (p: Profile) => Band;
  about: L10n;
  high_meaning: L10n;
  low_meaning: L10n;
  questions: { high: L10n[]; low: L10n[] };
}

const b = (low: number, high: number, yellowLow: number, yellowHigh: number): Band => ({ low, high, yellowLow, yellowHigh });

export const CLINICAL_DB: ClinicalTest[] = [
  {
    key: "hemoglobin",
    name: { hi: "हीमोग्लोबिन", pa: "ਹੀਮੋਗਲੋਬਿਨ", mr: "हिमोग्लोबिन", en: "Hemoglobin" },
    aliases: ["hemoglobin", "haemoglobin", "hb", "hgb"],
    unit: "g/dL",
    units: ["g/dl", "gm/dl", "g%", "gm%", "gms/dl"],
    conversions: [{ units: ["g/l", "gm/l"], toCanonical: (v) => v / 10 }],
    band: (p) => (p.sex === "F" ? b(12.0, 15.5, 10.0, 17.0) : p.sex === "M" ? b(13.0, 17.0, 10.0, 18.5) : b(12.0, 17.0, 10.0, 18.5)),
    about: { hi: "खून में ऑक्सीजन ले जाने वाला तत्व", pa: "ਖ਼ੂਨ ਵਿੱਚ ਆਕਸੀਜਨ ਲਿਜਾਣ ਵਾਲਾ ਤੱਤ", mr: "रक्तातील ऑक्सिजन वाहून नेणारा घटक", en: "Carries oxygen in your blood" },
    high_meaning: { hi: "पानी की कमी या दूसरे कारण हो सकते हैं।", pa: "ਪਾਣੀ ਦੀ ਘਾਟ ਜਾਂ ਹੋਰ ਕਾਰਨ ਹੋ ਸਕਦੇ ਹਨ।", mr: "पाण्याची कमतरता किंवा इतर कारणे असू शकतात.", en: "It can rise with low water intake or other reasons." },
    low_meaning: { hi: "यह खून की कमी (एनीमिया) की ओर इशारा कर सकता है।", pa: "ਇਹ ਖ਼ੂਨ ਦੀ ਘਾਟ (ਅਨੀਮੀਆ) ਵੱਲ ਇਸ਼ਾਰਾ ਕਰ ਸਕਦਾ ਹੈ।", mr: "हे रक्ताच्या कमतरतेकडे (अ‍ॅनिमिया) इशारा करू शकते.", en: "It can point to low blood (anaemia)." },
    questions: {
      high: [{ hi: "मेरा हीमोग्लोबिन ज़्यादा क्यों है?", pa: "ਮੇਰਾ ਹੀਮੋਗਲੋਬਿਨ ਵੱਧ ਕਿਉਂ ਹੈ?", mr: "माझे हिमोग्लोबिन जास्त का आहे?", en: "Why is my hemoglobin high?" }],
      low: [
        { hi: "क्या मुझे खून की कमी है? इसका कारण क्या है?", pa: "ਕੀ ਮੈਨੂੰ ਖ਼ੂਨ ਦੀ ਘਾਟ ਹੈ? ਇਸ ਦਾ ਕਾਰਨ ਕੀ ਹੈ?", mr: "मला रक्ताची कमतरता आहे का? याचे कारण काय?", en: "Do I have anaemia? What is causing it?" },
      ],
    },
  },
  {
    key: "fasting_sugar",
    name: { hi: "खाली पेट शुगर", pa: "ਖ਼ਾਲੀ ਪੇਟ ਸ਼ੂਗਰ", mr: "उपाशीपोटी साखर", en: "Fasting Blood Sugar" },
    aliases: ["fasting blood sugar", "fbs", "fasting glucose", "glucose fasting", "glucose (fasting)", "blood sugar fasting", "fasting plasma glucose", "fpg", "blood glucose fasting", "sugar fasting"],
    unit: "mg/dL",
    units: ["mg/dl", "mg%"],
    conversions: [{ units: ["mmol/l"], toCanonical: (v) => v * 18 }],
    // ADA: normal 70–99, prediabetes 100–125, diabetes range ≥126
    band: () => b(70, 99, 54, 125),
    about: { hi: "सुबह खाली पेट खून में शुगर", pa: "ਸਵੇਰੇ ਖ਼ਾਲੀ ਪੇਟ ਖ਼ੂਨ ਵਿੱਚ ਸ਼ੂਗਰ", mr: "सकाळी उपाशीपोटी रक्तातील साखर", en: "Morning sugar level before eating" },
    high_meaning: { hi: "बढ़ी शुगर डायबिटीज़ या उसकी शुरुआत का संकेत हो सकती है।", pa: "ਵਧੀ ਸ਼ੂਗਰ ਡਾਇਬਟੀਜ਼ ਜਾਂ ਉਸਦੀ ਸ਼ੁਰੂਆਤ ਦਾ ਸੰਕੇਤ ਹੋ ਸਕਦੀ ਹੈ।", mr: "वाढलेली साखर मधुमेह किंवा त्याच्या सुरुवातीचे लक्षण असू शकते.", en: "High sugar can point to diabetes or early signs of it." },
    low_meaning: { hi: "कम शुगर से चक्कर या कमज़ोरी हो सकती है।", pa: "ਘੱਟ ਸ਼ੂਗਰ ਨਾਲ ਚੱਕਰ ਜਾਂ ਕਮਜ਼ੋਰੀ ਹੋ ਸਕਦੀ ਹੈ।", mr: "कमी साखरेमुळे चक्कर किंवा अशक्तपणा येऊ शकतो.", en: "Low sugar can cause dizziness or weakness." },
    questions: {
      high: [
        { hi: "क्या मुझे डायबिटीज़ का ख़तरा है?", pa: "ਕੀ ਮੈਨੂੰ ਡਾਇਬਟੀਜ਼ ਦਾ ਖ਼ਤਰਾ ਹੈ?", mr: "मला मधुमेहाचा धोका आहे का?", en: "Am I at risk of diabetes?" },
        { hi: "क्या शुगर की दोबारा जाँच होनी चाहिए?", pa: "ਕੀ ਸ਼ੂਗਰ ਦੀ ਦੁਬਾਰਾ ਜਾਂਚ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ?", mr: "साखरेची पुन्हा तपासणी करावी का?", en: "Should my sugar be tested again?" },
      ],
      low: [{ hi: "मेरी शुगर कम क्यों है?", pa: "ਮੇਰੀ ਸ਼ੂਗਰ ਘੱਟ ਕਿਉਂ ਹੈ?", mr: "माझी साखर कमी का आहे?", en: "Why is my sugar low?" }],
    },
  },
  {
    key: "hba1c",
    name: { hi: "HbA1c (3 महीने की शुगर)", pa: "HbA1c (3 ਮਹੀਨੇ ਦੀ ਸ਼ੂਗਰ)", mr: "HbA1c (3 महिन्यांची साखर)", en: "HbA1c (3-month sugar)" },
    aliases: ["hba1c", "glycated hemoglobin", "glycated haemoglobin", "glycosylated hemoglobin", "a1c", "hb a1c"],
    unit: "%",
    units: ["%", "percent"],
    conversions: [{ units: ["mmol/mol"], toCanonical: (v) => v / 10.929 + 2.15 }],
    // normal <5.7, critical >8.5
    band: () => b(4.0, 5.6, 3.0, 8.5),
    about: { hi: "पिछले 2–3 महीनों की औसत शुगर", pa: "ਪਿਛਲੇ 2–3 ਮਹੀਨਿਆਂ ਦੀ ਔਸਤ ਸ਼ੂਗਰ", mr: "मागील 2–3 महिन्यांची सरासरी साखर", en: "Average sugar over the last 2–3 months" },
    high_meaning: { hi: "लंबे समय से शुगर ज़्यादा रही है।", pa: "ਲੰਮੇ ਸਮੇਂ ਤੋਂ ਸ਼ੂਗਰ ਵੱਧ ਰਹੀ ਹੈ।", mr: "बराच काळ साखर जास्त राहिली आहे.", en: "Sugar has stayed high for a long time." },
    low_meaning: { hi: "आमतौर पर चिंता नहीं, पर डॉक्टर से पूछें।", pa: "ਆਮ ਤੌਰ 'ਤੇ ਫ਼ਿਕਰ ਨਹੀਂ, ਪਰ ਡਾਕਟਰ ਨੂੰ ਪੁੱਛੋ।", mr: "सहसा काळजी नाही, पण डॉक्टरांना विचारा.", en: "Usually not a worry, but ask your doctor." },
    questions: {
      high: [
        { hi: "मेरी शुगर कितनी नियंत्रित है?", pa: "ਮੇਰੀ ਸ਼ੂਗਰ ਕਿੰਨੀ ਕਾਬੂ ਵਿੱਚ ਹੈ?", mr: "माझी साखर किती नियंत्रणात आहे?", en: "How well controlled is my sugar?" },
        { hi: "क्या आँखों, पैरों और किडनी की जाँच भी होनी चाहिए?", pa: "ਕੀ ਅੱਖਾਂ, ਪੈਰਾਂ ਅਤੇ ਗੁਰਦਿਆਂ ਦੀ ਜਾਂਚ ਵੀ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ?", mr: "डोळे, पाय आणि किडनीची तपासणीही करावी का?", en: "Should my eyes, feet and kidneys also be checked?" },
      ],
      low: [{ hi: "क्या कम HbA1c किसी बात का संकेत है?", pa: "ਕੀ ਘੱਟ HbA1c ਕਿਸੇ ਗੱਲ ਦਾ ਸੰਕੇਤ ਹੈ?", mr: "कमी HbA1c चा काही अर्थ आहे का?", en: "Does a low HbA1c mean anything?" }],
    },
  },
  {
    key: "creatinine",
    name: { hi: "क्रिएटिनिन (किडनी)", pa: "ਕ੍ਰੀਏਟੀਨਿਨ (ਗੁਰਦੇ)", mr: "क्रिएटिनिन (किडनी)", en: "Serum Creatinine (kidney)" },
    aliases: ["creatinine", "serum creatinine", "s. creatinine", "s creatinine", "creat"],
    unit: "mg/dL",
    units: ["mg/dl", "mg%"],
    conversions: [{ units: ["umol/l", "µmol/l", "micromol/l"], toCanonical: (v) => v / 88.4 }],
    // critical >2.0
    band: (p) => (p.sex === "F" ? b(0.6, 1.1, 0.4, 2.0) : p.sex === "M" ? b(0.7, 1.3, 0.4, 2.0) : b(0.6, 1.3, 0.4, 2.0)),
    about: { hi: "किडनी खून को कितना साफ़ कर रही है", pa: "ਗੁਰਦੇ ਖ਼ੂਨ ਨੂੰ ਕਿੰਨਾ ਸਾਫ਼ ਕਰ ਰਹੇ ਹਨ", mr: "किडनी रक्त किती स्वच्छ करते", en: "How well your kidneys clean your blood" },
    high_meaning: { hi: "यह किडनी पर दबाव का संकेत हो सकता है।", pa: "ਇਹ ਗੁਰਦਿਆਂ 'ਤੇ ਦਬਾਅ ਦਾ ਸੰਕੇਤ ਹੋ ਸਕਦਾ ਹੈ।", mr: "हे किडनीवरील ताणाचे लक्षण असू शकते.", en: "It can point to stress on the kidneys." },
    low_meaning: { hi: "आमतौर पर कम मांसपेशियों से जुड़ा होता है।", pa: "ਆਮ ਤੌਰ 'ਤੇ ਘੱਟ ਮਾਸਪੇਸ਼ੀਆਂ ਨਾਲ ਜੁੜਿਆ ਹੁੰਦਾ ਹੈ।", mr: "सहसा कमी स्नायूंशी संबंधित असते.", en: "Usually linked to lower muscle mass." },
    questions: {
      high: [
        { hi: "क्या मेरी किडनी ठीक काम कर रही है?", pa: "ਕੀ ਮੇਰੇ ਗੁਰਦੇ ਠੀਕ ਕੰਮ ਕਰ ਰਹੇ ਹਨ?", mr: "माझी किडनी नीट काम करते का?", en: "Are my kidneys working properly?" },
        { hi: "क्या मेरी अभी की दवाइयाँ किडनी के लिए ठीक हैं?", pa: "ਕੀ ਮੇਰੀਆਂ ਹੁਣ ਦੀਆਂ ਦਵਾਈਆਂ ਗੁਰਦਿਆਂ ਲਈ ਠੀਕ ਹਨ?", mr: "माझी सध्याची औषधे किडनीसाठी सुरक्षित आहेत का?", en: "Are my current medicines safe for my kidneys?" },
      ],
      low: [{ hi: "क्या कम क्रिएटिनिन चिंता की बात है?", pa: "ਕੀ ਘੱਟ ਕ੍ਰੀਏਟੀਨਿਨ ਫ਼ਿਕਰ ਦੀ ਗੱਲ ਹੈ?", mr: "कमी क्रिएटिनिन काळजीचे आहे का?", en: "Is low creatinine a concern?" }],
    },
  },
  {
    key: "total_cholesterol",
    name: { hi: "कुल कोलेस्ट्रॉल", pa: "ਕੁੱਲ ਕੋਲੈਸਟ੍ਰੋਲ", mr: "एकूण कोलेस्ट्रॉल", en: "Total Cholesterol" },
    aliases: ["total cholesterol", "cholesterol", "cholesterol total", "serum cholesterol"],
    unit: "mg/dL",
    units: ["mg/dl", "mg%"],
    conversions: [{ units: ["mmol/l"], toCanonical: (v) => v * 38.67 }],
    band: () => b(125, 199, 100, 239),
    about: { hi: "खून में चर्बी की मात्रा", pa: "ਖ਼ੂਨ ਵਿੱਚ ਚਰਬੀ ਦੀ ਮਾਤਰਾ", mr: "रक्तातील चरबीचे प्रमाण", en: "Amount of fat in your blood" },
    high_meaning: { hi: "ज़्यादा कोलेस्ट्रॉल दिल पर असर डाल सकता है।", pa: "ਵੱਧ ਕੋਲੈਸਟ੍ਰੋਲ ਦਿਲ 'ਤੇ ਅਸਰ ਪਾ ਸਕਦਾ ਹੈ।", mr: "जास्त कोलेस्ट्रॉलचा हृदयावर परिणाम होऊ शकतो.", en: "High cholesterol can affect heart health." },
    low_meaning: { hi: "कम कोलेस्ट्रॉल के बारे में डॉक्टर से पूछें।", pa: "ਘੱਟ ਕੋਲੈਸਟ੍ਰੋਲ ਬਾਰੇ ਡਾਕਟਰ ਨੂੰ ਪੁੱਛੋ।", mr: "कमी कोलेस्ट्रॉलबद्दल डॉक्टरांना विचारा.", en: "Ask your doctor about low cholesterol." },
    questions: {
      high: [{ hi: "क्या मेरे दिल की जाँच होनी चाहिए?", pa: "ਕੀ ਮੇਰੇ ਦਿਲ ਦੀ ਜਾਂਚ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ?", mr: "माझ्या हृदयाची तपासणी करावी का?", en: "Should my heart be checked?" }],
      low: [{ hi: "मेरा कोलेस्ट्रॉल कम क्यों है?", pa: "ਮੇਰਾ ਕੋਲੈਸਟ੍ਰੋਲ ਘੱਟ ਕਿਉਂ ਹੈ?", mr: "माझे कोलेस्ट्रॉल कमी का आहे?", en: "Why is my cholesterol low?" }],
    },
  },
  {
    key: "tsh",
    name: { hi: "TSH (थायरॉइड)", pa: "TSH (ਥਾਇਰਾਇਡ)", mr: "TSH (थायरॉईड)", en: "TSH (thyroid)" },
    aliases: ["tsh", "thyroid stimulating hormone", "ultrasensitive tsh", "tsh ultrasensitive"],
    unit: "µIU/mL",
    units: ["uiu/ml", "miu/l", "mu/l", "uu/ml", "uiu/l"],
    // upper limit rises in people aged 70+
    band: (p) => (p.age !== null && p.age >= 70 ? b(0.4, 6.0, 0.1, 10) : b(0.4, 4.5, 0.1, 10)),
    about: { hi: "थायरॉइड ग्रंथि का काम", pa: "ਥਾਇਰਾਇਡ ਗ੍ਰੰਥੀ ਦਾ ਕੰਮ", mr: "थायरॉईड ग्रंथीचे काम", en: "How your thyroid gland is working" },
    high_meaning: { hi: "थायरॉइड धीमा होने का संकेत हो सकता है।", pa: "ਥਾਇਰਾਇਡ ਹੌਲੀ ਹੋਣ ਦਾ ਸੰਕੇਤ ਹੋ ਸਕਦਾ ਹੈ।", mr: "थायरॉईड मंद असल्याचे लक्षण असू शकते.", en: "It can point to a slow thyroid." },
    low_meaning: { hi: "थायरॉइड तेज़ होने का संकेत हो सकता है।", pa: "ਥਾਇਰਾਇਡ ਤੇਜ਼ ਹੋਣ ਦਾ ਸੰਕੇਤ ਹੋ ਸਕਦਾ ਹੈ।", mr: "थायरॉईड जास्त सक्रिय असल्याचे लक्षण असू शकते.", en: "It can point to an overactive thyroid." },
    questions: {
      high: [{ hi: "क्या थायरॉइड की और जाँच चाहिए?", pa: "ਕੀ ਥਾਇਰਾਇਡ ਦੀ ਹੋਰ ਜਾਂਚ ਚਾਹੀਦੀ ਹੈ?", mr: "थायरॉईडची आणखी तपासणी हवी का?", en: "Do I need more thyroid tests?" }],
      low: [{ hi: "क्या थायरॉइड की और जाँच चाहिए?", pa: "ਕੀ ਥਾਇਰਾਇਡ ਦੀ ਹੋਰ ਜਾਂਚ ਚਾਹੀਦੀ ਹੈ?", mr: "थायरॉईडची आणखी तपासणी हवी का?", en: "Do I need more thyroid tests?" }],
    },
  },
  {
    key: "vitamin_d",
    name: { hi: "विटामिन D", pa: "ਵਿਟਾਮਿਨ D", mr: "व्हिटॅमिन D", en: "Vitamin D" },
    aliases: ["vitamin d", "vit d", "25-oh vitamin d", "25 oh vitamin d", "25 hydroxy vitamin d", "vitamin d3", "25(oh)d", "vitamin d total"],
    unit: "ng/mL",
    units: ["ng/ml"],
    conversions: [{ units: ["nmol/l"], toCanonical: (v) => v / 2.496 }],
    band: () => b(30, 100, 12, 150),
    about: { hi: "हड्डियों और मांसपेशियों के लिए ज़रूरी", pa: "ਹੱਡੀਆਂ ਅਤੇ ਮਾਸਪੇਸ਼ੀਆਂ ਲਈ ਜ਼ਰੂਰੀ", mr: "हाडे आणि स्नायूंसाठी आवश्यक", en: "Needed for bones and muscles" },
    high_meaning: { hi: "बहुत ज़्यादा विटामिन D के बारे में डॉक्टर से बात करें।", pa: "ਬਹੁਤ ਵੱਧ ਵਿਟਾਮਿਨ D ਬਾਰੇ ਡਾਕਟਰ ਨਾਲ ਗੱਲ ਕਰੋ।", mr: "खूप जास्त व्हिटॅमिन D बद्दल डॉक्टरांशी बोला.", en: "Talk to your doctor about very high vitamin D." },
    low_meaning: { hi: "कम विटामिन D से हड्डियाँ कमज़ोर हो सकती हैं।", pa: "ਘੱਟ ਵਿਟਾਮਿਨ D ਨਾਲ ਹੱਡੀਆਂ ਕਮਜ਼ੋਰ ਹੋ ਸਕਦੀਆਂ ਹਨ।", mr: "कमी व्हिटॅमिन D मुळे हाडे कमकुवत होऊ शकतात.", en: "Low vitamin D can weaken bones." },
    questions: {
      high: [{ hi: "मेरा विटामिन D ज़्यादा क्यों है?", pa: "ਮੇਰਾ ਵਿਟਾਮਿਨ D ਵੱਧ ਕਿਉਂ ਹੈ?", mr: "माझे व्हिटॅमिन D जास्त का आहे?", en: "Why is my vitamin D high?" }],
      low: [{ hi: "मेरा विटामिन D कैसे ठीक होगा?", pa: "ਮੇਰਾ ਵਿਟਾਮਿਨ D ਕਿਵੇਂ ਠੀਕ ਹੋਵੇਗਾ?", mr: "माझे व्हिटॅमिन D कसे सुधारेल?", en: "How can my vitamin D be improved?" }],
    },
  },
  {
    key: "vitamin_b12",
    name: { hi: "विटामिन B12", pa: "ਵਿਟਾਮਿਨ B12", mr: "व्हिटॅमिन B12", en: "Vitamin B12" },
    aliases: ["vitamin b12", "vit b12", "b12", "cobalamin", "cyanocobalamin"],
    unit: "pg/mL",
    units: ["pg/ml", "ng/l"],
    conversions: [{ units: ["pmol/l"], toCanonical: (v) => v * 1.355 }],
    band: () => b(200, 900, 150, 1500),
    about: { hi: "नसों और खून बनने के लिए ज़रूरी", pa: "ਨਸਾਂ ਅਤੇ ਖ਼ੂਨ ਬਣਨ ਲਈ ਜ਼ਰੂਰੀ", mr: "नसा आणि रक्त तयार होण्यासाठी आवश्यक", en: "Needed for nerves and making blood" },
    high_meaning: { hi: "ज़्यादा B12 के बारे में डॉक्टर से पूछें।", pa: "ਵੱਧ B12 ਬਾਰੇ ਡਾਕਟਰ ਨੂੰ ਪੁੱਛੋ।", mr: "जास्त B12 बद्दल डॉक्टरांना विचारा.", en: "Ask your doctor about high B12." },
    low_meaning: { hi: "कम B12 से थकान या झुनझुनी हो सकती है।", pa: "ਘੱਟ B12 ਨਾਲ ਥਕਾਵਟ ਜਾਂ ਝਰਨਾਹਟ ਹੋ ਸਕਦੀ ਹੈ।", mr: "कमी B12 मुळे थकवा किंवा मुंग्या येऊ शकतात.", en: "Low B12 can cause tiredness or tingling." },
    questions: {
      high: [{ hi: "मेरा B12 ज़्यादा क्यों है?", pa: "ਮੇਰਾ B12 ਵੱਧ ਕਿਉਂ ਹੈ?", mr: "माझे B12 जास्त का आहे?", en: "Why is my B12 high?" }],
      low: [{ hi: "मेरा B12 कम क्यों है?", pa: "ਮੇਰਾ B12 ਘੱਟ ਕਿਉਂ ਹੈ?", mr: "माझे B12 कमी का आहे?", en: "Why is my B12 low?" }],
    },
  },
  {
    key: "platelets",
    name: { hi: "प्लेटलेट्स", pa: "ਪਲੇਟਲੈਟਸ", mr: "प्लेटलेट्स", en: "Platelet Count" },
    aliases: ["platelet count", "platelets", "platelet", "plt"],
    unit: "lakh/µL",
    units: ["lakh/ul", "lakhs/ul", "lakh/cumm", "lakhs/cumm", "lakh/mm3"],
    conversions: [
      { units: ["/ul", "/cumm", "cells/ul", "/mm3", "cells/cumm"], toCanonical: (v) => v / 100000 },
      { units: ["10^3/ul", "x10^3/ul", "thou/ul", "10*3/ul", "k/ul", "10^9/l", "x10^9/l"], toCanonical: (v) => v / 100 },
    ],
    band: () => b(1.5, 4.5, 1.0, 6.0),
    about: { hi: "खून को जमने में मदद करते हैं", pa: "ਖ਼ੂਨ ਨੂੰ ਜੰਮਣ ਵਿੱਚ ਮਦਦ ਕਰਦੇ ਹਨ", mr: "रक्त गोठण्यास मदत करतात", en: "Help your blood to clot" },
    high_meaning: { hi: "ज़्यादा प्लेटलेट्स के बारे में डॉक्टर से बात करें।", pa: "ਵੱਧ ਪਲੇਟਲੈਟਸ ਬਾਰੇ ਡਾਕਟਰ ਨਾਲ ਗੱਲ ਕਰੋ।", mr: "जास्त प्लेटलेट्सबद्दल डॉक्टरांशी बोला.", en: "Talk to your doctor about high platelets." },
    low_meaning: { hi: "कम प्लेटलेट्स से खून आसानी से बह सकता है।", pa: "ਘੱਟ ਪਲੇਟਲੈਟਸ ਨਾਲ ਖ਼ੂਨ ਸੌਖਾ ਵਗ ਸਕਦਾ ਹੈ।", mr: "कमी प्लेटलेट्समुळे रक्तस्राव सहज होऊ शकतो.", en: "Low platelets can make bleeding easier." },
    questions: {
      high: [{ hi: "मेरे प्लेटलेट्स ज़्यादा क्यों हैं?", pa: "ਮੇਰੇ ਪਲੇਟਲੈਟਸ ਵੱਧ ਕਿਉਂ ਹਨ?", mr: "माझे प्लेटलेट्स जास्त का आहेत?", en: "Why are my platelets high?" }],
      low: [{ hi: "मेरे प्लेटलेट्स कम क्यों हैं? क्या दोबारा जाँच ज़रूरी है?", pa: "ਮੇਰੇ ਪਲੇਟਲੈਟਸ ਘੱਟ ਕਿਉਂ ਹਨ? ਕੀ ਦੁਬਾਰਾ ਜਾਂਚ ਜ਼ਰੂਰੀ ਹੈ?", mr: "माझे प्लेटलेट्स कमी का? पुन्हा तपासणी हवी का?", en: "Why are my platelets low? Is a repeat test needed?" }],
    },
  },
  {
    key: "uric_acid",
    name: { hi: "यूरिक एसिड", pa: "ਯੂਰਿਕ ਐਸਿਡ", mr: "युरिक अ‍ॅसिड", en: "Uric Acid" },
    aliases: ["uric acid", "serum uric acid"],
    unit: "mg/dL",
    units: ["mg/dl", "mg%"],
    conversions: [{ units: ["umol/l", "µmol/l"], toCanonical: (v) => v / 59.48 }],
    band: (p) => (p.sex === "F" ? b(2.6, 6.0, 2.0, 9.0) : p.sex === "M" ? b(3.5, 7.2, 2.0, 9.0) : b(2.6, 7.2, 2.0, 9.0)),
    about: { hi: "शरीर का अपशिष्ट जो किडनी से निकलता है", pa: "ਸਰੀਰ ਦਾ ਫ਼ਾਲਤੂ ਪਦਾਰਥ ਜੋ ਗੁਰਦਿਆਂ ਰਾਹੀਂ ਨਿਕਲਦਾ ਹੈ", mr: "किडनीतून बाहेर पडणारा शरीरातील टाकाऊ पदार्थ", en: "A waste product cleared by the kidneys" },
    high_meaning: { hi: "ज़्यादा यूरिक एसिड से जोड़ों में दर्द हो सकता है।", pa: "ਵੱਧ ਯੂਰਿਕ ਐਸਿਡ ਨਾਲ ਜੋੜਾਂ ਵਿੱਚ ਦਰਦ ਹੋ ਸਕਦਾ ਹੈ।", mr: "जास्त युरिक अ‍ॅसिडमुळे सांधेदुखी होऊ शकते.", en: "High uric acid can cause joint pain." },
    low_meaning: { hi: "कम यूरिक एसिड आमतौर पर चिंता की बात नहीं।", pa: "ਘੱਟ ਯੂਰਿਕ ਐਸਿਡ ਆਮ ਤੌਰ 'ਤੇ ਫ਼ਿਕਰ ਦੀ ਗੱਲ ਨਹੀਂ।", mr: "कमी युरिक अ‍ॅसिड सहसा काळजीचे नसते.", en: "Low uric acid is usually not a worry." },
    questions: {
      high: [{ hi: "क्या जोड़ों के दर्द का कारण यूरिक एसिड है?", pa: "ਕੀ ਜੋੜਾਂ ਦੇ ਦਰਦ ਦਾ ਕਾਰਨ ਯੂਰਿਕ ਐਸਿਡ ਹੈ?", mr: "सांधेदुखीचे कारण युरिक अ‍ॅसिड आहे का?", en: "Could uric acid be causing joint pain?" }],
      low: [{ hi: "क्या कम यूरिक एसिड चिंता की बात है?", pa: "ਕੀ ਘੱਟ ਯੂਰਿਕ ਐਸਿਡ ਫ਼ਿਕਰ ਦੀ ਗੱਲ ਹੈ?", mr: "कमी युरिक अ‍ॅसिड काळजीचे आहे का?", en: "Is low uric acid a concern?" }],
    },
  },
];

function normalise(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9()% ]+/g, " ").replace(/\s+/g, " ").trim();
}

export function normaliseUnit(unit: string) {
  return unit.toLowerCase().replace(/µ|μ/g, "u").replace(/\s+/g, "").replace(/cu\.?mm/, "cumm");
}

export function findTest(name: string): ClinicalTest | undefined {
  const n = normalise(name);
  if (!n) return undefined;
  const exact = CLINICAL_DB.find((t) => t.aliases.some((a) => normalise(a) === n));
  if (exact) return exact;
  let best: { test: ClinicalTest; len: number } | undefined;
  for (const t of CLINICAL_DB) {
    for (const a of t.aliases) {
      const na = normalise(a);
      if (na.length < 3) continue;
      const re = new RegExp(`(^|[^a-z0-9])${na.replace(/[()]/g, "\\$&")}($|[^a-z0-9])`);
      if (re.test(n) && (!best || na.length > best.len)) best = { test: t, len: na.length };
    }
  }
  return best?.test;
}

export function getTestByKey(key: string): ClinicalTest | undefined {
  return CLINICAL_DB.find((t) => t.key === key);
}

/** Converts a value into the table's unit. Returns null when the unit is unknown. */
export function toCanonical(test: ClinicalTest, value: number, unit: string): number | null {
  const u = normaliseUnit(unit);
  if (!u || u === normaliseUnit(test.unit) || test.units.includes(u)) return value;
  for (const c of test.conversions ?? []) if (c.units.includes(u)) return Math.round(c.toCanonical(value) * 100) / 100;
  return null;
}
