import { describe, expect, it } from "vitest";
import { AdvisorEngine } from "../orchestrator";
import { findInformationGaps } from "../agents/informationGapAgent";
import { detectContradictions } from "../agents/consistencyAgent";
import { scoreConfidence } from "../agents/confidenceAgent";
import { buildKnowledgeGraph } from "../agents/researchAgent";
import { buildPersona } from "../agents/personaBuilder";
import { detectOpportunities } from "../agents/opportunityDetector";
import { generateRecommendations } from "../agents/recommendationAgent";
import { buildCurriculum } from "../agents/curriculumBuilder";
import { assessCurriculum } from "../agents/qualityAgent";
import { AUTO_ASSIGN_SCORE, matchRoles } from "../knowledge/roleMatcher";
import type { Answer, Question } from "../types";

function makeAnswer(field: Answer["field"], value: Answer["value"], id = `a-${field}`): Answer {
  return { questionId: id, field, type: "open-text", value, answeredAt: Date.now() };
}

/** Answer whatever question the engine asks, like a cooperative user. */
function autoAnswer(question: Question): Answer["value"] {
  switch (question.field) {
    case "selfDescription":
      return "אני עובד בחברת הייטק על תיאום בין צוותים"; // no lexicon hit on purpose
    case "role":
      return ["role-pm"];
    case "tasks":
      return ["task-meetings", "task-writing", "task-planning"];
    case "pains":
      return ["pain-meeting-overload", "pain-time-writing"];
    case "toolsUsed":
      return ["tool-claude"];
    case "aiExperience":
      return 5;
    case "learningStyle":
      return ["hands-on"];
    case "timeBudget":
      return 4;
    case "goals":
      return "לחסוך זמן על סיכומי פגישות ומיילים";
    case "workArtifacts":
      return ["screenshot.png"];
  }
}

describe("Information Gap Agent", () => {
  it("prioritizes the self-description first, then unlocks dependent fields", () => {
    const before = findInformationGaps([]);
    expect(before[0].field).toBe("selfDescription");

    const after = findInformationGaps([
      makeAnswer("selfDescription", "אני מנהל מוצר"),
      makeAnswer("role", ["role-pm"]),
    ]);
    expect(after.find((g) => g.field === "role")).toBeUndefined();
    expect(after[0].field).toBe("tasks");
  });

  it("still asks about the role when the self-description was skipped", () => {
    const answers: Answer[] = [
      { ...makeAnswer("selfDescription", []), skipped: true },
    ];
    const gaps = findInformationGaps(answers);
    expect(gaps[0].field).toBe("role");
    expect(gaps[0].priority).toBeGreaterThan(0.5);
  });

  it("deprioritizes skipped fields instead of nagging", () => {
    const answers: Answer[] = [{ ...makeAnswer("goals", []), skipped: true }];
    const gaps = findInformationGaps(answers);
    const goalsGap = gaps.find((g) => g.field === "goals");
    expect(goalsGap).toBeDefined();
    expect(goalsGap!.priority).toBeLessThan(0.1);
  });
});

describe("Consistency Agent", () => {
  it("flags high AI experience with zero tools used", () => {
    const answers = [
      makeAnswer("aiExperience", 9),
      makeAnswer("toolsUsed", []),
    ];
    const contradictions = detectContradictions(answers, []);
    expect(contradictions.some((c) => c.id === "exp-high-no-tools")).toBe(true);
  });

  it("keeps previously resolved contradictions resolved", () => {
    const answers = [makeAnswer("aiExperience", 9), makeAnswer("toolsUsed", [])];
    const first = detectContradictions(answers, []);
    first[0].resolved = true;
    const second = detectContradictions(answers, first);
    expect(second.find((c) => c.id === first[0].id)?.resolved).toBe(true);
  });
});

describe("Confidence Agent", () => {
  it("halves confidence for fields in open contradictions", () => {
    const answers = [makeAnswer("aiExperience", 9), makeAnswer("toolsUsed", [])];
    const contradictions = detectContradictions(answers, []);
    const withConflict = scoreConfidence(answers, contradictions);
    const noConflict = scoreConfidence(answers, []);
    const conflictScore = withConflict.fields.find((f) => f.field === "aiExperience")!.score;
    const cleanScore = noConflict.fields.find((f) => f.field === "aiExperience")!.score;
    expect(conflictScore).toBeLessThan(cleanScore);
  });
});

