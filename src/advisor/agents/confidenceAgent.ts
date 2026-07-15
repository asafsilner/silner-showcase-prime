/**
 * Confidence Agent — scores how much we trust each profile field.
 *
 * Confidence grows with evidence (answers, clarifications, artifacts) and
 * shrinks when the field is involved in an unresolved contradiction or was
 * skipped. Recommendations are only generated once overall confidence
 * crosses a threshold or the interview budget is exhausted.
 */

import type {
  Answer,
  ConfidenceReport,
  Contradiction,
  FieldConfidence,
  ProfileField,
} from "../types";
import { computeCoverage } from "./informationGapAgent";

const ALL_FIELDS: ProfileField[] = [
  "role",
  "tasks",
  "pains",
  "toolsUsed",
  "aiExperience",
  "learningStyle",
  "timeBudget",
  "goals",
  "workArtifacts",
];

/** Fields that materially affect the recommendations. */
const CORE_FIELDS: ProfileField[] = [
  "role",
  "tasks",
  "pains",
  "aiExperience",
  "learningStyle",
  "timeBudget",
];

export function scoreConfidence(
  answers: Answer[],
  contradictions: Contradiction[],
): ConfidenceReport {
  const fields: FieldConfidence[] = ALL_FIELDS.map((field) => {
    const evidence = answers.filter((a) => a.field === field && !a.skipped);
    const clarifications = evidence.filter((a) =>
      a.questionId !== evidence[0]?.questionId,
    ).length;
    const skipped = answers.some((a) => a.field === field && a.skipped);

    let score = computeCoverage(answers, field);
    // Extra evidence (clarifications) adds trust, capped below certainty.
    score = Math.min(0.95, score + clarifications * 0.1);

    const inConflict = contradictions.some(
      (c) => !c.resolved && c.fields.includes(field),
    );
    if (inConflict) score *= 0.5;
    if (skipped && evidence.length === 0) score = 0.1;

    const notes = inConflict
      ? "סתירה פתוחה מורידה את הביטחון"
      : skipped && evidence.length === 0
        ? "השאלה דולגה"
        : evidence.length > 0
          ? "נתמך בתשובות המשתמש"
          : "אין עדיין מידע";

    return { field, score, evidenceCount: evidence.length, notes };
  });

  const core = fields.filter((f) => CORE_FIELDS.includes(f.field));
  const overall = core.reduce((sum, f) => sum + f.score, 0) / core.length;
  return { overall, fields };
}

/** Overall confidence needed before moving from interview to synthesis. */
export const CONFIDENCE_THRESHOLD = 0.75;
