/**
 * Sheet composer — renders the generated character sheet as a single
 * downloadable PNG: a blueprint-style layout with turnaround panels
 * built from the user's sketch, an expression strip, the color palette
 * and key design notes. Pure canvas 2D, no dependencies.
 */

import type { CharacterSheet } from "./types";

const W = 1920;
const H = 1200;

const INK = "#1E2430";
const PAPER = "#F4F1E8";
const LINE = "#C8C2B2";
const ACCENT = "#B8860B";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function panel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label: string) {
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = INK;
  ctx.font = "600 20px 'Inter', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label.toUpperCase(), x + w / 2, y + h + 30);
}

/** Draw the sketch fitted inside a box, optionally mirrored or as a silhouette. */
function drawSketch(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { mirror?: boolean; silhouette?: boolean } = {},
) {
  const pad = 16;
  const scale = Math.min((w - pad * 2) / img.width, (h - pad * 2) / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;

  ctx.save();
  if (opts.mirror) {
    ctx.translate(dx + dw / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(dx + dw / 2), 0);
  }
  if (opts.silhouette) {
    // Draw to an offscreen buffer, then flood the ink with a flat fill.
    const buf = document.createElement("canvas");
    buf.width = Math.ceil(dw);
    buf.height = Math.ceil(dh);
    const bctx = buf.getContext("2d");
    if (bctx) {
      bctx.drawImage(img, 0, 0, dw, dh);
      bctx.globalCompositeOperation = "source-in";
      bctx.fillStyle = "#3A4254";
      bctx.fillRect(0, 0, buf.width, buf.height);
      ctx.drawImage(buf, dx, dy);
    }
  } else {
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  ctx.restore();
}

/** Compose the sheet and return it as a PNG data-URL. */
export async function composeSheetPng(sheet: CharacterSheet): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");

  // Paper background with a faint blueprint grid.
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(120,130,150,0.10)";
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= W; gx += 48) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
  }
  for (let gy = 0; gy <= H; gy += 48) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  }

  // Header.
  ctx.fillStyle = INK;
  ctx.textAlign = "left";
  ctx.font = "800 56px 'Inter', system-ui, sans-serif";
  ctx.fillText(sheet.bible.bio.name.toUpperCase(), 60, 96);
  ctx.font = "500 26px 'Inter', system-ui, sans-serif";
  ctx.fillStyle = ACCENT;
  ctx.fillText(`"${sheet.bible.bio.title}"  ·  ${sheet.bible.bio.species}`, 60, 138);
  ctx.fillStyle = "#6A7080";
  ctx.font = "400 20px 'Inter', system-ui, sans-serif";
  ctx.fillText(`${sheet.visual.artStyle}  ·  CHARACTER MODEL SHEET`, 60, 170);
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(60, 190); ctx.lineTo(W - 60, 190); ctx.stroke();

  const img = sheet.sketchDataUrl ? await loadImage(sheet.sketchDataUrl).catch(() => null) : null;

  // Turnaround row.
  const tw = 330, th = 420, ty = 240, gap = 30;
  const labels = ["Front", "3/4 View", "Side (mirrored)", "Back (silhouette)"];
  const variants = [
    {},
    {},
    { mirror: true },
    { mirror: true, silhouette: true },
  ];
  for (let i = 0; i < 4; i++) {
    const tx = 60 + i * (tw + gap);
    panel(ctx, tx, ty, tw, th, labels[i]);
    if (img) drawSketch(ctx, img, tx, ty, tw, th, variants[i]);
    else {
      ctx.fillStyle = "#B9B2A0";
      ctx.font = "400 18px 'Inter', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("(no sketch)", tx + tw / 2, ty + th / 2);
    }
  }

  // Right column: palette + notes.
  const rx = 60 + 4 * (tw + gap);
  ctx.fillStyle = INK;
  ctx.textAlign = "left";
  ctx.font = "700 22px 'Inter', system-ui, sans-serif";
  ctx.fillText("COLOR SCRIPT", rx, ty + 8);
  sheet.bible.design.palette.slice(0, 5).forEach((sw, i) => {
    const sy = ty + 30 + i * 76;
    ctx.fillStyle = sw.hex;
    ctx.fillRect(rx, sy, 64, 56);
    ctx.strokeStyle = LINE;
    ctx.strokeRect(rx, sy, 64, 56);
    ctx.fillStyle = INK;
    ctx.font = "600 18px 'Inter', system-ui, sans-serif";
    ctx.fillText(sw.name, rx + 78, sy + 24);
    ctx.fillStyle = "#6A7080";
    ctx.font = "400 16px monospace";
    ctx.fillText(sw.hex.toUpperCase(), rx + 78, sy + 46);
  });

  // Expression strip.
  const ey = 760, ew = 250, eh = 230;
  ctx.fillStyle = INK;
  ctx.font = "700 22px 'Inter', system-ui, sans-serif";
  ctx.fillText("EXPRESSION SHEET", 60, ey - 14);
  const expressions = sheet.visual.expressions.slice(0, 6);
  expressions.forEach((exp, i) => {
    const ex = 60 + i * (ew + 24);
    panel(ctx, ex, ey, ew, eh, exp.emotion);
    if (img) {
      // Head crop: top 45% of the sketch, zoomed into the frame.
      const sh = img.height * 0.45;
      const pad = 12;
      const scale = Math.min((ew - pad * 2) / img.width, (eh - pad * 2) / sh);
      const dw = img.width * scale, dh = sh * scale;
      ctx.save();
      ctx.beginPath();
      ctx.rect(ex + 2, ey + 2, ew - 4, eh - 4);
      ctx.clip();
      ctx.drawImage(img, 0, 0, img.width, sh, ex + (ew - dw) / 2, ey + (eh - dh) / 2, dw, dh);
      ctx.restore();
    }
  });

  // Footer: prompt + animation note.
  ctx.fillStyle = "#6A7080";
  ctx.font = "italic 400 19px 'Inter', system-ui, sans-serif";
  ctx.textAlign = "left";
  const promptLine = `PROMPT — ${sheet.prompt}`;
  ctx.fillText(promptLine.length > 160 ? `${promptLine.slice(0, 157)}...` : promptLine, 60, H - 62);
  ctx.fillStyle = INK;
  ctx.font = "400 19px 'Inter', system-ui, sans-serif";
  const anim = `MOTION — ${sheet.bible.animation.movementStyle}`;
  ctx.fillText(anim.length > 160 ? `${anim.slice(0, 157)}...` : anim, 60, H - 30);

  return canvas.toDataURL("image/png");
}
