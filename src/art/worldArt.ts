import { BIOMES } from "../content/world";
import type { BiomeId } from "../core/types";
import { CHUNK, TILE } from "../core/coords";
import { STREAM_SALT } from "../core/rng";
import { distToRoad, groundTint, type ChunkData, type PropInst } from "../world/map";
import { fbm, randAt } from "../world/noise";
import { clamp } from "../core/math";
import { cachedStatic } from "./cache";
import { ellipse, matEnv, poly, roundRect } from "./materials";
import { PAL, rgba, snapEnv } from "./palette";

export const GROUND_PAD = 4;
export const GROUND_CELL = 12;

export type PropLayer = "trunk" | "canopy" | "body" | "roof";

export function isHanokArt(art: string): boolean {
  return art === "house" || art === "shop" || art === "shrine" || art === "gate";
}

function artT(x: number, y: number, seed: number, salt: number): number {
  return randAt(Math.floor(x), Math.floor(y), seed ^ STREAM_SALT.art, salt);
}

function tuft(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, color: string): void {
  ctx.strokeStyle = snapEnv(color);
  ctx.lineWidth = 1.3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 1.4, y - h);
  ctx.moveTo(x + 1.6, y);
  ctx.lineTo(x + 2.2, y - h * 0.75);
  ctx.moveTo(x - 2.2, y);
  ctx.lineTo(x - 3, y - h * 0.6);
  ctx.stroke();
}

/** QA / fallback tile. Play path uses stitched world-space groundTint. */
export function drawTile(ctx: CanvasRenderingContext2D, biome: BiomeId, x: number, y: number, seed: number): void {
  const b = BIOMES[biome];
  const t = artT(x / TILE, y / TILE, seed, 3);
  const t2 = artT(x / TILE, y / TILE, seed, 7);
  const t3 = artT(x / TILE, y / TILE, seed, 13);

  ctx.fillStyle = groundTint(seed, x + TILE * 0.5, y + TILE * 0.5);
  ctx.fillRect(x - 1, y - 1, TILE + 2, TILE + 2);

  if (biome === "road") {
    ctx.fillStyle = snapEnv(BIOMES.hanyang.grass);
    ctx.fillRect(x, y, TILE + 1, 9);
    ctx.fillRect(x, y + TILE - 9, TILE + 1, 10);
    ctx.fillStyle = snapEnv(b.dirt);
    const inset = 8 + (t * 3) | 0;
    ctx.fillRect(x - 1, y + inset, TILE + 3, TILE - inset * 2);
    ctx.fillStyle = snapEnv(PAL.earth_mid);
    ctx.globalAlpha = 0.4;
    ctx.fillRect(x + t * 10, y + inset + 4, 11, 4);
    ctx.fillRect(x + 18 + t2 * 16, y + 22, 9, 3);
    ctx.globalAlpha = 1;
    tuft(ctx, x + 6 + t * 8, y + 8, 5, BIOMES.hanyang.deco);
    tuft(ctx, x + 30 + t2 * 8, y + TILE - 6, 5, BIOMES.hanyang.deco);
    return;
  }

  ctx.fillStyle = snapEnv(b.grass2);
  for (let i = 0; i < 5; i++) {
    const px = x + 2 + artT(x / TILE, y / TILE, seed, 50 + i) * (TILE - 6);
    const py = y + 2 + artT(x / TILE, y / TILE, seed, 70 + i) * (TILE - 6);
    ctx.fillRect(px, py, 3 + (t * 3) | 0, 2);
  }
  if (t > 0.55) {
    ctx.fillStyle = snapEnv(b.dirt);
    ctx.fillRect(x + 8 + t2 * 24, y + 10 + t3 * 18, 4, 3);
    ctx.fillRect(x + 20 + t * 16, y + 26 + t2 * 10, 5, 2);
  }

  if (t3 > 0.55) tuft(ctx, x + 8 + t * 28, y + 14 + t2 * 22, 5, b.deco);
  if (t > 0.72) tuft(ctx, x + 26 + t2 * 12, y + 30 + t3 * 10, 4, b.deco);

  if (biome === "village" || biome === "hanyang") {
    if (t3 > 0.62) {
      ctx.fillStyle = snapEnv(PAL.earth_mid);
      ctx.globalAlpha = 0.45;
      ctx.fillRect(x + t * 20, y + TILE - 10, 14 + t2 * 10, 5);
      ctx.globalAlpha = 1;
    }
  }

  if (biome === "riverside" || biome === "swamp") {
    if (t2 > 0.6) {
      ctx.fillStyle = snapEnv(b.water ?? PAL.env_cool);
      ctx.globalAlpha = biome === "swamp" ? 0.46 : 0.38;
      ctx.fillRect(x, y + TILE * 0.4, TILE + 1, TILE * 0.6);
      ctx.globalAlpha = 1;
    }
  }

  if (biome === "snow") {
    ctx.fillStyle = rgba(PAL.bone_light, 0.2);
    ctx.fillRect(x + t * 8, y + t2 * 8, 16, 10);
  }
}

