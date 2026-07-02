import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Circle, MapPin } from "lucide-react";
import type { AudioGuidePOI } from "@/data/telAvivAudioGuide";

interface POIListSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pois: (AudioGuidePOI & { distanceLabel: string | null })[];
  visitedIds: Set<string>;
  onSelectPoi: (id: string) => void;
}

export default function POIListSheet({ open, onOpenChange, pois, visitedIds, onSelectPoi }: POIListSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" dir="rtl" className="bg-card border-border h-[80vh] font-body">
        <SheetHeader className="text-right">
          <SheetTitle className="font-display text-foreground">כל התחנות</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(80vh-4rem)] mt-2">
          <ul className="space-y-2 pb-8">
            {pois.map((poi) => {
              const visited = visitedIds.has(poi.id);
              return (
                <li key={poi.id}>
                  <button
                    onClick={() => onSelectPoi(poi.id)}
                    className="w-full text-right flex items-center gap-3 rounded-lg border border-border bg-secondary/40 hover:bg-secondary/70 transition-colors p-3"
                  >
                    {visited ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium truncate">{poi.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{poi.hook}</p>
                    </div>
                    {poi.distanceLabel && (
                      <span className="flex items-center gap-1 text-xs text-primary shrink-0">
                        <MapPin className="w-3 h-3" /> {poi.distanceLabel}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
