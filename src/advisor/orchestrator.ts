/**
 * Advisor Orchestrator — wires all agents together and drives the loops:
 *
 * Interview loop:
 *   information gap → question → answer → consistency check →
 *   (clarification if contradiction) → confidence score → repeat
 *   until confidence is high enough, gaps run out, or budget is spent.
 *
 * Synthesis:
 *   persona → opportunities → recommendations → CRITIC LOOP →
 *   curriculum → QUALITY LOOP → final report.
 */

import type {
  AdvisorReport,
  AdvisorState,
  AgentName,
  Answer,
  Question,
} from "./types";
import { buildKnowledgeGraph } from "./agents/researchAgent";
import {
  findInformationGaps,
  hasActionableGaps,
} from "./agents/informationGapAgent";
import {
  generateClarification,
  generateQuestion,
  type PersonalContext,
} from "./agents/interviewAgent";
import { AUTO_ASSIGN_SCORE, matchRoles } from "./knowledge/roleMatcher";
import { detectContradictions } from "./agents/consistencyAgent";
import { CONFIDENCE_THRESHOLD, scoreConfidence } from "./agents/confidenceAgent";
import { buildPersona } from "./agents/personaBuilder";
import { detectOpportunities } from "./agents/opportunityDetector";
import { generateRecommendations } from "./agents/recommendationAgent";
import { applyMustInclude, critiqueRecommendations } from "./agents/criticAgent";
import { buildCurriculum } from "./agents/curriculumBuilder";
import { assessCurriculum } from "./agents/qualityAgent";

export const MAX_QUESTIONS = 14;
export const MAX_CRITIC_ROUNDS = 3;
export const MAX_QUALITY_ROUNDS = 3;

export class AdvisorEngine {
  private state: AdvisorState;
  /** clarification question id -> contradiction id */
  private pendingClarifications = new Map<string, string>();
  /** What the Research Agent learned from the user's own words. */
  private personalContext: PersonalContext = {};

  constructor() {
    const graph = buildKnowledgeGraph();
    this.state = {
      phase: "interviewing",
      graph,
      answers: [],
      currentQuestion: null,
      questionCount: 0,
      gaps: [],
      contradictions: [],
      confidence: scoreConfidence([], []),
      traces: [],
      report: null,
    };
    this.trace("research", `נבנה גרף ידע: ${graph.nodes.size} צמתים, ${graph.edges.length} קשרים`);
    this.askNext();
  }

  getState(): AdvisorState {
    return this.state;
  }

  private trace(agent: AgentName, summary: string) {
    this.state.traces.push({ agent, summary, at: Date.now() });
  }

  /** Record the user's answer and advance the interview loop. */
  submitAnswer(value: Answer["value"], skipped = false): AdvisorState {
    const question = this.state.currentQuestion;
    if (!question || this.state.phase !== "interviewing") return this.state;

    const answer: Answer = {
      questionId: question.id,
      field: question.field,
      type: question.type,
      value,
      answeredAt: Date.now(),
      skipped,
    };
    this.state.answers.push(answer);
    this.state.currentQuestion = null;

    // Research Agent pass: mine the free-text self-description for the
    // user's field. A confident match answers the role question for them.
    if (question.field === "selfDescription" && typeof value === "string" && !skipped) {
      const matches = matchRoles(value);
      if (matches.length > 0) {
        this.personalContext = {
          phrase: matches[0].matchedPhrase,
          suggestedRoleIds: matches.map((m) => m.roleId),
        };
        const top = matches[0];
        const label = this.state.graph.nodes.get(top.roleId)?.label ?? top.roleId;
        if (top.score >= AUTO_ASSIGN_SCORE) {
          this.state.answers.push({
            questionId: `auto-role-${question.id}`,
            field: "role",
            type: "single-choice",
            value: [top.roleId],
            answeredAt: Date.now(),
          });
          this.trace("research", `זוהה תחום מהתיאור החופשי: ${label} ("${top.matchedPhrase}")`);
        } else {
          this.trace("research", `התיאור מרמז על ${label} — נוודא בשאלה הבאה`);
        }
      } else {
        this.trace("research", "התיאור החופשי לא זוהה בלקסיקון — נשאל על התחום ישירות");
      }
    }

    // A clarification answer resolves its contradiction.
    const contradictionId = this.pendingClarifications.get(question.id);
    if (contradictionId) {
      this.pendingClarifications.delete(question.id);
      const c = this.state.contradictions.find((x) => x.id === contradictionId);
      if (c) c.resolved = true;
      this.trace("consistency", `סתירה "${contradictionId}" נסגרה אחרי הבהרה`);
    }

    // Consistency check on the updated answer set.
    this.state.contradictions = detectContradictions(
      this.state.answers,
      this.state.contradictions,
    );

    // Confidence re-scoring.
    this.state.confidence = scoreConfidence(this.state.answers, this.state.contradictions);
    this.trace(
      "confidence",
      `ביטחון כולל: ${Math.round(this.state.confidence.overall * 100)}%`,
    );

    this.askNext();
    return this.state;
  }

