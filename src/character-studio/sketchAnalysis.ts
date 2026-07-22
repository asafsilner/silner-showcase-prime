/**
 * Local sketch analysis — reads the canvas pixels and turns raw
 * structure (ink coverage, bounding box, symmetry) into art-direction
 * language. Runs instantly in the browser with no model involved;
 * the LLM layer can replace it with a true vision read when a key is set.
 */

import type { SketchAnalysis } from "./types";

interface InkStats {
  coverage: number;
  aspectRatio: number;
  /** 0..1 — how similar left and right halves of the ink are. */
  symmetry: number;
  /** 0..1 — vertical center of mass (0 = top). */
  centerY: number;
}

/** Sample the canvas and measure where the ink lives. */
export function measureInk(canvas: HTMLCanvasElement): InkStats | null {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;

  const step = 2; // sample every other pixel for speed
  let inked = 0;
  let minX = width, maxX = 0, minY = height, maxY = 0;
  let sumY = 0;
  const colHits = new Float32Array(width);

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const a = data[i + 3];
      // Ink = any non-transparent, non-near-white pixel.
      const isInk = a > 40 && (data[i] < 235 || data[i + 1] < 235 || data[i + 2] < 235);
      if (!isInk) continue;
      inked++;
      sumY += y;
      colHits[x]++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  const sampled = Math.ceil(width / step) * Math.ceil(height / step);
  if (inked < 20) return null; // effectively empty canvas

  const bboxW = Math.max(1, maxX - minX);
  const bboxH = Math.max(1, maxY - minY);

  // Symmetry: compare column ink histograms mirrored around bbox center.
  const cx = (minX + maxX) / 2;
  let symSum = 0, symCount = 0;
  for (let dx = 1; dx < bboxW / 2; dx += step) {
    const l = colHits[Math.round(cx - dx)] ?? 0;
    const r = colHits[Math.round(cx + dx)] ?? 0;
    const m = Math.max(l, r);
    if (m > 0) {
      symSum += Math.min(l, r) / m;
      symCount++;
    }
  }

  return {
    coverage: inked / sampled,
    aspectRatio: bboxW / bboxH,
    symmetry: symCount > 0 ? symSum / symCount : 0,
    centerY: (sumY / inked - minY) / bboxH,
  };
}

/** Translate raw ink stats into a structural read of the character. */
export function analyzeSketch(
  canvas: HTMLCanvasElement,
  strokeCount: number,
): SketchAnalysis | null {
  const stats = measureInk(canvas);
  if (!stats) return null;

  const { coverage, aspectRatio, symmetry, centerY } = stats;

  const silhouette =
    aspectRatio < 0.55
      ? "tall, slender silhouette with strong vertical thrust"
      : aspectRatio > 1.4
        ? "wide, grounded silhouette built on horizontal mass"
        : "compact, balanced silhouette with an even footprint";

  const stance =
    symmetry > 0.6
      ? "upright, symmetric stance — calm and frontal, ideal for a turnaround base"
      : "asymmetric, dynamic stance with clear weight shift";

  const proportions =
    centerY < 0.42
      ? "top-heavy massing — large head/torso over small base, chibi-friendly proportions"
      : centerY > 0.58
        ? "bottom-heavy massing — sturdy legs and base anchor the design"
        : "evenly distributed mass, roughly heroic proportions";

  const archetypes: string[] = [];
  if (aspectRatio < 0.55) archetypes.push("Elegant mystic", "Lanky speedster");
  else if (aspectRatio > 1.4) archetypes.push("Gentle guardian", "Tank-class bruiser");
  else archetypes.push("Plucky all-rounder", "Compact mascot");
  if (symmetry <= 0.6) archetypes.push("Action-oriented rogue");
  if (coverage > 0.18) archetypes.push("Heavily-equipped adventurer");

  return {
    strokeCount,
    coverage: Math.round(coverage * 1000) / 1000,
    aspectRatio: Math.round(aspectRatio * 100) / 100,
    silhouette,
    stance,
    proportions,
    archetypes: archetypes.slice(0, 3),
  };
}
