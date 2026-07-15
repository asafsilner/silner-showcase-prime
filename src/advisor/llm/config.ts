/**
 * LLM configuration — Bring Your Own Key.
 *
 * The API key is stored only in the browser's localStorage and sent
 * directly to Anthropic's API; it never touches any other server.
 * Without a key the advisor runs entirely on the rule-based engine.
 */

const KEY_STORAGE = "ai-advisor:apiKey";
const MODEL_STORAGE = "ai-advisor:model";

export const DEFAULT_MODEL = "claude-opus-4-8";

export const AVAILABLE_MODELS = [
  { id: "claude-opus-4-8", label: "Claude Opus 4.8 — החכם ביותר (ברירת מחדל)" },
  { id: "claude-sonnet-5", label: "Claude Sonnet 5 — מהיר ומאוזן" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5 — הכי מהיר וזול" },
] as const;

function storage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export function getApiKey(): string | null {
  return storage()?.getItem(KEY_STORAGE) ?? null;
}

export function setApiKey(key: string | null): void {
  const s = storage();
  if (!s) return;
  if (key && key.trim()) s.setItem(KEY_STORAGE, key.trim());
  else s.removeItem(KEY_STORAGE);
}

export function getModel(): string {
  return storage()?.getItem(MODEL_STORAGE) ?? DEFAULT_MODEL;
}

export function setModel(model: string): void {
  storage()?.setItem(MODEL_STORAGE, model);
}

export function isLLMConfigured(): boolean {
  return !!getApiKey();
}
