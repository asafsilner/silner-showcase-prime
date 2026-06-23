import { useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

// ─── Canvas constants ────────────────────────────────────────────────
const W = 800, H = 500;
const ROAD_TOP = 148;   // y where road starts (from top)
const ROAD_BOT = 352;   // y where road ends (toward bottom)
const PX = 130;          // player fixed X position
const BASE_SPD = 3.2;
const PAPER_SPD = 9;
const PLAYER_SPD = 4.5;

// ─── Types ───────────────────────────────────────────────────────────
type Phase = "start" | "play" | "over";

interface Paper  { id: number; x: number; y: number; rot: number }
interface House  {
  id: number; x: number; side: "top" | "bot";
  sub: boolean; hit: boolean; flash: number; colorIdx: number;
}
interface Obs    { id: number; x: number; y: number; type: "car" | "dog" | "cone" }

interface G {
  phase: Phase;
  score: number; lives: number; best: number;
  frame: number; speed: number;
  py: number; pvy: number;
  throwA: number; inv: number;
  papers: Paper[]; houses: House[]; obs: Obs[];
  nid: number; spawnT: number;
}

function newGame(best = 0): G {
  return {
    phase: "play",
    score: 0, lives: 3, best,
    frame: 0, speed: BASE_SPD,
    py: (ROAD_TOP + ROAD_BOT) / 2, pvy: 0,
    throwA: 0, inv: 0,
    papers: [], houses: [], obs: [],
    nid: 0, spawnT: 80,
  };
}

// ─── Palette ─────────────────────────────────────────────────────────
const WALL_COLORS    = ["#F5E6C8", "#EDE0C5", "#F0DDB0", "#E8D5A3"];
const SUB_ROOFS      = ["#2E7D32", "#1B5E20", "#388E3C", "#43A047"];
const NSUB_ROOFS     = ["#8D2B00", "#7A2000", "#9C3A00", "#6D1C00"];
const SUB_WIN        = "#C8E6C9";
const NSUB_WIN       = "#B0BEC5";

// ─── Draw: Background ────────────────────────────────────────────────
function drawBg(ctx: CanvasRenderingContext2D, scrollX: number) {
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, ROAD_TOP);
  sky.addColorStop(0, "#5BA4CF");
  sky.addColorStop(1, "#B8E4F7");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, ROAD_TOP);

  // Top grass strip
  ctx.fillStyle = "#4CAF50";
  ctx.fillRect(0, ROAD_TOP - 28, W, 28);
  // Bottom grass strip
  ctx.fillStyle = "#4CAF50";
  ctx.fillRect(0, ROAD_BOT, W, 28);

  // Road
  ctx.fillStyle = "#4A4A4A";
  ctx.fillRect(0, ROAD_TOP, W, ROAD_BOT - ROAD_TOP);

  // Road panels (darker stripes)
  ctx.fillStyle = "#444";
  const panelW = 80;
  for (let rx = (scrollX % panelW) - panelW; rx < W; rx += panelW) {
    ctx.fillRect(rx, ROAD_TOP, panelW - 3, ROAD_BOT - ROAD_TOP);
  }

  // Center dashed yellow line
  ctx.strokeStyle = "#FFEE32";
  ctx.lineWidth = 3;
  ctx.setLineDash([28, 18]);
  ctx.lineDashOffset = -(scrollX % 46);
  ctx.beginPath();
  const midY = (ROAD_TOP + ROAD_BOT) / 2;
  ctx.moveTo(0, midY); ctx.lineTo(W, midY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Road edge white lines
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, ROAD_TOP + 2); ctx.lineTo(W, ROAD_TOP + 2);
  ctx.moveTo(0, ROAD_BOT - 2); ctx.lineTo(W, ROAD_BOT - 2);
  ctx.stroke();

  // Bottom lawn
  ctx.fillStyle = "#8BC34A";
  ctx.fillRect(0, ROAD_BOT + 28, W, H - ROAD_BOT - 28);

  // Scrolling fence posts (top edge of road)
  ctx.fillStyle = "#ECEFF1";
  const postSpacing = 40;
  for (let px = (scrollX % postSpacing) - postSpacing; px < W; px += postSpacing) {
    ctx.fillRect(px, ROAD_TOP - 35, 5, 35);
    ctx.fillRect(px - 4, ROAD_TOP - 40, 13, 7);
  }
  // Fence rail
  ctx.fillStyle = "#CFD8DC";
  ctx.fillRect(0, ROAD_TOP - 30, W, 5);
  ctx.fillRect(0, ROAD_TOP - 16, W, 4);
  // Bottom fence posts
  for (let fpx = (scrollX % postSpacing) - postSpacing; fpx < W; fpx += postSpacing) {
    ctx.fillRect(fpx, ROAD_BOT, 5, 35);
    ctx.fillRect(fpx - 4, ROAD_BOT + 33, 13, 7);
  }
  ctx.fillStyle = "#CFD8DC";
  ctx.fillRect(0, ROAD_BOT + 10, W, 5);
  ctx.fillRect(0, ROAD_BOT + 22, W, 4);
}

