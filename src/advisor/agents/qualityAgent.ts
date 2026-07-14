/**
 * Quality Agent — final gate on the curriculum. Verifies the plan fits the
 * user's time budget, covers the top opportunities, and progresses from
 * foundations to depth. Failures come with revision hints for the loop.
 */

import type { CurriculumPlan, PersonaProfile, QualityReport, Recommendation } from "../types";

export interface QualityResult extends QualityReport {
  /** Hint for the next curriculum round. */
  suggestedMaxItemsPerPhase?: number;
}

export function assessCurriculum(
  plan: CurriculumPlan,
  persona: PersonaProfile,
  recommendations: Recommendation[],
): QualityResult {
  const issues: string[] = [];
  let suggestedMaxItemsPerPhase: number | undefined;

  // 1. Load vs. time budget — allow a small stretch, not fantasy.
  if (plan.totalWeeklyHours > persona.timeBudgetHours * 1.25) {
    issues.push(
      `העומס השבועי (${plan.totalWeeklyHours} שעות) חורג מתקציב הזמן (${persona.timeBudgetHours} שעות)`,
    );
    const currentMax = Math.max(...plan.phases.map((p) => p.items.length), 1);
    suggestedMaxItemsPerPhase = Math.max(1, currentMax - 1);
  }

  // 2. The plan must not be empty when there are recommendations.
  const totalItems = plan.phases.reduce((sum, p) => sum + p.items.length, 0);
  if (recommendations.length > 0 && totalItems === 0) {
    issues.push("התוכנית ריקה למרות שיש המלצות");
  }

  // 3. Top-priority recommendations must appear somewhere in the plan.
  const planned = new Set(
    plan.phases.flatMap((p) => p.items.map((i) => i.recommendationId)),
  );
  const topRecs = recommendations.filter((r) => r.priority <= 2).slice(0, 3);
  for (const rec of topRecs) {
    if (!planned.has(rec.id)) {
      issues.push(`המלצה מרכזית ("${rec.title}") לא נכנסה לתוכנית`);
    }
  }

  // 4. Progression — the first phase should exist before later ones.
  const [p30, p60] = plan.phases;
  if (p30.items.length === 0 && p60.items.length > 0) {
    issues.push("אין שלב יסודות — התוכנית קופצת ישר לעומק");
  }

  // 5. Every phase needs measurable success metrics.
  for (const phase of plan.phases) {
    if (phase.items.length > 0 && phase.successMetrics.length === 0) {
      issues.push(`שלב ${phase.day} חסר מדדי הצלחה`);
    }
  }

  const score = Math.max(0, 1 - issues.length * 0.25);
  return { passed: issues.length === 0, issues, score, suggestedMaxItemsPerPhase };
}
