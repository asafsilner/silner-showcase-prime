import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Bot,
  Clapperboard,
  Copy,
  Cpu,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Layers,
  Save,
  Smile,
  Sun,
} from "lucide-react";
import type { CharacterSheet } from "@/character-studio/types";
import { composeSheetPng } from "@/character-studio/sheetComposer";
import {
  downloadDataUrl,
  downloadMarkdown,
  sheetFileName,
} from "@/character-studio/exporters";

/**
 * State 2 ("Generation Phase") — renders the complete character sheet:
 * PART A visual generation parameters (with a downloadable composed
 * PNG model sheet built from the user's sketch) and PART B, the
 * character bible.
 */

interface CharacterSheetViewProps {
  sheet: CharacterSheet;
  onSave: (sheet: CharacterSheet) => void;
}

const SectionTitle = ({ icon: Icon, children }: { icon: typeof Eye; children: React.ReactNode }) => (
  <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
    <Icon className="h-4 w-4" />
    {children}
  </h3>
);

const CharacterSheetView = ({ sheet, onSave }: CharacterSheetViewProps) => {
  const [sheetPng, setSheetPng] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSheetPng(null);
    composeSheetPng(sheet)
      .then((png) => { if (!cancelled) setSheetPng(png); })
      .catch(() => { if (!cancelled) setSheetPng(null); });
    return () => { cancelled = true; };
  }, [sheet]);

  const copyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex.toUpperCase());
      toast.success(`Copied ${hex.toUpperCase()}`);
    } catch {
      toast.error("Clipboard unavailable");
    }
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(sheet, null, 2));
      toast.success("Character JSON copied to clipboard");
    } catch {
      toast.error("Clipboard unavailable");
    }
  };

  const { bible, visual } = sheet;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold">{bible.bio.name}</h2>
            <Badge variant={sheet.source === "claude" ? "default" : "secondary"} className="gap-1">
              {sheet.source === "claude" ? <Cpu className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
              {sheet.source === "claude" ? "Live model" : "Rule engine"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            "{bible.bio.title}" · {bible.bio.species} · {bible.bio.occupation}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onSave(sheet)}>
            <Save className="h-4 w-4" /> Save to library
          </Button>
          {sheetPng && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => downloadDataUrl(sheetFileName(sheet, "png"), sheetPng)}
            >
              <ImageIcon className="h-4 w-4" /> Sheet PNG
            </Button>
          )}
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => downloadMarkdown(sheet)}>
            <FileText className="h-4 w-4" /> Bible .md
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={copyJson}>
            <Copy className="h-4 w-4" /> JSON
          </Button>
        </div>
      </div>

      {/* Composed model sheet */}
      {sheetPng && (
        <div className="overflow-hidden rounded-lg border border-border">
          <img src={sheetPng} alt={`${bible.bio.name} model sheet`} className="w-full" />
        </div>
      )}

      {/* Sketch analysis */}
      {sheet.sketchAnalysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" /> Sketch Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <p><span className="font-medium">Silhouette:</span> {sheet.sketchAnalysis.silhouette}</p>
            <p><span className="font-medium">Stance:</span> {sheet.sketchAnalysis.stance}</p>
            <p><span className="font-medium">Proportions:</span> {sheet.sketchAnalysis.proportions}</p>
            <p>
              <span className="font-medium">Archetypes:</span>{" "}
              {sheet.sketchAnalysis.archetypes.join(" · ")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* PART A */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="h-5 w-5 text-primary" />
            Part A — Visual Generation Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p className="flex items-start gap-2">
              <Sun className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span><span className="font-medium">Lighting:</span> {visual.lighting}</span>
            </p>
            <p className="flex items-start gap-2">
              <Clapperboard className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span><span className="font-medium">Art style:</span> {visual.artStyle}</span>
            </p>
          </div>
          <Separator />

          <div className="space-y-2">
            <SectionTitle icon={Layers}>Orthographic Turnarounds</SectionTitle>
            <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {visual.turnarounds.map((t) => <li key={t} className="rounded-md border border-border p-3">{t}</li>)}
            </ul>
          </div>

          <div className="space-y-2">
            <SectionTitle icon={Smile}>Facial Expressions Panel</SectionTitle>
            <div className="grid gap-2 sm:grid-cols-3">
              {visual.expressions.map((e) => (
                <div key={e.emotion} className="rounded-md border border-border p-3">
                  <p className="text-sm font-semibold">{e.emotion}</p>
                  <p className="text-xs text-muted-foreground">{e.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <SectionTitle icon={Clapperboard}>Action Poses</SectionTitle>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {visual.actionPoses.map((p) => <li key={p}>• {p}</li>)}
              </ul>
            </div>
            <div className="space-y-2">
              <SectionTitle icon={Eye}>Callouts & Details</SectionTitle>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {visual.callouts.map((c) => <li key={c}>• {c}</li>)}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PART B */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            Part B — Character Bible
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bio */}
          <div className="space-y-2">
            <SectionTitle icon={BookOpen}>Character Bio</SectionTitle>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p><span className="font-medium">Name:</span> {bible.bio.name}</p>
              <p><span className="font-medium">Age/Era:</span> {bible.bio.ageEra}</p>
              <p><span className="font-medium">Species:</span> {bible.bio.species}</p>
              <p><span className="font-medium">Occupation:</span> {bible.bio.occupation}</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{bible.bio.backstory}</p>
          </div>
          <Separator />

          {/* Personality */}
          <div className="space-y-3">
            <SectionTitle icon={Smile}>Personality Matrix</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {bible.personality.coreTraits.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
            </div>
            <p className="text-sm italic text-muted-foreground">"{bible.personality.motto}"</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-sm font-medium">Strengths</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {bible.personality.strengths.map((s) => <li key={s}>+ {s}</li>)}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Weaknesses</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {bible.personality.weaknesses.map((w) => <li key={w}>− {w}</li>)}
                </ul>
              </div>
            </div>
            <div className="space-y-2">
              {bible.personality.stats.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-xs text-muted-foreground">{s.label}</span>
                  <Progress value={s.value} className="h-2" />
                  <span className="w-8 text-right text-xs font-mono">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <Separator />

          {/* Design & materials */}
          <div className="space-y-3">
            <SectionTitle icon={Layers}>Design Notes & Materials</SectionTitle>
            <div>
              <p className="mb-1 text-sm font-medium">Textures</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {bible.design.textures.map((t) => <li key={t}>• {t}</li>)}
              </ul>
            </div>
            <p className="text-sm">
              <span className="font-medium">Scale/Proportions:</span>{" "}
              <span className="text-muted-foreground">{bible.design.proportions}</span>
            </p>
            <div>
              <p className="mb-1 text-sm font-medium">Key features</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {bible.design.keyFeatures.map((f) => <li key={f}>• {f}</li>)}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Color palette <span className="text-xs text-muted-foreground">(click to copy hex)</span></p>
              <div className="flex flex-wrap gap-2">
                {bible.design.palette.map((c) => (
                  <button
                    key={`${c.name}-${c.hex}`}
                    type="button"
                    onClick={() => copyHex(c.hex)}
                    className="group flex items-center gap-2 rounded-md border border-border px-2 py-1.5 transition-colors hover:border-primary"
                  >
                    <span className="h-6 w-6 rounded border border-border" style={{ backgroundColor: c.hex }} />
                    <span className="text-left">
                      <span className="block text-xs font-medium">{c.name}</span>
                      <span className="block font-mono text-[10px] text-muted-foreground group-hover:text-primary">
                        {c.hex.toUpperCase()}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Separator />

          {/* Animation */}
          <div className="space-y-2">
            <SectionTitle icon={Clapperboard}>Animation Guidelines</SectionTitle>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Movement style:</span> {bible.animation.movementStyle}</p>
              <p><span className="font-medium text-foreground">Gait:</span> {bible.animation.gait}</p>
              <p><span className="font-medium text-foreground">Expression mechanics:</span> {bible.animation.expressionNotes}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        <Download className="mr-1 inline h-3 w-3" />
        Prompt: {sheet.prompt}
      </p>
    </motion.section>
  );
};

export default CharacterSheetView;
