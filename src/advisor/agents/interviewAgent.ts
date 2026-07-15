/**
 * Interview Agent — turns the top information gap into the next question.
 *
 * The interview is adaptive rather than a rigid questionnaire: options are
 * derived from the Knowledge Graph based on previous answers (e.g. the task
 * list matches the chosen role, the pain list matches the chosen tasks),
 * and phrasing stays conversational. Question types vary between choices,
 * sliders, ranking, free text and artifact uploads.
 */

import type {
  Answer,
  Contradiction,
  InformationGap,
  KnowledgeGraph,
  Question,
  QuestionOption,
} from "../types";
import { edgesFrom, nodesOfKind } from "./researchAgent";

let questionCounter = 0;

function nextId(): string {
  return `q-${++questionCounter}`;
}

function findAnswer(answers: Answer[], field: Answer["field"]): Answer | undefined {
  return answers.find((a) => a.field === field && !a.skipped);
}

function asIds(value: Answer["value"] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
}

/** Tasks the graph associates with the user's chosen role, strongest first. */
function tasksForRole(graph: KnowledgeGraph, roleId: string | undefined): QuestionOption[] {
  const taskNodes = nodesOfKind(graph, "task");
  if (!roleId || !graph.nodes.has(roleId)) {
    return taskNodes.map((t) => ({ id: t.id, label: t.label }));
  }
  const performed = edgesFrom(graph, roleId, "performs").sort((a, b) => b.weight - a.weight);
  const performedIds = new Set(performed.map((e) => e.to));
  const ordered = [
    ...performed.map((e) => graph.nodes.get(e.to)!),
    ...taskNodes.filter((t) => !performedIds.has(t.id)),
  ];
  return ordered.map((t) => ({ id: t.id, label: t.label }));
}

/** Pains connected to the tasks the user selected. */
function painsForTasks(graph: KnowledgeGraph, taskIds: string[]): QuestionOption[] {
  const painIds = new Set<string>();
  for (const taskId of taskIds) {
    for (const edge of edgesFrom(graph, taskId, "suffers")) painIds.add(edge.to);
  }
  const pains = [...painIds]
    .map((id) => graph.nodes.get(id))
    .filter((n): n is NonNullable<typeof n> => !!n);
  const fallback = pains.length > 0 ? pains : nodesOfKind(graph, "pain");
  return fallback.map((p) => ({ id: p.id, label: p.label }));
}

/** What the orchestrator learned about the person from free text. */
export interface PersonalContext {
  /** The user's own words that identified their field (e.g. "יוגה"). */
  phrase?: string;
  /** Role ids the matcher considered likely, best first. */
  suggestedRoleIds?: string[];
}

/** "בתחום שלך (יוגה)" — safe personalization without Hebrew inflection. */
function personalTag(context: PersonalContext): string {
  return context.phrase ? ` (${context.phrase})` : "";
}

