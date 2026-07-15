/**
 * Persona Builder — assembles the full user profile from raw answers,
 * the knowledge graph, the confidence report and open contradictions.
 */

import type {
  Answer,
  ConfidenceReport,
  Contradiction,
  KnowledgeGraph,
  LearningStyle,
  PersonaProfile,
} from "../types";

function answerOf(answers: Answer[], field: Answer["field"]): Answer | undefined {
  return answers.find((a) => a.field === field && !a.skipped);
}

function asArray(value: Answer["value"] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value) return [value];
  return [];
}

const LEARNING_STYLES: LearningStyle[] = ["video", "reading", "hands-on", "mentored"];

export function buildPersona(
  answers: Answer[],
  graph: KnowledgeGraph,
  confidence: ConfidenceReport,
  contradictions: Contradiction[],
): PersonaProfile {
  const roleId = asArray(answerOf(answers, "role")?.value)[0] ?? null;
  const roleLabel = roleId ? graph.nodes.get(roleId)?.label ?? roleId : "לא ידוע";

  const styleRaw = asArray(answerOf(answers, "learningStyle")?.value)[0];
  const learningStyle: LearningStyle = LEARNING_STYLES.includes(styleRaw as LearningStyle)
    ? (styleRaw as LearningStyle)
    : "hands-on";

  const aiExpRaw = answerOf(answers, "aiExperience")?.value;
  const timeRaw = answerOf(answers, "timeBudget")?.value;
  const goalsRaw = answerOf(answers, "goals")?.value;

  return {
    roleId,
    roleLabel,
    taskIds: asArray(answerOf(answers, "tasks")?.value).filter((id) => graph.nodes.has(id)),
    painIds: asArray(answerOf(answers, "pains")?.value).filter((id) => graph.nodes.has(id)),
    toolsUsed: asArray(answerOf(answers, "toolsUsed")?.value),
    aiExperience: typeof aiExpRaw === "number" ? aiExpRaw : 3,
    learningStyle,
    timeBudgetHours: typeof timeRaw === "number" ? timeRaw : 3,
    goals: typeof goalsRaw === "string" ? goalsRaw : "",
    artifacts: asArray(answerOf(answers, "workArtifacts")?.value),
    confidence,
    contradictions,
  };
}
