import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ASSET_BASE = "/games/forest-runner/assets";

const ASSET_FILES = {
  background: "background.png",
  groundGrass: "ground-grass.png",
  groundDirtTL: "ground-dirt-tl.png",
  groundDirtTR: "ground-dirt-tr.png",
  groundDirtMid: "ground-dirt-mid.png",
  bush1: "bush-1.png",
  bush2: "bush-2.png",
  bush3: "bush-3.png",
  bush4: "bush-4.png",
  mushroom1: "mushroom-1.png",
  mushroom2: "mushroom-2.png",
  crate: "crate.png",
  stone: "stone.png",
  sign1: "sign-1.png",
  sign2: "sign-2.png",
  tree2: "tree-2.png",
  tree3: "tree-3.png",
  treeStump: "tree-stump.png",
} as const;

type AssetKey = keyof typeof ASSET_FILES;

interface Obstacle {
  x: number;
  y: number; // top surface (world y)
  w: number;
  h: number;
  sprite: AssetKey;
}

interface Decoration {
  x: number;
  y: number; // world y where the sprite's bottom sits
  w: number;
  h: number;
  sprite: AssetKey;
  layer: "back" | "front";
}

interface Pickup {
  x: number;
  y: number;
  sprite: AssetKey;
  collected: boolean;
}

interface Pit {
  x1: number;
  x2: number;
}

interface LevelData {
  name: string;
  worldWidth: number;
  pits: Pit[];
  obstacles: Obstacle[];
  decorations: Decoration[];
  pickups: Pickup[];
  start: { x: number; y: number };
  goal: { x: number; y: number };
}

const GROUND_Y = 440;
const CANVAS_W = 960;
const CANVAS_H = 540;

function buildLevel(def: Omit<LevelData, "pickups"> & { pickups?: Omit<Pickup, "collected">[] }): LevelData {
  return {
    ...def,
    pickups: (def.pickups || []).map((p) => ({ ...p, collected: false })),
  };
}