export function ensureChunkGround(chunk: ChunkData, seed: number): HTMLCanvasElement {
  if (chunk.ground) return chunk.ground;
  const pad = GROUND_PAD;
  const cell = GROUND_CELL;
  const c = document.createElement("canvas");
  c.width = CHUNK + pad * 2;
  c.height = CHUNK + pad * 2;
  const g = c.getContext("2d")!;
  const ox = chunk.cx * CHUNK;
  const oy = chunk.cy * CHUNK;
  for (let y = -pad; y < CHUNK + pad; y += cell) {
    for (let x = -pad; x < CHUNK + pad; x += cell) {
      const wx = ox + x + cell * 0.5;
      const wy = oy + y + cell * 0.5;
      g.fillStyle = groundTint(seed, wx, wy);
      g.fillRect(x + pad, y + pad, cell + 1, cell + 1);
    }
  }
  decorateWorldGround(g, seed, ox, oy, pad);
  chunk.ground = c;
  return c;
}

function decorateWorldGround(g: CanvasRenderingContext2D, seed: number, ox: number, oy: number, pad: number): void {
  const step = 20;
  for (let gy = oy - 10; gy < oy + CHUNK + 10; gy += step) {
    for (let gx = ox - 10; gx < ox + CHUNK + 10; gx += step) {
      const rx = Math.floor(gx / step);
      const ry = Math.floor(gy / step);
      const u = randAt(rx, ry, seed ^ STREAM_SALT.art, 41);
      if (u < 0.58) continue;
      const px = gx + randAt(rx, ry, seed, 42) * 17;
      const py = gy + randAt(rx, ry, seed, 43) * 17;
      const sx = px - ox + pad;
      const sy = py - oy + pad;
      const road = distToRoad(px, py);
      if (road < 18) {
        g.fillStyle = snapEnv(PAL.earth_mid);
        g.globalAlpha = 0.45;
        g.fillRect(sx, sy, 3 + (u * 3) | 0, 2);
        g.globalAlpha = 1;
        continue;
      }
      if (u > 0.82) {
        g.fillStyle = snapEnv(PAL.earth_dark);
        g.globalAlpha = 0.5;
        g.fillRect(sx, sy, 3, 2);
        g.globalAlpha = 1;
      } else {
        tuft(g, sx, sy, 4 + u * 3, PAL.moss_cool);
      }
    }
  }
  const n = fbm(ox / 400, oy / 400, seed + 9, 2);
  if (n > 0.12) {
    g.strokeStyle = snapEnv(PAL.env_mid);
    g.globalAlpha = 0.18;
    g.beginPath();
    g.moveTo(pad, pad + 40 + n * 20);
    g.quadraticCurveTo(CHUNK * 0.5, pad + 80, CHUNK + pad, pad + 30);
    g.stroke();
    g.globalAlpha = 1;
  }
}

export function drawChunkGround(ctx: CanvasRenderingContext2D, chunk: ChunkData, seed: number): void {
  const g = ensureChunkGround(chunk, seed);
  ctx.drawImage(g, chunk.cx * CHUNK - GROUND_PAD, chunk.cy * CHUNK - GROUND_PAD);
}

