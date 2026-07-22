/**
 * Claude bridge for the Character Studio.
 *
 * Reuses the site-wide BYO-key config (shared with the AI Advisor):
 * the key lives only in this browser's localStorage and is sent
 * directly to Anthropic. Every function returns null on any failure
 * so callers fall back to the deterministic rule engine.
 *
 * The sketch is sent to the model as an actual image — with a key
 * configured, Claude *sees* the drawing and art-directs from it.
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getApiKey, getModel } from "@/advisor/llm/config";
import { generateCharacterSheet, hashString } from "./engine";
import type { CharacterSheet, PromptSuggestion, SketchAnalysis } from "./types";

function getClient(): Anthropic | null {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
    maxRetries: 1,
    timeout: 90_000,
  });
}

function sketchImageBlock(sketchDataUrl: string): Anthropic.ImageBlockParam | null {
  const match = /^data:(image\/png|image\/jpeg);base64,(.+)$/.exec(sketchDataUrl);
  if (!match) return null;
  return {
    type: "image",
    source: {
      type: "base64",
      media_type: match[1] as "image/png" | "image/jpeg",
      data: match[2],
    },
  };
}

/* ------------------------------------------------------------------ */
/* State 1 — live prompt enhancement                                   */
/* ------------------------------------------------------------------ */

const SuggestionSchema = z.object({
  completion: z.string(),
});

