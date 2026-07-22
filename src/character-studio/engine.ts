/**
 * Rule-based generation engine — the deterministic heart of the studio.
 *
 * Everything here works fully offline. When a Claude API key is
 * configured the LLM layer (llm.ts) takes over; on any failure the
 * callers fall back to these functions, so the app always produces a
 * complete character sheet.
 */

import type {
  CharacterBible,
  CharacterSheet,
  ColorSwatch,
  PromptSuggestion,
  SketchAnalysis,
  VisualSheetSpec,
} from "./types";

/* ------------------------------------------------------------------ */
/* Keyword lexicon                                                     */
/* ------------------------------------------------------------------ */

interface ThemeEntry {
  keywords: string[];
  species: string;
  occupation: string;
  textures: string[];
  palette: ColorSwatch[];
  gait: string;
  nameSeeds: string[];
  traits: string[];
}

const THEMES: Record<string, ThemeEntry> = {
  robot: {
    keywords: ["robot", "mech", "android", "droid", "cyborg", "machine", "bot"],
    species: "Autonomous Robot",
    occupation: "Companion Unit",
    textures: [
      "Brushed steel chassis with oxidized copper joints",
      "Matte polymer plating with worn edge highlights",
      "Soft-glow LED strips recessed into panel seams",
    ],
    palette: [
      { name: "Gunmetal", hex: "#4A5560" },
      { name: "Oxidized Copper", hex: "#B87333" },
      { name: "LED Cyan", hex: "#4DD9E8" },
      { name: "Warning Amber", hex: "#F2A93B" },
      { name: "Chassis Cream", hex: "#E8E2D0" },
    ],
    gait: "Heavy, clanking gait with delicate, precise hand movements",
    nameSeeds: ["Bolt", "Rivet", "Chip", "Gizmo", "Vex", "Servo", "Widget"],
    traits: ["Curious", "Endearingly literal", "Deeply loyal"],
  },
  fantasy: {
    keywords: ["knight", "wizard", "mage", "elf", "dwarf", "warrior", "dragon", "sorcer", "paladin", "rogue", "fantasy"],
    species: "Fantasy Humanoid",
    occupation: "Wandering Adventurer",
    textures: [
      "Hand-tooled leather with brass buckles and travel wear",
      "Weathered steel with etched runic engravings",
      "Homespun wool cloak with frayed hems",
    ],
    palette: [
      { name: "Forest Green", hex: "#3E5F3C" },
      { name: "Worn Leather", hex: "#8A5A33" },
      { name: "Rune Gold", hex: "#D9A441" },
      { name: "Steel Grey", hex: "#7C8590" },
      { name: "Night Indigo", hex: "#2E3057" },
    ],
    gait: "Measured, grounded stride; hand never far from the hilt",
    nameSeeds: ["Kael", "Bryn", "Thorne", "Isolde", "Fenn", "Maro", "Sylra"],
    traits: ["Honor-bound", "Dry-witted", "Quietly haunted by the past"],
  },
  animal: {
    keywords: ["cat", "dog", "fox", "bear", "rabbit", "bird", "owl", "wolf", "mouse", "panda", "creature", "beast", "animal"],
    species: "Anthropomorphic Animal",
    occupation: "Neighborhood Fixer",
    textures: [
      "Layered fur clumps with soft subsurface scattering",
      "Velvety inner-ear and paw-pad detailing",
      "Stitched canvas satchel with patched corners",
    ],
    palette: [
      { name: "Russet Fur", hex: "#B0653A" },
      { name: "Cream Belly", hex: "#F2E4C9" },
      { name: "Moss Green", hex: "#6E7F4C" },
      { name: "Berry Red", hex: "#A64242" },
      { name: "Bark Brown", hex: "#5C4632" },
    ],
    gait: "Light, springy steps with a tail counterbalancing every turn",
    nameSeeds: ["Pip", "Bramble", "Hazel", "Rusty", "Willow", "Clove", "Sorrel"],
    traits: ["Optimistic", "A little clumsy", "Fiercely protective of friends"],
  },
  scifi: {
    keywords: ["alien", "space", "astronaut", "cyberpunk", "galactic", "neon", "sci-fi", "scifi", "pilot", "hacker"],
    species: "Off-world Traveler",
    occupation: "Freelance Starship Courier",
    textures: [
      "Iridescent flight-suit weave with pressure seams",
      "Holographic HUD elements hovering off the visor",
      "Scuffed alloy boots with magnetic soles",
    ],
    palette: [
      { name: "Void Navy", hex: "#1B2440" },
      { name: "Neon Magenta", hex: "#E84DBB" },
      { name: "Ion Teal", hex: "#3BD9C4" },
      { name: "Hull White", hex: "#E9EDF2" },
      { name: "Thruster Orange", hex: "#F2703B" },
    ],
    gait: "Low-gravity lope — long glides punctuated by precise anchor steps",
    nameSeeds: ["Nova", "Juno", "Cass", "Orion", "Vega", "Lyra", "Zephyr"],
    traits: ["Resourceful", "Allergic to authority", "Sentimental about old tech"],
  },
  cute: {
    keywords: ["cute", "chibi", "kawaii", "tiny", "baby", "adorable", "plush", "mascot"],
    species: "Pocket-sized Mascot",
    occupation: "Professional Morale Officer",
    textures: [
      "Ultra-soft velour surface with visible micro-fuzz",
      "Glossy button eyes with star-shaped catchlights",
      "Embroidered stitch details along seams",
    ],
    palette: [
      { name: "Bubblegum", hex: "#F2A2C4" },
      { name: "Sky Pastel", hex: "#A6D8F2" },
      { name: "Butter Yellow", hex: "#F2DC9B" },
      { name: "Mint", hex: "#B4E8C8" },
      { name: "Cocoa Accent", hex: "#8A6A54" },
    ],
    gait: "Bouncy toddle — the whole body tilts side to side with each step",
    nameSeeds: ["Mochi", "Pudding", "Boba", "Momo", "Nori", "Taffy", "Pom"],
    traits: ["Relentlessly cheerful", "Easily distracted by snacks", "Braver than their size suggests"],
  },
};