  /** Interview loop step: clarification > next gap question > synthesis. */
  private askNext() {
    // 1. Unresolved contradictions get a clarification question first.
    const open = this.state.contradictions.find(
      (c) => !c.resolved && ![...this.pendingClarifications.values()].includes(c.id),
    );
    const alreadyAskedFor = new Set(
      this.state.answers
        .map((a) => this.clarifiedContradiction(a.questionId))
        .filter(Boolean),
    );
    if (open && !alreadyAskedFor.has(open.id) && this.state.questionCount < MAX_QUESTIONS) {
      const q = generateClarification(open);
      this.pendingClarifications.set(q.id, open.id);
      this.clarificationLog.set(q.id, open.id);
      this.state.currentQuestion = q;
      this.state.questionCount += 1;
      this.trace("consistency", `זוהתה סתירה: ${open.description}`);
      this.trace("interview", "נשלחה שאלת הבהרה");
      return;
    }

    // 2. Information gaps drive the next regular question.
    this.state.gaps = findInformationGaps(this.state.answers);
    this.trace(
      "information-gap",
      this.state.gaps.length > 0
        ? `פערי מידע פתוחים: ${this.state.gaps.map((g) => g.field).join(", ")}`
        : "אין פערי מידע פתוחים",
    );

    const confident = this.state.confidence.overall >= CONFIDENCE_THRESHOLD;
    const budgetSpent = this.state.questionCount >= MAX_QUESTIONS;
    const gapsRemain = hasActionableGaps(this.state.gaps);

    if (gapsRemain && !budgetSpent && !(confident && this.state.gaps[0].priority < 0.5)) {
      const q = generateQuestion(
        this.state.gaps[0],
        this.state.graph,
        this.state.answers,
        this.personalContext,
      );
      this.state.currentQuestion = q;
      this.state.questionCount += 1;
      this.trace("interview", `שאלה חדשה על "${q.field}" (${q.type})`);
      return;
    }

    // 3. Nothing left to ask — move to synthesis.
    this.synthesize();
  }

  private clarificationLog = new Map<string, string>();
  private clarifiedContradiction(questionId: string): string | undefined {
    return this.clarificationLog.get(questionId);
  }

  /** Synthesis pipeline with the critic and quality loops. */
  private synthesize() {
    this.state.phase = "synthesizing";

    const persona = buildPersona(
      this.state.answers,
      this.state.graph,
      this.state.confidence,
      this.state.contradictions,
    );
    this.trace("persona-builder", `נבנה פרופיל: ${persona.roleLabel}, ${persona.taskIds.length} משימות, ${persona.painIds.length} חסמים`);

    const opportunities = detectOpportunities(persona, this.state.graph);
    this.trace("opportunity-detector", `זוהו ${opportunities.length} הזדמנויות`);

    // --- Critic loop -------------------------------------------------
    let excludeNodeIds = new Set<string>();
    let recommendations = generateRecommendations(opportunities, persona, this.state.graph);
    let criticRounds = 0;
    for (let round = 0; round < MAX_CRITIC_ROUNDS; round++) {
      criticRounds = round + 1;
      const critique = critiqueRecommendations(
        recommendations,
        opportunities,
        persona,
        this.state.graph,
      );
      this.trace(
        "critic",
        critique.passed
          ? `סבב ${criticRounds}: ההמלצות אושרו`
          : `סבב ${criticRounds}: ${critique.issues.join("; ")}`,
      );
      if (critique.passed) break;

      excludeNodeIds = new Set([...excludeNodeIds, ...critique.exclude]);
      recommendations = generateRecommendations(opportunities, persona, this.state.graph, {
        excludeNodeIds,
      });
      recommendations = applyMustInclude(
        recommendations,
        critique.mustInclude,
        opportunities,
        this.state.graph,
      );
      this.trace("recommendation", `ההמלצות עודכנו לפי הביקורת (סבב ${criticRounds})`);
    }
    this.trace("recommendation", `${recommendations.length} המלצות סופיות`);

    // --- Quality loop -------------------------------------------------
    let curriculum = buildCurriculum(recommendations, persona);
    let quality = assessCurriculum(curriculum, persona, recommendations);
    let qualityRounds = 1;
    while (!quality.passed && qualityRounds < MAX_QUALITY_ROUNDS) {
      this.trace("quality", `סבב ${qualityRounds}: ${quality.issues.join("; ")}`);
      curriculum = buildCurriculum(recommendations, persona, {
        maxItemsPerPhase: quality.suggestedMaxItemsPerPhase ?? 2,
      });
      quality = assessCurriculum(curriculum, persona, recommendations);
      qualityRounds += 1;
    }
    this.trace(
      "quality",
      quality.passed
        ? `תוכנית הלימוד אושרה (ציון ${Math.round(quality.score * 100)}%)`
        : `תוכנית הלימוד פורסמה עם הסתייגויות: ${quality.issues.join("; ")}`,
    );

    const taskMap = persona.taskIds.map((taskId) => {
      const painLabels = this.state.graph.edges
        .filter((e) => e.from === taskId && e.kind === "suffers" && persona.painIds.includes(e.to))
        .map((e) => this.state.graph.nodes.get(e.to)?.label ?? e.to);
      return {
        taskId,
        label: this.state.graph.nodes.get(taskId)?.label ?? taskId,
        painLabels,
      };
    });

    const report: AdvisorReport = {
      persona,
      taskMap,
      opportunities,
      recommendations,
      curriculum,
      quality,
      criticRounds,
      qualityRounds,
    };

    this.state.report = report;
    this.state.phase = "done";
  }
}

export function currentQuestion(state: AdvisorState): Question | null {
  return state.currentQuestion;
}
