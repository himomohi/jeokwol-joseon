import { BIOMES } from "../content/world";
import type { BiomeId } from "../core/types";
import { CHUNK, TILE } from "../core/coords";
import { STREAM_SALT } from "../core/rng";
import { biomeAt, type ChunkData, type PropInst } from "../world/map";
import { randAt } from "../world/noise";
import { cachedStatic } from "./cache";
import { ellipse, matEnv, poly, roundRect } from "./materials";
import { PAL, rgba, snapEnv } from "./palette";

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

/** Break the 48px tile fill so the grid is not the first thing you see. */
export function drawTile(ctx: CanvasRenderingContext2D, biome: BiomeId, x: number, y: number, seed: number): void {
  const b = BIOMES[biome];
  const t = artT(x / TILE, y / TILE, seed, 3);
  const t2 = artT(x / TILE, y / TILE, seed, 7);
  const t3 = artT(x / TILE, y / TILE, seed, 13);

  ctx.fillStyle = snapEnv(b.grass);
  ctx.fillRect(x, y, TILE + 1, TILE + 1);

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

  const east = biomeAt(seed, x + TILE + 4, y + TILE * 0.5);
  if (east !== biome) {
    ctx.fillStyle = snapEnv(BIOMES[east].grass);
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 5; i++) {
      const yy = y + 3 + i * 9 + t * 4;
      ctx.fillRect(x + TILE - 6 - (i % 2) * 4, yy, 8, 5);
    }
    ctx.globalAlpha = 1;
  }
}

export function ensureChunkGround(chunk: ChunkData, seed: number): HTMLCanvasElement {
  if (chunk.ground) return chunk.ground;
  const c = document.createElement("canvas");
  c.width = CHUNK;
  c.height = CHUNK;
  const g = c.getContext("2d")!;
  const ox = chunk.cx * CHUNK;
  const oy = chunk.cy * CHUNK;
  g.save();
  g.translate(-ox, -oy);
  for (let ty = 0; ty < 16; ty++) {
    for (let tx = 0; tx < 16; tx++) {
      const b = chunk.tiles[ty * 16 + tx]!;
      drawTile(g, b, ox + tx * TILE, oy + ty * TILE, seed);
    }
  }
  g.restore();
  chunk.ground = c;
  return c;
}

export function drawChunkGround(ctx: CanvasRenderingContext2D, chunk: ChunkData, seed: number): void {
  const g = ensureChunkGround(chunk, seed);
  ctx.drawImage(g, chunk.cx * CHUNK, chunk.cy * CHUNK);
}

export function drawProp(ctx: CanvasRenderingContext2D, p: PropInst): void {
  ctx.save();
  ctx.translate(p.x, p.y);
  const art = p.def.art;
  const sz = propSheetSize(art);
  const sheet = cachedStatic(`prop:${art}:${(p.variant * 8) | 0}:${sz}`, sz, sz, (c) => drawPropArt(c, art, p.def.w, p.def.h));
  const foot = art === "pine" || art === "bamboo" || art === "tent" || art === "deadtree";
  ctx.drawImage(sheet, -sz / 2, foot ? -sz * 0.72 : -sz * 0.55, sz, sz);
  ctx.restore();
}

function propSheetSize(art: string): number {
  if (art === "house" || art === "shop" || art === "shrine" || art === "gate") return 220;
  if (art === "pine" || art === "bamboo") return 200;
  if (art === "tent") return 168;
  return 112;
}

function drawPropArt(ctx: CanvasRenderingContext2D, art: string, w: number, h: number): void {
  if (art === "pine") drawPine(ctx);
  else if (art === "bamboo") drawBamboo(ctx);
  else if (art === "deadtree") drawDeadTree(ctx);
  else if (art === "rock") drawRock(ctx);
  else if (art === "reed") drawReed(ctx);
  else if (art === "bush") drawBush(ctx);
  else if (art === "lantern") drawStoneLantern(ctx);
  else if (art === "campfire") drawCampfire(ctx);
  else if (art === "grave") drawGrave(ctx);
  else if (art === "house" || art === "shop" || art === "shrine" || art === "gate") drawHanok(ctx, art, w, h);
  else if (art === "tent") drawTent(ctx);
  else if (art === "wall") drawStoneWall(ctx);
}