const DEFAULT_THEME: ThemeEntry = {
  keywords: [],
  species: "Original Character",
  occupation: "Protagonist-in-training",
  textures: [
    "Layered fabric with hand-painted wear at the edges",
    "Soft matte skin shading with warm bounce light",
    "One signature glossy accent material for focal contrast",
  ],
  palette: [
    { name: "Slate", hex: "#5A6472" },
    { name: "Warm Sand", hex: "#D9C29B" },
    { name: "Accent Coral", hex: "#E8705A" },
    { name: "Deep Teal", hex: "#2E5F5C" },
    { name: "Paper White", hex: "#F2F0EA" },
  ],
  gait: "Confident walk with a distinctive personal rhythm",
  nameSeeds: ["Ari", "Rowan", "Milo", "Nia", "Remy", "Sage", "Kit"],
  traits: ["Determined", "Improvises under pressure", "Secretly soft-hearted"],
};

interface StylePreset {
  keywords: string[];
  label: string;
  enhancement: string;
  lighting: string;
}

const STYLES: StylePreset[] = [
  {
    keywords: ["pixar", "3d render", "dreamworks", "disney"],
    label: "Premium Pixar-style 3D render",
    enhancement: "in a premium Pixar-style 3D render, appealing rounded shapes, subsurface skin shading",
    lighting: "Warm key light with soft fill, gentle rim light, ambient occlusion in crevices",
  },
  {
    keywords: ["anime", "manga", "cel"],
    label: "Clean cel-shaded anime",
    enhancement: "in a clean cel-shaded anime style, crisp line art, expressive oversized eyes",
    lighting: "Flat two-tone cel shading with a single dramatic rim light",
  },
  {
    keywords: ["riot", "concept art", "splash", "painterly"],
    label: "Painterly AAA concept art",
    enhancement: "as painterly AAA concept art, confident brushwork, cinematic value structure",
    lighting: "High-contrast cinematic lighting with strong directional key",
  },
  {
    keywords: ["pixel", "8-bit", "16-bit", "retro"],
    label: "16-bit retro pixel art",
    enhancement: "as chunky 16-bit pixel art, limited palette, clean silhouette read at small sizes",
    lighting: "Two-step pixel shading with a single light source from the upper left",
  },
  {
    keywords: ["watercolor", "storybook", "ghibli"],
    label: "Soft storybook watercolor",
    enhancement: "in a soft storybook watercolor style, textured paper grain, loose ink outlines",
    lighting: "Diffuse overcast light with warm watercolor blooms",
  },
];

const DEFAULT_STYLE = STYLES[0];

const QUALITY_TAIL =
  "studio lighting, ultra-detailed, 8k resolution, clean blueprint background";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Deterministic string hash so the same prompt yields the same character. */