describe("Synthesis pipeline", () => {
  const graph = buildKnowledgeGraph();
  const answers: Answer[] = [
    makeAnswer("role", ["role-pm"]),
    makeAnswer("tasks", ["task-meetings", "task-writing"]),
    makeAnswer("pains", ["pain-meeting-overload", "pain-time-writing"]),
    makeAnswer("toolsUsed", []),
    makeAnswer("aiExperience", 2),
    makeAnswer("learningStyle", ["video"]),
    makeAnswer("timeBudget", 3),
    makeAnswer("goals", "פחות זמן על סיכומים"),
  ];
  const persona = buildPersona(answers, graph, scoreConfidence(answers, []), []);

  it("detects opportunities for every solvable pain, sorted by score", () => {
    const opportunities = detectOpportunities(persona, graph);
    expect(opportunities).toHaveLength(2);
    expect(opportunities[0].score).toBeGreaterThanOrEqual(opportunities[1].score);
  });

  it("recommends tools plus the skills they require", () => {
    const opportunities = detectOpportunities(persona, graph);
    const recs = generateRecommendations(opportunities, persona, graph);
    expect(recs.some((r) => r.kind === "tool")).toBe(true);
    expect(recs.some((r) => r.kind === "skill")).toBe(true);
  });

  it("builds a 30-60-90 plan with exercises and metrics in every active phase", () => {
    const opportunities = detectOpportunities(persona, graph);
    const recs = generateRecommendations(opportunities, persona, graph);
    const plan = buildCurriculum(recs, persona);
    expect(plan.phases.map((p) => p.day)).toEqual([30, 60, 90]);
    for (const phase of plan.phases) {
      expect(phase.successMetrics.length).toBeGreaterThan(0);
      for (const item of phase.items) {
        expect(item.exercises.length).toBeGreaterThan(0);
      }
    }
  });

  it("quality agent rejects plans that blow the time budget", () => {
    const opportunities = detectOpportunities(persona, graph);
    const recs = generateRecommendations(opportunities, persona, graph);
    const tightPersona = { ...persona, timeBudgetHours: 1 };
    const overloaded = buildCurriculum(recs, { ...tightPersona, timeBudgetHours: 10 });
    const result = assessCurriculum(overloaded, tightPersona, recs);
    expect(result.passed).toBe(false);
    expect(result.suggestedMaxItemsPerPhase).toBeDefined();
  });
});

describe("Role Matcher", () => {
  it("identifies a yoga teacher from free text with a confident score", () => {
    const matches = matchRoles("אני מדריכת יוגה, מעבירה שיעורים בסטודיו ובזום");
    expect(matches[0].roleId).toBe("role-coach");
    expect(matches[0].score).toBeGreaterThanOrEqual(AUTO_ASSIGN_SCORE);
  });

  it("returns weak or empty matches for vague text", () => {
    const matches = matchRoles("אני עושה כל מיני דברים");
    expect(matches.filter((m) => m.score >= AUTO_ASSIGN_SCORE)).toHaveLength(0);
  });
});

describe("Personalized interview (yoga teacher)", () => {
  it("skips the role question and offers person-relevant tasks and pains", () => {
    const engine = new AdvisorEngine();
    let state = engine.getState();
    expect(state.currentQuestion?.field).toBe("selfDescription");

    state = engine.submitAnswer("אני מדריכת יוגה עצמאית, מלמדת בסטודיו קטן");

    // Role was auto-assigned by the Research Agent — no role question.
    expect(state.currentQuestion?.field).toBe("tasks");
    const taskLabels = state.currentQuestion!.options!.map((o) => o.label);
    // The first (strongest) options are coach-life tasks, not office tasks.
    expect(taskLabels[0]).toContain("פרונטלית");
    expect(taskLabels.slice(0, 5).join(" ")).toContain("לקוחות");
    // The question is phrased with the user's own words.
    expect(state.currentQuestion!.text).toContain("יוגה");

    state = engine.submitAnswer(["task-inperson", "task-clients", "task-social"]);
    expect(state.currentQuestion?.field).toBe("pains");
    const painLabels = state.currentQuestion!.options!.map((o) => o.label);
    expect(painLabels.join(" ")).toContain("תיאומים");
    expect(painLabels.join(" ")).toContain("רשתות");
  });

  it("produces coach-relevant recommendations end-to-end", () => {
    const engine = new AdvisorEngine();
    let state = engine.getState();
    let guard = 0;
    while (state.phase === "interviewing" && state.currentQuestion && guard < 25) {
      const q = state.currentQuestion;
      if (q.field === "selfDescription") state = engine.submitAnswer("אני מדריכת יוגה עצמאית");
      else if (q.field === "tasks") state = engine.submitAnswer(["task-inperson", "task-clients", "task-social"]);
      else if (q.field === "pains") state = engine.submitAnswer(["pain-scheduling", "pain-selfmarketing"]);
      else state = engine.submitAnswer(autoAnswer(q));
      guard += 1;
    }
    expect(state.phase).toBe("done");
    const report = state.report!;
    expect(report.persona.roleLabel).toContain("אימון");
    const recTitles = report.recommendations.map((r) => r.title).join(" ");
    expect(recTitles).toMatch(/Calendly|WhatsApp|Canva/);
  });
});

