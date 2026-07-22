import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CornerDownLeft, Dices, Sparkles, Wand2 } from "lucide-react";
import {
  MODIFIER_TAGS,
  STYLE_PRESETS,
  randomInspiration,
  suggestEnhancement,
} from "@/character-studio/engine";
import { suggestEnhancementLLM } from "@/character-studio/llm";
import { isLLMConfigured } from "@/advisor/llm/config";
import type { PromptSuggestion } from "@/character-studio/types";

/**
 * The Smart Prompt Editor — State 1 ("Typing Phase") of the studio.
 * As the user types, a debounced prompt engineer proposes a richer
 * completion. Tab (or click) appends it. With a Claude key configured
 * the suggestion comes from the live model; otherwise from the
 * deterministic rule engine.
 */

interface SmartPromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const DEBOUNCE_MS = 700;

const SmartPromptEditor = ({ value, onChange, disabled }: SmartPromptEditorProps) => {
  const [suggestion, setSuggestion] = useState<PromptSuggestion | null>(null);
  const [thinking, setThinking] = useState(false);
  const requestId = useRef(0);
  const lastAccepted = useRef("");

  const fetchSuggestion = useCallback(async (prompt: string) => {
    const id = ++requestId.current;
    const ruleBased = suggestEnhancement(prompt);
    if (!isLLMConfigured()) {
      if (id === requestId.current) setSuggestion(ruleBased);
      return;
    }
    // Show the instant rule-based suggestion while the model thinks.
    if (id === requestId.current) {
      setSuggestion(ruleBased);
      setThinking(true);
    }
    const llm = await suggestEnhancementLLM(prompt);
    if (id !== requestId.current) return;
    setThinking(false);
    if (llm) setSuggestion(llm);
  }, []);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length < 8 || trimmed === lastAccepted.current) {
      setSuggestion(null);
      setThinking(false);
      requestId.current++;
      return;
    }
    const timer = setTimeout(() => fetchSuggestion(trimmed), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, fetchSuggestion]);

  const accept = () => {
    if (!suggestion) return;
    const next = value.trimEnd() + suggestion.completion;
    lastAccepted.current = next.trim();
    onChange(next);
    setSuggestion(null);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab" && suggestion) {
      e.preventDefault();
      accept();
    }
  };

  const appendText = (text: string) => {
    const base = value.trim();
    if (base.toLowerCase().includes(text.toLowerCase())) return;
    onChange(base ? `${base.replace(/,\s*$/, "")}, ${text}` : text);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="character-prompt" className="text-sm font-medium flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          Describe your character
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          disabled={disabled}
          onClick={() => {
            lastAccepted.current = "";
            onChange(randomInspiration());
          }}
        >
          <Dices className="h-3.5 w-3.5" />
          Surprise me
        </Button>
      </div>

      <Textarea
        id="character-prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        rows={4}
        placeholder='e.g. "A cute robot with a flower..." — keep typing and let the co-pilot enrich it'
        className="resize-none text-base"
      />

      {/* Live enhancement suggestion */}
      {suggestion && !disabled && (
        <button
          type="button"
          onClick={accept}
          className="w-full rounded-md border border-primary/40 bg-primary/5 p-3 text-left transition-colors hover:bg-primary/10"
        >
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {suggestion.source === "claude" ? "Claude suggests" : "Co-pilot suggests"}
            {thinking && <span className="text-muted-foreground">(refining…)</span>}
            <span className="ml-auto flex items-center gap-1 rounded border border-primary/30 px-1.5 py-0.5 font-mono text-[10px]">
              Tab <CornerDownLeft className="h-3 w-3" /> to accept
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {value.trim()}
            <span className="text-foreground font-medium">{suggestion.completion}</span>
          </p>
        </button>
      )}

      {/* Art style presets */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Art style presets</p>
        <div className="flex flex-wrap gap-1.5">
          {STYLE_PRESETS.map((s) => (
            <button
              key={s.label}
              type="button"
              disabled={disabled}
              onClick={() => appendText(s.enhancement)}
              className="rounded-full border border-border px-2.5 py-1 text-xs transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick modifiers */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Quick modifiers</p>
        <div className="flex flex-wrap gap-1.5">
          {MODIFIER_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={value.toLowerCase().includes(tag.toLowerCase()) ? "default" : "outline"}
              className="cursor-pointer select-none"
              onClick={() => !disabled && appendText(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartPromptEditor;
