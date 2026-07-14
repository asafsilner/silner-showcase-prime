/**
 * Consistency Agent — scans the answers for contradictions.
 *
 * Each rule produces a contradiction with a stable id, so a contradiction
 * that was already surfaced (and possibly clarified by the user) is not
 * raised twice. The orchestrator injects a clarification question for each
 * unresolved contradiction and marks it resolved once answered.
 */

import type { Answer, Contradiction } from "../types";

function answerOf(answers: Answer[], field: Answer["field"]): Answer | undefined {
  return answers.find((a) => a.field === field && !a.skipped);
}

function asNumber(value: Answer["value"] | undefined): number | null {
  return typeof value === "number" ? value : null;
}

function asArray(value: Answer["value"] | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

interface Rule {
  id: string;
  check: (answers: Answer[]) => Omit<Contradiction, "id" | "resolved"> | null;
}

const RULES: Rule[] = [
  {
    id: "exp-high-no-tools",
    check: (answers) => {
      const exp = asNumber(answerOf(answers, "aiExperience")?.value);
      const tools = answerOf(answers, "toolsUsed");
      if (exp === null || !tools) return null;
      if (exp >= 7 && asArray(tools.value).length === 0) {
        return {
          fields: ["aiExperience", "toolsUsed"],
          description: "דירגתם את עצמכם כמנוסים מאוד ב-AI, אבל לא סימנתם אף כלי שהשתמשתם בו",
          evidence: [answerOf(answers, "aiExperience")!.questionId, tools.questionId],
        };
      }
      return null;
    },
  },
  {
    id: "exp-low-many-tools",
    check: (answers) => {
      const exp = asNumber(answerOf(answers, "aiExperience")?.value);
      const tools = answerOf(answers, "toolsUsed");
      if (exp === null || !tools) return null;
      if (exp <= 2 && asArray(tools.value).length >= 4) {
        return {
          fields: ["aiExperience", "toolsUsed"],
          description: "דירגתם את עצמכם כמתחילים ב-AI, אבל סימנתם לא מעט כלים שכבר ניסיתם",
          evidence: [answerOf(answers, "aiExperience")!.questionId, tools.questionId],
        };
      }
      return null;
    },
  },
  {
    id: "no-pains-selected",
    check: (answers) => {
      const pains = answerOf(answers, "pains");
      const tasks = answerOf(answers, "tasks");
      if (!pains || !tasks) return null;
      if (asArray(pains.value).length === 0 && asArray(tasks.value).length >= 3) {
        return {
          fields: ["pains", "tasks"],
          description: "בחרתם הרבה משימות שגוזלות זמן אבל אף חסם — בדרך כלל יש לפחות דבר אחד שמתסכל",
          evidence: [tasks.questionId, pains.questionId],
        };
      }
      return null;
    },
  },
];

/**
 * Run all rules; keep resolution state from previously known contradictions.
 */
export function detectContradictions(
  answers: Answer[],
  known: Contradiction[],
): Contradiction[] {
  const result: Contradiction[] = [];
  for (const rule of RULES) {
    const existing = known.find((c) => c.id === rule.id);
    if (existing) {
      result.push(existing);
      continue;
    }
    const found = rule.check(answers);
    if (found) result.push({ ...found, id: rule.id, resolved: false });
  }
  return result;
}
