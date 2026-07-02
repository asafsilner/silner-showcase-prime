import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Eye, CheckCircle2, MapPin } from "lucide-react";
import type { AudioGuidePOI } from "@/data/telAvivAudioGuide";

interface POIDetailSheetProps {
  poi: AudioGuidePOI | null;
  distanceLabel: string | null;
  isVisited: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  onOpenChange: (open: boolean) => void;
  onPlay: () => void;
  onTogglePause: () => void;
  onStop: () => void;
}

export default function POIDetailSheet({
  poi,
  distanceLabel,
  isVisited,
  isSpeaking,
  isPaused,
  onOpenChange,
  onPlay,
  onTogglePause,
  onStop,
}: POIDetailSheetProps) {
  return (
    <Drawer open={!!poi} onOpenChange={onOpenChange}>
      <DrawerContent
        dir="rtl"
        className="bg-card border-border max-h-[85vh] font-body"
      >
        {poi && (
          <div className="overflow-y-auto px-6 pb-8 pt-2 max-h-[80vh]">
            <DrawerTitle className="sr-only">{poi.title}</DrawerTitle>
            <DrawerDescription className="sr-only">{poi.hook}</DrawerDescription>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                {isVisited && (
                  <Badge className="bg-green-500/15 text-green-400 border-green-500/30 gap-1">
                    <CheckCircle2 className="w-3 h-3" /> ביקרתם כאן
                  </Badge>
                )}
                {distanceLabel && (
                  <Badge variant="outline" className="gap-1 border-border text-muted-foreground">
                    <MapPin className="w-3 h-3" /> {distanceLabel}
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-primary text-sm font-medium mb-1">{poi.hook}</p>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">{poi.title}</h2>

            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3 mb-4">
              <Eye className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
              <span>{poi.visual_marker}</span>
            </div>

            <div className="flex items-center gap-2 mb-5">
              {!isSpeaking && (
                <Button onClick={onPlay} className="gap-2">
                  <Play className="w-4 h-4" /> השמעת הסיפור
                </Button>
              )}
              {isSpeaking && (
                <Button onClick={onTogglePause} variant="secondary" className="gap-2">
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? "המשך" : "השהה"}
                </Button>
              )}
              {isSpeaking && (
                <Button onClick={onStop} variant="outline" size="icon" aria-label="עצור">
                  <Square className="w-4 h-4" />
                </Button>
              )}
            </div>

            <p className="text-foreground leading-relaxed mb-5 whitespace-pre-line">{poi.story}</p>

            <div className="bg-accent/40 border border-primary/20 rounded-lg p-4">
              <p className="text-xs font-semibold text-primary mb-1">ידעתם ש...</p>
              <p className="text-sm text-foreground/90 leading-relaxed">{poi.fact}</p>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