const LEVELS: LevelData[] = [
  buildLevel({
    name: "Baby Steps",
    worldWidth: 2400,
    pits: [
      { x1: 700, x2: 820 },
      { x1: 1420, x2: 1540 },
    ],
    obstacles: [
      { x: 1050, y: GROUND_Y - 46, w: 46, h: 46, sprite: "crate" },
      { x: 1900, y: GROUND_Y - 40, w: 66, h: 40, sprite: "stone" },
    ],
    decorations: [
      { x: 200, y: GROUND_Y + 6, w: 200, h: 214, sprite: "tree2", layer: "back" },
      { x: 950, y: GROUND_Y + 4, w: 190, h: 190, sprite: "tree3", layer: "back" },
      { x: 2050, y: GROUND_Y + 6, w: 200, h: 214, sprite: "tree2", layer: "back" },
      { x: 60, y: GROUND_Y + 6, w: 95, h: 46, sprite: "bush1", layer: "front" },
      { x: 420, y: GROUND_Y + 4, w: 90, h: 60, sprite: "bush4", layer: "front" },
      { x: 900, y: GROUND_Y + 6, w: 95, h: 46, sprite: "bush2", layer: "front" },
      { x: 1650, y: GROUND_Y + 4, w: 90, h: 60, sprite: "bush3", layer: "front" },
      { x: 2150, y: GROUND_Y + 6, w: 95, h: 46, sprite: "bush1", layer: "front" },
      { x: 550, y: GROUND_Y - 8, w: 82, h: 33, sprite: "treeStump", layer: "front" },
    ],
    pickups: [
      { x: 500, y: GROUND_Y - 40, sprite: "mushroom1" },
      { x: 1000, y: GROUND_Y - 80, sprite: "mushroom2" },
      { x: 1750, y: GROUND_Y - 40, sprite: "mushroom1" },
    ],
    start: { x: 60, y: GROUND_Y },
    goal: { x: 2300, y: GROUND_Y },
  }),
  buildLevel({
    name: "Rocky Path",
    worldWidth: 3000,
    pits: [
      { x1: 520, x2: 650 },
      { x1: 1060, x2: 1170 },
      { x1: 1780, x2: 1930 },
      { x1: 2400, x2: 2500 },
    ],
    obstacles: [
      { x: 850, y: GROUND_Y - 40, w: 66, h: 40, sprite: "stone" },
      { x: 1350, y: GROUND_Y - 46, w: 46, h: 46, sprite: "crate" },
      { x: 1420, y: GROUND_Y - 92, w: 46, h: 46, sprite: "crate" },
      { x: 2100, y: GROUND_Y - 40, w: 66, h: 40, sprite: "stone" },
      { x: 2650, y: GROUND_Y - 46, w: 46, h: 46, sprite: "crate" },
    ],
    decorations: [
      { x: 150, y: GROUND_Y + 6, w: 190, h: 190, sprite: "tree3", layer: "back" },
      { x: 780, y: GROUND_Y + 4, w: 200, h: 214, sprite: "tree2", layer: "back" },
      { x: 1550, y: GROUND_Y + 6, w: 190, h: 190, sprite: "tree3", layer: "back" },
      { x: 2250, y: GROUND_Y + 4, w: 200, h: 214, sprite: "tree2", layer: "back" },
      { x: 2820, y: GROUND_Y + 6, w: 190, h: 190, sprite: "tree3", layer: "back" },
      { x: 30, y: GROUND_Y + 6, w: 95, h: 46, sprite: "bush2", layer: "front" },
      { x: 950, y: GROUND_Y + 4, w: 90, h: 60, sprite: "bush3", layer: "front" },
      { x: 1250, y: GROUND_Y - 6, w: 82, h: 33, sprite: "treeStump", layer: "front" },
      { x: 2000, y: GROUND_Y + 6, w: 95, h: 46, sprite: "bush4", layer: "front" },
      { x: 2550, y: GROUND_Y + 4, w: 90, h: 60, sprite: "bush1", layer: "front" },
    ],
    pickups: [
      { x: 400, y: GROUND_Y - 40, sprite: "mushroom2" },
      { x: 1390, y: GROUND_Y - 130, sprite: "mushroom1" },
      { x: 2000, y: GROUND_Y - 40, sprite: "mushroom2" },
      { x: 2700, y: GROUND_Y - 80, sprite: "mushroom1" },
    ],
    start: { x: 60, y: GROUND_Y },
    goal: { x: 2900, y: GROUND_Y },
  }),
  buildLevel({
    name: "Boulder Run",
    worldWidth: 3700,
    pits: [
      { x1: 450, x2: 610 },
      { x1: 1000, x2: 1150 },
      { x1: 1650, x2: 1810 },
      { x1: 2350, x2: 2500 },
      { x1: 2950, x2: 3100 },
    ],
    obstacles: [
      { x: 780, y: GROUND_Y - 40, w: 66, h: 40, sprite: "stone" },
      { x: 1250, y: GROUND_Y - 46, w: 46, h: 46, sprite: "crate" },
      { x: 1320, y: GROUND_Y - 92, w: 46, h: 46, sprite: "crate" },
      { x: 1390, y: GROUND_Y - 138, w: 46, h: 46, sprite: "crate" },
      { x: 1950, y: GROUND_Y - 40, w: 66, h: 40, sprite: "stone" },
      { x: 2080, y: GROUND_Y - 40, w: 66, h: 40, sprite: "stone" },
      { x: 2650, y: GROUND_Y - 46, w: 46, h: 46, sprite: "crate" },
      { x: 3250, y: GROUND_Y - 40, w: 66, h: 40, sprite: "stone" },
      { x: 3330, y: GROUND_Y - 86, w: 46, h: 46, sprite: "crate" },
    ],
    decorations: [
      { x: 100, y: GROUND_Y + 6, w: 200, h: 214, sprite: "tree2", layer: "back" },
      { x: 700, y: GROUND_Y + 4, w: 190, h: 190, sprite: "tree3", layer: "back" },
      { x: 1450, y: GROUND_Y + 6, w: 200, h: 214, sprite: "tree2", layer: "back" },
      { x: 2200, y: GROUND_Y + 4, w: 190, h: 190, sprite: "tree3", layer: "back" },
      { x: 2850, y: GROUND_Y + 6, w: 200, h: 214, sprite: "tree2", layer: "back" },
      { x: 3450, y: GROUND_Y + 4, w: 190, h: 190, sprite: "tree3", layer: "back" },
      { x: 40, y: GROUND_Y + 6, w: 95, h: 46, sprite: "bush3", layer: "front" },
      { x: 900, y: GROUND_Y - 6, w: 82, h: 33, sprite: "treeStump", layer: "front" },
      { x: 1600, y: GROUND_Y + 4, w: 90, h: 60, sprite: "bush4", layer: "front" },
      { x: 2320, y: GROUND_Y + 6, w: 95, h: 46, sprite: "bush2", layer: "front" },
      { x: 2900, y: GROUND_Y + 4, w: 90, h: 60, sprite: "bush1", layer: "front" },
      { x: 3550, y: GROUND_Y + 6, w: 95, h: 46, sprite: "bush3", layer: "front" },
    ],
    pickups: [
      { x: 350, y: GROUND_Y - 40, sprite: "mushroom1" },
      { x: 1300, y: GROUND_Y - 180, sprite: "mushroom2" },
      { x: 2000, y: GROUND_Y - 80, sprite: "mushroom1" },
      { x: 2750, y: GROUND_Y - 40, sprite: "mushroom2" },
      { x: 3300, y: GROUND_Y - 130, sprite: "mushroom1" },
    ],
    start: { x: 60, y: GROUND_Y },
    goal: { x: 3600, y: GROUND_Y },
  }),
];