// ─── Draw: House ─────────────────────────────────────────────────────
function drawHouse(ctx: CanvasRenderingContext2D, h: House) {
  const { x, side, sub, hit, flash, colorIdx } = h;
  const isFlash = flash > 0;

  const wallCol = isFlash ? (sub ? "#A5D6A7" : "#FFCDD2") : WALL_COLORS[colorIdx];
  const roofCol = isFlash ? (sub ? "#81C784" : "#EF9A9A") : (sub ? SUB_ROOFS[colorIdx] : NSUB_ROOFS[colorIdx]);
  const winCol  = isFlash ? "#FFFFFF" : (sub ? SUB_WIN : NSUB_WIN);

  const draw = (cx: number) => {
    if (side === "top") {
      const wTop = 10, wBot = ROAD_TOP - 28;
      const wH = wBot - wTop;

      // Wall
      ctx.fillStyle = wallCol;
      ctx.fillRect(cx - 33, wTop + 18, 66, wH - 18);

      // Roof triangle
      ctx.fillStyle = roofCol;
      ctx.beginPath();
      ctx.moveTo(cx - 42, wTop + 18);
      ctx.lineTo(cx, wTop);
      ctx.lineTo(cx + 42, wTop + 18);
      ctx.closePath();
      ctx.fill();

      // Windows
      ctx.fillStyle = winCol;
      ctx.fillRect(cx - 26, wTop + 28, 18, 16);
      ctx.fillRect(cx + 8,  wTop + 28, 18, 16);
      // Window cross panes
      ctx.strokeStyle = "#90A4AE"; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 17, wTop + 28); ctx.lineTo(cx - 17, wTop + 44);
      ctx.moveTo(cx - 26, wTop + 36); ctx.lineTo(cx - 8,  wTop + 36);
      ctx.moveTo(cx + 17, wTop + 28); ctx.lineTo(cx + 17, wTop + 44);
      ctx.moveTo(cx + 8,  wTop + 36); ctx.lineTo(cx + 26, wTop + 36);
      ctx.stroke();

      // Door
      ctx.fillStyle = roofCol;
      ctx.fillRect(cx - 11, wBot - 30, 22, 30);
      // Door knob
      ctx.fillStyle = "#FFD700";
      ctx.beginPath(); ctx.arc(cx + 7, wBot - 15, 2.5, 0, Math.PI * 2); ctx.fill();

      // Mailbox post
      ctx.fillStyle = "#546E7A";
      ctx.fillRect(cx - 2, ROAD_TOP - 25, 4, 22);
      // Mailbox box
      ctx.fillStyle = hit ? "#78909C" : "#1565C0";
      ctx.fillRect(cx - 10, ROAD_TOP - 38, 20, 14);
      ctx.fillStyle = hit ? "#607D8B" : "#0D47A1";
      ctx.fillRect(cx - 10, ROAD_TOP - 26, 20, 3);
      // Red flag on subscriber mailbox
      if (sub && !hit) {
        ctx.fillStyle = "#F44336";
        ctx.fillRect(cx + 8, ROAD_TOP - 48, 5, 12);
        ctx.fillRect(cx + 8, ROAD_TOP - 48, 10, 6);
      }

      // Subscriber glow outline
      if (sub && !hit) {
        ctx.save();
        ctx.shadowColor = "#4CAF50"; ctx.shadowBlur = 12;
        ctx.strokeStyle = "#4CAF50"; ctx.lineWidth = 2;
        ctx.strokeRect(cx - 33, wTop + 18, 66, wH - 18);
        ctx.restore();
      }

    } else {
      // Bottom house
      const hTop = ROAD_BOT + 28;
      const hH   = H - hTop - 6;

      // Wall
      ctx.fillStyle = wallCol;
      ctx.fillRect(cx - 33, hTop, 66, hH);

      // Roof (triangle at top of house, pointing toward road)
      ctx.fillStyle = roofCol;
      ctx.beginPath();
      ctx.moveTo(cx - 42, hTop);
      ctx.lineTo(cx, ROAD_BOT + 8);
      ctx.lineTo(cx + 42, hTop);
      ctx.closePath();
      ctx.fill();

      // Windows
      ctx.fillStyle = winCol;
      ctx.fillRect(cx - 26, hTop + 10, 18, 16);
      ctx.fillRect(cx + 8,  hTop + 10, 18, 16);
      ctx.strokeStyle = "#90A4AE"; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 17, hTop + 10); ctx.lineTo(cx - 17, hTop + 26);
      ctx.moveTo(cx - 26, hTop + 18); ctx.lineTo(cx - 8,  hTop + 18);
      ctx.moveTo(cx + 17, hTop + 10); ctx.lineTo(cx + 17, hTop + 26);
      ctx.moveTo(cx + 8,  hTop + 18); ctx.lineTo(cx + 26, hTop + 18);
      ctx.stroke();

      // Door
      ctx.fillStyle = roofCol;
      ctx.fillRect(cx - 11, hTop + 32, 22, 30);
      ctx.fillStyle = "#FFD700";
      ctx.beginPath(); ctx.arc(cx + 8, hTop + 47, 2.5, 0, Math.PI * 2); ctx.fill();

      // Mailbox
      ctx.fillStyle = "#546E7A";
      ctx.fillRect(cx - 2, ROAD_BOT + 3, 4, 22);
      ctx.fillStyle = hit ? "#78909C" : "#1565C0";
      ctx.fillRect(cx - 10, ROAD_BOT + 10, 20, 14);
      ctx.fillStyle = hit ? "#607D8B" : "#0D47A1";
      ctx.fillRect(cx - 10, ROAD_BOT + 22, 20, 3);
      if (sub && !hit) {
        ctx.fillStyle = "#F44336";
        ctx.fillRect(cx + 8, ROAD_BOT + 2, 5, 12);
        ctx.fillRect(cx + 8, ROAD_BOT + 2, 10, 6);
      }

      if (sub && !hit) {
        ctx.save();
        ctx.shadowColor = "#4CAF50"; ctx.shadowBlur = 12;
        ctx.strokeStyle = "#4CAF50"; ctx.lineWidth = 2;
        ctx.strokeRect(cx - 33, hTop, 66, hH);
        ctx.restore();
      }
    }
  };

  draw(x);
}