export function isTreeArt(art: string): boolean {
  return art === "pine" || art === "bamboo" || art === "deadtree";
}

export function canopyRadius(art: string): number {
  if (art === "bamboo") return 14;
  if (art === "deadtree") return 16;
  if (art === "pine") return 24;
  return 0;
}

/** Fade only the canopy when it would cover the player (§22). */
export function canopyFade(p: PropInst, px: number, py: number): number {
  const r = canopyRadius(p.def.art);
  if (r <= 0) return 1;
  const dx = px - p.x;
  const dy = py - p.y;
  if (dy > 8) return 1;
  if (Math.abs(dx) > r + 6) return 1;
  const back = Math.max(28, p.def.h * 0.9);
  if (dy < -back) return 1;
  const cx = 1 - Math.abs(dx) / (r + 6);
  const cy = clamp((-dy + 8) / 20, 0, 1);
  return 1 - cx * cy * 0.82;
}

/** Fade only the giwa when the player is under that hanok. Walls stay opaque. */
export function roofFade(p: PropInst, px: number, py: number): number {
  if (!p.def.roof && !isHanokArt(p.def.art)) return 1;
  const inside =
    Math.abs(px - p.x) < p.def.w * 0.32 &&
    py < p.y + 4 &&
    py > p.y - p.def.h * 0.42;
  return inside ? 0.22 : 1;
}

export function drawProp(ctx: CanvasRenderingContext2D, p: PropInst, layer: PropLayer = "body", canopyAlpha = 1): void {
  ctx.save();
  ctx.translate(p.x, p.y);
  const art = p.def.art;
  const sz = propSheetSize(art);
  const v = ((p.variant * 8) | 0);
  const sheet = cachedStatic(`prop:${art}:${v}:${sz}:${layer}`, sz, sz, (c) => drawPropArt(c, art, p.def.w, p.def.h, p.variant, layer));
  const foot = isTreeArt(art) || art === "tent" || isHanokArt(art);
  if (layer === "canopy" || layer === "roof") ctx.globalAlpha *= canopyAlpha;
  ctx.drawImage(sheet, -sz / 2, foot ? -sz * 0.72 : -sz * 0.55, sz, sz);
  ctx.restore();
}

function propSheetSize(art: string): number {
  if (art === "house" || art === "shop" || art === "shrine" || art === "gate") return 220;
  if (art === "pine" || art === "bamboo") return 200;
  if (art === "tent") return 168;
  return 112;
}

function drawPropArt(ctx: CanvasRenderingContext2D, art: string, w: number, h: number, variant = 0.5, layer: PropLayer = "body"): void {
  if (art === "pine") drawPine(ctx, variant, layer);
  else if (art === "bamboo") drawBamboo(ctx, variant, layer);
  else if (art === "deadtree") drawDeadTree(ctx, variant, layer);
  else if (layer === "canopy") return;
  else if (art === "rock") drawRock(ctx);
  else if (art === "reed") drawReed(ctx);
  else if (art === "bush") drawBush(ctx);
  else if (art === "lantern") drawStoneLantern(ctx);
  else if (art === "campfire") drawCampfire(ctx);
  else if (art === "grave") drawGrave(ctx);
  else if (isHanokArt(art)) {
    if (layer === "roof") {
      paintHanokGiwa(ctx, w, h);
      return;
    }
    if (layer === "trunk") {
      paintHanokWalls(ctx, art, w, h);
      return;
    }
    drawHanok(ctx, art, w, h);
  }
  else if (art === "tent") drawTent(ctx);
  else if (art === "wall") drawStoneWall(ctx);
}

function treeSeed(variant: number) {
  const v = Number.isFinite(variant) ? variant : 0.5;
  return {
    lean: (v - 0.5) * 12,
    h: 0.86 + v * 0.3,
    extra: 2 + ((v * 5) | 0),
    flip: v > 0.5 ? 1 : -1,
  };
}

