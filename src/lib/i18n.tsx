import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "hi" | "pa" | "mr" | "en";
export type L10n = Record<Lang, string>;

export const LANGS: { code: Lang; label: string; speech: string }[] = [
  { code: "hi", label: "हिंदी", speech: "hi-IN" },
  { code: "pa", label: "ਪੰਜਾਬੀ", speech: "pa-IN" },
  { code: "mr", label: "मराठी", speech: "mr-IN" },
  { code: "en", label: "English", speech: "en-IN" },
];

const STORAGE_KEY = "sehat-saathi-lang";

const dict = {
  brandName: { hi: "सेहत साथी", pa: "ਸਿਹਤ ਸਾਥੀ", mr: "सेहत साथी", en: "Sehat Saathi" },
  brandTagline: { hi: "रिपोर्ट समझो, दवाई डॉक्टर से पूछो", pa: "ਰਿਪੋਰਟ ਸਮਝੋ, ਦਵਾਈ ਡਾਕਟਰ ਤੋਂ ਪੁੱਛੋ", mr: "रिपोर्ट समजा, औषध डॉक्टरांना विचारा", en: "Healthcare made understandable for every Indian" },
  navCheck: { hi: "रिपोर्ट जाँचें", pa: "ਰਿਪੋਰਟ ਜਾਂਚੋ", mr: "रिपोर्ट तपासा", en: "Check report" },
  navHow: { hi: "कैसे काम करता है", pa: "ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ", mr: "कसे काम करते", en: "How it works" },
  navWhy: { hi: "हम अलग क्यों", pa: "ਅਸੀਂ ਵੱਖਰੇ ਕਿਉਂ", mr: "आम्ही वेगळे का", en: "Why us" },
  langLabel: { hi: "भाषा", pa: "ਭਾਸ਼ਾ", mr: "भाषा", en: "Language" },

  viewPatient: { hi: "मरीज़", pa: "ਮਰੀਜ਼", mr: "रुग्ण", en: "Patient View" },
  viewDoctor: { hi: "🩺 डॉक्टर ट्राइएज", pa: "🩺 ਡਾਕਟਰ ਟ੍ਰਾਇਏਜ", mr: "🩺 डॉक्टर ट्रायएज", en: "🩺 Doctor Triage" },
  offlineLabel: { hi: "📶 ऑफ़लाइन मोड", pa: "📶 ਔਫ਼ਲਾਈਨ ਮੋਡ", mr: "📶 ऑफलाइन मोड", en: "📶 Offline Ready" },
  offlineBadge: {
    hi: "ऑफ़लाइन इंजन चालू: फ़ोन पर ही रिपोर्ट पढ़ना + तय क्लिनिकल नियम, बिना क्लाउड के",
    pa: "ਔਫ਼ਲਾਈਨ ਇੰਜਣ ਚਾਲੂ: ਫ਼ੋਨ 'ਤੇ ਹੀ ਰਿਪੋਰਟ ਪੜ੍ਹਨਾ + ਪੱਕੇ ਕਲੀਨਿਕਲ ਨਿਯਮ, ਬਿਨਾਂ ਕਲਾਊਡ",
    mr: "ऑफलाइन इंजिन सुरू: फोनवरच रिपोर्ट वाचन + ठरलेले क्लिनिकल नियम, क्लाउडशिवाय",
    en: "Offline Engine Active: Local OCR + Hard-Coded Clinical DB Running Without Cloud",
  },
  offlinePreparing: { hi: "ऑफ़लाइन इंजन तैयार हो रहा है…", pa: "ਔਫ਼ਲਾਈਨ ਇੰਜਣ ਤਿਆਰ ਹੋ ਰਿਹਾ ਹੈ…", mr: "ऑफलाइन इंजिन तयार होत आहे…", en: "Preparing offline engine…" },
  offlineQueued: { hi: "डॉक्टर को भेजने के लिए फ़ोन में रखा", pa: "ਡਾਕਟਰ ਨੂੰ ਭੇਜਣ ਲਈ ਫ਼ੋਨ ਵਿੱਚ ਰੱਖਿਆ", mr: "डॉक्टरांना पाठवण्यासाठी फोनमध्ये ठेवले", en: "waiting on this phone to send" },
  offlinePdf: {
    hi: "ऑफ़लाइन मोड में सिर्फ़ फ़ोटो पढ़ी जा सकती है। PDF के लिए ऑफ़लाइन मोड बंद करें।",
    pa: "ਔਫ਼ਲਾਈਨ ਮੋਡ ਵਿੱਚ ਸਿਰਫ਼ ਫ਼ੋਟੋ ਪੜ੍ਹੀ ਜਾ ਸਕਦੀ ਹੈ। PDF ਲਈ ਔਫ਼ਲਾਈਨ ਮੋਡ ਬੰਦ ਕਰੋ।",
    mr: "ऑफलाइन मोडमध्ये फक्त फोटो वाचता येतो. PDF साठी ऑफलाइन मोड बंद करा.",
    en: "Offline mode reads photos only. Turn offline mode off for PDFs.",
  },

  heroEyebrow: {
    hi: "क्लिनिकली संरचित प्रोटोटाइप • डॉक्टर-साथ टेलीहेल्थ के लिए तैयार",
    pa: "ਕਲੀਨਿਕਲ ਢਾਂਚੇ ਵਾਲਾ ਪ੍ਰੋਟੋਟਾਈਪ • ਡਾਕਟਰ-ਨਾਲ ਟੈਲੀਹੈਲਥ ਲਈ ਤਿਆਰ",
    mr: "क्लिनिकली रचलेला प्रोटोटाइप • डॉक्टर-सोबत टेलिहेल्थसाठी तयार",
    en: "Clinically Structured Prototype • Human-in-the-Loop Telehealth Ready",
  },
  heroTitle: { hi: "रिपोर्ट समझो, दवाई डॉक्टर से पूछो।", pa: "ਰਿਪੋਰਟ ਸਮਝੋ, ਦਵਾਈ ਡਾਕਟਰ ਤੋਂ ਪੁੱਛੋ।", mr: "रिपोर्ट समजा, औषध डॉक्टरांना विचारा.", en: "Report Samjho, Dawai Doctor Se Poochho." },
  heroSub: {
    hi: "रिपोर्ट की फ़ोटो डालें — रंग और आवाज़ से अपनी सेहत समझें।",
    pa: "ਰਿਪੋਰਟ ਦੀ ਫ਼ੋਟੋ ਪਾਓ — ਰੰਗ ਅਤੇ ਆਵਾਜ਼ ਨਾਲ ਆਪਣੀ ਸਿਹਤ ਸਮਝੋ।",
    mr: "रिपोर्टचा फोटो टाका — रंग आणि आवाजातून तुमचे आरोग्य समजून घ्या.",
    en: "Add a photo of your report — understand your health through colours and voice.",
  },
  ctaUpload: { hi: "रिपोर्ट अपलोड करें", pa: "ਰਿਪੋਰਟ ਅਪਲੋਡ ਕਰੋ", mr: "रिपोर्ट अपलोड करा", en: "Upload Lab Report" },
  ctaSample: { hi: "सैंपल रिपोर्ट देखें", pa: "ਸੈਂਪਲ ਰਿਪੋਰਟ ਵੇਖੋ", mr: "नमुना रिपोर्ट पहा", en: "Try Sample Report" },
  heroTrust1: { hi: "हरा · पीला · लाल", pa: "ਹਰਾ · ਪੀਲਾ · ਲਾਲ", mr: "हिरवा · पिवळा · लाल", en: "Green · Yellow · Red" },
  heroTrust2: { hi: "सुनकर समझें", pa: "ਸੁਣ ਕੇ ਸਮਝੋ", mr: "ऐकून समजा", en: "Listen aloud" },
  heroTrust3: { hi: "कभी दवाई की सलाह नहीं", pa: "ਕਦੇ ਦਵਾਈ ਦੀ ਸਲਾਹ ਨਹੀਂ", mr: "कधीही औषधाचा सल्ला नाही", en: "Zero AI prescriptions" },

  step1Title: { hi: "चरण 1: अपनी रिपोर्ट दें", pa: "ਕਦਮ 1: ਆਪਣੀ ਰਿਪੋਰਟ ਦਿਓ", mr: "पायरी 1: तुमचा रिपोर्ट द्या", en: "Step 1: Add your report" },
  profileTitle: { hi: "मरीज़ की जानकारी", pa: "ਮਰੀਜ਼ ਦੀ ਜਾਣਕਾਰੀ", mr: "रुग्णाची माहिती", en: "Patient details" },
  profileHint: { hi: "सामान्य सीमा उम्र और लिंग के हिसाब से बदलती है", pa: "ਆਮ ਹੱਦ ਉਮਰ ਅਤੇ ਲਿੰਗ ਅਨੁਸਾਰ ਬਦਲਦੀ ਹੈ", mr: "सामान्य मर्यादा वय आणि लिंगानुसार बदलते", en: "Normal ranges adjust to age and sex" },
  fSex: { hi: "लिंग", pa: "ਲਿੰਗ", mr: "लिंग", en: "Sex" },
  sexM: { hi: "पुरुष", pa: "ਪੁਰਸ਼", mr: "पुरुष", en: "Male" },
  sexF: { hi: "महिला", pa: "ਔਰਤ", mr: "स्त्री", en: "Female" },
  tabUpload: { hi: "फ़ोटो / PDF", pa: "ਫ਼ੋਟੋ / PDF", mr: "फोटो / PDF", en: "Photo / PDF" },
  tabManual: { hi: "नंबर ख़ुद डालें", pa: "ਨੰਬਰ ਆਪ ਪਾਓ", mr: "आकडे स्वतः टाका", en: "Type values" },
  dropTitle: { hi: "रिपोर्ट की फ़ोटो या PDF यहाँ डालें", pa: "ਰਿਪੋਰਟ ਦੀ ਫ਼ੋਟੋ ਜਾਂ PDF ਇੱਥੇ ਪਾਓ", mr: "रिपोर्टचा फोटो किंवा PDF इथे टाका", en: "Drop a photo or PDF of your report" },
  dropChoose: { hi: "फ़ाइल चुनें", pa: "ਫ਼ਾਈਲ ਚੁਣੋ", mr: "फाइल निवडा", en: "Choose file" },
  dropHint: { hi: "JPG, PNG या PDF · 8 MB तक", pa: "JPG, PNG ਜਾਂ PDF · 8 MB ਤੱਕ", mr: "JPG, PNG किंवा PDF · 8 MB पर्यंत", en: "JPG, PNG or PDF · up to 8 MB" },
  sampleBtn: { hi: "सैंपल रिपोर्ट लोड करें (रमेश जी, 62 पुरुष)", pa: "ਸੈਂਪਲ ਰਿਪੋਰਟ ਲੋਡ ਕਰੋ (ਰਮੇਸ਼ ਜੀ, 62 ਪੁਰਸ਼)", mr: "नमुना रिपोर्ट लोड करा (रमेश जी, 62 पुरुष)", en: "Load Sample Report (Ramesh Ji, 62M)" },
  openLast: { hi: "मेरी पिछली रिपोर्ट खोलें", pa: "ਮੇਰੀ ਪਿਛਲੀ ਰਿਪੋਰਟ ਖੋਲ੍ਹੋ", mr: "माझा मागील रिपोर्ट उघडा", en: "Open my last report" },
  privacyNote: { hi: "रिपोर्ट सिर्फ़ नंबर पढ़ने के लिए, सेव नहीं होती", pa: "ਰਿਪੋਰਟ ਸਿਰਫ਼ ਨੰਬਰ ਪੜ੍ਹਨ ਲਈ, ਸੇਵ ਨਹੀਂ ਹੁੰਦੀ", mr: "रिपोर्ट फक्त आकडे वाचण्यासाठी, जतन होत नाही", en: "Report used only to read values — never saved" },

  scan1: { hi: "रिपोर्ट पढ़ी जा रही है…", pa: "ਰਿਪੋਰਟ ਪੜ੍ਹੀ ਜਾ ਰਹੀ ਹੈ…", mr: "रिपोर्ट वाचला जात आहे…", en: "Reading your report…" },
  scan2: { hi: "जाँच के नंबर ढूँढे जा रहे हैं…", pa: "ਜਾਂਚ ਦੇ ਨੰਬਰ ਲੱਭੇ ਜਾ ਰਹੇ ਹਨ…", mr: "तपासणीचे आकडे शोधत आहे…", en: "Finding test values…" },
  scan3: { hi: "क्लिनिकल नियमों से मिलान…", pa: "ਕਲੀਨਿਕਲ ਨਿਯਮਾਂ ਨਾਲ ਮਿਲਾਨ…", mr: "क्लिनिकल नियमांशी जुळवणी…", en: "Checking clinical rules…" },
  scan4: { hi: "आसान भाषा में समझाया जा रहा है…", pa: "ਸੌਖੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਮਝਾਇਆ ਜਾ ਰਿਹਾ ਹੈ…", mr: "सोप्या भाषेत समजावत आहे…", en: "Explaining in simple words…" },

  manualTest: { hi: "जाँच", pa: "ਜਾਂਚ", mr: "तपासणी", en: "Test" },
  manualOther: { hi: "दूसरी जाँच", pa: "ਹੋਰ ਜਾਂਚ", mr: "इतर तपासणी", en: "Other test" },
  manualOtherName: { hi: "जाँच का नाम", pa: "ਜਾਂਚ ਦਾ ਨਾਂ", mr: "तपासणीचे नाव", en: "Test name" },
  manualValue: { hi: "आपका नंबर", pa: "ਤੁਹਾਡਾ ਨੰਬਰ", mr: "तुमचा आकडा", en: "Your value" },
  manualUnit: { hi: "इकाई", pa: "ਇਕਾਈ", mr: "एकक", en: "Unit" },
  manualLow: { hi: "लैब सीमा: से", pa: "ਲੈਬ ਹੱਦ: ਤੋਂ", mr: "लॅब मर्यादा: पासून", en: "Lab range from" },
  manualHigh: { hi: "तक", pa: "ਤੱਕ", mr: "पर्यंत", en: "to" },
  manualAdd: { hi: "एक और जाँच", pa: "ਇੱਕ ਹੋਰ ਜਾਂਚ", mr: "आणखी तपासणी", en: "Add test" },
  manualRemove: { hi: "हटाएँ", pa: "ਹਟਾਓ", mr: "काढा", en: "Remove" },
  manualSubmit: { hi: "मेरा नतीजा दिखाएँ", pa: "ਮੇਰਾ ਨਤੀਜਾ ਵਿਖਾਓ", mr: "माझा निकाल दाखवा", en: "Show my results" },
  manualRuleNote: { hi: "सीमा तय क्लिनिकल नियमों से आएगी", pa: "ਹੱਦ ਪੱਕੇ ਕਲੀਨਿਕਲ ਨਿਯਮਾਂ ਤੋਂ ਆਵੇਗੀ", mr: "मर्यादा ठरलेल्या क्लिनिकल नियमांतून येईल", en: "Range comes from the clinical rule table" },
  manualInvalid: { hi: "कृपया हर जाँच का नंबर सही भरें।", pa: "ਕਿਰਪਾ ਕਰਕੇ ਹਰ ਜਾਂਚ ਦਾ ਨੰਬਰ ਸਹੀ ਭਰੋ।", mr: "कृपया प्रत्येक तपासणीचा आकडा बरोबर भरा.", en: "Please fill in each test's value correctly." },

  resultsTitle: { hi: "आपकी रिपोर्ट", pa: "ਤੁਹਾਡੀ ਰਿਪੋਰਟ", mr: "तुमचा रिपोर्ट", en: "Your report" },
  resultsSampleTag: { hi: "सैंपल (काल्पनिक डेटा)", pa: "ਸੈਂਪਲ (ਕਾਲਪਨਿਕ ਡੇਟਾ)", mr: "नमुना (काल्पनिक माहिती)", en: "Sample (fictional data)" },
  resultsCheckValues: { hi: "नंबर अपने-आप पढ़े गए — काग़ज़ी रिपोर्ट से मिला लें", pa: "ਨੰਬਰ ਆਪੇ ਪੜ੍ਹੇ ਗਏ — ਕਾਗ਼ਜ਼ੀ ਰਿਪੋਰਟ ਨਾਲ ਮਿਲਾ ਲਓ", mr: "आकडे आपोआप वाचले — कागदी रिपोर्टशी जुळवा", en: "Values were read automatically — check them against your paper report" },
  editValues: { hi: "नंबर बदलें", pa: "ਨੰਬਰ ਬਦਲੋ", mr: "आकडे बदला", en: "Edit values" },
  startOver: { hi: "नई रिपोर्ट", pa: "ਨਵੀਂ ਰਿਪੋਰਟ", mr: "नवा रिपोर्ट", en: "New report" },
  summaryRed: { hi: "कुछ जाँचें लाल ज़ोन में हैं — आज ही डॉक्टर से बात करें", pa: "ਕੁਝ ਜਾਂਚਾਂ ਲਾਲ ਜ਼ੋਨ ਵਿੱਚ ਹਨ — ਅੱਜ ਹੀ ਡਾਕਟਰ ਨਾਲ ਗੱਲ ਕਰੋ", mr: "काही तपासण्या लाल झोनमध्ये — आजच डॉक्टरांशी बोला", en: "Some tests are in the Red Zone — talk to a doctor today" },
  summaryYellow: { hi: "कुछ जाँचें पीले ज़ोन में हैं — डॉक्टर से बात करें", pa: "ਕੁਝ ਜਾਂਚਾਂ ਪੀਲੇ ਜ਼ੋਨ ਵਿੱਚ ਹਨ — ਡਾਕਟਰ ਨਾਲ ਗੱਲ ਕਰੋ", mr: "काही तपासण्या पिवळ्या झोनमध्ये — डॉक्टरांशी बोला", en: "Some tests are in the Yellow Zone — discuss with your doctor" },
  summaryGreen: { hi: "सभी जाँचें हरे ज़ोन में हैं — सब सामान्य", pa: "ਸਾਰੀਆਂ ਜਾਂਚਾਂ ਹਰੇ ਜ਼ੋਨ ਵਿੱਚ — ਸਭ ਠੀਕ", mr: "सर्व तपासण्या हिरव्या झोनमध्ये — सर्व सामान्य", en: "All tests are in the Green Zone — all normal" },
  countGreen: { hi: "हरा", pa: "ਹਰਾ", mr: "हिरवा", en: "Green" },
  countYellow: { hi: "पीला", pa: "ਪੀਲਾ", mr: "पिवळा", en: "Yellow" },
  countRed: { hi: "लाल", pa: "ਲਾਲ", mr: "लाल", en: "Red" },
  yourValue: { hi: "आपका नंबर", pa: "ਤੁਹਾਡਾ ਨੰਬਰ", mr: "तुमचा आकडा", en: "Your value" },
  normalRange: { hi: "सामान्य सीमा", pa: "ਆਮ ਹੱਦ", mr: "सामान्य मर्यादा", en: "Normal range" },
  trustPill: { hi: "✓ तय क्लिनिकल नियमों से जाँचा (AI गणित नहीं)", pa: "✓ ਪੱਕੇ ਕਲੀਨਿਕਲ ਨਿਯਮਾਂ ਨਾਲ ਜਾਂਚਿਆ (AI ਗਣਿਤ ਨਹੀਂ)", mr: "✓ ठरलेल्या क्लिनिकल नियमांनी तपासले (AI गणित नाही)", en: "✓ Verified via Deterministic Clinical Rules (Zero-LLM Math)" },
  ruleLab: { hi: "लैब की छपी सीमा से", pa: "ਲੈਬ ਦੀ ਛਪੀ ਹੱਦ ਤੋਂ", mr: "लॅबच्या छापील मर्यादेनुसार", en: "Using the lab's printed range" },

  listen: { hi: "🔊 सुनिए", pa: "🔊 ਸੁਣੋ", mr: "🔊 ऐका", en: "🔊 Suniye" },
  listenDialect: { hi: "🔊 सुनिए (अपनी भाषा में)", pa: "🔊 ਸੁਣੋ (ਆਪਣੀ ਬੋਲੀ ਵਿੱਚ)", mr: "🔊 ऐका (तुमच्या भाषेत)", en: "🔊 Suniye (Listen in Your Dialect)" },
  stop: { hi: "⏹ रोकें", pa: "⏹ ਰੋਕੋ", mr: "⏹ थांबवा", en: "⏹ Stop" },
  voiceBadge: { hi: "भाषिणी-तैयार क्षेत्रीय आवाज़ इंजन", pa: "ਭਾਸ਼ਿਣੀ-ਤਿਆਰ ਖੇਤਰੀ ਆਵਾਜ਼ ਇੰਜਣ", mr: "भाषिणी-तयार प्रादेशिक आवाज इंजिन", en: "Bhashini-Ready Regional Voice Engine" },
  voiceNote: { hi: "अभी आपके फ़ोन की आवाज़ से", pa: "ਹੁਣ ਤੁਹਾਡੇ ਫ਼ੋਨ ਦੀ ਆਵਾਜ਼ ਨਾਲ", mr: "सध्या तुमच्या फोनच्या आवाजात", en: "Currently using your phone's built-in voice" },
  noVoice: { hi: "इस फ़ोन/ब्राउज़र में आवाज़ की सुविधा नहीं है।", pa: "ਇਸ ਫ਼ੋਨ/ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਆਵਾਜ਼ ਦੀ ਸਹੂਲਤ ਨਹੀਂ।", mr: "या फोन/ब्राउझरमध्ये आवाजाची सोय नाही.", en: "Read-aloud isn't available on this phone/browser." },

  zoneGreenTitle: { hi: "हरा ज़ोन — सामान्य", pa: "ਹਰਾ ਜ਼ੋਨ — ਆਮ", mr: "हिरवा झोन — सामान्य", en: "Green Zone — Normal" },
  zoneYellowTitle: { hi: "पीला ज़ोन — डॉक्टर से बात करें", pa: "ਪੀਲਾ ਜ਼ੋਨ — ਡਾਕਟਰ ਨਾਲ ਗੱਲ ਕਰੋ", mr: "पिवळा झोन — डॉक्टरांशी बोला", en: "Yellow Zone — Discuss with Doctor" },
  zoneRedTitle: { hi: "लाल ज़ोन — तुरंत डॉक्टर", pa: "ਲਾਲ ਜ਼ੋਨ — ਤੁਰੰਤ ਡਾਕਟਰ", mr: "लाल झोन — त्वरित डॉक्टर", en: "Red Zone — Seek Prompt Care" },

  safetyTitle: { hi: "⚠️ सुरक्षा नियम", pa: "⚠️ ਸੁਰੱਖਿਆ ਨਿਯਮ", mr: "⚠️ सुरक्षा नियम", en: "⚠️ Safety Rule" },
  safetyBody: {
    hi: "सेहत साथी कभी दवाई या इलाज की सलाह नहीं देता। ख़ुद से दवाई न लें — हमेशा डॉक्टर से पूछें।",
    pa: "ਸਿਹਤ ਸਾਥੀ ਕਦੇ ਦਵਾਈ ਜਾਂ ਇਲਾਜ ਦੀ ਸਲਾਹ ਨਹੀਂ ਦਿੰਦਾ। ਆਪੇ ਦਵਾਈ ਨਾ ਲਓ — ਹਮੇਸ਼ਾ ਡਾਕਟਰ ਨੂੰ ਪੁੱਛੋ।",
    mr: "सेहत साथी कधीही औषध किंवा उपचाराचा सल्ला देत नाही. स्वतः औषध घेऊ नका — नेहमी डॉक्टरांना विचारा.",
    en: "Sehat Saathi never gives medicine or treatment advice. Don't take medicines on your own — always ask a doctor.",
  },
  safetyMotto: { hi: "AI समझाता है। डॉक्टर तय करते हैं।", pa: "AI ਸਮਝਾਉਂਦਾ ਹੈ। ਡਾਕਟਰ ਫ਼ੈਸਲਾ ਕਰਦੇ ਹਨ।", mr: "AI समजावते. डॉक्टर ठरवतात.", en: "AI explains. Doctors decide. Never an AI prescription." },

  step3Title: { hi: "डॉक्टर से ये पूछें", pa: "ਡਾਕਟਰ ਨੂੰ ਇਹ ਪੁੱਛੋ", mr: "डॉक्टरांना हे विचारा", en: "Questions for your doctor" },
  step3None: { hi: "सब सामान्य है। नियमित जाँच जारी रखें।", pa: "ਸਭ ਠੀਕ ਹੈ। ਨਿਯਮਤ ਜਾਂਚ ਜਾਰੀ ਰੱਖੋ।", mr: "सर्व सामान्य आहे. नियमित तपासणी सुरू ठेवा.", en: "All normal. Keep up regular check-ups." },
  printList: { hi: "प्रिंट करें", pa: "ਪ੍ਰਿੰਟ ਕਰੋ", mr: "प्रिंट करा", en: "Print" },

  refTitle: { hi: "ज़रूरी: डॉक्टर को भेजें", pa: "ਜ਼ਰੂਰੀ: ਡਾਕਟਰ ਨੂੰ ਭੇਜੋ", mr: "तातडीचे: डॉक्टरांना पाठवा", en: "High priority: send to a doctor" },
  refSub: { hi: "लाल ज़ोन की जाँचें मिली हैं। एक क्लिक में डॉक्टर तक पहुँचाएँ।", pa: "ਲਾਲ ਜ਼ੋਨ ਦੀਆਂ ਜਾਂਚਾਂ ਮਿਲੀਆਂ ਹਨ। ਇੱਕ ਕਲਿੱਕ ਵਿੱਚ ਡਾਕਟਰ ਤੱਕ ਪਹੁੰਚਾਓ।", mr: "लाल झोनमधील तपासण्या आढळल्या. एका क्लिकमध्ये डॉक्टरांपर्यंत पोहोचवा.", en: "Red-zone results found. Reach a doctor in one click." },
  refBtn: { hi: "1-क्लिक: ई-संजीवनी / पार्टनर डॉक्टर को भेजें", pa: "1-ਕਲਿੱਕ: ਈ-ਸੰਜੀਵਨੀ / ਪਾਰਟਨਰ ਡਾਕਟਰ ਨੂੰ ਭੇਜੋ", mr: "1-क्लिक: ई-संजीवनी / पार्टनर डॉक्टरांना पाठवा", en: "1-Click Send to eSanjeevani / Partner Doctor" },
  refPacket: { hi: "अपने-आप तैयार रेफ़रल पैकेट", pa: "ਆਪੇ ਤਿਆਰ ਰੈਫ਼ਰਲ ਪੈਕੇਟ", mr: "आपोआप तयार रेफरल पॅकेट", en: "Auto-packaged referral packet" },
  refItemValues: { hi: "रिपोर्ट + जाँच के नंबर (JSON)", pa: "ਰਿਪੋਰਟ + ਜਾਂਚ ਦੇ ਨੰਬਰ (JSON)", mr: "रिपोर्ट + तपासणीचे आकडे (JSON)", en: "Report summary + extracted JSON values" },
  refItemFlags: { hi: "लाल ज़ोन क्लिनिकल फ़्लैग", pa: "ਲਾਲ ਜ਼ੋਨ ਕਲੀਨਿਕਲ ਫ਼ਲੈਗ", mr: "लाल झोन क्लिनिकल फ्लॅग", en: "Red-zone clinical flags" },
  refItemLang: { hi: "पसंदीदा भाषा और आवाज़ सारांश", pa: "ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਅਤੇ ਆਵਾਜ਼ ਸਾਰ", mr: "आवडती भाषा आणि आवाज सारांश", en: "Preferred language & audio summary" },
  refItemConsent: { hi: "DPDPA सहमति + पहचान छिपाना", pa: "DPDPA ਸਹਿਮਤੀ + ਪਛਾਣ ਲੁਕਾਉਣਾ", mr: "DPDPA संमती + ओळख लपवणे", en: "DPDPA consent & auto-anonymised PII" },
  refFileNote: { hi: "मूल फ़ाइल आपके फ़ोन पर ही रहती है", pa: "ਅਸਲ ਫ਼ਾਈਲ ਤੁਹਾਡੇ ਫ਼ੋਨ 'ਤੇ ਹੀ ਰਹਿੰਦੀ ਹੈ", mr: "मूळ फाइल तुमच्या फोनवरच राहते", en: "Original file stays on your phone" },
  refConsent: { hi: "मैं ये नतीजे पार्टनर डॉक्टर से साझा करने की सहमति देता/देती हूँ (DPDPA)", pa: "ਮੈਂ ਇਹ ਨਤੀਜੇ ਪਾਰਟਨਰ ਡਾਕਟਰ ਨਾਲ ਸਾਂਝੇ ਕਰਨ ਦੀ ਸਹਿਮਤੀ ਦਿੰਦਾ/ਦਿੰਦੀ ਹਾਂ (DPDPA)", mr: "मी हे निकाल पार्टनर डॉक्टरांशी शेअर करण्यास संमती देतो/देते (DPDPA)", en: "I consent to share these results with a partner doctor (DPDPA)" },
  refAnon: { hi: "मेरा नाम और फ़ोन छिपाएँ", pa: "ਮੇਰਾ ਨਾਂ ਅਤੇ ਫ਼ੋਨ ਲੁਕਾਓ", mr: "माझे नाव आणि फोन लपवा", en: "Hide my name & phone (anonymise)" },
  refPhone: { hi: "कॉल-बैक के लिए मोबाइल नंबर", pa: "ਕਾਲ-ਬੈਕ ਲਈ ਮੋਬਾਈਲ ਨੰਬਰ", mr: "कॉल-बॅकसाठी मोबाईल नंबर", en: "Mobile number for call-back" },
  refSending: { hi: "भेजा जा रहा है…", pa: "ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ…", mr: "पाठवत आहे…", en: "Sending…" },
  refSent: { hi: "डॉक्टर की कतार में पहुँच गया ✓", pa: "ਡਾਕਟਰ ਦੀ ਕਤਾਰ ਵਿੱਚ ਪਹੁੰਚ ਗਿਆ ✓", mr: "डॉक्टरांच्या रांगेत पोहोचले ✓", en: "Delivered to the doctor queue ✓" },
  refQueued: { hi: "फ़ोन में सेव — इंटरनेट आते ही भेजा जाएगा", pa: "ਫ਼ੋਨ ਵਿੱਚ ਸੇਵ — ਇੰਟਰਨੈੱਟ ਆਉਂਦੇ ਹੀ ਭੇਜਿਆ ਜਾਵੇਗਾ", mr: "फोनमध्ये जतन — इंटरनेट येताच पाठवले जाईल", en: "Saved on this phone — will send when internet returns" },
  refViewQueue: { hi: "डॉक्टर की कतार देखें", pa: "ਡਾਕਟਰ ਦੀ ਕਤਾਰ ਵੇਖੋ", mr: "डॉक्टरांची रांग पहा", en: "See doctor queue" },
  refNote: { hi: "प्रोटोटाइप: पार्टनर-डॉक्टर कतार में जाता है। ई-संजीवनी जुड़ाव योजना में है।", pa: "ਪ੍ਰੋਟੋਟਾਈਪ: ਪਾਰਟਨਰ-ਡਾਕਟਰ ਕਤਾਰ ਵਿੱਚ ਜਾਂਦਾ ਹੈ। ਈ-ਸੰਜੀਵਨੀ ਜੋੜ ਯੋਜਨਾ ਵਿੱਚ ਹੈ।", mr: "प्रोटोटाइप: पार्टनर-डॉक्टर रांगेत जाते. ई-संजीवनी जोडणी नियोजित आहे.", en: "Prototype: goes to the partner-doctor queue. eSanjeevani connection is planned." },
  refError: { hi: "भेजा नहीं जा सका। दोबारा कोशिश करें।", pa: "ਭੇਜਿਆ ਨਹੀਂ ਜਾ ਸਕਿਆ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।", mr: "पाठवता आले नाही. पुन्हा प्रयत्न करा.", en: "Couldn't send. Please try again." },

  consultCta: { hi: "योग्य डॉक्टर से सलाह लें", pa: "ਯੋਗ ਡਾਕਟਰ ਤੋਂ ਸਲਾਹ ਲਓ", mr: "पात्र डॉक्टरांचा सल्ला घ्या", en: "Consult a Qualified Doctor" },
  consultBand: { hi: "हर सफ़र डॉक्टर पर ख़त्म होता है — दवाई की पर्ची पर नहीं।", pa: "ਹਰ ਸਫ਼ਰ ਡਾਕਟਰ 'ਤੇ ਖ਼ਤਮ ਹੁੰਦਾ ਹੈ — ਦਵਾਈ ਦੀ ਪਰਚੀ 'ਤੇ ਨਹੀਂ।", mr: "प्रत्येक प्रवास डॉक्टरांकडे संपतो — औषधाच्या चिठ्ठीवर नाही.", en: "Every journey ends with a doctor — never a prescription." },
  consultTitle: { hi: "डॉक्टर से सलाह बुक करें", pa: "ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਬੁੱਕ ਕਰੋ", mr: "डॉक्टरांचा सल्ला बुक करा", en: "Book a doctor consultation" },
  consultSub: { hi: "हमारी टीम कॉल करके समय पक्का करेगी।", pa: "ਸਾਡੀ ਟੀਮ ਕਾਲ ਕਰਕੇ ਸਮਾਂ ਪੱਕਾ ਕਰੇਗੀ।", mr: "आमची टीम कॉल करून वेळ निश्चित करेल.", en: "Our team will call you to confirm a time." },
  fName: { hi: "मरीज़ का नाम", pa: "ਮਰੀਜ਼ ਦਾ ਨਾਂ", mr: "रुग्णाचे नाव", en: "Patient name" },
  fPhone: { hi: "मोबाइल नंबर", pa: "ਮੋਬਾਈਲ ਨੰਬਰ", mr: "मोबाईल नंबर", en: "Mobile number" },
  fAge: { hi: "उम्र", pa: "ਉਮਰ", mr: "वय", en: "Age" },
  fMode: { hi: "सलाह कैसे चाहिए?", pa: "ਸਲਾਹ ਕਿਵੇਂ ਚਾਹੀਦੀ ਹੈ?", mr: "सल्ला कसा हवा?", en: "How would you like to consult?" },
  modeVideo: { hi: "वीडियो कॉल", pa: "ਵੀਡੀਓ ਕਾਲ", mr: "व्हिडिओ कॉल", en: "Video call" },
  modePhone: { hi: "फ़ोन कॉल", pa: "ਫ਼ੋਨ ਕਾਲ", mr: "फोन कॉल", en: "Phone call" },
  modeClinic: { hi: "क्लिनिक जाकर", pa: "ਕਲੀਨਿਕ ਜਾ ਕੇ", mr: "क्लिनिकला जाऊन", en: "Clinic visit" },
  fDate: { hi: "पसंदीदा तारीख़", pa: "ਪਸੰਦੀਦਾ ਤਾਰੀਖ਼", mr: "आवडती तारीख", en: "Preferred date" },
  fSlot: { hi: "पसंदीदा समय", pa: "ਪਸੰਦੀਦਾ ਸਮਾਂ", mr: "आवडती वेळ", en: "Preferred time" },
  slotMorning: { hi: "सुबह", pa: "ਸਵੇਰ", mr: "सकाळ", en: "Morning" },
  slotAfternoon: { hi: "दोपहर", pa: "ਦੁਪਹਿਰ", mr: "दुपार", en: "Afternoon" },
  slotEvening: { hi: "शाम", pa: "ਸ਼ਾਮ", mr: "संध्याकाळ", en: "Evening" },
  fConcerns: { hi: "डॉक्टर से क्या पूछना है?", pa: "ਡਾਕਟਰ ਨੂੰ ਕੀ ਪੁੱਛਣਾ ਹੈ?", mr: "डॉक्टरांना काय विचारायचे?", en: "What would you like to ask the doctor?" },
  fSubmit: { hi: "बुकिंग भेजें", pa: "ਬੁਕਿੰਗ ਭੇਜੋ", mr: "बुकिंग पाठवा", en: "Send booking" },
  fSending: { hi: "भेजा जा रहा है…", pa: "ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ…", mr: "पाठवत आहे…", en: "Sending…" },
  bookedTitle: { hi: "बुकिंग मिल गई 🙏", pa: "ਬੁਕਿੰਗ ਮਿਲ ਗਈ 🙏", mr: "बुकिंग मिळाले 🙏", en: "Booking received 🙏" },
  bookedBody: { hi: "टीम जल्द कॉल करेगी। बुकिंग नंबर:", pa: "ਟੀਮ ਜਲਦੀ ਕਾਲ ਕਰੇਗੀ। ਬੁਕਿੰਗ ਨੰਬਰ:", mr: "टीम लवकरच कॉल करेल. बुकिंग नंबर:", en: "Our team will call you shortly. Booking number:" },
  bookedEmergency: { hi: "हालत गंभीर लगे तो तुरंत 108 पर कॉल करें।", pa: "ਹਾਲਤ ਗੰਭੀਰ ਲੱਗੇ ਤਾਂ ਤੁਰੰਤ 108 'ਤੇ ਕਾਲ ਕਰੋ।", mr: "प्रकृती गंभीर वाटल्यास लगेच 108 वर कॉल करा.", en: "If you feel very unwell, call 108 right away." },
  bookError: { hi: "बुकिंग नहीं भेजी जा सकी। दोबारा कोशिश करें।", pa: "ਬੁਕਿੰਗ ਨਹੀਂ ਭੇਜੀ ਜਾ ਸਕੀ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।", mr: "बुकिंग पाठवता आले नाही. पुन्हा प्रयत्न करा.", en: "Couldn't send the booking. Please try again." },
  close: { hi: "बंद करें", pa: "ਬੰਦ ਕਰੋ", mr: "बंद करा", en: "Close" },
  errName: { hi: "कृपया नाम लिखें", pa: "ਕਿਰਪਾ ਕਰਕੇ ਨਾਂ ਲਿਖੋ", mr: "कृपया नाव लिहा", en: "Please enter a name" },
  errPhone: { hi: "कृपया सही मोबाइल नंबर लिखें", pa: "ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ ਮੋਬਾਈਲ ਨੰਬਰ ਲਿਖੋ", mr: "कृपया योग्य मोबाईल नंबर लिहा", en: "Please enter a valid mobile number" },

  howTitle: { hi: "उलझी रिपोर्ट से साफ़ समझ तक", pa: "ਉਲਝੀ ਰਿਪੋਰਟ ਤੋਂ ਸਾਫ਼ ਸਮਝ ਤੱਕ", mr: "गोंधळलेल्या रिपोर्टपासून स्पष्ट समजेपर्यंत", en: "From confusing reports to clear understanding" },
  how1: { hi: "रिपोर्ट डालें", pa: "ਰਿਪੋਰਟ ਪਾਓ", mr: "रिपोर्ट टाका", en: "Upload Report" },
  how1d: { hi: "फ़ोटो या PDF", pa: "ਫ਼ੋਟੋ ਜਾਂ PDF", mr: "फोटो किंवा PDF", en: "Photo or PDF of your lab report" },
  how2: { hi: "पक्के नियमों से जाँच", pa: "ਪੱਕੇ ਨਿਯਮਾਂ ਨਾਲ ਜਾਂਚ", mr: "ठरलेल्या नियमांनी तपासणी", en: "Deterministic Analysis" },
  how2d: { hi: "उम्र-लिंग के हिसाब से क्लिनिकल सीमा", pa: "ਉਮਰ-ਲਿੰਗ ਅਨੁਸਾਰ ਕਲੀਨਿਕਲ ਹੱਦ", mr: "वय-लिंगानुसार क्लिनिकल मर्यादा", en: "Age & sex adjusted clinical ranges" },
  how3: { hi: "अपनी भाषा में समझें", pa: "ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਮਝੋ", mr: "तुमच्या भाषेत समजा", en: "Understand in Your Language" },
  how3d: { hi: "रंग + आवाज़", pa: "ਰੰਗ + ਆਵਾਜ਼", mr: "रंग + आवाज", en: "Colour zones + voice" },
  how4: { hi: "डॉक्टर से सलाह", pa: "ਡਾਕਟਰ ਤੋਂ ਸਲਾਹ", mr: "डॉक्टरांचा सल्ला", en: "Doctor Consultation" },
  how4d: { hi: "लाल ज़ोन पर 1-क्लिक रेफ़रल", pa: "ਲਾਲ ਜ਼ੋਨ 'ਤੇ 1-ਕਲਿੱਕ ਰੈਫ਼ਰਲ", mr: "लाल झोनवर 1-क्लिक रेफरल", en: "1-click referral on red flags" },
  howMore: { hi: "पूरा तरीका देखें", pa: "ਪੂਰਾ ਤਰੀਕਾ ਵੇਖੋ", mr: "पूर्ण पद्धत पहा", en: "See the full process" },
  stepLabel: { hi: "चरण", pa: "ਕਦਮ", mr: "पायरी", en: "Step" },

  docTitle: { hi: "डॉक्टर ट्राइएज डैशबोर्ड", pa: "ਡਾਕਟਰ ਟ੍ਰਾਇਏਜ ਡੈਸ਼ਬੋਰਡ", mr: "डॉक्टर ट्रायएज डॅशबोर्ड", en: "Doctor Triage Dashboard" },
  docSub: { hi: "लाल फ़्लैग वाले मरीज़ सबसे ऊपर", pa: "ਲਾਲ ਫ਼ਲੈਗ ਵਾਲੇ ਮਰੀਜ਼ ਸਭ ਤੋਂ ਉੱਪਰ", mr: "लाल फ्लॅग असलेले रुग्ण सर्वात वर", en: "Patients with the most red flags appear first" },
  docLive: { hi: "लाइव कतार", pa: "ਲਾਈਵ ਕਤਾਰ", mr: "लाइव्ह रांग", en: "Live queue" },
  docRed: { hi: "लाल फ़्लैग", pa: "ਲਾਲ ਫ਼ਲੈਗ", mr: "लाल फ्लॅग", en: "Red Flags" },
  docYellow: { hi: "पीले", pa: "ਪੀਲੇ", mr: "पिवळे", en: "Yellow" },
  docDemo: { hi: "डेमो मरीज़", pa: "ਡੈਮੋ ਮਰੀਜ਼", mr: "डेमो रुग्ण", en: "Demo patient" },
  docStart: { hi: "टेली-कंसल्ट शुरू करें और सत्यापित सलाह दें", pa: "ਟੈਲੀ-ਕੰਸਲਟ ਸ਼ੁਰੂ ਕਰੋ ਅਤੇ ਤਸਦੀਕਸ਼ੁਦਾ ਸਲਾਹ ਦਿਓ", mr: "टेली-कन्सल्ट सुरू करा आणि सत्यापित सल्ला द्या", en: "Start Tele-Consult & Issue Verified Advice" },
  docAnonNote: { hi: "असली मरीज़ बिना नाम/फ़ोन के दिखते हैं। डॉक्टर लॉगिन के बाद ही संपर्क विवरण मिलेगा।", pa: "ਅਸਲ ਮਰੀਜ਼ ਬਿਨਾਂ ਨਾਂ/ਫ਼ੋਨ ਦੇ ਦਿਸਦੇ ਹਨ। ਡਾਕਟਰ ਲੌਗਇਨ ਤੋਂ ਬਾਅਦ ਹੀ ਸੰਪਰਕ ਵੇਰਵਾ ਮਿਲੇਗਾ।", mr: "खरे रुग्ण नाव/फोनशिवाय दिसतात. डॉक्टर लॉगिननंतरच संपर्क तपशील मिळेल.", en: "Real patients appear without name or phone. Contact details are for signed-in partner doctors only." },
  docEmpty: { hi: "कतार ख़ाली है", pa: "ਕਤਾਰ ਖ਼ਾਲੀ ਹੈ", mr: "रांग रिकामी आहे", en: "The queue is empty" },
  docRefresh: { hi: "ताज़ा करें", pa: "ਤਾਜ਼ਾ ਕਰੋ", mr: "रिफ्रेश करा", en: "Refresh" },
  docPlay: { hi: "🔊 मरीज़ का आवाज़ सारांश", pa: "🔊 ਮਰੀਜ਼ ਦਾ ਆਵਾਜ਼ ਸਾਰ", mr: "🔊 रुग्णाचा आवाज सारांश", en: "🔊 Patient's audio summary" },
  docAdvice: { hi: "डॉक्टर की सलाह (मरीज़ को भेजी जाएगी)", pa: "ਡਾਕਟਰ ਦੀ ਸਲਾਹ (ਮਰੀਜ਼ ਨੂੰ ਭੇਜੀ ਜਾਵੇਗੀ)", mr: "डॉक्टरांचा सल्ला (रुग्णाला पाठवला जाईल)", en: "Doctor's advice (sent to the patient)" },
  docIssue: { hi: "सत्यापित सलाह दें", pa: "ਤਸਦੀਕਸ਼ੁਦਾ ਸਲਾਹ ਦਿਓ", mr: "सत्यापित सल्ला द्या", en: "Issue verified advice" },
  docIssued: { hi: "सलाह दर्ज (डेमो) — असली उपयोग में डॉक्टर लॉगिन ज़रूरी", pa: "ਸਲਾਹ ਦਰਜ (ਡੈਮੋ) — ਅਸਲ ਵਰਤੋਂ ਵਿੱਚ ਡਾਕਟਰ ਲੌਗਇਨ ਜ਼ਰੂਰੀ", mr: "सल्ला नोंदवला (डेमो) — खऱ्या वापरात डॉक्टर लॉगिन आवश्यक", en: "Advice recorded (demo) — real use needs doctor sign-in" },
  docWaitingFor: { hi: "पहले", pa: "ਪਹਿਲਾਂ", mr: "पूर्वी", en: "ago" },

  privTitle: { hi: "गोपनीयता और सुरक्षा ढाँचा", pa: "ਨਿੱਜਤਾ ਅਤੇ ਸੁਰੱਖਿਆ ਢਾਂਚਾ", mr: "गोपनीयता आणि सुरक्षा रचना", en: "Privacy & Safety Architecture" },
  priv1: { hi: "शून्य AI पर्ची", pa: "ਜ਼ੀਰੋ AI ਪਰਚੀ", mr: "शून्य AI चिठ्ठी", en: "Zero AI Prescriptions" },
  priv2: { hi: "तय सीमा मिलान (कोई भ्रम नहीं)", pa: "ਪੱਕਾ ਹੱਦ ਮਿਲਾਨ (ਕੋਈ ਭਰਮ ਨਹੀਂ)", mr: "ठरलेली मर्यादा जुळवणी (भ्रम नाही)", en: "Deterministic Range Mapping (No Hallucinations)" },
  priv3: { hi: "ऑफ़लाइन-पहले, फ़ोन में स्टोरेज", pa: "ਔਫ਼ਲਾਈਨ-ਪਹਿਲਾਂ, ਫ਼ੋਨ ਵਿੱਚ ਸਟੋਰੇਜ", mr: "ऑफलाइन-प्रथम, फोनमध्ये साठवण", en: "Offline-First Local Storage" },
  priv4: { hi: "DPDPA सहमति और एन्क्रिप्शन", pa: "DPDPA ਸਹਿਮਤੀ ਅਤੇ ਐਨਕ੍ਰਿਪਸ਼ਨ", mr: "DPDPA संमती आणि एन्क्रिप्शन", en: "DPDPA Patient Consent & Data Encryption" },
  footerNote: {
    hi: "सेहत साथी सिर्फ़ जानकारी समझाता है। यह डॉक्टर की जाँच, निदान या इलाज की जगह नहीं लेता।",
    pa: "ਸਿਹਤ ਸਾਥੀ ਸਿਰਫ਼ ਜਾਣਕਾਰੀ ਸਮਝਾਉਂਦਾ ਹੈ। ਇਹ ਡਾਕਟਰ ਦੀ ਜਾਂਚ, ਨਿਦਾਨ ਜਾਂ ਇਲਾਜ ਦੀ ਥਾਂ ਨਹੀਂ ਲੈਂਦਾ।",
    mr: "सेहत साथी फक्त माहिती समजावते. ते डॉक्टरांची तपासणी, निदान किंवा उपचारांची जागा घेत नाही.",
    en: "Sehat Saathi only explains information. It does not replace a doctor's examination, diagnosis or treatment.",
  },
  footerEmergency: { hi: "आपातकाल में 108 पर कॉल करें।", pa: "ਐਮਰਜੈਂਸੀ ਵਿੱਚ 108 'ਤੇ ਕਾਲ ਕਰੋ।", mr: "आपत्कालीन स्थितीत 108 वर कॉल करा.", en: "In an emergency, call 108." },

  errGeneric: { hi: "रिपोर्ट पढ़ी नहीं जा सकी। दोबारा कोशिश करें या नंबर ख़ुद डालें।", pa: "ਰਿਪੋਰਟ ਪੜ੍ਹੀ ਨਹੀਂ ਜਾ ਸਕੀ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ ਨੰਬਰ ਆਪ ਪਾਓ।", mr: "रिपोर्ट वाचता आला नाही. पुन्हा प्रयत्न करा किंवा आकडे स्वतः टाका.", en: "We couldn't read the report. Try again or type the values yourself." },
  errFileType: { hi: "कृपया JPG, PNG या PDF चुनें।", pa: "ਕਿਰਪਾ ਕਰਕੇ JPG, PNG ਜਾਂ PDF ਚੁਣੋ।", mr: "कृपया JPG, PNG किंवा PDF निवडा.", en: "Please choose a JPG, PNG or PDF file." },
  errFileSize: { hi: "फ़ाइल बहुत बड़ी है (8 MB तक)।", pa: "ਫ਼ਾਈਲ ਬਹੁਤ ਵੱਡੀ ਹੈ (8 MB ਤੱਕ)।", mr: "फाइल खूप मोठी आहे (8 MB पर्यंत).", en: "The file is too large (up to 8 MB)." },
  errNoTests: { hi: "जाँच के नंबर नहीं मिले। साफ़ फ़ोटो लें या नंबर ख़ुद डालें।", pa: "ਜਾਂਚ ਦੇ ਨੰਬਰ ਨਹੀਂ ਮਿਲੇ। ਸਾਫ਼ ਫ਼ੋਟੋ ਲਓ ਜਾਂ ਨੰਬਰ ਆਪ ਪਾਓ।", mr: "तपासणीचे आकडे सापडले नाहीत. स्पष्ट फोटो घ्या किंवा आकडे स्वतः टाका.", en: "No test values found. Take a clearer photo or type the values yourself." },
  errCredits: { hi: "रिपोर्ट पढ़ने की सुविधा अभी बंद है। नंबर ख़ुद डालें।", pa: "ਰਿਪੋਰਟ ਪੜ੍ਹਨ ਦੀ ਸਹੂਲਤ ਹੁਣ ਬੰਦ ਹੈ। ਨੰਬਰ ਆਪ ਪਾਓ।", mr: "रिपोर्ट वाचण्याची सोय सध्या बंद आहे. आकडे स्वतः टाका.", en: "Report reading is unavailable right now. Please type the values." },
  errBusy: { hi: "अभी बहुत भीड़ है। एक मिनट बाद कोशिश करें।", pa: "ਹੁਣ ਬਹੁਤ ਭੀੜ ਹੈ। ਇੱਕ ਮਿੰਟ ਬਾਅਦ ਕੋਸ਼ਿਸ਼ ਕਰੋ।", mr: "सध्या खूप गर्दी आहे. एका मिनिटाने प्रयत्न करा.", en: "It's busy right now. Please try again in a minute." },
} satisfies Record<string, L10n>;

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
    if (saved && LANGS.some((l) => l.code === saved)) setLangState(saved as Lang);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
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