export function hashString(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(items: readonly T[], seed: number, salt = 0): T {
  return items[(seed + salt * 7919) % items.length];
}

export function detectTheme(prompt: string): { key: string; theme: ThemeEntry } {
  const lower = prompt.toLowerCase();
  for (const [key, theme] of Object.entries(THEMES)) {
    if (theme.keywords.some((k) => lower.includes(k))) return { key, theme };
  }
  return { key: "original", theme: DEFAULT_THEME };
}

export function detectStyle(prompt: string): StylePreset {
  const lower = prompt.toLowerCase();
  return STYLES.find((s) => s.keywords.some((k) => lower.includes(k))) ?? DEFAULT_STYLE;
}

/* ------------------------------------------------------------------ */
/* State 1 — Typing phase: prompt enhancement suggestions              */
/* ------------------------------------------------------------------ */

/**
 * Build a rich enhancement tail for a partial prompt, e.g.
 * "A cute robot with a flower" →
 * ", in a premium Pixar-style 3D render, rusty metallic textures, ...".
 * Returns null when the prompt is too short or already fully enhanced.
 */
export function suggestEnhancement(prompt: string): PromptSuggestion | null {
  const trimmed = prompt.trim();
  if (trimmed.length < 8) return null;

  const lower = trimmed.toLowerCase();
  const { theme } = detectTheme(trimmed);

  const parts: string[] = [];
  const hasStyle = STYLES.some((s) => s.keywords.some((k) => lower.includes(k)));
  if (!hasStyle) parts.push(DEFAULT_STYLE.enhancement);

  const texture = theme.textures[0].toLowerCase();
  if (!lower.includes("texture")) parts.push(texture.replace(/\.$/, ""));

  for (const tag of QUALITY_TAIL.split(", ")) {
    if (!lower.includes(tag.split(" ")[0])) parts.push(tag);
  }
  if (parts.length === 0) return null;

  const completion = (trimmed.endsWith(",") ? " " : ", ") + parts.join(", ");
  return { completion, source: "rules" };
}

/* ------------------------------------------------------------------ */
/* State 2 — Generation phase: the full character sheet                */
/* ------------------------------------------------------------------ */

function generateName(seed: number, theme: ThemeEntry): string {
  const first = pick(theme.nameSeeds, seed, 1);
  const suffixes = ["", "", "-7", " Jr.", " the Bold", " of the Vale", " Mk. II"];
  return `${first}${pick(suffixes, seed, 2)}`.trim();
}

function buildVisualSpec(
  prompt: string,
  theme: ThemeEntry,
  analysis: SketchAnalysis | null,
): VisualSheetSpec {
  const style = detectStyle(prompt);
  const silhouette = analysis?.silhouette ?? "balanced, readable silhouette";
  return {
    turnarounds: [
      `Front view — neutral A-pose locking down the ${silhouette}; both hands visible, feet planted shoulder-width.`,
      "3/4 view — the hero angle; strongest overlap of forms, used as the main reference for all promotional art.",
      "Side profile — flattened read of posture and spine curve; confirms nose, chest and back silhouette.",
      "Back view — resolves hair/equipment attachment points and any straps, tails or cables hidden from the front.",
    ],
    expressions: [
      { emotion: "Neutral", note: "Resting face; establishes default brow and mouth line." },
      { emotion: "Joy", note: "Eyes compress into arcs; the whole face pushes upward." },
      { emotion: "Anger", note: "Brows knot inward; asymmetric mouth for believability." },
      { emotion: "Surprise", note: "Everything opens — lids, brows, mouth; head pulls back." },
      { emotion: "Sadness", note: "Outer brows drop; gaze drifts down and away." },
      { emotion: "Determination", note: "The signature look: narrowed eyes, subtle smirk." },
    ],
    actionPoses: [
      `Signature stance — ${analysis?.stance ?? "weight on the back foot, front foot testing the ground"}; instantly recognizable in silhouette.`,
      "Full-run cycle keyframe — extreme contact pose with strong line of action and follow-through on loose parts.",
    ],
    callouts: [
      "Eye close-up — iris material, catchlight shape and rim thickness.",
      `Material study — ${theme.textures[0].toLowerCase()}.`,
      "Hands/feet — joint articulation and how digits compress when gripping.",
      "Signature accessory — construction breakdown from three angles.",
    ],
    lighting: style.lighting,
    artStyle: style.label,
  };
}

function buildBible(
  prompt: string,
  theme: ThemeEntry,
  seed: number,
  analysis: SketchAnalysis | null,
): CharacterBible {
  const name = generateName(seed, theme);
  const proportions =
    analysis?.proportions ??
    "Slightly oversized head and hands against a compact torso — reads friendly at any distance.";

  return {
    bio: {
      name,
      title: pick(
        ["The Reluctant Hero", "First of Their Kind", "The Small Legend", "Keeper of Curiosities", "The Late Bloomer"],
        seed,
        3,
      ),
      species: theme.species,
      ageEra: pick(
        ["Young adult — present day", "Ageless — built 12 years ago", "Late teens — near future", "Old soul in a young frame — timeless fable era"],
        seed,
        4,
      ),
      occupation: theme.occupation,
      backstory: `Born from the prompt "${prompt.trim()}", ${name} never quite fit the mold they came from — and that turned out to be their greatest asset. What began as a small act of kindness snowballed into a reputation, and now everyone in town knows exactly who to call.`,
    },
    personality: {
      coreTraits: theme.traits,
      motto: pick(
        [
          "Small hands, big fixes.",
          "If it's broken, it's just not finished yet.",
          "Courage is a muscle — I'm still training.",
          "Every scratch is a story.",
        ],
        seed,
        5,
      ),
      strengths: [
        "Reads people (and machines) better than anyone expects",
        "Improvises tools and plans from whatever is at hand",
        "Loyalty that turns strangers into lifelong allies",
      ],
      weaknesses: [
        "Says yes to every request — then overcommits",
        "Sentimental about objects; refuses to throw anything away",
        "Freezes briefly when praised in public",
      ],
      stats: [
        { label: "Courage", value: 40 + (seed % 45) },
        { label: "Empathy", value: 55 + ((seed >>> 3) % 40) },
        { label: "Agility", value: 35 + ((seed >>> 6) % 50) },
        { label: "Wit", value: 45 + ((seed >>> 9) % 45) },
        { label: "Chaos Factor", value: 20 + ((seed >>> 12) % 60) },
      ],
    },
    design: {
      textures: theme.textures,
      proportions,
      keyFeatures: [
        "One instantly readable signature accessory that survives simplification",
        "Asymmetric detail (patch, marking or attachment) to break mirror symmetry",
        "A soft focal gradient guiding the eye to the face",
      ],
      palette: theme.palette,
    },
    animation: {
      movementStyle: theme.gait,
      gait: `${theme.gait}. Idle cycle includes a personality tick every ~4 seconds.`,
      expressionNotes:
        "Face leads every action by 2-3 frames; anticipation is exaggerated 20% beyond realistic to sell intent in silhouette.",
    },
  };
}

export function generateCharacterSheet(
  prompt: string,
  sketchDataUrl: string | null,
  analysis: SketchAnalysis | null,
): CharacterSheet {
  const seed = hashString(prompt.trim().toLowerCase());
  const { theme } = detectTheme(prompt);
  return {
    id: `char-${seed.toString(36)}-${Date.now().toString(36)}`,
    createdAt: Date.now(),
    prompt: prompt.trim(),
    sketchDataUrl,
    sketchAnalysis: analysis,
    visual: buildVisualSpec(prompt, theme, analysis),
    bible: buildBible(prompt, theme, seed, analysis),
    source: "rules",
  };
}

/* ------------------------------------------------------------------ */
/* Inspiration generator for the "Surprise me" button                  */
/* ------------------------------------------------------------------ */

const INSPIRATION_SUBJECTS = [
  "A cute robot gardener with a flower growing from its head",
  "A retired dragon who now runs a tiny mountain bakery",
  "A moth-winged night courier delivering dreams in glass jars",
  "A grumpy cloud spirit forced to work as a weather intern",
  "A knight whose armor is made entirely of found teapots",
  "A deep-sea jazz musician octopus with a bioluminescent suit",
  "A pocket-sized yeti who collects lost mittens",
  "A solar-punk fox mechanic with vine-wrapped tools",
];

export function randomInspiration(seed = Date.now()): string {
  const subject = INSPIRATION_SUBJECTS[seed % INSPIRATION_SUBJECTS.length];
  const style = STYLES[(seed >> 4) % STYLES.length];
  return `${subject}, ${style.enhancement}, ${QUALITY_TAIL}`;
}

export const STYLE_PRESETS = STYLES.map((s) => ({ label: s.label, enhancement: s.enhancement }));

export const MODIFIER_TAGS = [
  "studio lighting",
  "rim light",
  "subsurface scattering",
  "PBR textures",
  "8k resolution",
  "clean blueprint background",
  "hand-painted look",
  "dramatic silhouette",
];