export function generateQuestion(
  gap: InformationGap,
  graph: KnowledgeGraph,
  answers: Answer[],
  context: PersonalContext = {},
): Question {
  const id = nextId();
  switch (gap.field) {
    case "selfDescription":
      return {
        id,
        field: "selfDescription",
        type: "open-text",
        text: "נעים להכיר! לפני הכול — ספרו לי במילים שלכם: מה אתם עושים, ואיך נראה יום עבודה טיפוסי שלכם?",
        hint: "אין תשובה נכונה. כמה משפטים חופשיים — מזה אבנה את שאר השיחה במיוחד בשבילך.",
      };
    case "role": {
      const suggested = context.suggestedRoleIds ?? [];
      const allRoles = nodesOfKind(graph, "role");
      const ordered = [
        ...suggested.map((rid) => allRoles.find((r) => r.id === rid)).filter((r): r is NonNullable<typeof r> => !!r),
        ...allRoles.filter((r) => !suggested.includes(r.id)),
      ];
      return {
        id,
        field: "role",
        type: "single-choice",
        text:
          suggested.length > 0
            ? "מהתיאור שלך אני לא בטוח במאה אחוז — איזה מהתחומים האלה הכי קרוב למה שאתם עושים?"
            : "כדי שאבין את עולם העבודה שלך — איזה תחום הכי קרוב למה שאתם עושים ביום־יום?",
        hint: "בחרו את הקרוב ביותר — נדייק את השאר בשאלות הבאות.",
        options: ordered.map((r) => ({
          id: r.id,
          label: r.description ? `${r.label} — ${r.description}` : r.label,
        })),
      };
    }
    case "tasks": {
      const roleId = asIds(findAnswer(answers, "role")?.value)[0];
      return {
        id,
        field: "tasks",
        type: "ranking",
        text: `מתוך המשימות האלה, סדרו אותן לפי כמה זמן הן באמת לוקחות לכם בשבוע בתחום שלכם${personalTag(context)} — מהגוזלת ביותר ומטה.`,
        hint: "אפשר להשאיר בחוץ משימות שלא רלוונטיות בכלל.",
        options: tasksForRole(graph, roleId),
      };
    }
    case "pains": {
      const taskIds = asIds(findAnswer(answers, "tasks")?.value);
      return {
        id,
        field: "pains",
        type: "multi-choice",
        text: `איפה זה הכי כואב בעבודה שלכם${personalTag(context)}? סמנו את הדברים שהכי מתסכלים או מעכבים אתכם.`,
        options: painsForTasks(graph, taskIds),
      };
    }
    case "toolsUsed":
      return {
        id,
        field: "toolsUsed",
        type: "multi-choice",
        text: "באילו כלי AI כבר יצא לכם לגעת, אפילו רק לניסיון?",
        hint: "אם אף אחד — פשוט דלגו, זו נקודת פתיחה מצוינת.",
        options: nodesOfKind(graph, "tool").map((t) => ({ id: t.id, label: t.label })),
      };
    case "aiExperience":
      return {
        id,
        field: "aiExperience",
        type: "slider",
        text: "ובכנות — כמה בנוח אתם מרגישים עם כלי AI היום?",
        slider: { min: 0, max: 10, step: 1, minLabel: "בכלל לא נגעתי", maxLabel: "משתמש/ת יומיומי/ת" },
      };
    case "learningStyle":
      return {
        id,
        field: "learningStyle",
        type: "single-choice",
        text: "כשאתם לומדים משהו חדש, מה עובד לכם הכי טוב?",
        options: [
          { id: "video", label: "סרטונים וקורסים מוקלטים" },
          { id: "reading", label: "מאמרים ומדריכים כתובים" },
          { id: "hands-on", label: "ללכלך את הידיים — ללמוד תוך כדי עשייה" },
          { id: "mentored", label: "ליווי אישי או למידה בקבוצה" },
        ],
      };
    case "timeBudget":
      return {
        id,
        field: "timeBudget",
        type: "slider",
        text: "כמה שעות בשבוע ריאלי שתקדישו ללמידה ותרגול?",
        hint: "תשובה כנה כאן שווה יותר מתוכנית שאפתנית שלא תקרה.",
        slider: { min: 1, max: 15, step: 1, minLabel: "שעה", maxLabel: "15+ שעות" },
      };
    case "goals":
      return {
        id,
        field: "goals",
        type: "open-text",
        text: "אם בעוד שלושה חודשים הייתם מספרים לחבר 'ה-AI שינה לי את העבודה' — מה הייתם רוצים שיהיה שם בסיפור?",
        hint: "כמה משפטים חופשיים. אפשר גם להקליט או להעלות קובץ בשלב הבא.",
      };
    case "workArtifacts":
      return {
        id,
        field: "workArtifacts",
        type: "file-upload",
        text: "רוצים לשתף דוגמה מהעבודה? צילום מסך, מסמך או הקלטה קצרה יעזרו לי לדייק את ההמלצות.",
        hint: "לא חובה — אפשר לדלג.",
      };
  }
}

/** Build a clarification question for a detected contradiction. */
export function generateClarification(contradiction: Contradiction): Question {
  return {
    id: nextId(),
    field: contradiction.fields[0],
    type: "open-text",
    text: `רגע, משהו לא מסתדר לי: ${contradiction.description} — תוכלו לעזור לי להבין מה יותר מדויק?`,
    isClarification: true,
  };
}
