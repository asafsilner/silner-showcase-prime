import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Palette, Sparkles } from "lucide-react";
import DrawingCanvas, { DrawingCanvasHandle } from "@/components/character-studio/DrawingCanvas";
import SmartPromptEditor from "@/components/character-studio/SmartPromptEditor";
import CharacterSheetView from "@/components/character-studio/CharacterSheetView";
import LibraryDrawer from "@/components/character-studio/LibraryDrawer";
import StudioSettings from "@/components/character-studio/StudioSettings";
import { analyzeSketch } from "@/character-studio/sketchAnalysis";
import { generateSheet } from "@/character-studio/llm";
import { generateCharacterSheet } from "@/character-studio/engine";
import { loadLibrary, removeFromLibrary, saveToLibrary } from "@/character-studio/library";
import { isLLMConfigured } from "@/advisor/llm/config";
import type { CharacterSheet } from "@/character-studio/types";

/**
 * AI Character Studio — a creative co-pilot that turns a rough canvas
 * sketch + a text prompt into a professional multi-panel character
 * sheet (visual parameters + character bible).
 *
 * Works fully offline on a deterministic rule engine; connecting a
 * Claude API key upgrades every step to the live model, including
 * vision analysis of the sketch.
 */
const CharacterStudio = () => {
  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [library, setLibrary] = useState<CharacterSheet[]>([]);
  const [, setSettingsVersion] = useState(0);
  const refreshSettings = useCallback(() => setSettingsVersion((v) => v + 1), []);

  useEffect(() => {
    setLibrary(loadLibrary());
  }, []);

  useEffect(() => {
    if (sheet && sheetRef.current) {
      sheetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [sheet]);

  const generate = async () => {
    const trimmed = prompt.trim();
    if (trimmed.length < 4) {
      toast.error("Describe your character first — a few words are enough.");
      return;
    }
    setBusy(true);
    try {
      const canvas = canvasRef.current;
      const snap = canvas && !canvas.isEmpty() ? canvas.snapshot() : null;
      const analysis = snap ? analyzeSketch(snap.canvas, canvas!.strokeCount()) : null;
      const result = await generateSheet(trimmed, snap?.dataUrl ?? null, analysis);
      setSheet(result);
    } catch (error) {
      console.error("[studio] generation failed:", error);
      // Absolute last resort — the rule engine cannot fail.
      setSheet(generateCharacterSheet(trimmed, null, null));
    } finally {
      setBusy(false);
    }
  };

  const handleSave = (s: CharacterSheet) => {
    setLibrary(saveToLibrary(s));
    toast.success(`${s.bible.bio.name} saved to your library`);
  };

  const handleDelete = (id: string) => {
    setLibrary(removeFromLibrary(id));
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container max-w-6xl px-6 md:px-8">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-end justify-between gap-4"
        >
          <div className="space-y-2">
            <h1 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
              <Palette className="h-8 w-8 text-primary" />
              AI Character Studio
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Sketch a rough shape, describe your idea, and the co-pilot turns
              them into a professional character sheet — turnarounds,
              expressions, palette and a full character bible.
            </p>
          </div>
          <div className="flex gap-2">
            <StudioSettings onChange={refreshSettings} />
            <LibraryDrawer
              library={library}
              onLoad={(s) => { setSheet(s); setPrompt(s.prompt); }}
              onDelete={handleDelete}
            />
          </div>
        </motion.div>

        {/* Workspace */}
        <div className="grid items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
          <section aria-label="Drawing canvas">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              1 · Live Drawing Canvas
            </h2>
            <DrawingCanvas ref={canvasRef} />
          </section>

          <section aria-label="Prompt editor" className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              2 · Smart Prompt Editor
            </h2>
            <SmartPromptEditor value={prompt} onChange={setPrompt} disabled={busy} />
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={generate}
              disabled={busy || prompt.trim().length < 4}
            >
              {busy ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isLLMConfigured()
                    ? "Claude is reading your sketch and writing the sheet…"
                    : "Composing your character sheet…"}
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Character Sheet
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              {isLLMConfigured()
                ? "Live mode: the model sees your actual sketch and prompt."
                : "Demo mode: the built-in rule engine generates the sheet. Connect a Claude API key for live generation."}
            </p>
          </section>
        </div>

        {/* Result */}
        <div ref={sheetRef} className="scroll-mt-24">
          {sheet && (
            <div className="mt-12 border-t border-border pt-10">
              <CharacterSheetView sheet={sheet} onSave={handleSave} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default CharacterStudio;
