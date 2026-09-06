import { BIOMES } from "../content/world";
import type { BiomeId } from "../core/types";
import { TILE } from "../core/coords";
import { randAt } from "../world/noise";
import type { ChunkData, PropInst } from "../world/map";
import { PAL, rgba, snapEnv } from "./palette";
import { ellipse, fillStroke, matEnv, roundRect } from "./materials";

export function drawTile(ctx: CanvasRenderingContext2D, biome: BiomeId, x: number, y: number, seed: number): void {
  const b = BIOMES[biome];
  const t = randAt(Math.floor(x / TILE), Math.floor(y / TILE), seed, 3);
  ctx.fillStyle = snapEnv(t > 0.5 ? b.grass2 : b.grass);
  ctx.fillRect(x, y, TILE + 1, TILE + 1);
  if (biome === "road") {
    ctx.fillStyle = snapEnv(b.dirt);
    ctx.fillRect(x, y + 8, TILE + 1, TILE - 16);
  }
  if (biome === "riverside" || biome === "swamp") {
    if (t > 0.82) {
      ctx.fillStyle = snapEnv(b.water ?? PAL.env_cool);
      ctx.globalAlpha = 0.55;
      ctx.fillRect(x, y, TILE + 1, TILE + 1);
      ctx.globalAlpha = 1;
    }
  }
  if (biome === "snow") {
    ctx.fillStyle = rgba(PAL.bone_light, 0.22);
    ctx.fillRect(x, y, TILE + 1, TILE + 1);
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
  if (art === "pine") {
    ctx.beginPath();
    ctx.moveTo(0, -36);
    ctx.lineTo(14, 4);
    ctx.lineTo(-14, 4);
    ctx.closePath();
    fillStroke(ctx, matEnv("jade", PAL.moss_cool));
    ctx.fillStyle = PAL.earth_dark;
    ctx.fillRect(-2, 4, 4, 8);
  } else if (art === "bamboo") {
    ctx.strokeStyle = PAL.moss_cool;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(2, -32);
    ctx.stroke();
    ctx.strokeStyle = PAL.env_mid;
    ctx.beginPath();
    ctx.moveTo(5, 8);
    ctx.lineTo(7, -28);
    ctx.stroke();
  } else if (art === "deadtree") {
    ctx.strokeStyle = PAL.earth_dark;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(0, -28);
    ctx.lineTo(-10, -36);
    ctx.moveTo(0, -20);
    ctx.lineTo(10, -30);
    ctx.stroke();
  } else if (art === "rock") {
    ellipse(ctx, 0, 0, 12, 8, matEnv("iron", PAL.earth_dark));
  } else if (art === "reed") {
    ctx.strokeStyle = PAL.moss_cool;
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(-2, -16);
    ctx.moveTo(4, 6);
    ctx.lineTo(6, -14);
    ctx.stroke();
  } else if (art === "bush") {
    ellipse(ctx, 0, 0, 12, 8, matEnv("jade", PAL.moss_cool));
  } else if (art === "lantern") {
    ctx.fillStyle = PAL.earth_dark;
    ctx.fillRect(-3, 4, 6, 8);
    ctx.fillStyle = PAL.torch_warm;
    ctx.shadowColor = PAL.torch_hot;
    ctx.shadowBlur = 10;
    roundRect(ctx, -6, -10, 12, 14, 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (art === "campfire") {
    ellipse(ctx, 0, 4, 10, 5, matEnv("iron", PAL.earth_dark));
    ctx.fillStyle = PAL.torch_hot;
    ctx.beginPath();
    ctx.moveTo(-6, 2);
    ctx.lineTo(0, -12);
    ctx.lineTo(6, 2);
    ctx.fill();
  } else if (art === "grave") {
    ctx.fillStyle = PAL.earth_dark;
    roundRect(ctx, -6, -10, 12, 18, 3);
    ctx.fill();
  } else if (art === "house" || art === "shop" || art === "shrine" || art === "gate") {
    const w = p.def.w;
    const h = p.def.h;
    ctx.fillStyle = snapEnv(PAL.earth_mid);
    ctx.fillRect(-w * 0.42, -h * 0.15, w * 0.84, h * 0.45);
    ctx.strokeStyle = PAL.earth_dark;
    ctx.strokeRect(-w * 0.42, -h * 0.15, w * 0.84, h * 0.45);
    ctx.fillStyle = snapEnv(PAL.earth_dark);
    ctx.beginPath();
    ctx.moveTo(-w * 0.5, -h * 0.15);
    ctx.lineTo(0, -h * 0.65);
    ctx.lineTo(w * 0.5, -h * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = PAL.shadow_navy;
    ctx.stroke();
    ctx.fillStyle = PAL.bone_light;
    ctx.fillRect(-8, 4, 16, 14);
    ctx.strokeStyle = PAL.earth_dark;
    ctx.strokeRect(-8, 4, 16, 14);
  } else if (art === "tent") {
    ctx.beginPath();
    ctx.moveTo(-20, 10);
    ctx.lineTo(0, -16);
    ctx.lineTo(20, 10);
    ctx.closePath();
    fillStroke(ctx, matEnv("cotton", PAL.earth_dark));
  }
  ctx.restore();
}

export function drawRoof(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = snapEnv(PAL.earth_dark);
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.55);
  ctx.lineTo(x + w * 0.5, y);
  ctx.lineTo(x + w, y + h * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PAL.shadow_navy;
  ctx.stroke();
  ctx.restore();
}