/** Trunk + stacked canopy. Variant from world seed. */
export function drawPine(ctx: CanvasRenderingContext2D, variant = 0.5, layer: PropLayer = "body"): void {
  const s = treeSeed(variant);
  ctx.save();
  ctx.translate(s.lean * 0.15, 0);
  if (layer === "trunk" || layer === "body") {
    const wood = matEnv("wood", PAL.earth_mid);
    const bark = matEnv("wood", PAL.earth_dark);
    poly(ctx, [[-8, 32], [-5.5, -8], [6.2, -8], [9.5, 32]], wood, 1.5);
    poly(ctx, [[-3.2, 14], [-2, -6], [2.4, -6], [3, 16]], bark, 1);
    ctx.strokeStyle = snapEnv(PAL.earth_mid);
    ctx.lineWidth = 2.1;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-2, 6);
    ctx.lineTo(-18 * s.flip, -10);
    ctx.moveTo(3, 4);
    ctx.lineTo(19 * s.flip, -8);
    ctx.moveTo(0, -2);
    ctx.lineTo(-10 * s.flip, -22);
    ctx.stroke();
  }
  if (layer === "canopy" || layer === "body") {
    const needle = matEnv("jade", PAL.moss_cool);
    const deep = matEnv("jade", PAL.env_mid);
    const clumps: [number, number, number, number, boolean][] = [
      [-18, -20, 19, 12, true],
      [18, -17, 18, 11, false],
      [0, -16, 24, 14, false],
      [-14, -30, 17, 12, false],
      [15, -32, 17, 12, true],
      [1, -40, 20, 13, false],
      [-8, -54, 14, 10, true],
      [9, -56, 14, 10, false],
      [1, -66 * s.h, 11, 9, false],
    ];
    for (let i = 0; i < s.extra; i++) {
      clumps.push([(-16 + i * 7) * s.flip, -24 - i * 6, 10 + i, 7, i % 2 === 0]);
    }
    for (const [x, y, rx, ry, d] of clumps) {
      ellipse(ctx, x + s.lean * 0.08, y * s.h, rx, ry, d ? deep : needle);
    }
  }
  ctx.restore();
}

export function drawBamboo(ctx: CanvasRenderingContext2D, variant = 0.5, layer: PropLayer = "body"): void {
  const s = treeSeed(variant);
  const stalks: [number, number, number][] = [
    [-10 + s.lean * 0.2, -58 * s.h, 5.1],
    [2, -72 * s.h, 5.7],
    [14 - s.lean * 0.15, -52 * s.h, 4.3],
  ];
  if (s.extra > 3) stalks.push([s.flip * 7, -64 * s.h, 3.6]);
  if (layer === "trunk" || layer === "body") {
    for (const [x, top, w] of stalks) {
      ctx.strokeStyle = snapEnv(PAL.moss_cool);
      ctx.lineWidth = w;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, 24);
      ctx.lineTo(x + 1.2, top);
      ctx.stroke();
      ctx.strokeStyle = snapEnv(PAL.earth_dark);
      ctx.lineWidth = 1.2;
      for (let y = 18; y > top; y -= 9) {
        ctx.beginPath();
        ctx.moveTo(x - 4, y);
        ctx.lineTo(x + 5, y);
        ctx.stroke();
      }
    }
  }
  if (layer === "canopy" || layer === "body") {
    const leaf = matEnv("jade", PAL.moss_cool);
    const mid = matEnv("jade", PAL.env_mid);
    ellipse(ctx, -12, -52 * s.h, 13, 8, leaf);
    ellipse(ctx, 4, -62 * s.h, 14, 9, leaf);
    ellipse(ctx, 15, -46 * s.h, 12, 7, mid);
    ellipse(ctx, -3, -38 * s.h, 9, 6, leaf);
    ellipse(ctx, 8, -54 * s.h, 10, 6, mid);
    if (s.extra > 3) ellipse(ctx, s.flip * 6, -68 * s.h, 9, 5, leaf);
  }
}