const GRAVITY = 1900;
const JUMP_VELOCITY = -680;
const MOVE_SPEED = 260;
const MAX_FALL = 1000;
const PLAYER_W = 34;
const PLAYER_H = 46;
const COYOTE_TIME = 0.1;
const JUMP_BUFFER = 0.12;
const TILE = 50;

type GameStatus = "ready" | "playing" | "dead" | "levelComplete" | "finished";

interface PlayerState {
  x: number;
  y: number; // feet position (bottom)
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  coyote: number;
  jumpBuffer: number;
  walkCycle: number;
  squash: number;
}

function overlapRect(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

const ForestRunner = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<Partial<Record<AssetKey, HTMLImageElement>>>({});
  const [imagesReady, setImagesReady] = useState(false);

  const [levelIndex, setLevelIndex] = useState(0);
  const [status, setStatus] = useState<GameStatus>("ready");
  const statusRef = useRef<GameStatus>("ready");
  const levelIndexRef = useRef(0);

  const hudTimeRef = useRef<HTMLSpanElement | null>(null);
  const hudMushroomsRef = useRef<HTMLSpanElement | null>(null);

  const keysRef = useRef<Record<string, boolean>>({});
  const touchRef = useRef({ left: false, right: false, jump: false });

  const playerRef = useRef<PlayerState>({
    x: 60,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1,
    coyote: 0,
    jumpBuffer: 0,
    walkCycle: 0,
    squash: 1,
  });

  const runTimeRef = useRef(0);
  const mushroomCountRef = useRef(0);
  const cameraXRef = useRef(0);
  const deathShakeRef = useRef(0);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  useEffect(() => {
    levelIndexRef.current = levelIndex;
  }, [levelIndex]);

  // Preload images
  useEffect(() => {
    let cancelled = false;
    const entries = Object.entries(ASSET_FILES) as [AssetKey, string][];
    let loaded = 0;
    entries.forEach(([key, file]) => {
      const img = new Image();
      img.src = `${ASSET_BASE}/${file}`;
      img.onload = () => {
        loaded += 1;
        if (!cancelled) imagesRef.current[key] = img;
        if (loaded === entries.length && !cancelled) setImagesReady(true);
      };
      img.onerror = () => {
        loaded += 1;
        if (loaded === entries.length && !cancelled) setImagesReady(true);
      };
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const resetPlayerToStart = useCallback(() => {
    const level = LEVELS[levelIndexRef.current];
    const p = playerRef.current;
    p.x = level.start.x;
    p.y = level.start.y;
    p.vx = 0;
    p.vy = 0;
    p.onGround = false;
    p.facing = 1;
    p.coyote = 0;
    p.jumpBuffer = 0;
    p.walkCycle = 0;
    p.squash = 1;
  }, []);

  const startLevel = useCallback(
    (idx: number) => {
      levelIndexRef.current = idx;
      setLevelIndex(idx);
      LEVELS[idx].pickups.forEach((pk) => (pk.collected = false));
      mushroomCountRef.current = 0;
      runTimeRef.current = 0;
      resetPlayerToStart();
      setStatus("playing");
    },
    [resetPlayerToStart]
  );

  const handleDeath = useCallback(() => {
    setStatus("dead");
    deathShakeRef.current = 0.4;
    window.setTimeout(() => {
      resetPlayerToStart();
      runTimeRef.current = 0;
      mushroomCountRef.current = 0;
      LEVELS[levelIndexRef.current].pickups.forEach((pk) => (pk.collected = false));
      setStatus("playing");
    }, 900);
  }, [resetPlayerToStart]);

  const handleGoalReached = useCallback(() => {
    if (statusRef.current !== "playing") return;
    const isLast = levelIndexRef.current === LEVELS.length - 1;
    setStatus(isLast ? "finished" : "levelComplete");
  }, []);

  // Keyboard input
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (["ArrowUp", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Main game loop
  useEffect(() => {
    if (!imagesReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();

    const getImg = (key: AssetKey) => imagesRef.current[key];

    const drawTiledGround = (level: LevelData, camX: number) => {
      const startTileX = Math.floor(camX / TILE) * TILE;
      for (let x = startTileX; x < camX + CANVAS_W + TILE; x += TILE) {
        const inPit = level.pits.some((p) => x + TILE > p.x1 && x < p.x2);
        if (inPit) continue;
        const sx = x - camX;
        const grass = getImg("groundGrass");
        if (grass) ctx.drawImage(grass, sx, GROUND_Y, TILE, TILE);
        for (let y = GROUND_Y + TILE; y < CANVAS_H + TILE; y += TILE) {
          const dirt = getImg("groundDirtMid");
          if (dirt) ctx.drawImage(dirt, sx, y, TILE, TILE);
        }
      }
    };

    const drawDecorations = (level: LevelData, camX: number, layer: "back" | "front") => {
      level.decorations
        .filter((d) => d.layer === layer)
        .forEach((d) => {
          const img = getImg(d.sprite);
          if (!img) return;
          const sx = d.x - camX;
          if (sx + d.w < -50 || sx > CANVAS_W + 50) return;
          ctx.drawImage(img, sx, d.y - d.h, d.w, d.h);
        });
    };

    const drawObstacles = (level: LevelData, camX: number) => {
      level.obstacles.forEach((o) => {
        const img = getImg(o.sprite);
        const sx = o.x - camX;
        if (sx + o.w < -50 || sx > CANVAS_W + 50) return;
        if (img) ctx.drawImage(img, sx, o.y, o.w, o.h);
      });
    };

    const drawPickups = (level: LevelData, camX: number, t: number) => {
      level.pickups.forEach((pk) => {
        if (pk.collected) return;
        const img = getImg(pk.sprite);
        if (!img) return;
        const sx = pk.x - camX;
        if (sx < -50 || sx > CANVAS_W + 50) return;
        const bob = Math.sin(t * 3 + pk.x) * 5;
        const w = 40;
        const h = (img.naturalHeight / img.naturalWidth) * w;
        ctx.drawImage(img, sx - w / 2, pk.y - h + bob, w, h);
      });
    };

    const drawGoal = (level: LevelData, camX: number) => {
      const img = getImg("sign2");
      if (!img) return;
      const w = 70;
      const h = (img.naturalHeight / img.naturalWidth) * w;
      const sx = level.goal.x - camX;
      ctx.drawImage(img, sx - w / 2, level.goal.y - h, w, h);
    };

    const drawPlayer = (camX: number) => {
      const p = playerRef.current;
      const sx = p.x - camX;
      const sy = p.y;
      const bodyW = PLAYER_W * p.squash;
      const bodyH = PLAYER_H / p.squash;
      const legPhase = p.onGround ? Math.sin(p.walkCycle * 12) : 0;

      ctx.save();
      ctx.translate(sx, sy);

      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.beginPath();
      ctx.ellipse(0, 4, bodyW * 0.55, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // legs
      ctx.fillStyle = "#7a3d1c";
      const legOffset = p.onGround ? legPhase * 6 : 0;
      ctx.beginPath();
      ctx.ellipse(-8, -6 + Math.max(0, legOffset), 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(8, -6 + Math.max(0, -legOffset), 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // body
      const bodyGrad = ctx.createLinearGradient(0, -bodyH, 0, 0);
      bodyGrad.addColorStop(0, "#ffb15c");
      bodyGrad.addColorStop(1, "#ff7a3d");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, -bodyH / 2, bodyW / 2, bodyH / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#c4501c";
      ctx.lineWidth = 2;
      ctx.stroke();

      // eyes
      const eyeDir = p.facing;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(eyeDir * 6, -bodyH / 2 - 4, 7, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(eyeDir * -6, -bodyH / 2 - 6, 6, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#231407";
      ctx.beginPath();
      ctx.arc(eyeDir * 6 + eyeDir * 2, -bodyH / 2 - 4, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeDir * -6 + eyeDir * 1.5, -bodyH / 2 - 6, 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const groundHeightAt = (level: LevelData, x: number): number | null => {
      const inPit = level.pits.some((p) => x > p.x1 && x < p.x2);
      if (inPit) return null;
      if (x < 0 || x > level.worldWidth) return null;
      return GROUND_Y;
    };

    const update = (dt: number) => {
      const level = LEVELS[levelIndexRef.current];
      const p = playerRef.current;

      if (statusRef.current !== "playing") return;

      runTimeRef.current += dt;

      const left = keysRef.current["ArrowLeft"] || keysRef.current["KeyA"] || touchRef.current.left;
      const right = keysRef.current["ArrowRight"] || keysRef.current["KeyD"] || touchRef.current.right;
      const jumpPressed =
        keysRef.current["ArrowUp"] || keysRef.current["KeyW"] || keysRef.current["Space"] || touchRef.current.jump;

      if (jumpPressed) p.jumpBuffer = JUMP_BUFFER;
      else p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);

      let moveDir = 0;
      if (left && !right) moveDir = -1;
      else if (right && !left) moveDir = 1;

      p.vx = moveDir * MOVE_SPEED;
      if (moveDir !== 0) p.facing = moveDir > 0 ? 1 : -1;

      p.coyote = p.onGround ? COYOTE_TIME : Math.max(0, p.coyote - dt);

      if (p.jumpBuffer > 0 && p.coyote > 0) {
        p.vy = JUMP_VELOCITY;
        p.onGround = false;
        p.coyote = 0;
        p.jumpBuffer = 0;
        p.squash = 0.78;
      }

      p.vy = Math.min(MAX_FALL, p.vy + GRAVITY * dt);

      // Horizontal movement + obstacle collision
      p.x += p.vx * dt;
      p.x = Math.max(PLAYER_W / 2, Math.min(level.worldWidth - PLAYER_W / 2, p.x));

      const playerLeft = () => p.x - PLAYER_W / 2;
      const playerTop = () => p.y - PLAYER_H;

      level.obstacles.forEach((o) => {
        if (overlapRect(playerLeft(), playerTop(), PLAYER_W, PLAYER_H, o.x, o.y, o.w, o.h)) {
          const fromLeft = p.vx > 0 || (p.vx === 0 && p.x < o.x + o.w / 2);
          if (playerTop() < o.y + o.h - 4) {
            if (fromLeft) p.x = o.x - PLAYER_W / 2;
            else p.x = o.x + o.w + PLAYER_W / 2;
            p.vx = 0;
          }
        }
      });

      // Vertical movement + obstacle collision
      p.y += p.vy * dt;
      p.onGround = false;

      level.obstacles.forEach((o) => {
        if (overlapRect(playerLeft(), p.y - PLAYER_H, PLAYER_W, PLAYER_H, o.x, o.y, o.w, o.h)) {
          if (p.vy >= 0 && p.y - PLAYER_H < o.y) {
            p.y = o.y;
            p.vy = 0;
            p.onGround = true;
          } else if (p.vy < 0 && p.y - PLAYER_H >= o.y) {
            p.y = o.y + o.h + PLAYER_H;
            p.vy = 0;
          }
        }
      });

      // Ground collision
      const gY = groundHeightAt(level, p.x);
      if (gY !== null && p.vy >= 0 && p.y >= gY) {
        p.y = gY;
        p.vy = 0;
        p.onGround = true;
      }

      // Fell into a pit / off the world
      if (p.y > CANVAS_H + 150) {
        handleDeath();
        return;
      }

      // Squash/stretch recovery
      p.squash += (1 - p.squash) * Math.min(1, dt * 10);
      if (moveDir !== 0 && p.onGround) p.walkCycle += dt * 4;

      // Pickups
      level.pickups.forEach((pk) => {
        if (pk.collected) return;
        const dx = p.x - pk.x;
        const dy = p.y - PLAYER_H / 2 - pk.y;
        if (Math.hypot(dx, dy) < 34) {
          pk.collected = true;
          mushroomCountRef.current += 1;
        }
      });

      // Goal
      const dxGoal = p.x - level.goal.x;
      if (Math.abs(dxGoal) < 36 && p.y > level.goal.y - 90) {
        handleGoalReached();
      }

      // Camera
      const targetCam = Math.max(0, Math.min(level.worldWidth - CANVAS_W, p.x - CANVAS_W / 2));
      cameraXRef.current += (targetCam - cameraXRef.current) * Math.min(1, dt * 6);

      if (hudTimeRef.current) hudTimeRef.current.textContent = runTimeRef.current.toFixed(1);
      if (hudMushroomsRef.current)
        hudMushroomsRef.current.textContent = `${mushroomCountRef.current}/${level.pickups.length}`;
    };

    const render = (t: number) => {
      const level = LEVELS[levelIndexRef.current];
      const camX = cameraXRef.current;
      const shake =
        deathShakeRef.current > 0 ? (Math.random() - 0.5) * 10 * deathShakeRef.current : 0;
      deathShakeRef.current = Math.max(0, deathShakeRef.current - 0.03);

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.save();
      ctx.translate(shake, 0);

      // Background (parallax)
      const bg = getImg("background");
      if (bg) {
        const bgW = CANVAS_H * (bg.naturalWidth / bg.naturalHeight);
        const parallaxX = -((camX * 0.25) % bgW);
        for (let x = parallaxX - bgW; x < CANVAS_W + bgW; x += bgW) {
          ctx.drawImage(bg, x, 0, bgW, CANVAS_H);
        }
      } else {
        ctx.fillStyle = "#bdeaff";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      }

      drawDecorations(level, camX, "back");
      drawTiledGround(level, camX);
      drawObstacles(level, camX);
      drawGoal(level, camX);
      drawPickups(level, camX, t / 1000);
      drawDecorations(level, camX, "front");
      drawPlayer(camX);

      ctx.restore();
    };

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      update(dt);
      render(now);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame((now) => {
      last = now;
      raf = requestAnimationFrame(loop);
    });

    return () => cancelAnimationFrame(raf);
  }, [imagesReady, handleDeath, handleGoalReached]);

  const currentLevel = LEVELS[levelIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-5xl px-4 pt-6 pb-3 flex items-center justify-between">
        <Button asChild variant="outline" size="sm" className="border-border">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Work
          </Link>
        </Button>
        <div className="text-right">
          <h1 className="text-lg md:text-xl font-semibold text-foreground">Forest Runner</h1>
          <p className="text-xs text-muted-foreground">
            Level {levelIndex + 1} / {LEVELS.length} — {currentLevel.name}
          </p>
        </div>
      </div>

      <div className="w-full max-w-5xl px-4 flex items-center justify-between mb-3 text-sm">
        <div className="flex gap-4">
          <span className="text-muted-foreground">
            ⏱ <span ref={hudTimeRef} className="text-foreground font-medium">0.0</span>s
          </span>
          <span className="text-muted-foreground">
            🍄 <span ref={hudMushroomsRef} className="text-foreground font-medium">0/0</span>
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => startLevel(levelIndex)}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Restart
        </Button>
      </div>

      <div className="relative w-full max-w-5xl px-4">
        <div
          className="relative w-full rounded-xl overflow-hidden border-2 border-[hsl(var(--gold-dim))] shadow-2xl bg-[#bdeaff]"
          style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full h-full block select-none"
          />

          {status === "ready" && (
            <Overlay>
              <h2 className="text-2xl font-bold text-foreground mb-2">Forest Runner</h2>
              <p className="text-sm text-muted-foreground mb-5 max-w-xs">
                Guide the little forest sprite from the left edge of the screen all the way to the
                signpost on the right. Jump over crates, stones and pits to reach the goal.
              </p>
              <Button onClick={() => startLevel(0)} className="bg-primary text-primary-foreground font-medium">
                Start Game
              </Button>
              <p className="text-[11px] text-muted-foreground mt-4">
                ← → / A D to move · Space / ↑ / W to jump
              </p>
            </Overlay>
          )}

          {status === "dead" && (
            <Overlay>
              <h2 className="text-2xl font-bold text-foreground mb-1">Oops! 💀</h2>
              <p className="text-sm text-muted-foreground">Watch out for the gaps...</p>
            </Overlay>
          )}

          {status === "levelComplete" && (
            <Overlay>
              <h2 className="text-2xl font-bold text-foreground mb-1">Level Clear! 🎉</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Time: {runTimeRef.current.toFixed(1)}s · Mushrooms: {mushroomCountRef.current}/
                {currentLevel.pickups.length}
              </p>
              <Button
                onClick={() => startLevel(levelIndex + 1)}
                className="bg-primary text-primary-foreground font-medium"
              >
                Next Level
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Overlay>
          )}

          {status === "finished" && (
            <Overlay>
              <h2 className="text-2xl font-bold text-foreground mb-1">All Levels Cleared! 🏆</h2>
              <p className="text-sm text-muted-foreground mb-5">
                You made it across every screen. Nicely done.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => startLevel(0)} variant="outline" className="border-border">
                  Play Again
                </Button>
                <Button asChild className="bg-primary text-primary-foreground font-medium">
                  <Link to="/">Back to Work</Link>
                </Button>
              </div>
            </Overlay>
          )}
        </div>
      </div>

      {/* Touch controls */}
      <div className="w-full max-w-5xl px-4 mt-4 flex items-center justify-between select-none md:hidden">
        <div className="flex gap-3">
          <TouchButton
            label="◀"
            onDown={() => (touchRef.current.left = true)}
            onUp={() => (touchRef.current.left = false)}
          />
          <TouchButton
            label="▶"
            onDown={() => (touchRef.current.right = true)}
            onUp={() => (touchRef.current.right = false)}
          />
        </div>
        <TouchButton
          label="⤒ JUMP"
          wide
          onDown={() => (touchRef.current.jump = true)}
          onUp={() => (touchRef.current.jump = false)}
        />
      </div>

      <p className="hidden md:block text-xs text-muted-foreground mt-4">
        ← → / A D to move · Space / ↑ / W to jump
      </p>
    </div>
  );
};

const Overlay = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-background/70 backdrop-blur-sm">
    {children}
  </div>
);

const TouchButton = ({
  label,
  wide,
  onDown,
  onUp,
}: {
  label: string;
  wide?: boolean;
  onDown: () => void;
  onUp: () => void;
}) => (
  <button
    className={`${wide ? "px-8" : "px-6"} py-4 rounded-xl bg-secondary text-foreground font-semibold text-lg border border-border active:bg-accent touch-none`}
    onPointerDown={(e) => {
      e.preventDefault();
      onDown();
    }}
    onPointerUp={(e) => {
      e.preventDefault();
      onUp();
    }}
    onPointerLeave={() => onUp()}
    onContextMenu={(e) => e.preventDefault()}
  >
    {label}
  </button>
);

export default ForestRunner;
