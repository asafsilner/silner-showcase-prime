/**
 * Information Gap Agent — computes which profile fields still lack
 * sufficient evidence, and how urgently each should be asked about.
 * The interview loop keeps running while high-priority gaps remain.
 */

import type { Answer, InformationGap, ProfileField } from "../types";

interface FieldSpec {
  field: ProfileField;
  /** Base importance of the field for building a persona (0..1). */
  importance: number;
  /** Answers needed for full coverage. */
  targetEvidence: number;
  /** Fields that must be covered before this one is worth asking. */
  dependsOn?: ProfileField[];
  reason: string;
}

const FIELD_SPECS: FieldSpec[] = [
  { field: "selfDescription", importance: 1.0, targetEvidence: 1, reason: "התיאור האישי הוא הבסיס לכל השאלות הבאות" },
  { field: "role", importance: 0.98, targetEvidence: 1, dependsOn: ["selfDescription"], reason: "בלי תחום עיסוק אי אפשר למפות משימות" },
  { field: "tasks", importance: 0.95, targetEvidence: 1, dependsOn: ["role"], reason: "מפת המשימות היא הבסיס לזיהוי הזדמנויות" },
  { field: "pains", importance: 0.9, targetEvidence: 1, dependsOn: ["tasks"], reason: "החסמים קובעים אילו הזדמנויות שוות בדיקה" },
  { field: "toolsUsed", importance: 0.7, targetEvidence: 1, reason: "כלים קיימים משפיעים על ההמלצות" },
  { field: "aiExperience", importance: 0.8, targetEvidence: 1, reason: "רמת הניסיון קובעת את נקודת ההתחלה" },
  { field: "learningStyle", importance: 0.75, targetEvidence: 1, reason: "סגנון הלמידה מעצב את מסלול הלימוד" },
  { field: "timeBudget", importance: 0.8, targetEvidence: 1, reason: "תקציב הזמן קובע את קצב התוכנית" },
  { field: "goals", importance: 0.6, targetEvidence: 1, dependsOn: ["role"], reason: "מטרות אישיות ממקדות את ההמלצות" },
  { field: "workArtifacts", importance: 0.3, targetEvidence: 1, dependsOn: ["tasks", "pains"], reason: "דוגמאות עבודה מחדדות את הפרופיל" },
];

export function computeCoverage(answers: Answer[], field: ProfileField): number {
  const spec = FIELD_SPECS.find((s) => s.field === field);
  if (!spec) return 1;
  const evidence = answers.filter((a) => a.field === field && !a.skipped).length;
  return Math.min(1, evidence / spec.targetEvidence);
}

export function findInformationGaps(answers: Answer[]): InformationGap[] {
  const gaps: InformationGap[] = [];
  for (const spec of FIELD_SPECS) {
    const coverage = computeCoverage(answers, spec.field);
    if (coverage >= 1) continue;
    // A skipped dependency counts as "handled": we asked, the user passed,
    // and the interview must not cascade-skip everything downstream.
    const dependenciesMet = (spec.dependsOn ?? []).every(
      (dep) =>
        computeCoverage(answers, dep) >= 1 ||
        answers.some((a) => a.field === dep && a.skipped),
    );
    // A skipped question lowers priority so the interview moves on instead
    // of nagging, but the gap stays visible for the confidence report.
    const wasSkipped = answers.some((a) => a.field === spec.field && a.skipped);
    const priority =
      spec.importance * (1 - coverage) * (dependenciesMet ? 1 : 0.15) * (wasSkipped ? 0.1 : 1);
    gaps.push({ field: spec.field, coverage, priority, reason: spec.reason });
  }
  return gaps.sort((a, b) => b.priority - a.priority);
}

/** The interview may stop once no gap is above this priority. */
export const GAP_PRIORITY_THRESHOLD = 0.2;

export function hasActionableGaps(gaps: InformationGap[]): boolean {
  return gaps.some((g) => g.priority > GAP_PRIORITY_THRESHOLD);
}