export function drawDeadTree(ctx: CanvasRenderingContext2D, variant = 0.5, layer: PropLayer = "body"): void {
  const s = treeSeed(variant);
  if (layer === "trunk" || layer === "body") {
    ctx.strokeStyle = snapEnv(PAL.earth_dark);
    ctx.lineWidth = 4.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(s.lean * 0.1, 16);
    ctx.lineTo(s.lean * 0.2, -28);
    ctx.stroke();
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(s.lean * 0.15, -12);
    ctx.lineTo(-16 * s.flip, -36);
    ctx.moveTo(s.lean * 0.15, -20);
    ctx.lineTo(14 * s.flip, -40);
    ctx.moveTo(s.lean * 0.1, -6);
    ctx.lineTo(10 * s.flip, -8);
    ctx.stroke();
  }
  if (layer === "canopy" || layer === "body") {
    ctx.strokeStyle = snapEnv(PAL.earth_mid);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-8 * s.flip, -30);
    ctx.lineTo(-20 * s.flip, -44);
    ctx.moveTo(8 * s.flip, -34);
    ctx.lineTo(18 * s.flip, -48);
    ctx.moveTo(2, -26);
    ctx.lineTo(-6, -50);
    ctx.stroke();
    if (s.extra > 2) {
      ellipse(ctx, -12 * s.flip, -38, 5, 3, matEnv("jade", PAL.env_mid));
      ellipse(ctx, 8 * s.flip, -42, 4, 3, matEnv("jade", PAL.earth_dark));
    }
  }
}

function drawRock(ctx: CanvasRenderingContext2D): void {
  poly(ctx, [[-12, 6], [-8, -6], [4, -10], [14, -2], [10, 8], [-8, 9]], matEnv("stone", PAL.earth_dark), 1.3);
  poly(ctx, [[-4, 0], [2, -6], [8, 2]], matEnv("stone", PAL.env_mid), 1);
}

function drawReed(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = snapEnv(PAL.moss_cool);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(-3, -16);
  ctx.moveTo(5, 8);
  ctx.lineTo(7, -14);
  ctx.moveTo(-5, 8);
  ctx.lineTo(-8, -12);
  ctx.stroke();
  ellipse(ctx, -3, -16, 3, 2, matEnv("straw", PAL.earth_mid));
}

function drawBush(ctx: CanvasRenderingContext2D): void {
  ellipse(ctx, -4, 2, 10, 7, matEnv("jade", PAL.moss_cool));
  ellipse(ctx, 6, 1, 9, 6, matEnv("jade", PAL.moss_cool));
  ellipse(ctx, 0, -5, 8, 5, matEnv("jade", PAL.moss_cool));
}

function drawStoneLantern(ctx: CanvasRenderingContext2D): void {
  poly(ctx, [[-5, 10], [-4, 2], [4, 2], [5, 10]], matEnv("stone", PAL.earth_dark), 1.2);
  ctx.shadowColor = PAL.torch_hot;
  ctx.shadowBlur = 8;
  roundRect(ctx, -7, -12, 14, 14, 2);
  ctx.fillStyle = PAL.torch_warm;
  ctx.fill();
  ctx.shadowBlur = 0;
  poly(ctx, [[-8, -12], [0, -18], [8, -12]], matEnv("stone", PAL.earth_dark), 1.2);
}

function drawCampfire(ctx: CanvasRenderingContext2D): void {
  ellipse(ctx, 0, 6, 10, 4, matEnv("stone", PAL.earth_dark));
  ctx.beginPath();
  ctx.moveTo(-6, 4);
  ctx.lineTo(0, -12);
  ctx.lineTo(6, 4);
  ctx.closePath();
  ctx.fillStyle = PAL.torch_hot;
  ctx.fill();
  ctx.fillStyle = PAL.torch_warm;
  ctx.beginPath();
  ctx.moveTo(-3, 2);
  ctx.lineTo(0, -8);
  ctx.lineTo(3, 2);
  ctx.fill();
}

function drawGrave(ctx: CanvasRenderingContext2D): void {
  poly(ctx, [[-7, 8], [-6, -12], [6, -12], [7, 8]], matEnv("stone", PAL.earth_dark), 1.3);
  ctx.fillStyle = snapEnv(PAL.earth_mid);
  ctx.fillRect(-3, -6, 6, 2);
}

