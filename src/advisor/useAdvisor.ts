import { useCallback, useRef, useState } from "react";
import { AdvisorEngine } from "./orchestrator";
import type { AdvisorState, Answer } from "./types";

/**
 * React binding for the advisor engine. The engine mutates its own state;
 * a version counter forces re-renders after each interaction. `busy` is
 * true while the engine is waiting on the live model (LLM mode only).
 */
export function useAdvisor() {
  const engineRef = useRef<AdvisorEngine | null>(null);
  const [, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);

  if (!engineRef.current) {
    engineRef.current = new AdvisorEngine();
  }

  const submitAnswer = useCallback(async (value: Answer["value"], skipped = false) => {
    setBusy(true);
    try {
      await engineRef.current!.submitAnswer(value, skipped);
    } finally {
      setBusy(false);
      setVersion((v) => v + 1);
    }
  }, []);

  const restart = useCallback(() => {
    engineRef.current = new AdvisorEngine();
    setVersion((v) => v + 1);
  }, []);

  const state: AdvisorState = engineRef.current.getState();
  return { state, submitAnswer, restart, busy };
}
