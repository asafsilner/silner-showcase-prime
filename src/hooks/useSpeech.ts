import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechState {
  speaking: boolean;
  paused: boolean;
  speakingId: string | null;
  supported: boolean;
}

/** Wraps window.speechSynthesis with Hebrew voice selection and per-POI id tracking. */
export function useSpeech() {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [state, setState] = useState<SpeechState>({
    speaking: false,
    paused: false,
    speakingId: null,
    supported,
  });
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!supported) return;
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [supported]);

  const pickHebrewVoice = () => {
    const voices = voicesRef.current;
    return (
      voices.find((v) => v.lang?.toLowerCase().startsWith("he")) ??
      voices.find((v) => v.lang?.toLowerCase().startsWith("iw")) ??
      null
    );
  };

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setState((s) => ({ ...s, speaking: false, paused: false, speakingId: null }));
  }, [supported]);

  const speak = useCallback(
    (id: string, text: string) => {
      if (!supported) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "he-IL";
      const voice = pickHebrewVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = 0.95;

      utterance.onstart = () => setState({ speaking: true, paused: false, speakingId: id, supported });
      utterance.onend = () => setState({ speaking: false, paused: false, speakingId: null, supported });
      utterance.onerror = () => setState({ speaking: false, paused: false, speakingId: null, supported });

      window.speechSynthesis.speak(utterance);
    },
    [supported]
  );

  const togglePause = useCallback(() => {
    if (!supported) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setState((s) => ({ ...s, paused: true }));
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setState((s) => ({ ...s, paused: false }));
    }
  }, [supported]);

  useEffect(() => stop, [stop]);

  return { ...state, speak, stop, togglePause };
}
