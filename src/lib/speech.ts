import { useCallback, useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";

function pickVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang === "hi" ? "hi" : "en-IN";
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix.toLowerCase())) ??
    (lang === "en" ? voices.find((v) => v.lang.toLowerCase().startsWith("en")) : undefined)
  );
}

/** Read-aloud using the browser's built-in voice (hi-IN / en-IN). One utterance at a time. */
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
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === "hi" ? "hi-IN" : "en-IN";
      const voice = pickVoice(lang);
      if (voice) u.voice = voice;
      u.rate = 0.85; // slower for elderly listeners
      u.onend = () => setSpeakingId((cur) => (cur === id ? null : cur));
      u.onerror = () => setSpeakingId((cur) => (cur === id ? null : cur));
      setSpeakingId(id);
      synth.speak(u);
      return true;
    },
    [speakingId, supported],
  );

  return { speak, stop, speakingId, supported };
}
