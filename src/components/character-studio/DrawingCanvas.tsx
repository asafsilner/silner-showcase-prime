import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import {
  Circle,
  Eraser,
  Grid3X3,
  Minus,
  PenLine,
  Redo2,
  Square,
  Trash2,
  Undo2,
  User,
} from "lucide-react";

/**
 * The Live Drawing Canvas — the visual input of the studio.
 * The user sketches stick figures / basic shapes here; the sketch
 * becomes the structural blueprint for the generated character.
 *
 * Two stacked canvases: the main layer holds committed ink; the
 * overlay (pointer-events: none) holds the grid, pose guides and
 * live shape previews, and is never exported.
 */

export interface DrawingCanvasHandle {
  /** Snapshot the sketch composited on white, or null when unavailable. */
  snapshot(): { dataUrl: string; canvas: HTMLCanvasElement } | null;
  strokeCount(): number;
  isEmpty(): boolean;
}

type Tool = "pen" | "eraser" | "line" | "rect" | "ellipse";

const CANVAS_W = 960;
const CANVAS_H = 600;
const MAX_HISTORY = 30;

const SWATCHES = ["#1E2430", "#B8433A", "#2E6E4E", "#2A5DA8", "#C78A2B", "#7A4FA3"];

interface PoseGuide {
  id: string;
  label: string;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

function stickFigure(
  ctx: CanvasRenderingContext2D,
  headR: number,
  cx: number,
  top: number,
  bodyLen: number,
  armY: number,
  armSpan: number,
  legSpread: number,
) {
  ctx.beginPath();
  ctx.arc(cx, top + headR, headR, 0, Math.PI * 2);
  const neck = top + headR * 2;
  ctx.moveTo(cx, neck);
  ctx.lineTo(cx, neck + bodyLen);
  ctx.moveTo(cx - armSpan, neck + armY);
  ctx.lineTo(cx + armSpan, neck + armY);
  ctx.moveTo(cx, neck + bodyLen);
  ctx.lineTo(cx - legSpread, neck + bodyLen + bodyLen * 0.9);
  ctx.moveTo(cx, neck + bodyLen);
  ctx.lineTo(cx + legSpread, neck + bodyLen + bodyLen * 0.9);
  ctx.stroke();
}

const POSE_GUIDES: PoseGuide[] = [
  {
    id: "tpose",
    label: "T-Pose",
    draw: (ctx) => stickFigure(ctx, 55, CANVAS_W / 2, 60, 200, 40, 180, 70),
  },
  {
    id: "chibi",
    label: "Chibi",
    draw: (ctx) => stickFigure(ctx, 110, CANVAS_W / 2, 90, 130, 45, 120, 55),
  },
  {
    id: "action",
    label: "Action",
    draw: (ctx) => {
      ctx.beginPath();
      ctx.arc(CANVAS_W / 2 + 60, 130, 50, 0, Math.PI * 2);
      ctx.moveTo(CANVAS_W / 2 + 45, 175);
      ctx.lineTo(CANVAS_W / 2 - 30, 350);
      ctx.moveTo(CANVAS_W / 2 + 40, 230);
      ctx.lineTo(CANVAS_W / 2 + 190, 190);
      ctx.moveTo(CANVAS_W / 2 + 40, 230);
      ctx.lineTo(CANVAS_W / 2 - 110, 260);
      ctx.moveTo(CANVAS_W / 2 - 30, 350);
      ctx.lineTo(CANVAS_W / 2 + 80, 470);
      ctx.moveTo(CANVAS_W / 2 - 30, 350);
      ctx.lineTo(CANVAS_W / 2 - 160, 440);
      ctx.stroke();
    },
  },
];

const DrawingCanvas = forwardRef<DrawingCanvasHandle>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(SWATCHES[0]);
  const [width, setWidth] = useState(5);
  const [showGrid, setShowGrid] = useState(true);
  const [guide, setGuide] = useState<string | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [future, setFuture] = useState<ImageData[]>([]);
  const strokes = useRef(0);
  const drawing = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const last = useRef({ x: 0, y: 0 });

  const getCtx = (c: HTMLCanvasElement | null) =>
    c?.getContext("2d", { willReadFrequently: true }) ?? null;