// ─── Draw: Player ────────────────────────────────────────────────────
function drawPlayer(ctx: CanvasRenderingContext2D, py: number, throwA: number, inv: number) {
  if (inv > 0 && Math.floor(inv / 5) % 2 === 0) return;

  const x = PX, y = py;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x, y + 16, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wheels
  const drawWheel = (wx: number, wy: number) => {
    ctx.fillStyle = "#1A1A1A"; ctx.beginPath();
    ctx.arc(wx, wy, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#444"; ctx.lineWidth = 1.5;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath();
      ctx.moveTo(wx + Math.cos(a) * 4, wy + Math.sin(a) * 4);
      ctx.lineTo(wx + Math.cos(a) * 10, wy + Math.sin(a) * 10);
      ctx.stroke();
    }
    ctx.strokeStyle = "#666"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(wx, wy, 11, 0, Math.PI * 2); ctx.stroke();
  };

  drawWheel(x - 18, y + 14);
  drawWheel(x + 18, y + 14);

  // Bike frame
  ctx.strokeStyle = "#FF6D00"; ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - 18, y + 14);
  ctx.lineTo(x, y - 2);
  ctx.lineTo(x + 18, y + 14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - 2); ctx.lineTo(x - 8, y + 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 8, y - 6); ctx.lineTo(x + 18, y + 14);
  ctx.stroke();
  ctx.lineCap = "butt";

  // Handlebars
  ctx.strokeStyle = "#9E9E9E"; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 7, y - 14); ctx.lineTo(x + 24, y - 20);
  ctx.stroke();

  // Body / jacket
  ctx.fillStyle = "#1565C0";
  ctx.fillRect(x - 9, y - 28, 18, 22);

  // Throwing arm
  if (throwA > 0) {
    const t = throwA / 8;
    ctx.save();
    ctx.translate(x + 6, y - 22);
    ctx.rotate(-0.2 - t * 0.9);
    ctx.fillStyle = "#1565C0";
    ctx.fillRect(0, -3, 26, 6);
    // Newspaper in hand
    ctx.fillStyle = "#FFFFF0";
    ctx.fillRect(22, -5, 18, 12);
    ctx.strokeStyle = "#BDBDBD"; ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(23, -1); ctx.lineTo(39, -1);
    ctx.moveTo(23, 3);  ctx.lineTo(39, 3);
    ctx.moveTo(23, 6);  ctx.lineTo(39, 6);
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.fillStyle = "#1565C0";
    ctx.fillRect(x + 6, y - 24, 20, 6);
  }

  // Helmet
  ctx.fillStyle = "#FF6D00";
  ctx.beginPath(); ctx.arc(x, y - 36, 11, 0, Math.PI * 2); ctx.fill();
  // Face
  ctx.fillStyle = "#FFDAB9";
  ctx.beginPath();
  ctx.arc(x + 5, y - 32, 7, 0.3, Math.PI - 0.3);
  ctx.fill();
  // Goggles
  ctx.fillStyle = "#1565C0";
  ctx.fillRect(x - 1, y - 36, 12, 5);
  ctx.fillStyle = "#80DEEA";
  ctx.fillRect(x, y - 35, 5, 4);
  ctx.fillRect(x + 6, y - 35, 4, 4);
}

