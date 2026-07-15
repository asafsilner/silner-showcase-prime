/**
 * Recommendation Agent — translates opportunities into concrete tool,
 * method and skill recommendations, ordered by opportunity score.
 *
 * Accepts critic feedback via `excludeNodeIds` so the critic loop can force
 * a revision (e.g. drop a tool the user already masters, or diversify).
 */

import type { KnowledgeGraph, Opportunity, PersonaProfile, Recommendation } from "../types";
import { edgesFrom, edgesTo } from "./researchAgent";

export interface RecommendationOptions {
  /** Node ids the critic rejected in a previous round. */
  excludeNodeIds?: Set<string>;
  maxPerOpportunity?: number;
}

export function generateRecommendations(
  opportunities: Opportunity[],
  persona: PersonaProfile,
  graph: KnowledgeGraph,
  options: RecommendationOptions = {},
): Recommendation[] {
  const exclude = options.excludeNodeIds ?? new Set<string>();
  const maxPer = options.maxPerOpportunity ?? 2;
  const recommendations: Recommendation[] = [];
  const usedNodes = new Set<string>();

  opportunities.forEach((opp, oppIndex) => {
    const solvers = edgesTo(graph, opp.painId, "solves")
      .filter((e) => !exclude.has(e.from) && !usedNodes.has(e.from))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, maxPer);

    for (const edge of solvers) {
      const node = graph.nodes.get(edge.from);
      if (!node) continue;
      usedNodes.add(node.id);

      const alreadyUses = persona.toolsUsed.includes(node.id);
      recommendations.push({
        id: `rec-${node.id}-${opp.id}`,
        opportunityId: opp.id,
        kind: node.kind === "tool" ? "tool" : "method",
        nodeId: node.id,
        title: node.label,
        rationale: alreadyUses
          ? `כבר התנסיתם ב-${node.label} — כאן נעמיק בו ספציפית בשביל "${graph.nodes.get(opp.painId)?.label}".`
          : `${node.description ?? node.label} — התאמה ישירה לחסם "${graph.nodes.get(opp.painId)?.label}".`,
        priority: Math.min(5, oppIndex + 1),
      });

      // Every tool/method drags in the skills it requires or teaches.
      const skillEdges = [
        ...edgesFrom(graph, node.id, "requires"),
        ...edgesFrom(graph, node.id, "teaches"),
      ];
      for (const skillEdge of skillEdges) {
        const skill = graph.nodes.get(skillEdge.to);
        if (!skill || usedNodes.has(skill.id) || exclude.has(skill.id)) continue;
        usedNodes.add(skill.id);
        recommendations.push({
          id: `rec-${skill.id}-${opp.id}`,
          opportunityId: opp.id,
          kind: "skill",
          nodeId: skill.id,
          title: skill.label,
          rationale: `מיומנות בסיס שנדרשת כדי להפיק ערך אמיתי מ-${node.label}.`,
          priority: Math.min(5, oppIndex + 2),
        });
      }
    }
  });

  return recommendations.sort((a, b) => a.priority - b.priority);
}
