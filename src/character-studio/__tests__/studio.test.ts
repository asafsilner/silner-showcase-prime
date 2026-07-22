import { beforeEach, describe, expect, it } from "vitest";
import {
  detectTheme,
  generateCharacterSheet,
  hashString,
  randomInspiration,
  suggestEnhancement,
} from "../engine";
import { sheetToMarkdown } from "../exporters";
import { loadLibrary, removeFromLibrary, saveToLibrary } from "../library";

describe("prompt enhancement (State 1 — typing phase)", () => {
  it("suggests a rich completion for a basic concept", () => {
    const s = suggestEnhancement("A cute robot with a flower");
    expect(s).not.toBeNull();
    expect(s!.source).toBe("rules");
    expect(s!.completion).toMatch(/^,? ?, |^, /);
    expect(s!.completion.toLowerCase()).toContain("studio lighting");
    expect(s!.completion.toLowerCase()).toContain("8k resolution");
    // Robot theme should contribute a metallic texture.
    expect(s!.completion.toLowerCase()).toContain("steel");
  });

  it("returns null for prompts that are too short", () => {
    expect(suggestEnhancement("cat")).toBeNull();
    expect(suggestEnhancement("   ")).toBeNull();
  });

  it("does not repeat tags already present in the prompt", () => {
    const s = suggestEnhancement(
      "A knight in a premium Pixar-style 3D render, studio lighting, ultra-detailed, 8k resolution, clean blueprint background, with textures",
    );
    if (s) {
      expect(s.completion.toLowerCase()).not.toContain("studio lighting");
      expect(s.completion.toLowerCase()).not.toContain("8k resolution");
    }
  });
});

describe("theme detection", () => {
  it.each([
    ["a rusty robot janitor", "robot"],
    ["an elf ranger of the woods", "fantasy"],
    ["a sleepy fox merchant", "animal"],
    ["a neon cyberpunk hacker", "scifi"],
    ["a kawaii mascot blob", "cute"],
    ["someone entirely undefined", "original"],
  ])("classifies %s as %s", (prompt, expected) => {
    expect(detectTheme(prompt).key).toBe(expected);
  });
});

describe("character sheet generation (State 2 — generation phase)", () => {
  const sheet = generateCharacterSheet("A cute robot with a flower", null, null);

  it("produces a complete Part A visual spec", () => {
    expect(sheet.visual.turnarounds).toHaveLength(4);
    expect(sheet.visual.expressions.length).toBeGreaterThanOrEqual(4);
    expect(sheet.visual.expressions.length).toBeLessThanOrEqual(6);
    expect(sheet.visual.actionPoses.length).toBeGreaterThanOrEqual(1);
    expect(sheet.visual.callouts.length).toBeGreaterThanOrEqual(3);
    expect(sheet.visual.lighting).toBeTruthy();
    expect(sheet.visual.artStyle).toBeTruthy();
  });

  it("produces a complete Part B character bible", () => {
    const { bio, personality, design, animation } = sheet.bible;
    expect(bio.name).toBeTruthy();
    expect(bio.occupation).toBeTruthy();
    expect(personality.coreTraits.length).toBeGreaterThanOrEqual(2);
    expect(personality.strengths.length).toBeGreaterThanOrEqual(2);
    expect(personality.weaknesses.length).toBeGreaterThanOrEqual(2);
    expect(personality.stats).toHaveLength(5);
    for (const stat of personality.stats) {
      expect(stat.value).toBeGreaterThanOrEqual(0);
      expect(stat.value).toBeLessThanOrEqual(100);
    }
    expect(design.palette.length).toBeGreaterThanOrEqual(4);
    for (const swatch of design.palette) {
      expect(swatch.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
    expect(animation.movementStyle).toBeTruthy();
  });

  it("is deterministic for the same prompt (character consistency)", () => {
    const again = generateCharacterSheet("A cute robot with a flower", null, null);
    expect(again.bible.bio.name).toBe(sheet.bible.bio.name);
    expect(again.bible.personality.stats).toEqual(sheet.bible.personality.stats);
  });

  it("varies with the prompt", () => {
    const other = generateCharacterSheet("An elf ranger of the silent woods", null, null);
    expect(other.bible.bio.species).not.toBe(sheet.bible.bio.species);
  });

  it("threads sketch analysis into the visual spec", () => {
    const analysis = {
      strokeCount: 12,
      coverage: 0.1,
      aspectRatio: 0.5,
      silhouette: "tall, slender silhouette",
      stance: "asymmetric action stance",
      proportions: "top-heavy chibi proportions",
      archetypes: ["Elegant mystic"],
    };
    const withSketch = generateCharacterSheet("a mysterious wizard", "data:image/png;base64,x", analysis);
    expect(withSketch.sketchDataUrl).toBe("data:image/png;base64,x");
    expect(withSketch.visual.turnarounds[0]).toContain("tall, slender silhouette");
    expect(withSketch.visual.actionPoses[0]).toContain("asymmetric action stance");
    expect(withSketch.bible.design.proportions).toContain("chibi");
  });
});

describe("hashString", () => {
  it("is stable and prompt-sensitive", () => {
    expect(hashString("abc")).toBe(hashString("abc"));
    expect(hashString("abc")).not.toBe(hashString("abd"));
  });
});

describe("randomInspiration", () => {
  it("returns a full production-ready prompt", () => {
    const p = randomInspiration(42);
    expect(p.length).toBeGreaterThan(40);
    expect(p).toContain("8k resolution");
  });
});

describe("markdown export", () => {
  it("renders both Part A and Part B sections", () => {
    const sheet = generateCharacterSheet("a pocket-sized yeti collector", null, null);
    const md = sheetToMarkdown(sheet);
    expect(md).toContain("# " + sheet.bible.bio.name);
    expect(md).toContain("## Part A — Visual Generation Parameters");
    expect(md).toContain("## Part B — Character Bible");
    expect(md).toContain("### Orthographic Turnarounds");
    expect(md).toContain("### Personality Matrix");
    expect(md).toContain("### Animation Guidelines");
  });
});

describe("library persistence", () => {
  beforeEach(() => localStorage.clear());

  it("saves, loads and deletes sheets", () => {
    const a = generateCharacterSheet("a robot librarian", null, null);
    const b = generateCharacterSheet("a dragon barista", null, null);
    saveToLibrary(a);
    const after = saveToLibrary(b);
    expect(after[0].id).toBe(b.id); // newest first
    expect(loadLibrary()).toHaveLength(2);
    removeFromLibrary(a.id);
    expect(loadLibrary().map((s) => s.id)).toEqual([b.id]);
  });

  it("deduplicates by id and caps the list at 10", () => {
    const a = generateCharacterSheet("a robot librarian", null, null);
    saveToLibrary(a);
    saveToLibrary(a);
    expect(loadLibrary()).toHaveLength(1);
    for (let i = 0; i < 15; i++) {
      saveToLibrary({ ...a, id: `id-${i}` });
    }
    expect(loadLibrary().length).toBeLessThanOrEqual(10);
  });
});
