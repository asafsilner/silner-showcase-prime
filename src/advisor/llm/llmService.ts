/**
 * LLM service — the bridge between the rule-based agents and Claude.
 *
 * Three touchpoints, each with graceful degradation: every function
 * returns null on any failure (no key, network error, refusal, invalid
 * JSON), and the caller falls back to the deterministic rule-based path.
 *
 * Runs directly in the browser (BYO key, `dangerouslyAllowBrowser`) —
 * the key comes from localStorage and goes only to Anthropic's API.
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { KnowledgeGraph, PersonaProfile, AdvisorReport, Question } from "../types";
import { nodesOfKind } from "../agents/researchAgent";
import { getApiKey, getModel } from "./config";

function getClient(): Anthropic | null {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
    maxRetries: 1,
    timeout: 60_000,
  });
}

/** Extract the first text block from a response. */
function textOf(response: Anthropic.Message): string {
  for (const block of response.content) {
    if (block.type === "text") return block.text;
  }
  return "";
}

/* ------------------------------------------------------------------ */
/* 1. Research Agent — analyze the free-text self-description          */
/* ------------------------------------------------------------------ */

const AnalysisSchema = z.object({
  roleId: z.string().nullable(),
  phrase: z.string().nullable(),
  painIds: z.array(z.string()),
  summary: z.string(),
});

export interface LLMAnalysis {
  roleId: string | null;
  phrase: string | null;
  painIds: string[];
  summary: string;
}

