/**
 * Critic Agent — reviews the recommendation set before it reaches the
 * curriculum. Each issue comes with an actionable fix (nodes to drop or
 * add) so the recommendation agent can revise in the next loop round.
 */

import type { Critique, KnowledgeGraph, Opportunity, PersonaProfile, Recommendation } from "../types";

export interface CriticResult extends Critique {
  /** Node ids to exclude in the next recommendation round. */
  exclude: string[];
  /** Node ids that must appear (e.g. foundations for beginners). */
  mustInclude: string[];
}

const MAX_RECOMMENDATIONS = 8;

export function critiqueRecommendations(
  recommendations: Recommendation[],
  opportunities: Opportunity[],
  persona: PersonaProfile,
  graph: KnowledgeGraph,
): CriticResult {
  const issues: string[] = [];
  const exclude: string[] = [];
  const mustInclude: string[] = [];

  // 1. Coverage — the top opportunities must each get at least one answer.
  const covered = new Set(recommendations.map((r) => r.opportunityId));
  for (const opp of opportunities.slice(0, 3)) {
    if (!covered.has(opp.id)) {
      issues.push(`ההזדמנות "${opp.title}" נשארה בלי המלצה`);
    }
  }

  // 2. Overload — a plan nobody follows is worse than a short one.
  if (recommendations.length > MAX_RECOMMENDATIONS) {
    issues.push("יותר מדי המלצות — התוכנית תהיה עמוסה מכדי לבצע");
    for (const rec of recommendations.slice(MAX_RECOMMENDATIONS)) {
      exclude.push(rec.nodeId);
    }
  }

  // 3. Foundations — beginners need prompting basics before advanced tools.
  if (persona.aiExperience <= 3) {
    const hasFoundation = recommendations.some((r) => r.nodeId === "method-prompting");
    if (!hasFoundation && graph.nodes.has("method-prompting")) {
      issues.push("למתחילים חסר בסיס של כתיבת פרומפטים לפני כלים מתקדמים");
      mustInclude.push("method-prompting");
    }
  }

  // 4. Diversity — tools without skills produce shallow adoption.
  const hasSkill = recommendations.some((r) => r.kind === "skill");
  if (recommendations.length > 0 && !hasSkill) {
    issues.push("כל ההמלצות הן כלים בלבד — חסרה מיומנות שתחזיק לאורך זמן");
  }

  return { passed: issues.length === 0, issues, exclude, mustInclude };
}

/** Apply the critic's mustInclude fix directly to a recommendation set. */
export function applyMustInclude(
  recommendations: Recommendation[],
  mustInclude: string[],
  opportunities: Opportunity[],
  graph: KnowledgeGraph,
): Recommendation[] {
  const result = [...recommendations];
  const present = new Set(result.map((r) => r.nodeId));
  for (const nodeId of mustInclude) {
    if (present.has(nodeId)) continue;
    const node = graph.nodes.get(nodeId);
    if (!node) continue;
    result.unshift({
      id: `rec-${nodeId}-critic`,
      opportunityId: opportunities[0]?.id ?? "general",
      kind: node.kind === "tool" ? "tool" : node.kind === "skill" ? "skill" : "method",
      nodeId,
      title: node.label,
      rationale: "נוסף בעקבות ביקורת: בסיס הכרחי לפני שאר ההמלצות.",
      priority: 1,
    });
  }
  return result;
}