// ─── Draw: Newspaper projectile ──────────────────────────────────────
function drawPaper(ctx: CanvasRenderingContext2D, p: Paper) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.fillStyle = "#FFFFF0";
  ctx.fillRect(-9, -6, 18, 12);
  ctx.strokeStyle = "#BDBDBD"; ctx.lineWidth = 0.8;
  ctx.strokeRect(-9, -6, 18, 12);
  ctx.beginPath();
  ctx.moveTo(-7, -2); ctx.lineTo(7, -2);
  ctx.moveTo(-7, 1);  ctx.lineTo(7, 1);
  ctx.moveTo(-7, 4);  ctx.lineTo(7, 4);
  ctx.stroke();
  // Red header bar
  ctx.fillStyle = "#D32F2F";
  ctx.fillRect(-9, -6, 18, 4);
  ctx.restore();
}

// ─── Draw: Obstacles ─────────────────────────────────────────────────
function drawObs(ctx: CanvasRenderingContext2D, ob: Obs) {
  const { x, y, type } = ob;

  if (type === "car") {
    // Body
    ctx.fillStyle = "#D32F2F";
    ctx.fillRect(x - 28, y - 15, 56, 30);
    // Cab
    ctx.fillStyle = "#B71C1C";
    ctx.fillRect(x - 18, y - 26, 36, 14);
    // Windows
    ctx.fillStyle = "#B3E5FC";
    ctx.fillRect(x - 14, y - 24, 12, 9);
    ctx.fillRect(x + 2, y - 24, 12, 9);
    // Wheels
    [[-20, -14], [20, -14], [-20, 14], [20, 14]].forEach(([wx, wy]) => {
      ctx.fillStyle = "#1A1A1A";
      ctx.beginPath(); ctx.arc(x + wx, y + wy, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#333"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x + wx, y + wy, 8, 0, Math.PI * 2); ctx.stroke();
    });
    // Headlights
    ctx.fillStyle = "#FFF176";
    ctx.fillRect(x + 25, y - 8, 6, 8);
    // Taillights
    ctx.fillStyle = "#EF5350";
    ctx.fillRect(x - 31, y - 8, 6, 8);

  } else if (type === "dog") {
    // Body
    ctx.fillStyle = "#8D6E63";
    ctx.beginPath();
    ctx.ellipse(x, y, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.fillStyle = "#8D6E63";
    ctx.beginPath();
    ctx.arc(x + 15, y - 4, 10, 0, Math.PI * 2);
    ctx.fill();
    // Ear
    ctx.fillStyle = "#6D4C41";
    ctx.beginPath();
    ctx.ellipse(x + 18, y - 11, 4, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Tail
    ctx.strokeStyle = "#8D6E63"; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 17, y - 2);
    ctx.quadraticCurveTo(x - 30, y - 16, x - 24, y - 22);
    ctx.stroke();
    ctx.lineCap = "butt";
    // Legs
    ctx.fillStyle = "#795548";
    [[-8, 8], [4, 8], [-4, 8], [8, 8]].forEach(([lx, ly]) => {
      ctx.fillRect(x + lx, y + ly, 5, 10);
    });
    // Eye + nose
    ctx.fillStyle = "#1A1A1A";
    ctx.beginPath(); ctx.arc(x + 20, y - 6, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#4E342E";
    ctx.beginPath(); ctx.arc(x + 24, y - 2, 2.5, 0, Math.PI * 2); ctx.fill();

  } else {
    // Traffic cone
    ctx.fillStyle = "#FF6D00";
    ctx.beginPath();
    ctx.moveTo(x, y - 26);
    ctx.lineTo(x - 14, y + 12);
    ctx.lineTo(x + 14, y + 12);
    ctx.closePath();
    ctx.fill();
    // White stripe
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 2);
    ctx.lineTo(x - 11, y + 10);
    ctx.lineTo(x + 11, y + 10);
    ctx.lineTo(x + 6, y - 2);
    ctx.closePath();
    ctx.fill();
    // Base
    ctx.fillStyle = "#E65100";
    ctx.fillRect(x - 16, y + 12, 32, 6);
  }
}

// ─── Draw: HUD ───────────────────────────────────────────────────────
function drawHUD(ctx: CanvasRenderingContext2D, score: number, lives: number, best: number, speed: number) {
  // Top bar
  ctx.fillStyle = "rgba(0,0,0,0.62)";
  ctx.fillRect(0, 0, W, 34);

  ctx.font = "bold 16px monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = "#FFE57F";
  ctx.fillText(`SCORE  ${String(score).padStart(6, "0")}`, 16, 22);

  ctx.textAlign = "center";
  ctx.fillStyle = "#B0BEC5";
  const lvl = Math.floor((speed - BASE_SPD) / 0.4) + 1;
  ctx.fillText(`LEVEL ${lvl}`, W / 2, 22);

  ctx.textAlign = "right";
  ctx.fillStyle = "#FFE57F";
  ctx.fillText(`BEST  ${String(best).padStart(6, "0")}`, W - 120, 22);

  // Lives as newspaper icons
  ctx.fillStyle = "#FFF";
  ctx.fillText("♥", W - 20 - (lives - 1) * 22 - 30, 22);
  for (let i = 0; i < lives; i++) {
    ctx.fillStyle = "#FFFFF0";
    const lx = W - 20 - i * 22;
    ctx.fillRect(lx - 14, 10, 14, 12);
    ctx.strokeStyle = "#BDBDBD"; ctx.lineWidth = 0.8;
    ctx.strokeRect(lx - 14, 10, 14, 12);
    ctx.fillStyle = "#D32F2F";
    ctx.fillRect(lx - 14, 10, 14, 4);
  }
}

// ─── Draw: Aim guide (subtle) ────────────────────────────────────────
function drawAimGuide(ctx: CanvasRenderingContext2D, py: number) {
  const topMailboxY = ROAD_TOP - 24;
  const botMailboxY = ROAD_BOT + 17;
  const distTop = Math.abs(py - topMailboxY);
  const distBot = Math.abs(py - botMailboxY);
  const nearTop = distTop < 50;
  const nearBot = distBot < 50;

  if (nearTop || nearBot) {
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = 0;
    ctx.lineWidth = 1;
    if (nearTop) {
      const alpha = Math.max(0, 1 - distTop / 50) * 0.4;
      ctx.strokeStyle = `rgba(76,175,80,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(PX + 30, py);
      ctx.lineTo(W, py);
      ctx.stroke();
    }
    if (nearBot) {
      const alpha = Math.max(0, 1 - distBot / 50) * 0.4;
      ctx.strokeStyle = `rgba(76,175,80,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(PX + 30, py);
      ctx.lineTo(W, py);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }
}

// ─── Draw: Hit particle burst ────────────────────────────────────────
function drawFlash(ctx: CanvasRenderingContext2D, h: House, frameNum: number) {
  if (h.flash <= 0) return;
  const progress = h.flash / 25;
  const x = h.x;
  const y = h.side === "top" ? ROAD_TOP - 24 : ROAD_BOT + 17;
  const r = (1 - progress) * 40;

  ctx.save();
  ctx.globalAlpha = progress * 0.7;
  ctx.fillStyle = h.sub ? "#A5D6A7" : "#FFCDD2";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Stars
  const starCount = 6;
  for (let i = 0; i < starCount; i++) {
    const angle = (i / starCount) * Math.PI * 2 + frameNum * 0.1;
    const sx = x + Math.cos(angle) * r * 0.8;
    const sy = y + Math.sin(angle) * r * 0.8;
    ctx.fillStyle = h.sub ? "#FFD700" : "#FF8A80";
    ctx.beginPath();
    ctx.arc(sx, sy, 4 * progress, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ─── Draw: Score popup ───────────────────────────────────────────────
interface Popup { id: number; x: number; y: number; text: string; color: string; life: number }
const popups: Popup[] = [];

function spawnPopup(x: number, y: number, text: string, color: string, nid: { v: number }) {
  popups.push({ id: nid.v++, x, y, text, color, life: 40 });
}

function updateDrawPopups(ctx: CanvasRenderingContext2D) {
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.life--;
    p.y -= 1;
    if (p.life <= 0) { popups.splice(i, 1); continue; }
    ctx.save();
    ctx.globalAlpha = p.life / 40;
    ctx.font = `bold ${14 + (40 - p.life) * 0.2}px monospace`;
    ctx.fillStyle = p.color;
    ctx.textAlign = "center";
    ctx.shadowColor = "#000"; ctx.shadowBlur = 6;
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
  }
}

// ─── Draw: Overlay screens ───────────────────────────────────────────
function drawStartScreen(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.save();
  ctx.font = "bold 62px monospace";
  ctx.textAlign = "center";
  const grd = ctx.createLinearGradient(0, H / 2 - 90, 0, H / 2 - 30);
  grd.addColorStop(0, "#FFE57F");
  grd.addColorStop(1, "#FF6D00");
  ctx.fillStyle = grd;
  ctx.shadowColor = "#FF6D00"; ctx.shadowBlur = 20;
  ctx.fillText("PAPERBOY", W / 2, H / 2 - 40);
  ctx.restore();

  // Subtitle
  ctx.font = "18px monospace";
  ctx.fillStyle = "#ECEFF1";
  ctx.textAlign = "center";
  ctx.fillText("Deliver the news. Dodge the chaos.", W / 2, H / 2 + 4);

  // Controls
  ctx.font = "14px monospace";
  ctx.fillStyle = "#90A4AE";
  ctx.fillText("↑ ↓  Move      SPACE  Throw newspaper", W / 2, H / 2 + 38);

  const blink = Math.sin(frame * 0.08) > 0;
  if (blink) {
    ctx.font = "bold 18px monospace";
    ctx.fillStyle = "#FFE57F";
    ctx.fillText("Press SPACE or ↑↓ to start", W / 2, H / 2 + 80);
  }

  // Legend
  ctx.font = "12px monospace";
  ctx.fillStyle = "#81C784"; ctx.fillText("● Green glow = Subscriber  +100 pts", W / 2 - 80, H / 2 + 115);
  ctx.fillStyle = "#EF9A9A"; ctx.fillText("● Dark roof  = Non-subscriber  −life", W / 2 + 90, H / 2 + 115);
}

function drawGameOver(ctx: CanvasRenderingContext2D, score: number, best: number, frame: number) {
  ctx.fillStyle = "rgba(0,0,0,0.78)";
  ctx.fillRect(0, 0, W, H);

  ctx.font = "bold 56px monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#EF5350";
  ctx.shadowColor = "#B71C1C"; ctx.shadowBlur = 18;
  ctx.fillText("GAME OVER", W / 2, H / 2 - 50);
  ctx.shadowBlur = 0;

  ctx.font = "26px monospace";
  ctx.fillStyle = "#FFE57F";
  ctx.fillText(`SCORE  ${score}`, W / 2, H / 2 + 4);
  ctx.fillStyle = "#B0BEC5";
  ctx.fillText(`BEST   ${best}`, W / 2, H / 2 + 38);

  const blink = Math.sin(frame * 0.1) > 0;
  if (blink) {
    ctx.font = "16px monospace";
    ctx.fillStyle = "#ECEFF1";
    ctx.fillText("SPACE or R to play again", W / 2, H / 2 + 82);
  }
}

// ─── Component ───────────────────────────────────────────────────────
export default function PaperboyGame() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const keysRef    = useRef(new Set<string>());
  const rafRef     = useRef(0);
  const gRef       = useRef<G | null>(null);
  const phaseRef   = useRef<Phase>("start");
  const scrollRef  = useRef(0);
  const frameRef   = useRef(0); // for overlay animations before game starts
  const nidRef     = useRef({ v: 0 });

  const startGame = useCallback(() => {
    const best = gRef.current?.best ?? 0;
    gRef.current = newGame(best);
    phaseRef.current = "play";
    popups.length = 0;
  }, []);

  // Keyboard handling
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current.add(e.key);
      if (phaseRef.current === "start") {
        if ([" ", "ArrowUp", "ArrowDown"].includes(e.key)) startGame();
      }
      if (phaseRef.current === "over") {
        if (e.key === " " || e.key === "r" || e.key === "R") startGame();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup",   onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup",   onUp);
    };
  }, [startGame]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const tick = () => {
      frameRef.current++;
      const keys = keysRef.current;
      const phase = phaseRef.current;
      const g = gRef.current;

      // ── UPDATE ────────────────────────────────────────────────────
      if (phase === "play" && g) {
        g.frame++;
        scrollRef.current += g.speed;
        g.throwA = Math.max(0, g.throwA - 1);
        g.inv    = Math.max(0, g.inv    - 1);
        g.speed  = BASE_SPD + Math.floor(g.score / 400) * 0.4;

        // Player movement
        const goUp   = keys.has("ArrowUp")   || keys.has("w") || keys.has("W");
        const goDown = keys.has("ArrowDown")  || keys.has("s") || keys.has("S");
        if (goUp)        g.pvy = Math.max(g.pvy - 1.0, -PLAYER_SPD);
        else if (goDown) g.pvy = Math.min(g.pvy + 1.0,  PLAYER_SPD);
        else             g.pvy *= 0.82;
        g.py = Math.max(ROAD_TOP + 20, Math.min(ROAD_BOT - 20, g.py + g.pvy));

        // Throw
        const wantThrow = keys.has(" ") || keys.has("ArrowRight");
        if (wantThrow && g.throwA === 0) {
          g.throwA = 10;
          g.papers.push({ id: g.nid++, x: PX + 26, y: g.py, rot: 0 });
          keys.delete(" ");
          keys.delete("ArrowRight");
        }

        // Spawn houses + obstacles
        g.spawnT--;
        if (g.spawnT <= 0) {
          const interval = Math.max(55, 105 - Math.floor(g.score / 300) * 4);
          g.spawnT = interval;

          const side = Math.random() < 0.5 ? "top" : "bot" as const;
          g.houses.push({
            id: g.nid++, x: W + 55, side,
            sub: Math.random() < 0.65,
            hit: false, flash: 0,
            colorIdx: Math.floor(Math.random() * 4),
          });

          if (Math.random() < 0.5) {
            const types = ["car", "dog", "cone"] as const;
            const type  = types[Math.floor(Math.random() * 3)];
            const obY   = type === "car"
              ? ROAD_TOP + 30 + Math.random() * (ROAD_BOT - ROAD_TOP - 60)
              : Math.random() < 0.5 ? ROAD_TOP + 24 : ROAD_BOT - 24;
            g.obs.push({ id: g.nid++, x: W + 50, y: obY, type });
          }
        }

        // Move houses
        for (const h of g.houses) { h.x -= g.speed; if (h.flash > 0) h.flash--; }
        g.houses = g.houses.filter(h => h.x > -90);

        // Move obstacles (slightly faster than scroll)
        for (const ob of g.obs) ob.x -= g.speed + 1.2;
        g.obs = g.obs.filter(ob => ob.x > -60);

        // Move newspapers
        for (const p of g.papers) { p.x += PAPER_SPD; p.rot += 0.18; }
        g.papers = g.papers.filter(p => p.x < W + 40);

        // Newspaper ↔ house collision
        for (const p of g.papers) {
          for (const h of g.houses) {
            if (h.hit) continue;
            const mailY = h.side === "top" ? ROAD_TOP - 24 : ROAD_BOT + 17;
            if (Math.abs(p.x - h.x) < 34 && Math.abs(p.y - mailY) < 32) {
              h.hit = true; h.flash = 28;
              p.x = W + 999;
              if (h.sub) {
                g.score += 100;
                spawnPopup(h.x, mailY - 20, "+100", "#FFE57F", nidRef.current);
              } else {
                g.score = Math.max(0, g.score - 50);
                g.lives--;
                spawnPopup(h.x, mailY - 20, "OOPS −life", "#EF5350", nidRef.current);
              }
            }
          }
        }

        // Player ↔ obstacle collision
        if (g.inv === 0) {
          for (const ob of g.obs) {
            const hw = ob.type === "car" ? 32 : 16;
            const hh = ob.type === "car" ? 18 : 16;
            if (Math.abs(PX - ob.x) < hw && Math.abs(g.py - ob.y) < hh) {
              g.lives--;
              g.inv = 90;
              g.obs = g.obs.filter(o => o.id !== ob.id);
              spawnPopup(PX, g.py - 30, "CRASH!", "#FF5252", nidRef.current);
              break;
            }
          }
        }

        // Check game over
        if (g.lives <= 0) {
          g.best = Math.max(g.best, g.score);
          phaseRef.current = "over";
        }
      }

      // ── DRAW ──────────────────────────────────────────────────────
      const scroll = scrollRef.current;
      const frame  = frameRef.current;

      drawBg(ctx, scroll);

      if (phase === "play" && g) {
        // Aim guide
        drawAimGuide(ctx, g.py);

        // Houses
        for (const h of g.houses) drawHouse(ctx, h);

        // Flash bursts
        for (const h of g.houses) drawFlash(ctx, h, frame);

        // Obstacles
        for (const ob of g.obs) drawObs(ctx, ob);

        // Newspapers
        for (const p of g.papers) drawPaper(ctx, p);

        // Player
        drawPlayer(ctx, g.py, g.throwA, g.inv);

        // Popups
        updateDrawPopups(ctx);

        // HUD
        drawHUD(ctx, g.score, g.lives, g.best, g.speed);

      } else if (phase === "over" && g) {
        drawHUD(ctx, g.score, 0, g.best, g.speed);
        drawGameOver(ctx, g.score, g.best, frame);
      } else {
        // Start screen — draw animated player
        const demoY = 250 + Math.sin(frame * 0.04) * 60;
        drawPlayer(ctx, demoY, 0, 0);
        drawStartScreen(ctx, frame);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); popups.length = 0; };
  }, []);

  // Mobile touch handlers
  const touchUp   = useCallback((hold: boolean) => {
    if (hold) keysRef.current.add("ArrowUp");
    else      keysRef.current.delete("ArrowUp");
  }, []);
  const touchDown = useCallback((hold: boolean) => {
    if (hold) keysRef.current.add("ArrowDown");
    else      keysRef.current.delete("ArrowDown");
  }, []);
  const touchThrow = useCallback(() => {
    if (phaseRef.current === "start") { startGame(); return; }
    if (phaseRef.current === "over")  { startGame(); return; }
    keysRef.current.add(" ");
    setTimeout(() => keysRef.current.delete(" "), 80);
  }, [startGame]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-6 w-full max-w-[800px]">
        <Link
          to="/"
          className="text-sm text-gray-400 hover:text-white transition-colors font-mono"
        >
          ← Portfolio
        </Link>
        <h1 className="text-white font-mono text-lg font-bold tracking-widest">
          📰 PAPERBOY
        </h1>
        <span className="text-gray-500 font-mono text-xs ml-auto">
          Commodore-style classic
        </span>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="border-2 border-yellow-600 rounded"
        style={{ maxWidth: "100%", height: "auto", imageRendering: "pixelated" }}
        tabIndex={0}
      />

      {/* Mobile controls */}
      <div className="flex gap-4 md:hidden">
        <button
          className="select-none touch-none px-6 py-4 bg-blue-700 text-white font-bold rounded-lg active:bg-blue-900"
          onPointerDown={() => touchUp(true)}
          onPointerUp={() => touchUp(false)}
          onPointerLeave={() => touchUp(false)}
        >▲ UP</button>
        <button
          className="select-none touch-none px-6 py-4 bg-orange-600 text-white font-bold rounded-lg active:bg-orange-800"
          onPointerDown={touchThrow}
        >📰 THROW</button>
        <button
          className="select-none touch-none px-6 py-4 bg-blue-700 text-white font-bold rounded-lg active:bg-blue-900"
          onPointerDown={() => touchDown(true)}
          onPointerUp={() => touchDown(false)}
          onPointerLeave={() => touchDown(false)}
        >▼ DOWN</button>
      </div>

      {/* Instructions (desktop) */}
      <p className="hidden md:block text-xs text-gray-500 font-mono text-center max-w-[800px]">
        <span className="text-green-400">↑ ↓</span> move &nbsp;·&nbsp;
        <span className="text-yellow-400">SPACE</span> throw newspaper &nbsp;·&nbsp;
        <span className="text-green-400">Green glow</span> = subscriber (+100) &nbsp;·&nbsp;
        <span className="text-red-400">Dark roof</span> = non-subscriber (−life) &nbsp;·&nbsp;
        dodge cars &amp; dogs!
      </p>
    </div>
  );
}
