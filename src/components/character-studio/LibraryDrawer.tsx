import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Trash2 } from "lucide-react";
import type { CharacterSheet } from "@/character-studio/types";

/**
 * Saved character library — a side drawer over localStorage.
 */

interface LibraryDrawerProps {
  library: CharacterSheet[];
  onLoad: (sheet: CharacterSheet) => void;
  onDelete: (id: string) => void;
}

const LibraryDrawer = ({ library, onLoad, onDelete }: LibraryDrawerProps) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" size="sm" className="gap-2">
        <FolderOpen className="h-4 w-4" />
        Library
        {library.length > 0 && <Badge variant="secondary">{library.length}</Badge>}
      </Button>
    </SheetTrigger>
    <SheetContent className="w-full sm:max-w-md overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Saved Characters</SheetTitle>
        <SheetDescription>
          Stored only in this browser. Load one to view its full sheet again.
        </SheetDescription>
      </SheetHeader>
      <div className="mt-6 space-y-3">
        {library.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nothing saved yet — generate a character and hit "Save to library".
          </p>
        )}
        {library.map((sheet) => (
          <div
            key={sheet.id}
            className="flex items-center gap-3 rounded-md border border-border p-3"
          >
            {sheet.sketchDataUrl ? (
              <img
                src={sheet.sketchDataUrl}
                alt=""
                className="h-14 w-20 shrink-0 rounded border border-border bg-white object-contain"
              />
            ) : (
              <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded border border-border text-xs text-muted-foreground">
                no sketch
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{sheet.bible.bio.name}</p>
              <p className="truncate text-xs text-muted-foreground">{sheet.prompt}</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(sheet.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <Button size="sm" variant="secondary" onClick={() => onLoad(sheet)}>
                Load
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(sheet.id)}
                aria-label={`Delete ${sheet.bible.bio.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </SheetContent>
  </Sheet>
);

export default LibraryDrawer;
