import { useCallback, useEffect, useState } from "react";

import { LANGS, type Lang } from "@/lib/i18n";

/** Finds a voice for the language; Marathi may fall back to a Hindi (Devanagari) voice. */
function pickVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const want = LANGS.find((l) => l.code === lang)?.speech.toLowerCase() ?? "hi-in";
  const base = want.slice(0, 2);
  return (
    voices.find((v) => v.lang.toLowerCase().replace("_", "-") === want) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(base)) ??
    (lang === "mr" ? voices.find((v) => v.lang.toLowerCase().startsWith("hi")) : undefined) ??
    (lang === "en" ? voices.find((v) => v.lang.toLowerCase().startsWith("en")) : undefined)
  );
}

/** Read-aloud using the browser's built-in voices. One utterance at a time. */
export function useSpeech() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const ok = typeof window !== "undefined" && "speechSynthesis" in window;
    setSupported(ok);
    if (!ok) return;
    window.speechSynthesis.getVoices();
    return () => window.speechSynthesis.cancel();
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    (id: string, text: string, lang: Lang) => {
      if (!supported) return false;
      const synth = window.speechSynthesis;
      synth.cancel();
      if (speakingId === id) {
        setSpeakingId(null);
        return true;
      }
      // Short pauses between sentences give elderly listeners time to follow.
      const sentences = text.split(/(?<=[।.!?])\s+/).filter(Boolean);
      const voice = pickVoice(lang);
      const tag = LANGS.find((l) => l.code === lang)?.speech ?? "hi-IN";
      sentences.forEach((s, i) => {
        const u = new SpeechSynthesisUtterance(s);
        u.lang = voice?.lang ?? tag;
        if (voice) u.voice = voice;
        u.rate = 0.82;
        u.pitch = 1.02;
        if (i === sentences.length - 1) {
          u.onend = () => setSpeakingId((cur) => (cur === id ? null : cur));
        }
        u.onerror = () => setSpeakingId((cur) => (cur === id ? null : cur));
        synth.speak(u);
      });
      setSpeakingId(id);
      return true;
    },
    [speakingId, supported],
  );

  return { speak, stop, speakingId, supported };
}
