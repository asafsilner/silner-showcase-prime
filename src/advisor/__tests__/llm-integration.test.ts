import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Verifies the engine's live-model path using mocked LLM calls:
 * analysis drives role/pain auto-fill, questions get the model's phrasing,
 * and the report carries the personal narrative — all without a network.
 */

vi.mock("../llm/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../llm/config")>();
  return { ...actual, isLLMConfigured: () => true };
});

vi.mock("../llm/llmService", () => ({
  analyzeSelfDescriptionLLM: vi.fn(async () => ({
    roleId: "role-coach",
    phrase: "יוגה",
    painIds: ["pain-scheduling"],
    summary: "מדריכת יוגה עצמאית עם סטודיו קטן",
  })),
  personalizeQuestionLLM: vi.fn(async () => ({
    text: "שאלה מנוסחת על ידי המודל",
    hint: "רמז מהמודל",
  })),
  generateNarrativeLLM: vi.fn(async () => "סיכום אישי שנכתב על ידי המודל"),
}));

import { AdvisorEngine } from "../orchestrator";
import { analyzeSelfDescriptionLLM, personalizeQuestionLLM } from "../llm/llmService";
import type { Answer, Question } from "../types";

function autoAnswer(question: Question): Answer["value"] {
  switch (question.field) {
    case "selfDescription":
      return "אני מדריכת יוגה עצמאית";
    case "role":
      return ["role-coach"];
    case "tasks":
      return ["task-inperson", "task-clients"];
    case "pains":
      return ["pain-scheduling"];
    case "toolsUsed":
      return [];
    case "aiExperience":
      return 4;
    case "learningStyle":
      return ["video"];
    case "timeBudget":
      return 3;
    case "goals":
      return "פחות תיאומים ידניים";
    case "workArtifacts":
      return ["photo.png"];
  }
}

describe("AdvisorEngine with a live model (mocked)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the model's analysis to auto-fill role and pains, phrases questions, and adds a narrative", async () => {
    const engine = new AdvisorEngine();
    let state = engine.getState();
    expect(state.currentQuestion?.field).toBe("selfDescription");

    state = await engine.submitAnswer("אני מדריכת יוגה עצמאית");
    expect(analyzeSelfDescriptionLLM).toHaveBeenCalledOnce();

    // Role auto-assigned and the mentioned pain captured — pains question skipped.
    expect(state.answers.some((a) => a.field === "role")).toBe(true);
    expect(state.answers.some((a) => a.field === "pains")).toBe(true);
    expect(state.currentQuestion?.field).toBe("tasks");

    // The pending question carries the model's phrasing.
    expect(state.currentQuestion?.text).toBe("שאלה מנוסחת על ידי המודל");
    expect(personalizeQuestionLLM).toHaveBeenCalled();

    let guard = 0;
    while (state.phase === "interviewing" && state.currentQuestion && guard < 25) {
      state = await engine.submitAnswer(autoAnswer(state.currentQuestion));
      guard += 1;
    }

    expect(state.phase).toBe("done");
    expect(state.report?.narrative).toBe("סיכום אישי שנכתב על ידי המודל");
    // Scheduling pain from the description flowed into the opportunities.
    expect(state.report?.opportunities.some((o) => o.painId === "pain-scheduling")).toBe(true);
  });
});