  /** Repaint grid + pose guide on the overlay (clears shape previews). */
  const drawGuides = useCallback(() => {
    const ctx = getCtx(overlayRef.current);
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    if (showGrid) {
      ctx.strokeStyle = "rgba(120,130,150,0.15)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= CANVAS_W; x += 48) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_H; y += 48) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
      }
      ctx.strokeStyle = "rgba(184,134,11,0.25)";
      ctx.beginPath(); ctx.moveTo(CANVAS_W / 2, 0); ctx.lineTo(CANVAS_W / 2, CANVAS_H); ctx.stroke();
    }
    if (guide) {
      const g = POSE_GUIDES.find((p) => p.id === guide);
      if (g) {
        ctx.strokeStyle = "rgba(90,120,200,0.35)";
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        g.draw(ctx);
      }
    }
  }, [showGrid, guide]);

  useEffect(() => {
    drawGuides();
  }, [drawGuides]);

  const pushHistory = useCallback(() => {
    const ctx = getCtx(canvasRef.current);
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    setHistory((h) => [...h.slice(-(MAX_HISTORY - 1)), snap]);
    setFuture([]);
  }, []);

  const undo = () => {
    const ctx = getCtx(canvasRef.current);
    if (!ctx || history.length === 0) return;
    const current = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [...f, current]);
    ctx.putImageData(prev, 0, 0);
  };

  const redo = () => {
    const ctx = getCtx(canvasRef.current);
    if (!ctx || future.length === 0) return;
    const current = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    const next = future[future.length - 1];
    setFuture((f) => f.slice(0, -1));
    setHistory((h) => [...h, current]);
    ctx.putImageData(next, 0, 0);
  };

  const clearAll = () => {
    const ctx = getCtx(canvasRef.current);
    if (!ctx) return;
    pushHistory();
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    strokes.current = 0;
  };

  const pointerPos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  };

  const applyStrokeStyle = (ctx: CanvasRenderingContext2D) => {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = tool === "eraser" ? Math.max(width * 3, 16) : width;
    ctx.strokeStyle = color;
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
  };

  const strokeShape = (
    ctx: CanvasRenderingContext2D,
    a: { x: number; y: number },
    b: { x: number; y: number },
  ) => {
    ctx.beginPath();
    if (tool === "line") {
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    } else if (tool === "rect") {
      ctx.rect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    } else if (tool === "ellipse") {
      ctx.ellipse(
        (a.x + b.x) / 2,
        (a.y + b.y) / 2,
        Math.max(1, Math.abs(b.x - a.x) / 2),
        Math.max(1, Math.abs(b.y - a.y) / 2),
        0, 0, Math.PI * 2,
      );
    }
    ctx.stroke();
  };

  const drawShapePreview = (to: { x: number; y: number }) => {
    const octx = getCtx(overlayRef.current);
    if (!octx) return;
    drawGuides();
    octx.save();
    applyStrokeStyle(octx);
    octx.globalCompositeOperation = "source-over";
    strokeShape(octx, start.current, to);
    octx.restore();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    const pos = pointerPos(e);
    drawing.current = true;
    start.current = pos;
    last.current = pos;
    pushHistory();
    if (tool === "pen" || tool === "eraser") {
      const ctx = getCtx(canvasRef.current);
      if (!ctx) return;
      ctx.save();
      applyStrokeStyle(ctx);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x + 0.01, pos.y + 0.01);
      ctx.stroke();
      ctx.restore();
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const pos = pointerPos(e);
    if (tool === "pen" || tool === "eraser") {
      const ctx = getCtx(canvasRef.current);
      if (!ctx) return;
      ctx.save();
      applyStrokeStyle(ctx);
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.restore();
      last.current = pos;
    } else {
      drawShapePreview(pos);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    drawing.current = false;
    const pos = pointerPos(e);
    if (tool !== "pen" && tool !== "eraser") {
      const ctx = getCtx(canvasRef.current);
      if (ctx) {
        ctx.save();
        applyStrokeStyle(ctx);
        ctx.globalCompositeOperation = "source-over";
        strokeShape(ctx, start.current, pos);
        ctx.restore();
      }
      drawGuides();
    }
    strokes.current += 1;
  };

  useImperativeHandle(ref, () => ({
    snapshot() {
      const src = canvasRef.current;
      if (!src) return null;
      // Composite on white so both the vision model and the sheet
      // composer get a clean paper-like image.
      const out = document.createElement("canvas");
      out.width = CANVAS_W;
      out.height = CANVAS_H;
      const ctx = out.getContext("2d");
      if (!ctx) return null;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.drawImage(src, 0, 0);
      return { dataUrl: out.toDataURL("image/png"), canvas: out };
    },
    strokeCount: () => strokes.current,
    isEmpty: () => strokes.current === 0,
  }));

  const tools: { id: Tool; icon: typeof PenLine; label: string }[] = [
    { id: "pen", icon: PenLine, label: "Pen" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "rect", icon: Square, label: "Rectangle" },
    { id: "ellipse", icon: Circle, label: "Ellipse" },
  ];

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-md border border-border p-1">
          {tools.map((t) => (
            <Button
              key={t.id}
              type="button"
              size="icon"
              variant={tool === t.id ? "default" : "ghost"}
              className="h-8 w-8"
              onClick={() => setTool(t.id)}
              title={t.label}
              aria-label={t.label}
            >
              <t.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { setColor(c); if (tool === "eraser") setTool("pen"); }}
              className={`h-6 w-6 rounded-full border-2 transition-transform ${
                color === c ? "scale-110 border-primary" : "border-border"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="ml-1 h-7 w-7 cursor-pointer rounded border border-border bg-transparent p-0.5"
            aria-label="Custom color"
          />
        </div>
        <div className="flex w-28 items-center gap-2">
          <span className="text-xs text-muted-foreground">Size</span>
          <Slider
            value={[width]}
            min={1}
            max={24}
            step={1}
            onValueChange={([v]) => setWidth(v)}
          />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Toggle
            pressed={showGrid}
            onPressedChange={setShowGrid}
            size="sm"
            aria-label="Toggle grid"
            title="Grid"
          >
            <Grid3X3 className="h-4 w-4" />
          </Toggle>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={undo} disabled={history.length === 0} title="Undo" aria-label="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={redo} disabled={future.length === 0} title="Redo" aria-label="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={clearAll} title="Clear canvas" aria-label="Clear canvas">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Pose guides */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <User className="h-3.5 w-3.5" />
        <span>Pose guide:</span>
        {POSE_GUIDES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGuide((cur) => (cur === g.id ? null : g.id))}
            className={`rounded-full border px-2.5 py-0.5 transition-colors ${
              guide === g.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Canvas stack: overlay paints above the (transparent-ink) main layer */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-white shadow-inner">
        <canvas
          ref={overlayRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block h-auto w-full touch-none cursor-crosshair"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Sketch a rough silhouette or stick figure — proportions and pose become the
        blueprint for the generated character. No art skills required.
      </p>
    </div>
  );
});

DrawingCanvas.displayName = "DrawingCanvas";

export default DrawingCanvas;