export async function analyzeSelfDescriptionLLM(
  text: string,
  graph: KnowledgeGraph,
): Promise<LLMAnalysis | null> {
  const client = getClient();
  if (!client) return null;

  const roles = nodesOfKind(graph, "role")
    .map((r) => `${r.id}: ${r.label}${r.description ? ` (${r.description})` : ""}`)
    .join("\n");
  const pains = nodesOfKind(graph, "pain")
    .map((p) => `${p.id}: ${p.label}`)
    .join("\n");

  try {
    const response = await client.messages.parse({
      model: getModel(),
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { format: zodOutputFormat(AnalysisSchema), effort: "low" },
      system:
        "אתה סוכן המחקר במערכת ייעוץ AI אישית. תפקידך לנתח את התיאור החופשי של המשתמש על העבודה שלו ולמפות אותו לגרף הידע של המערכת. השב בעברית.",
      messages: [
        {
          role: "user",
          content: `תיאור המשתמש על עצמו:
"""${text}"""

תחומי עיסוק אפשריים (מזהה: תווית):
${roles}

חסמים אפשריים (מזהה: תווית):
${pains}

החזר:
- roleId: מזהה התחום המתאים ביותר מהרשימה, או null אם אף אחד לא קרוב מספיק
- phrase: מילה או שתיים מתוך התיאור של המשתמש עצמו שמתמצתות את התחום (למשל "יוגה"), או null
- painIds: מזהי חסמים מהרשימה שכבר משתמעים במפורש מהתיאור (רק אם באמת נאמרו, אחרת רשימה ריקה)
- summary: משפט אחד קצר בעברית שמסכם את הפרופיל המקצועי`,
        },
      ],
    });

    const parsed = response.parsed_output;
    if (!parsed) return null;
    // Trust nothing: validate ids against the graph before use.
    const roleId = parsed.roleId && graph.nodes.has(parsed.roleId) ? parsed.roleId : null;
    const painIds = parsed.painIds.filter((id) => graph.nodes.has(id));
    return { roleId, phrase: parsed.phrase, painIds, summary: parsed.summary };
  } catch (error) {
    console.warn("[advisor] LLM analysis failed, falling back to lexicon:", error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* 2. Interview Agent — rephrase the next question conversationally    */
/* ------------------------------------------------------------------ */

const PhrasingSchema = z.object({
  text: z.string(),
  hint: z.string().nullable(),
});

export interface InterviewContextForLLM {
  selfDescription: string;
  roleLabel: string;
  phrase: string | null;
  questionNumber: number;
}

export async function personalizeQuestionLLM(
  question: Question,
  context: InterviewContextForLLM,
): Promise<{ text: string; hint: string | null } | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const response = await client.messages.parse({
      model: getModel(),
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { format: zodOutputFormat(PhrasingSchema), effort: "low" },
      system:
        "אתה המראיין במערכת ייעוץ AI אישית. נסח מחדש שאלות ראיון כך שירגישו כמו שיחה טבעית, חמה ואישית — לא שאלון. שמור על המשמעות המדויקת של השאלה המקורית. השב בעברית, בגוף שני.",
      messages: [
        {
          role: "user",
          content: `על המרואיין: "${context.selfDescription}"
תחום: ${context.roleLabel}${context.phrase ? ` (${context.phrase})` : ""}
זו שאלה מספר ${context.questionNumber} בשיחה.

השאלה המקורית: "${question.text}"
${question.hint ? `הסבר נלווה: "${question.hint}"` : ""}
${question.options ? `(לשאלה יש אפשרויות בחירה קבועות — אל תזכיר אותן בטקסט, הן יוצגו בנפרד)` : ""}

נסח מחדש את השאלה כך שתתייחס לעולם הספציפי של המרואיין (בלי להמציא עובדות עליו). החזר text (השאלה) ו-hint (הסבר קצר או null).`,
        },
      ],
    });
    return response.parsed_output ?? null;
  } catch (error) {
    console.warn("[advisor] LLM question phrasing failed, using rule-based text:", error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* 3. Report — a personal narrative summary from the advisor           */
/* ------------------------------------------------------------------ */

export async function generateNarrativeLLM(
  report: AdvisorReport,
  persona: PersonaProfile,
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  const opportunities = report.opportunities
    .map((o) => `- ${o.title} (השפעה ${o.impact}/5, מאמץ ${o.effort}/5)`)
    .join("\n");
  const recommendations = report.recommendations
    .map((r) => `- ${r.title}: ${r.rationale}`)
    .join("\n");
  const phases = report.curriculum.phases
    .map((p) => `- עד יום ${p.day}: ${p.theme} — ${p.items.map((i) => i.title).join(", ")}`)
    .join("\n");

  try {
    const response = await client.messages.create({
      model: getModel(),
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system:
        "אתה יועץ AI אישי. כתוב סיכום אישי וחם בעברית, בגוף שני, שמחבר בין מה שהמשתמש סיפר לבין התוכנית שנבנתה לו. בלי כותרות, בלי רשימות — 2-3 פסקאות קצרות של טקסט זורם. היה קונקרטי לעולם שלו, לא גנרי.",
      messages: [
        {
          role: "user",
          content: `מה המשתמש סיפר על עצמו: "${persona.selfDescription}"
תחום: ${persona.roleLabel}
המטרה שהגדיר: "${persona.goals}"
ניסיון AI: ${persona.aiExperience}/10 | זמן פנוי ללמידה: ${persona.timeBudgetHours} שעות בשבוע

ההזדמנויות שזוהו:
${opportunities}

ההמלצות:
${recommendations}

מסלול הלמידה:
${phases}

כתוב את הסיכום האישי.`,
        },
      ],
    });
    const text = textOf(response).trim();
    return text.length > 0 ? text : null;
  } catch (error) {
    console.warn("[advisor] LLM narrative failed:", error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Connection test for the settings dialog                             */
/* ------------------------------------------------------------------ */

export async function testConnection(): Promise<{ ok: boolean; message: string }> {
  const client = getClient();
  if (!client) return { ok: false, message: "לא הוגדר מפתח API" };
  try {
    const response = await client.messages.create({
      model: getModel(),
      max_tokens: 64,
      messages: [{ role: "user", content: "השב במילה אחת: שלום" }],
    });
    return { ok: true, message: `החיבור תקין (${response.model})` };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return { ok: false, message: "מפתח ה-API לא תקין" };
    }
    if (error instanceof Anthropic.APIError) {
      return { ok: false, message: `שגיאת API (${error.status}): ${error.message}` };
    }
    return { ok: false, message: "שגיאת רשת — בדקו את החיבור" };
  }
}
