/**
 * Opportunity Detector — crosses the persona's pains with the task map and
 * the knowledge graph to find where AI can actually move the needle.
 *
 * Impact rises when the pain is attached to a task the user ranked as
 * time-consuming; effort falls when the user already has AI experience or
 * uses adjacent tools.
 */

import type { KnowledgeGraph, Opportunity, PersonaProfile } from "../types";
import { edgesTo } from "./researchAgent";

export function detectOpportunities(
  persona: PersonaProfile,
  graph: KnowledgeGraph,
): Opportunity[] {
  const opportunities: Opportunity[] = [];

  for (const painId of persona.painIds) {
    const pain = graph.nodes.get(painId);
    if (!pain) continue;

    // Which of the user's tasks does this pain belong to, and how highly
    // was that task ranked? (rank 0 = biggest time sink)
    const sufferingTasks = edgesTo(graph, painId, "suffers").map((e) => e.from);
    const taskId = persona.taskIds.find((t) => sufferingTasks.includes(t)) ?? null;
    const rank = taskId ? persona.taskIds.indexOf(taskId) : persona.taskIds.length;
    const rankFactor = 1 - Math.min(rank, 4) / 5; // 1 .. 0.2

    // Solvability: how strongly do known tools/methods address this pain.
    const solvers = edgesTo(graph, painId, "solves");
    if (solvers.length === 0) continue;
    const bestSolve = Math.max(...solvers.map((e) => e.weight));

    const impact = Math.round(1 + 4 * rankFactor * bestSolve); // 1..5

    // Effort: less AI experience and no adjacent tools = harder start.
    const hasAdjacentTool = solvers.some((e) => persona.toolsUsed.includes(e.from));
    const experienceFactor = 1 - persona.aiExperience / 10; // 0..1
    const effort = Math.max(
      1,
      Math.round(1 + 3 * experienceFactor - (hasAdjacentTool ? 1 : 0)),
    ); // 1..5

    const taskLabel = taskId ? graph.nodes.get(taskId)?.label : null;
    opportunities.push({
      id: `opp-${painId}`,
      title: `להקל על: ${pain.label}`,
      description: taskLabel
        ? `החסם הזה יושב על "${taskLabel}" — משימה שדירגתם גבוה בזמן. יש כלים בשלים שפותרים אותו.`
        : `יש כלים בשלים שפותרים את החסם הזה גם בלי לשנות את שאר תהליך העבודה.`,
      painId,
      taskId,
      impact,
      effort,
      score: impact / effort,
    });
  }

  return opportunities.sort((a, b) => b.score - a.score);
}
