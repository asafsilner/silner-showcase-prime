/**
 * AI Character Studio — shared types.
 *
 * The studio turns a rough canvas sketch + a text prompt into a full
 * character sheet: Part A (visual generation parameters) and Part B
 * (a textual "character bible").
 */

export interface ColorSwatch {
  name: string;
  hex: string;
}

/** Lightweight structural read of the user's sketch. */
export interface SketchAnalysis {
  strokeCount: number;
  /** 0..1 — fraction of the canvas covered by ink. */
  coverage: number;
  /** Width / height of the inked bounding box. */
  aspectRatio: number;
  /** e.g. "tall and slender", "compact and boxy". */
  silhouette: string;
  /** e.g. "upright, symmetric stance". */
  stance: string;
  /** e.g. "roughly 3 heads tall — chibi territory". */
  proportions: string;
  /** Suggested character archetypes that fit the shapes. */
  archetypes: string[];
}

/* ---------------- PART A: visual generation parameters ---------------- */

export interface ExpressionSpec {
  emotion: string;
  note: string;
}

export interface VisualSheetSpec {
  /** Front / 3-4 / side / back view art direction. */
  turnarounds: string[];
  expressions: ExpressionSpec[];
  actionPoses: string[];
  /** Close-up detail callouts (eyes, hands, accessories...). */
  callouts: string[];
  lighting: string;
  artStyle: string;
}

/* ---------------- PART B: character bible ---------------- */

export interface CharacterBio {
  name: string;
  title: string;
  species: string;
  ageEra: string;
  occupation: string;
  backstory: string;
}

export interface StatEntry {
  label: string;
  /** 0..100 */
  value: number;
}

export interface PersonalityMatrix {
  coreTraits: string[];
  motto: string;
  strengths: string[];
  weaknesses: string[];
  stats: StatEntry[];
}

export interface DesignNotes {
  textures: string[];
  proportions: string;
  keyFeatures: string[];
  palette: ColorSwatch[];
}

export interface AnimationGuidelines {
  movementStyle: string;
  gait: string;
  expressionNotes: string;
}

export interface CharacterBible {
  bio: CharacterBio;
  personality: PersonalityMatrix;
  design: DesignNotes;
  animation: AnimationGuidelines;
}

/* ---------------- The full generated sheet ---------------- */

export interface CharacterSheet {
  id: string;
  createdAt: number;
  prompt: string;
  /** PNG data-URL of the user's sketch at generation time, if any. */
  sketchDataUrl: string | null;
  sketchAnalysis: SketchAnalysis | null;
  visual: VisualSheetSpec;
  bible: CharacterBible;
  /** Which engine produced it: deterministic rules or the live model. */
  source: "rules" | "claude";
}

/** A live autocomplete suggestion for the prompt editor. */
export interface PromptSuggestion {
  /** Text to append to the current prompt when accepted. */
  completion: string;
  source: "rules" | "claude";
}