export async function suggestEnhancementLLM(
  prompt: string,
): Promise<PromptSuggestion | null> {
  const client = getClient();
  if (!client) return null;
  try {
    const response = await client.messages.parse({
      model: getModel(),
      max_tokens: 2000,
      output_config: { format: zodOutputFormat(SuggestionSchema), effort: "low" },
      system:
        "You are the Smart Prompt Editor inside an AI character-creation studio. " +
        "The user is typing a character description. Return `completion`: a short " +
        "comma-separated tail to APPEND to their text (starting with ', ') that adds " +
        "art style, materials/textures, lighting and quality tags — e.g. " +
        "', in a premium Pixar-style 3D render, rusty metallic textures, glowing LED eyes, " +
        "studio lighting, ultra-detailed, 8k resolution, clean blueprint background'. " +
        "Never repeat what they already wrote. Under 30 words. If the prompt is already " +
        "fully production-ready, return an empty string.",
      messages: [{ role: "user", content: `Current prompt: "${prompt.trim()}"` }],
    });
    const completion = response.parsed_output?.completion?.trimEnd() ?? "";
    if (!completion.trim()) return null;
    return {
      completion: completion.startsWith(",") || completion.startsWith(" ") ? completion : `, ${completion}`,
      source: "claude",
    };
  } catch (error) {
    console.warn("[studio] LLM suggestion failed, using rules:", error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* State 2 — full character sheet generation (with vision)             */
/* ------------------------------------------------------------------ */

const SheetSchema = z.object({
  sketchAnalysis: z
    .object({
      silhouette: z.string(),
      stance: z.string(),
      proportions: z.string(),
      archetypes: z.array(z.string()),
    })
    .nullable(),
  visual: z.object({
    turnarounds: z.array(z.string()),
    expressions: z.array(z.object({ emotion: z.string(), note: z.string() })),
    actionPoses: z.array(z.string()),
    callouts: z.array(z.string()),
    lighting: z.string(),
    artStyle: z.string(),
  }),
  bible: z.object({
    bio: z.object({
      name: z.string(),
      title: z.string(),
      species: z.string(),
      ageEra: z.string(),
      occupation: z.string(),
      backstory: z.string(),
    }),
    personality: z.object({
      coreTraits: z.array(z.string()),
      motto: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      stats: z.array(z.object({ label: z.string(), value: z.number() })),
    }),
    design: z.object({
      textures: z.array(z.string()),
      proportions: z.string(),
      keyFeatures: z.array(z.string()),
      palette: z.array(z.object({ name: z.string(), hex: z.string() })),
    }),
    animation: z.object({
      movementStyle: z.string(),
      gait: z.string(),
      expressionNotes: z.string(),
    }),
  }),
});

const SHEET_SYSTEM = `You are the generation engine of "AI Character Studio" — a professional tool for artists, game developers and writers. You receive a text prompt and, when available, the user's rough canvas sketch as an image. The sketch is the structural blueprint: read its silhouette, proportions and pose, and let it drive the design. The prompt drives style, materials and personality.

Produce a complete production-quality character sheet:
- PART A (visual): art direction for orthographic turnarounds (front, 3/4, side, back), 5-6 facial expressions, 2 action poses, 3-4 detail callouts, plus consistent lighting and a named art style.
- PART B (bible): bio (fitting invented name), personality matrix with 5 stats (0-100), design notes with concrete materials/textures, a 5-color hex palette, and animation guidelines describing how the character moves.

If a sketch image is provided, also fill sketchAnalysis with what you actually see (silhouette, stance, proportions, up to 3 archetypes); otherwise set it to null. Be specific and inspiring, never generic. Keep every field concise.`;

export async function generateCharacterSheetLLM(
  prompt: string,
  sketchDataUrl: string | null,
  localAnalysis: SketchAnalysis | null,
): Promise<CharacterSheet | null> {
  const client = getClient();
  if (!client) return null;

  const content: Anthropic.ContentBlockParam[] = [];
  const image = sketchDataUrl ? sketchImageBlock(sketchDataUrl) : null;
  if (image) {
    content.push(
      { type: "text", text: "The user's rough sketch (structural blueprint):" },
      image,
    );
  }
  content.push({
    type: "text",
    text: `Character prompt: "${prompt.trim()}"${
      localAnalysis
        ? `\n\nLocal geometric pre-read of the sketch (verify against the image): ${localAnalysis.silhouette}; ${localAnalysis.stance}; ${localAnalysis.proportions}.`
        : ""
    }\n\nGenerate the full character sheet.`,
  });

  try {
    const response = await client.messages.parse({
      model: getModel(),
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { format: zodOutputFormat(SheetSchema), effort: "medium" },
      system: SHEET_SYSTEM,
      messages: [{ role: "user", content }],
    });
    const parsed = response.parsed_output;
    if (!parsed) return null;

    const seed = hashString(prompt.trim().toLowerCase());
    const analysis: SketchAnalysis | null = parsed.sketchAnalysis
      ? {
          strokeCount: localAnalysis?.strokeCount ?? 0,
          coverage: localAnalysis?.coverage ?? 0,
          aspectRatio: localAnalysis?.aspectRatio ?? 1,
          silhouette: parsed.sketchAnalysis.silhouette,
          stance: parsed.sketchAnalysis.stance,
          proportions: parsed.sketchAnalysis.proportions,
          archetypes: parsed.sketchAnalysis.archetypes.slice(0, 3),
        }
      : localAnalysis;

    return {
      id: `char-${seed.toString(36)}-${Date.now().toString(36)}`,
      createdAt: Date.now(),
      prompt: prompt.trim(),
      sketchDataUrl,
      sketchAnalysis: analysis,
      visual: {
        ...parsed.visual,
        turnarounds: parsed.visual.turnarounds.slice(0, 4),
        expressions: parsed.visual.expressions.slice(0, 6),
      },
      bible: {
        ...parsed.bible,
        personality: {
          ...parsed.bible.personality,
          stats: parsed.bible.personality.stats
            .slice(0, 5)
            .map((s) => ({ label: s.label, value: Math.max(0, Math.min(100, Math.round(s.value))) })),
        },
        design: {
          ...parsed.bible.design,
          palette: parsed.bible.design.palette.slice(0, 6),
        },
      },
      source: "claude",
    };
  } catch (error) {
    console.warn("[studio] LLM generation failed, using rule engine:", error);
    return null;
  }
}

/**
 * Generate with the live model when configured, falling back to the
 * deterministic engine otherwise (or on any failure).
 */
export async function generateSheet(
  prompt: string,
  sketchDataUrl: string | null,
  localAnalysis: SketchAnalysis | null,
): Promise<CharacterSheet> {
  const llmSheet = await generateCharacterSheetLLM(prompt, sketchDataUrl, localAnalysis);
  return llmSheet ?? generateCharacterSheet(prompt, sketchDataUrl, localAnalysis);
}