/** Brown trunk + stacked green canopy. Sized to read at play zoom. */
export function drawPine(ctx: CanvasRenderingContext2D): void {
  const wood = matEnv("wood", PAL.earth_mid);
  const bark = matEnv("wood", PAL.earth_dark);
  poly(ctx, [[-8, 30], [-6, -6], [6.5, -6], [9, 30]], wood, 1.5);
  poly(ctx, [[-3, 12], [-2, -4], [2, -4], [2.6, 14]], bark, 1);
  ctx.strokeStyle = snapEnv(PAL.earth_mid);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2, 4);
  ctx.lineTo(-16, -8);
  ctx.moveTo(3, 2);
  ctx.lineTo(17, -6);
  ctx.stroke();

  const needle = matEnv("jade", PAL.moss_cool);
  const needleDeep = matEnv("jade", PAL.moss_cool);
  ellipse(ctx, -16, -18, 18, 11, needleDeep);
  ellipse(ctx, 17, -16, 17, 10, needle);
  ellipse(ctx, 0, -14, 22, 13, needle);
  ellipse(ctx, -12, -26, 16, 11, needle);
  ellipse(ctx, 13, -28, 16, 11, needleDeep);
  ellipse(ctx, 1, -36, 18, 12, needle);
  ellipse(ctx, -6, -50, 13, 9, needle);
  ellipse(ctx, 7, -52, 13, 9, needle);
  ellipse(ctx, 1, -62, 10, 8, needle);
}

export function drawBamboo(ctx: CanvasRenderingContext2D): void {
  const stalks: [number, number, number][] = [[-10, -60, 5.2], [2, -70, 5.6], [14, -54, 4.4]];
  for (const [x, top, w] of stalks) {
    ctx.strokeStyle = snapEnv(PAL.moss_cool);
    ctx.lineWidth = w;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, 22);
    ctx.lineTo(x + 1.4, top);
    ctx.stroke();
    ctx.strokeStyle = snapEnv(PAL.earth_dark);
    ctx.lineWidth = 1.2;
    for (let y = 16; y > top; y -= 10) {
      ctx.beginPath();
      ctx.moveTo(x - 4, y);
      ctx.lineTo(x + 5, y);
      ctx.stroke();
    }
  }
  ellipse(ctx, -10, -50, 12, 7, matEnv("jade", PAL.moss_cool));
  ellipse(ctx, 4, -58, 13, 8, matEnv("jade", PAL.moss_cool));
  ellipse(ctx, 14, -44, 11, 6, matEnv("jade", PAL.moss_cool));
  ellipse(ctx, -2, -36, 8, 5, matEnv("jade", PAL.moss_cool));
}

function drawDeadTree(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = snapEnv(PAL.earth_dark);
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(0, -26);
  ctx.lineTo(-12, -36);
  ctx.moveTo(0, -18);
  ctx.lineTo(11, -30);
  ctx.moveTo(0, -12);
  ctx.lineTo(8, -8);
  ctx.stroke();
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

/** Wood walls + door. Roof is the separate opaque giwa pass. */
export function drawHanok(ctx: CanvasRenderingContext2D, art: string, w: number, h: number): void {
  const bw = Math.max(38, Math.min(56, w * 0.48));
  const bh = Math.max(26, Math.min(36, h * 0.42));
  const wood = matEnv("wood", PAL.earth_mid);
  const post = matEnv("wood", PAL.earth_dark);

  ctx.fillStyle = snapEnv(PAL.earth_dark);
  ctx.fillRect(-bw - 4, bh - 4, bw * 2 + 8, 8);

  ctx.fillStyle = wood.fill;
  ctx.fillRect(-bw, -6, bw * 2, bh);
  ctx.strokeStyle = post.stroke;
  ctx.lineWidth = 1.6;
  ctx.strokeRect(-bw, -6, bw * 2, bh);

  ctx.fillStyle = snapEnv(PAL.earth_dark);
  ctx.fillRect(-bw, -6, 5, bh);
  ctx.fillRect(bw - 5, -6, 5, bh);
  ctx.fillRect(-6, -6, 5, bh);
  for (let i = -bw + 12; i < bw - 8; i += 11) {
    ctx.fillStyle = snapEnv(PAL.earth_dark);
    ctx.globalAlpha = 0.35;
    ctx.fillRect(i, -4, 1.6, bh - 4);
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = snapEnv(PAL.bone_light);
  ctx.fillRect(-10, 4, 20, bh - 10);
  ctx.strokeStyle = snapEnv(PAL.earth_dark);
  ctx.strokeRect(-10, 4, 20, bh - 10);
  ctx.fillStyle = snapEnv(PAL.earth_dark);
  ctx.fillRect(-1, 8, 2, bh - 16);

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
  ctx.fillRect(-bw - 6, -10, bw * 2 + 12, 6);
  drawHanokRoof(ctx, -bw - 10, -52, bw * 2 + 20, 48);
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