function hanokBody(w: number, h: number): { bw: number; bh: number } {
  return {
    bw: Math.max(44, Math.min(64, w * 0.52)),
    bh: Math.max(36, Math.min(50, h * 0.5)),
  };
}

/** Local giwa rect in the same space as the walls — overlaps the eave, no air gap. */
export function hanokRoofLocal(w: number, h: number): { x: number; y: number; w: number; h: number } {
  const { bw, bh } = hanokBody(w, h);
  const rw = bw * 2 + 22;
  const rh = Math.max(44, bh * 1.45);
  return { x: -rw * 0.5, y: -rh - 6, w: rw, h: rh };
}

function paintHanokGiwa(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const r = hanokRoofLocal(w, h);
  drawHanokRoof(ctx, r.x, r.y, r.w, r.h);
}

function paintHanokWalls(ctx: CanvasRenderingContext2D, art: string, w: number, h: number): void {
  const { bw, bh } = hanokBody(w, h);
  const wood = matEnv("wood", PAL.earth_mid);
  const post = matEnv("wood", PAL.earth_dark);
  const top = -18;

  ctx.fillStyle = snapEnv(PAL.earth_dark);
  ctx.fillRect(-bw - 4, bh - 4, bw * 2 + 8, 8);

  ctx.fillStyle = wood.fill;
  ctx.fillRect(-bw, top, bw * 2, bh - top);
  ctx.strokeStyle = post.stroke;
  ctx.lineWidth = 1.8;
  ctx.strokeRect(-bw, top, bw * 2, bh - top);

  ctx.fillStyle = snapEnv(PAL.earth_dark);
  ctx.fillRect(-bw, top, 6, bh - top);
  ctx.fillRect(bw - 6, top, 6, bh - top);
  ctx.fillRect(-6, top, 5, bh - top);
  for (let i = -bw + 12; i < bw - 8; i += 11) {
    ctx.fillStyle = snapEnv(PAL.earth_dark);
    ctx.globalAlpha = 0.35;
    ctx.fillRect(i, top + 2, 1.6, bh - top - 4);
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = snapEnv(PAL.bone_light);
  ctx.fillRect(-11, 6, 22, bh - 12);
  ctx.strokeStyle = snapEnv(PAL.earth_dark);
  ctx.strokeRect(-11, 6, 22, bh - 12);
  ctx.fillStyle = snapEnv(PAL.earth_dark);
  ctx.fillRect(-1, 10, 2, bh - 18);

  if (art === "shop") {
    ctx.fillStyle = snapEnv(PAL.earth_dark);
    ctx.fillRect(-bw + 8, 0, bw * 2 - 16, 5);
    ctx.fillStyle = snapEnv(PAL.bone_light);
    ctx.fillRect(-bw + 12, -2, 10, 6);
  }
  if (art === "shrine") {
    ctx.fillStyle = snapEnv(PAL.earth_dark);
    ctx.fillRect(-4, -10, 8, 12);
    ctx.fillStyle = snapEnv(PAL.bone_light);
    ctx.fillRect(-8, -2, 16, 3);
  }
  if (art === "gate") {
    ctx.fillStyle = snapEnv(PAL.earth_dark);
    ctx.fillRect(-bw, -8, 8, bh + 4);
    ctx.fillRect(bw - 8, -8, 8, bh + 4);
  }

  ctx.fillStyle = snapEnv(PAL.earth_dark);
  ctx.fillRect(-bw - 8, top - 6, bw * 2 + 16, 10);
}

/** Opaque walls + opaque giwa as one solid building. Indoor fade uses the roof layer only. */
export function drawHanok(ctx: CanvasRenderingContext2D, art: string, w: number, h: number): void {
  paintHanokWalls(ctx, art, w, h);
  paintHanokGiwa(ctx, w, h);
}

/** Solid dark-earth giwa. No stroked umbrella ribs, no ghost alpha stripes. */
export function drawHanokRoof(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = snapEnv(PAL.earth_dark);
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.62);
  ctx.lineTo(x + w * 0.12, y + h * 0.22);
  ctx.lineTo(x + w * 0.5, y + 4);
  ctx.lineTo(x + w * 0.88, y + h * 0.22);
  ctx.lineTo(x + w, y + h * 0.62);
  ctx.lineTo(x + w * 0.92, y + h * 0.88);
  ctx.lineTo(x + w * 0.08, y + h * 0.88);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = snapEnv(PAL.shadow_navy);
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.fillStyle = snapEnv(PAL.earth_dark);
  ctx.fillRect(x + w * 0.44, y + 2, w * 0.12, h * 0.38);
  ctx.fillStyle = snapEnv(PAL.shadow_navy);
  ctx.globalAlpha = 0.35;
  for (let i = 1; i <= 6; i++) {
    const yy = y + h * (0.22 + i * 0.1);
    ctx.fillRect(x + w * 0.08, yy, w * 0.84, 3);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = snapEnv(PAL.earth_mid);
  ctx.fillRect(x + 2, y + h * 0.82, w - 4, 8);
  ctx.fillStyle = snapEnv(PAL.earth_dark);
  ctx.fillRect(x + w * 0.5 - 7, y, 14, 8);
}

export function drawTent(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = snapEnv(PAL.earth_dark);
  ctx.fillRect(-26, 12, 52, 6);

  ctx.strokeStyle = snapEnv(PAL.earth_dark);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-34, 22);
  ctx.lineTo(-24, 8);
  ctx.moveTo(34, 22);
  ctx.lineTo(24, 8);
  ctx.moveTo(-12, 24);
  ctx.lineTo(-8, 12);
  ctx.moveTo(12, 24);
  ctx.lineTo(8, 12);
  ctx.stroke();
  ctx.fillStyle = snapEnv(PAL.earth_dark);
  for (const [sx, sy] of [[-36, 20], [32, 20], [-14, 22], [10, 22]] as const) ctx.fillRect(sx, sy, 5, 5);

  ctx.fillStyle = snapEnv(PAL.earth_dark);
  ctx.beginPath();
  ctx.moveTo(-26, 12);
  ctx.lineTo(-4, -20);
  ctx.lineTo(-2, 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = snapEnv(PAL.earth_mid);
  ctx.beginPath();
  ctx.moveTo(2, 14);
  ctx.lineTo(4, -20);
  ctx.lineTo(26, 12);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = snapEnv(PAL.earth_dark);
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-16, 6);
  ctx.lineTo(-8, -8);
  ctx.moveTo(16, 6);
  ctx.lineTo(8, -8);
  ctx.moveTo(-18, 10);
  ctx.lineTo(18, 10);
  ctx.stroke();

  ctx.fillStyle = snapEnv(PAL.shadow_navy);
  ctx.fillRect(-8, 2, 16, 12);
  ctx.fillStyle = snapEnv(PAL.earth_mid);
  ctx.beginPath();
  ctx.moveTo(-8, 2);
  ctx.lineTo(0, -8);
  ctx.lineTo(8, 2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = snapEnv(PAL.earth_dark);
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.lineTo(0, 14);
  ctx.stroke();
  ctx.fillStyle = snapEnv(PAL.bone_light);
  ctx.fillRect(-2, -27, 4, 6);
}

function drawStoneWall(ctx: CanvasRenderingContext2D): void {
  const st = matEnv("stone", PAL.earth_dark);
  poly(ctx, [[-22, 8], [-20, -6], [20, -6], [22, 8]], st, 1.3);
  ctx.strokeStyle = snapEnv(PAL.shadow_navy);
  ctx.lineWidth = 1;
  ctx.strokeRect(-18, -4, 12, 8);
  ctx.strokeRect(-4, -4, 10, 8);
  ctx.strokeRect(8, -4, 10, 8);
}

/** QA helper. Play path never uses this as the only roof — giwa lives on the hanok. */
export function drawRoof(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, alpha: number): void {
  if (alpha < 0.08) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const key = `roof:${w | 0}x${h | 0}`;
  const sheet = cachedStatic(key, Math.max(64, w | 0), Math.max(48, h | 0), (c) => {
    drawHanokRoof(c, -w * 0.5, -h * 0.5, w, h);
  });
  ctx.drawImage(sheet, x, y, w, h);
  ctx.restore();
}
