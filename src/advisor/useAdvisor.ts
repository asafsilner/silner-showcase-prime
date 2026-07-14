import { useCallback, useRef, useState } from "react";
import { AdvisorEngine } from "./orchestrator";
import type { AdvisorState, Answer } from "./types";

/**
 * React binding for the advisor engine. The engine mutates its own state;
 * a version counter forces re-renders after each interaction.
 */
export function useAdvisor() {
  const engineRef = useRef<AdvisorEngine | null>(null);
  const [, setVersion] = useState(0);

  if (!engineRef.current) {
    engineRef.current = new AdvisorEngine();
  }

  const submitAnswer = useCallback((value: Answer["value"], skipped = false) => {
    engineRef.current!.submitAnswer(value, skipped);
    setVersion((v) => v + 1);
  }, []);

  const restart = useCallback(() => {
    engineRef.current = new AdvisorEngine();
    setVersion((v) => v + 1);
  }, []);

  const state: AdvisorState = engineRef.current.getState();
  return { state, submitAnswer, restart };
}
