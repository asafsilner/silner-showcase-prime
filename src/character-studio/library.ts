/**
 * Saved character library — persisted in localStorage only.
 * Sheets embed the sketch as a PNG data-URL, so the list is capped
 * to stay well inside the ~5MB localStorage budget.
 */

import type { CharacterSheet } from "./types";

const STORAGE_KEY = "character-studio:library";
const MAX_SAVED = 10;

function storage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadLibrary(): CharacterSheet[] {
  const raw = storage()?.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CharacterSheet[]) : [];
  } catch {
    return [];
  }
}

export function saveToLibrary(sheet: CharacterSheet): CharacterSheet[] {
  const next = [sheet, ...loadLibrary().filter((s) => s.id !== sheet.id)].slice(0, MAX_SAVED);
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota exceeded — retry once without the heaviest payloads.
    const slim = next.map((s) => ({ ...s, sketchDataUrl: null }));
    try {
      storage()?.setItem(STORAGE_KEY, JSON.stringify(slim));
      return slim;
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  }
  return next;
}

export function removeFromLibrary(id: string): CharacterSheet[] {
  const next = loadLibrary().filter((s) => s.id !== id);
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}
