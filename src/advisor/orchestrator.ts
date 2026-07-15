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
 *
 * When a Claude API key is configured (see llm/config.ts), three steps
 * are upgraded to the live model with graceful fallback to the
 * rule-based path: self-description analysis (Research Agent), question
 * phrasing (Interview Agent), and the personal report narrative.
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
import { detectContradictions } from "./agents/consistencyAgent";
import { CONFIDENCE_THRESHOLD, scoreConfidence } from "./agents/confidenceAgent";
import { buildPersona } from "./agents/personaBuilder";
import { detectOpportunities } from "./agents/opportunityDetector";
import { generateRecommendations } from "./agents/recommendationAgent";
import { applyMustInclude, critiqueRecommendations } from "./agents/criticAgent";
import { buildCurriculum } from "./agents/curriculumBuilder";
import { assessCurriculum } from "./agents/qualityAgent";
import { AUTO_ASSIGN_SCORE, matchRoles } from "./knowledge/roleMatcher";
import { isLLMConfigured } from "./llm/config";
import {
  analyzeSelfDescriptionLLM,
  generateNarrativeLLM,
  personalizeQuestionLLM,
} from "./llm/llmService";

export const MAX_QUESTIONS = 14;
export const MAX_CRITIC_ROUNDS = 3;
export const MAX_QUALITY_ROUNDS = 3;

export class AdvisorEngine {
  private state: AdvisorState;
  /** clarification question id -> contradiction id */
  private pendingClarifications = new Map<string, string>();
  private clarificationLog = new Map<string, string>();
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
    // The opening question is static — no LLM context exists yet.
    this.pickNext();
  }

  getState(): AdvisorState {
    return this.state;
  }

  private trace(agent: AgentName, summary: string) {
    this.state.traces.push({ agent, summary, at: Date.now() });
  }

  /** Record the user's answer and advance the interview loop. */
  async submitAnswer(value: Answer["value"], skipped = false): Promise<AdvisorState> {
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
    // user's field. Live model first, keyword lexicon as fallback.
    if (question.field === "selfDescription" && typeof value === "string" && !skipped) {
      await this.analyzeSelfDescription(question.id, value);
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

    const next = this.pickNext();
    if (next === "synthesize") {
      await this.synthesize();
    } else if (this.state.currentQuestion) {
      await this.personalizeCurrentQuestion();
    }
    return this.state;
  }

  /** Understand the user's own words — live model with lexicon fallback. */
  private async analyzeSelfDescription(questionId: string, text: string) {
    if (isLLMConfigured()) {
      const analysis = await analyzeSelfDescriptionLLM(text, this.state.graph);
      if (analysis) {
        this.personalContext = {
          phrase: analysis.phrase ?? undefined,
          suggestedRoleIds: analysis.roleId ? [analysis.roleId] : [],
        };
        if (analysis.roleId) {
          const label = this.state.graph.nodes.get(analysis.roleId)?.label ?? analysis.roleId;
          this.state.answers.push({
            questionId: `auto-role-${questionId}`,
            field: "role",
            type: "single-choice",
            value: [analysis.roleId],
            answeredAt: Date.now(),
          });
          this.trace("research", `המודל זיהה תחום מהתיאור: ${label} — ${analysis.summary}`);
        } else {
          this.trace("research", `המודל ניתח את התיאור (${analysis.summary}) אך לא זיהה תחום חד-משמעי`);
        }
        if (analysis.painIds.length > 0) {
          this.state.answers.push({
            questionId: `auto-pains-${questionId}`,
            field: "pains",
            type: "multi-choice",
            value: analysis.painIds,
            answeredAt: Date.now(),
          });
          this.trace(
            "research",
            `המודל זיהה חסמים שכבר עלו בתיאור: ${analysis.painIds
              .map((id) => this.state.graph.nodes.get(id)?.label ?? id)
              .join(", ")}`,
          );
        }
        return;
      }
      this.trace("research", "קריאת המודל נכשלה — עוברים לזיהוי מבוסס לקסיקון");
    }

    // Rule-based fallback: keyword lexicon.
    const matches = matchRoles(text);
    if (matches.length > 0) {
      this.personalContext = {
        phrase: matches[0].matchedPhrase,
        suggestedRoleIds: matches.map((m) => m.roleId),
      };
      const top = matches[0];
      const label = this.state.graph.nodes.get(top.roleId)?.label ?? top.roleId;
      if (top.score >= AUTO_ASSIGN_SCORE) {
        this.state.answers.push({
          questionId: `auto-role-${questionId}`,
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

  /**
   * Interview loop step: clarification > next gap question > synthesis.
   * Pure decision logic — no LLM calls here.
   */
  private pickNext(): "question" | "synthesize" {
    // 1. Unresolved contradictions get a clarification question first.
    const open = this.state.contradictions.find(
      (c) => !c.resolved && ![...this.pendingClarifications.values()].includes(c.id),
    );
    const alreadyAskedFor = new Set(this.clarificationLog.values());
    if (open && !alreadyAskedFor.has(open.id) && this.state.questionCount < MAX_QUESTIONS) {
      const q = generateClarification(open);
      this.pendingClarifications.set(q.id, open.id);
      this.clarificationLog.set(q.id, open.id);
      this.state.currentQuestion = q;
      this.state.questionCount += 1;
      this.trace("consistency", `זוהתה סתירה: ${open.description}`);
      this.trace("interview", "נשלחה שאלת הבהרה");
      return "question";
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
      return "question";
    }

    return "synthesize";
  }

  /** Let the live model rephrase the pending question conversationally. */
  private async personalizeCurrentQuestion() {
    const q = this.state.currentQuestion;
    if (!q || !isLLMConfigured()) return;

    const selfDesc = this.state.answers.find(
      (a) => a.field === "selfDescription" && !a.skipped,
    );
    if (!selfDesc || typeof selfDesc.value !== "string") return;

    const roleAnswer = this.state.answers.find((a) => a.field === "role" && !a.skipped);
    const roleId = Array.isArray(roleAnswer?.value) ? roleAnswer.value[0] : undefined;
    const roleLabel = roleId ? this.state.graph.nodes.get(roleId)?.label ?? "" : "";

    const phrased = await personalizeQuestionLLM(q, {
      selfDescription: selfDesc.value,
      roleLabel,
      phrase: this.personalContext.phrase ?? null,
      questionNumber: this.state.questionCount,
    });
    if (phrased && this.state.currentQuestion?.id === q.id) {
      q.text = phrased.text;
      if (phrased.hint) q.hint = phrased.hint;
      this.trace("interview", "השאלה נוסחה מחדש על ידי המודל");
    }
  }

  /** Synthesis pipeline with the critic and quality loops. */
  private async synthesize() {
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

    // Live-model touch: a personal narrative that ties it all together.
    if (isLLMConfigured()) {
      const narrative = await generateNarrativeLLM(report, persona);
      if (narrative) {
        report.narrative = narrative;
        this.trace("recommendation", "המודל כתב סיכום אישי לדוח");
      }
    }

    this.state.report = report;
    this.state.phase = "done";
  }
}