describe("AdvisorEngine end-to-end", () => {
  it("interviews, synthesizes, and produces a full report", () => {
    const engine = new AdvisorEngine();
    let state = engine.getState();
    expect(state.phase).toBe("interviewing");
    expect(state.currentQuestion?.field).toBe("selfDescription");

    let guard = 0;
    while (state.phase === "interviewing" && state.currentQuestion && guard < 25) {
      state = engine.submitAnswer(autoAnswer(state.currentQuestion));
      guard += 1;
    }

    expect(state.phase).toBe("done");
    const report = state.report!;
    expect(report).not.toBeNull();
    expect(report.persona.roleLabel).toBe("ניהול מוצר / פרויקטים");
    expect(report.taskMap.length).toBeGreaterThan(0);
    expect(report.opportunities.length).toBeGreaterThan(0);
    expect(report.recommendations.length).toBeGreaterThan(0);
    expect(report.curriculum.phases).toHaveLength(3);
    // The quality loop must keep the load within a 25% stretch of the budget.
    expect(report.curriculum.totalWeeklyHours).toBeLessThanOrEqual(
      report.persona.timeBudgetHours * 1.25,
    );
    // Agent traces show the whole pipeline ran.
    const agents = new Set(state.traces.map((t) => t.agent));
    for (const expected of [
      "research",
      "interview",
      "information-gap",
      "confidence",
      "persona-builder",
      "opportunity-detector",
      "recommendation",
      "critic",
      "quality",
    ] as const) {
      expect(agents.has(expected)).toBe(true);
    }
  });

  it("injects a clarification question when answers contradict", () => {
    const engine = new AdvisorEngine();
    let state = engine.getState();
    let sawClarification = false;
    let guard = 0;
    while (state.phase === "interviewing" && state.currentQuestion && guard < 25) {
      const q = state.currentQuestion;
      if (q.isClarification) {
        sawClarification = true;
        state = engine.submitAnswer("בעצם רק שמעתי על כלים, לא באמת השתמשתי");
      } else if (q.field === "aiExperience") {
        state = engine.submitAnswer(9); // expert...
      } else if (q.field === "toolsUsed") {
        state = engine.submitAnswer([]); // ...who never used a tool
      } else {
        state = engine.submitAnswer(autoAnswer(q));
      }
      guard += 1;
    }
    expect(sawClarification).toBe(true);
    expect(state.phase).toBe("done");
    expect(state.contradictions.find((c) => c.id === "exp-high-no-tools")?.resolved).toBe(true);
  });

  it("adds prompting foundations for beginners via the critic loop", () => {
    const engine = new AdvisorEngine();
    let state = engine.getState();
    let guard = 0;
    while (state.phase === "interviewing" && state.currentQuestion && guard < 25) {
      const q = state.currentQuestion;
      if (q.field === "aiExperience") state = engine.submitAnswer(1);
      else if (q.field === "toolsUsed") state = engine.submitAnswer([]);
      else state = engine.submitAnswer(autoAnswer(q));
      guard += 1;
    }
    expect(state.phase).toBe("done");
    const recs = state.report!.recommendations;
    expect(recs.some((r) => r.nodeId === "method-prompting")).toBe(true);
  });
});
