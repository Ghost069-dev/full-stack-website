import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "hi" | "en";

const STORAGE_KEY = "sehat-saathi-lang";

const dict = {
  brandTagline: { hi: "रिपोर्ट समझो, दवाई डॉक्टर से पूछो", en: "Healthcare made understandable for every Indian" },
  navCheck: { hi: "रिपोर्ट जाँचें", en: "Check report" },
  navHow: { hi: "कैसे काम करता है", en: "How it works" },
  navWhy: { hi: "हम अलग क्यों", en: "Why us" },
  langLabel: { hi: "भाषा बदलें", en: "Change language" },

  heroEyebrow: { hi: "डॉक्टर-पहले स्वास्थ्य साथी", en: "Doctor-first health companion" },
  heroTitle: { hi: "रिपोर्ट समझो, दवाई डॉक्टर से पूछो।", en: "Report Samjho, Dawai Doctor Se Poochho." },
  heroSub: {
    hi: "अपनी लैब रिपोर्ट अपलोड करें या जाँच के नंबर डालें — और अपनी सेहत को आसान हिंदी में समझें, बिना घबराहट या उलझन के।",
    en: "Upload your lab report or enter test values to understand your health in simple Hindi — without panic or confusion.",
  },
  ctaUpload: { hi: "लैब रिपोर्ट अपलोड करें (PDF/फ़ोटो)", en: "Upload Lab Report (PDF/Photo)" },
  ctaSample: { hi: "सैंपल रिपोर्ट देखें (डेमो)", en: "Try Sample Report (Demo)" },
  heroTrust1: { hi: "हरा · पीला · लाल ज़ोन", en: "Green · Yellow · Red zones" },
  heroTrust2: { hi: "सुनकर समझें", en: "Listen aloud" },
  heroTrust3: { hi: "कभी दवाई की सलाह नहीं", en: "Never a prescription" },

  step1Title: { hi: "चरण 1: अपनी रिपोर्ट दें", en: "Step 1: Add your report" },
  step1Sub: { hi: "फ़ोटो/PDF अपलोड करें, नंबर ख़ुद डालें, या सैंपल रिपोर्ट से आज़माएँ।", en: "Upload a photo/PDF, type the values yourself, or try the sample report." },
  tabUpload: { hi: "अपलोड करें", en: "Upload" },
  tabManual: { hi: "नंबर ख़ुद डालें", en: "Enter values" },
  dropTitle: { hi: "रिपोर्ट की फ़ोटो या PDF यहाँ डालें", en: "Drop a photo or PDF of your report here" },
  dropOr: { hi: "या", en: "or" },
  dropChoose: { hi: "फ़ाइल चुनें", en: "Choose file" },
  dropHint: { hi: "JPG, PNG या PDF · 8 MB तक · साफ़ और सीधी फ़ोटो लें", en: "JPG, PNG or PDF · up to 8 MB · take a clear, straight photo" },
  sampleBtn: { hi: "सैंपल रिपोर्ट लोड करें (रमेश जी, उम्र 62)", en: "Load Sample Report (Ramesh Ji, Age 62)" },
  privacyNote: { hi: "आपकी रिपोर्ट सिर्फ़ पढ़ने के लिए उपयोग होती है, सेव नहीं की जाती।", en: "Your report is only used to read the values — it is not saved." },

  scan1: { hi: "रिपोर्ट पढ़ी जा रही है…", en: "Reading your report…" },
  scan2: { hi: "जाँच के नंबर ढूँढे जा रहे हैं…", en: "Finding test values…" },
  scan3: { hi: "सामान्य सीमा से मिलान हो रहा है…", en: "Comparing with normal ranges…" },
  scan4: { hi: "आसान भाषा में समझाया जा रहा है…", en: "Explaining in simple words…" },

  manualTest: { hi: "जाँच का नाम", en: "Test name" },
  manualPick: { hi: "जाँच चुनें", en: "Choose a test" },
  manualOther: { hi: "दूसरी जाँच (नाम लिखें)", en: "Other test (type name)" },
  manualOtherName: { hi: "जाँच का नाम लिखें", en: "Type the test name" },
  manualValue: { hi: "आपका नंबर", en: "Your value" },
  manualUnit: { hi: "इकाई", en: "Unit" },
  manualLow: { hi: "सामान्य से कम नहीं", en: "Normal from" },
  manualHigh: { hi: "सामान्य तक", en: "Normal up to" },
  manualAdd: { hi: "एक और जाँच जोड़ें", en: "Add another test" },
  manualRemove: { hi: "हटाएँ", en: "Remove" },
  manualSubmit: { hi: "मेरा नतीजा दिखाएँ", en: "Show my results" },
  manualHint: { hi: "सामान्य सीमा आपकी रिपोर्ट पर \"Reference Range\" के पास लिखी होती है।", en: "The normal range is printed next to \"Reference Range\" on your report." },
  manualInvalid: { hi: "कृपया हर जाँच का नाम, नंबर और सामान्य सीमा सही भरें।", en: "Please fill in each test's name, value and normal range correctly." },

  resultsTitle: { hi: "चरण 2: आपकी रिपोर्ट का ज़ोन डैशबोर्ड", en: "Step 2: Your report zone dashboard" },
  resultsFor: { hi: "रिपोर्ट", en: "Report for" },
  resultsAge: { hi: "उम्र", en: "Age" },
  resultsSampleTag: { hi: "सैंपल रिपोर्ट (काल्पनिक डेटा)", en: "Sample report (fictional data)" },
  resultsCheckValues: {
    hi: "ये नंबर अपने-आप पढ़े गए हैं — कृपया अपनी काग़ज़ी रिपोर्ट से मिलाकर देखें।",
    en: "These values were read automatically — please check them against your paper report.",
  },
  editValues: { hi: "नंबर बदलें", en: "Edit values" },
  startOver: { hi: "नई रिपोर्ट", en: "New report" },
  summaryRed: { hi: "कुछ जाँचें लाल ज़ोन में हैं — कृपया जल्द डॉक्टर से मिलें।", en: "Some tests are in the Red Zone — please see a doctor soon." },
  summaryYellow: { hi: "कुछ जाँचें पीले ज़ोन में हैं — अगली बार डॉक्टर से बात करें।", en: "Some tests are in the Yellow Zone — discuss them with your doctor." },
  summaryGreen: { hi: "सभी जाँचें हरे ज़ोन में हैं — लैब की सामान्य सीमा के अंदर।", en: "All tests are in the Green Zone — within the lab's normal range." },
  countGreen: { hi: "हरा", en: "Green" },
  countYellow: { hi: "पीला", en: "Yellow" },
  countRed: { hi: "लाल", en: "Red" },
  yourValue: { hi: "आपका नंबर", en: "Your value" },
  normalRange: { hi: "सामान्य सीमा", en: "Normal range" },
  listen: { hi: "🔊 सुनिए", en: "🔊 Listen" },
  stop: { hi: "⏹ रोकें", en: "⏹ Stop" },
  listenAll: { hi: "🔊 पूरी रिपोर्ट सुनिए", en: "🔊 Listen to full report" },
  noVoice: { hi: "आपके फ़ोन/ब्राउज़र में आवाज़ की सुविधा नहीं है।", en: "Read-aloud isn't available on this phone/browser." },

  zoneGreenTitle: { hi: "हरा ज़ोन — सामान्य", en: "Green Zone — Normal" },
  zoneGreenLabel: { hi: "सामान्य स्तर", en: "Within Reference Range" },
  zoneYellowTitle: { hi: "पीला ज़ोन — डॉक्टर से बात करें", en: "Yellow Zone — Discuss with Doctor" },
  zoneYellowLabel: { hi: "सीमा से थोड़ा बाहर — डॉक्टर से बात करें", en: "Slightly Outside Range — Discuss with Doctor" },
  zoneRedTitle: { hi: "लाल ज़ोन — तुरंत इलाज ज़रूरी", en: "Red Zone — Seek Prompt Care" },
  zoneRedLabel: { hi: "सीमा से काफ़ी बाहर — जल्द डॉक्टर को दिखाएँ", en: "Far Outside Range — Seek Prompt Care" },

  safetyTitle: { hi: "⚠️ सुरक्षा नियम", en: "⚠️ Safety Rule" },
  safetyBody: {
    hi: "सेहत साथी कभी भी दवाई या इलाज की सलाह नहीं देता। कृपया ख़ुद से दवाई न लें — हमेशा डॉक्टर से पूछें।",
    en: "Sehat Saathi never gives medicine or treatment advice. Please don't take medicines on your own — always ask a doctor.",
  },
  safetyMotto: { hi: "AI समझाता है। डॉक्टर तय करते हैं। AI कभी दवाई नहीं लिखता।", en: "AI explains. Doctors decide. Never an AI prescription." },

  step3Title: { hi: "चरण 3: डॉक्टर से ये सवाल पूछें", en: "Step 3: Questions to ask your doctor" },
  step3Sub: { hi: "क्लिनिक जाते समय यह सूची साथ रखें। पूछे गए सवालों पर ✓ लगाएँ।", en: "Keep this list with you at the clinic. Tick each question once asked." },
  step3None: { hi: "सभी जाँचें सामान्य हैं। फिर भी अपनी नियमित जाँच डॉक्टर के साथ ज़रूर करें।", en: "All tests look normal. Still, keep up your regular check-ups with your doctor." },
  printList: { hi: "सूची प्रिंट करें", en: "Print list" },

  consultCta: { hi: "योग्य डॉक्टर से सलाह लें", en: "Consult a Qualified Doctor" },
  consultBand: { hi: "हर सफ़र डॉक्टर पर ख़त्म होता है — कभी दवाई की पर्ची पर नहीं।", en: "Every journey ends with a doctor — never a prescription." },
  consultTitle: { hi: "डॉक्टर से सलाह बुक करें", en: "Book a doctor consultation" },
  consultSub: { hi: "अपनी जानकारी दें। हमारी टीम आपको कॉल करके समय पक्का करेगी।", en: "Share your details. Our team will call you to confirm a time." },
  fName: { hi: "मरीज़ का नाम", en: "Patient name" },
  fPhone: { hi: "मोबाइल नंबर", en: "Mobile number" },
  fAge: { hi: "उम्र", en: "Age" },
  fMode: { hi: "सलाह कैसे चाहिए?", en: "How would you like to consult?" },
  modeVideo: { hi: "वीडियो कॉल", en: "Video call" },
  modePhone: { hi: "फ़ोन कॉल", en: "Phone call" },
  modeClinic: { hi: "क्लिनिक जाकर", en: "Clinic visit" },
  fDate: { hi: "पसंदीदा तारीख़", en: "Preferred date" },
  fSlot: { hi: "पसंदीदा समय", en: "Preferred time" },
  slotMorning: { hi: "सुबह", en: "Morning" },
  slotAfternoon: { hi: "दोपहर", en: "Afternoon" },
  slotEvening: { hi: "शाम", en: "Evening" },
  fConcerns: { hi: "डॉक्टर से क्या पूछना है?", en: "What would you like to ask the doctor?" },
  fSubmit: { hi: "बुकिंग भेजें", en: "Send booking" },
  fSending: { hi: "भेजा जा रहा है…", en: "Sending…" },
  bookedTitle: { hi: "आपकी बुकिंग मिल गई है 🙏", en: "Your booking is received 🙏" },
  bookedBody: { hi: "हमारी टीम जल्द ही आपको कॉल करेगी। आपका बुकिंग नंबर:", en: "Our team will call you shortly. Your booking number:" },
  bookedEmergency: { hi: "अगर हालत गंभीर लगे, तो तुरंत 108 पर कॉल करें या नज़दीकी अस्पताल जाएँ।", en: "If you feel very unwell, call 108 right away or go to the nearest hospital." },
  close: { hi: "बंद करें", en: "Close" },
  errName: { hi: "कृपया नाम लिखें", en: "Please enter a name" },
  errPhone: { hi: "कृपया सही मोबाइल नंबर लिखें", en: "Please enter a valid mobile number" },

  howTitle: { hi: "उलझी रिपोर्ट से साफ़ समझ तक", en: "From confusing reports to clear understanding" },
  how1: { hi: "रिपोर्ट अपलोड करें", en: "Upload Report" },
  how1d: { hi: "लैब रिपोर्ट की फ़ोटो या PDF डालें।", en: "Add a photo or PDF of your lab report." },
  how2: { hi: "स्मार्ट जाँच", en: "Smart Analysis" },
  how2d: { hi: "जाँच के नंबर पढ़कर सामान्य सीमा से मिलाए जाते हैं।", en: "Test values are read and compared with normal ranges." },
  how3: { hi: "आसान हिंदी में समझें", en: "Understand in Simple Hindi" },
  how3d: { hi: "हरा, पीला, लाल ज़ोन और सुनने का बटन।", en: "Green, yellow, red zones with a listen button." },
  how4: { hi: "डॉक्टर से सलाह", en: "Doctor Consultation" },
  how4d: { hi: "सवालों की सूची के साथ डॉक्टर से मिलें।", en: "Meet your doctor with a ready list of questions." },
  howMore: { hi: "पूरा तरीका देखें", en: "See the full process" },
  stepLabel: { hi: "चरण", en: "Step" },

  footerNote: {
    hi: "सेहत साथी सिर्फ़ जानकारी देता है। यह डॉक्टर की जाँच, निदान या इलाज की जगह नहीं लेता।",
    en: "Sehat Saathi only explains information. It does not replace a doctor's examination, diagnosis or treatment.",
  },
  footerEmergency: { hi: "आपातकाल में 108 पर कॉल करें।", en: "In an emergency, call 108." },

  errGeneric: { hi: "रिपोर्ट पढ़ी नहीं जा सकी। कृपया दोबारा कोशिश करें या नंबर ख़ुद डालें।", en: "We couldn't read the report. Please try again or enter the values yourself." },
  errFileType: { hi: "कृपया JPG, PNG या PDF फ़ाइल चुनें।", en: "Please choose a JPG, PNG or PDF file." },
  errFileSize: { hi: "फ़ाइल बहुत बड़ी है (8 MB तक)।", en: "The file is too large (up to 8 MB)." },
  errNoTests: { hi: "इस फ़ाइल में जाँच के नंबर नहीं मिले। कृपया साफ़ फ़ोटो लें या नंबर ख़ुद डालें।", en: "No test values were found in this file. Please take a clearer photo or enter values yourself." },
} as const;

export type DictKey = keyof typeof dict;

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("hi");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "hi" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "hi" ? "hi" : "en";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback((key: DictKey) => dict[key][lang], [lang]);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
