import { BIOMES } from "../content/world";
import type { BiomeId } from "../core/types";
import { TILE } from "../core/coords";
import { STREAM_SALT } from "../core/rng";
import { randAt } from "../world/noise";
import type { ChunkData, PropInst } from "../world/map";
import { PAL, rgba, snapEnv } from "./palette";
import { cachedStatic } from "./cache";
import { ellipse, fillStroke, matEnv, poly, roundRect } from "./materials";

function artT(x: number, y: number, seed: number, salt: number): number {
  return randAt(Math.floor(x), Math.floor(y), seed ^ STREAM_SALT.art, salt);
}

export function drawTile(ctx: CanvasRenderingContext2D, biome: BiomeId, x: number, y: number, seed: number): void {
  const b = BIOMES[biome];
  const t = artT(x / TILE, y / TILE, seed, 3);
  ctx.fillStyle = snapEnv(t > 0.5 ? b.grass2 : b.grass);
  ctx.fillRect(x, y, TILE + 1, TILE + 1);

  if (biome === "road") {
    ctx.fillStyle = snapEnv(b.dirt);
    ctx.fillRect(x, y + 10, TILE + 1, TILE - 20);
    ctx.fillStyle = snapEnv(PAL.earth_mid);
    ctx.globalAlpha = 0.35;
    ctx.fillRect(x, y + 16, TILE + 1, 3);
    ctx.fillRect(x, y + 28, TILE + 1, 2);
    ctx.globalAlpha = 1;
    if (t > 0.72) {
      ctx.fillStyle = snapEnv(PAL.env_mid);
      ctx.fillRect(x + 8 + t * 20, y + 20, 4, 3);
    }
  }

  if (biome === "riverside" || biome === "swamp") {
    const wet = artT(x / TILE, y / TILE, seed, 11);
    if (wet > 0.62) {
      ctx.fillStyle = snapEnv(b.water ?? PAL.env_cool);
      ctx.globalAlpha = biome === "swamp" ? 0.48 : 0.4;
      ctx.fillRect(x, y + TILE * 0.35, TILE + 1, TILE * 0.65);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = snapEnv(PAL.env_mid);
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(x, y + TILE * 0.4);
      ctx.quadraticCurveTo(x + 24, y + TILE * 0.5, x + TILE, y + TILE * 0.38);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  if (biome === "snow") {
    ctx.fillStyle = rgba(PAL.bone_light, 0.22);
    ctx.fillRect(x, y, TILE + 1, TILE + 1);
  }

  if (biome === "mountain" && t > 0.84) {
    ctx.fillStyle = snapEnv(PAL.env_mid);
    ctx.fillRect(x + 12, y + 18, 10, 6);
  }

  if (biome === "village" || biome === "hanyang") {
    ctx.strokeStyle = snapEnv(PAL.earth_dark);
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = 1;
    const row = 10 + ((Math.floor(y / TILE) * 3) % 8);
    ctx.beginPath();
    ctx.moveTo(x, y + row);
    ctx.lineTo(x + TILE, y + row + 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    if (t > 0.88) {
      ctx.fillStyle = snapEnv(PAL.earth_mid);
      ctx.fillRect(x + 20, y + 22, 6, 3);
    }
  }
}

export function drawChunkGround(ctx: CanvasRenderingContext2D, chunk: ChunkData, seed: number): void {
  const ox = chunk.cx * TILE * 16;
  const oy = chunk.cy * TILE * 16;
  for (let ty = 0; ty < 16; ty++) {
    for (let tx = 0; tx < 16; tx++) {
      const b = chunk.tiles[ty * 16 + tx]!;
      drawTile(ctx, b, ox + tx * TILE, oy + ty * TILE, seed);
    }
  }
}

export function drawProp(ctx: CanvasRenderingContext2D, p: PropInst): void {
  ctx.save();
  ctx.translate(p.x, p.y);
  const art = p.def.art;
  const big = art === "house" || art === "shop" || art === "shrine" || art === "gate" || art === "pine";
  const sz = big ? 140 : 112;
  const sheet = cachedStatic(`prop:${art}:${(p.variant * 8) | 0}:${sz}`, sz, sz, (c) => drawPropArt(c, art, p.def.w, p.def.h));
  ctx.drawImage(sheet, -sz / 2, -sz / 2, sz, sz);
  ctx.restore();
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

function drawPine(ctx: CanvasRenderingContext2D): void {
  const wood = matEnv("wood", PAL.earth_dark);
  poly(ctx, [[-4.5, 16], [-3, -10], [3.2, -10], [5, 16]], wood, 1.3);
  ctx.strokeStyle = snapEnv(PAL.earth_mid);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(-12, -16);
  ctx.moveTo(1, -2);
  ctx.lineTo(13, -14);
  ctx.stroke();
  ellipse(ctx, -10, -18, 12, 8, matEnv("jade", PAL.env_mid));
  ellipse(ctx, 11, -16, 11, 7, matEnv("jade", PAL.moss_cool));
  ellipse(ctx, 0, -14, 14, 9, matEnv("jade", PAL.moss_cool));
  ellipse(ctx, -6, -26, 10, 7, matEnv("jade", PAL.env_mid));
  ellipse(ctx, 6, -28, 10, 7, matEnv("jade", PAL.moss_cool));
  ellipse(ctx, 1, -34, 8, 6, matEnv("jade", PAL.moss_cool));
}

function drawBamboo(ctx: CanvasRenderingContext2D): void {
  const stalks: [number, number, number][] = [[-4, -34, 3], [2, -38, 3.2], [8, -30, 2.6]];
  for (const [x, top, w] of stalks) {
    ctx.strokeStyle = snapEnv(PAL.moss_cool);
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x, 10);
    ctx.lineTo(x + 1, top);
    ctx.stroke();
    ctx.strokeStyle = snapEnv(PAL.earth_dark);
    ctx.lineWidth = 1;
    for (let y = 6; y > top; y -= 8) {
      ctx.beginPath();
      ctx.moveTo(x - 3, y);
      ctx.lineTo(x + 4, y);
      ctx.stroke();
    }
  }
  ellipse(ctx, -2, -32, 8, 5, matEnv("jade", PAL.moss_cool));
  ellipse(ctx, 6, -28, 7, 4, matEnv("jade", PAL.env_mid));
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
  ellipse(ctx, -4, 2, 8, 6, matEnv("jade", PAL.moss_cool));
  ellipse(ctx, 5, 1, 7, 5, matEnv("jade", PAL.env_mid));
  ellipse(ctx, 0, -4, 6, 4, matEnv("jade", PAL.moss_cool));
}

function drawStoneLantern(ctx: CanvasRenderingContext2D): void {
  poly(ctx, [[-5, 10], [-4, 2], [4, 2], [5, 10]], matEnv("stone", PAL.earth_dark), 1.2);
  ctx.shadowColor = PAL.torch_hot;
  ctx.shadowBlur = 10;
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

function drawHanok(ctx: CanvasRenderingContext2D, art: string, w: number, h: number): void {
  const bw = Math.min(40, w * 0.42);
  const bh = Math.min(22, h * 0.28);
  ctx.fillStyle = snapEnv(PAL.earth_mid);
  ctx.fillRect(-bw, -4, bw * 2, bh);
  ctx.strokeStyle = snapEnv(PAL.earth_dark);
  ctx.strokeRect(-bw, -4, bw * 2, bh);
  ctx.fillStyle = snapEnv(PAL.shadow_navy);
  for (let i = -bw + 6; i < bw; i += 8) ctx.fillRect(i, -4, 1.4, bh);
  ctx.fillStyle = snapEnv(PAL.bone_light);
  ctx.fillRect(-7, 6, 14, 12);
  ctx.strokeStyle = snapEnv(PAL.earth_dark);
  ctx.strokeRect(-7, 6, 14, 12);
  if (art === "shop") {
    ctx.fillStyle = snapEnv(PAL.earth_dark);
    ctx.fillRect(-16, 2, 32, 4);
  }
  if (art === "shrine") {
    ctx.fillStyle = snapEnv(PAL.earth_dark);
    ctx.fillRect(-3, -6, 6, 10);
  }
  drawHanokRoof(ctx, -bw - 6, -28, bw * 2 + 12, 28);
}

function drawHanokRoof(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.72);
  ctx.quadraticCurveTo(x + w * 0.12, y + h * 0.2, x + w * 0.5, y);
  ctx.quadraticCurveTo(x + w * 0.88, y + h * 0.2, x + w, y + h * 0.72);
  ctx.lineTo(x + w * 0.92, y + h * 0.78);
  ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.32, x + w * 0.08, y + h * 0.78);
  ctx.closePath();
  fillStroke(ctx, matEnv("stone", PAL.earth_dark), 1.3);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y);
  ctx.lineTo(x + w * 0.5, y + 4);
  ctx.strokeStyle = snapEnv(PAL.shadow_navy);
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.strokeStyle = snapEnv(PAL.env_mid);
  ctx.lineWidth = 0.8;
  for (let i = 1; i < 5; i++) {
    const t = i / 5;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.12, y + h * (0.2 + t * 0.5));
    ctx.quadraticCurveTo(x + w * 0.5, y + h * (0.08 + t * 0.45), x + w * 0.88, y + h * (0.2 + t * 0.5));
    ctx.stroke();
  }
}

function drawTent(ctx: CanvasRenderingContext2D): void {
  poly(ctx, [[-20, 10], [0, -16], [20, 10]], matEnv("cotton", PAL.earth_dark), 1.3);
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(0, 10);
  ctx.strokeStyle = snapEnv(PAL.shadow_navy);
  ctx.stroke();
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
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x + w * 0.5, y + h * 0.45);
  drawHanokRoof(ctx, -w * 0.5, -h * 0.55, w, h * 0.7);
  ctx.restore();
}
