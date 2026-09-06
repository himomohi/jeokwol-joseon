import type { BiomeId } from "../core/types";
import { CHUNK, CHUNK_TILES, TILE, chunkKey, worldToChunk, worldToTile } from "../core/coords";
import { BIOMES, POI, PROPS, type BiomeDef } from "../content/world";
import type { PropDefinition } from "../core/types";
import { dist } from "../core/math";
import { fbm, randAt } from "./noise";

const BIOME_IDS: BiomeId[] = ["hanyang", "mountain", "bamboo", "riverside", "swamp", "snow", "haunted", "road", "village"];

export interface PropInst {
  id: string;
  def: PropDefinition;
  x: number;
  y: number;
  variant: number;
  roof: boolean;
}

export interface Solid {
  x: number;
  y: number;
  r: number;
  door?: boolean;
}

export interface RoofRect {
  x: number;
  y: number;
  w: number;
  h: number;
  alpha: number;
  art: string;
}

export interface ChunkData {
  cx: number;
  cy: number;
  tiles: BiomeId[];
  props: PropInst[];
  solids: Solid[];
  roofs: RoofRect[];
  lastUse: number;
}

const poiList = Object.values(POI);

function distToRoad(x: number, y: number): number {
  let best = 1e9;
  const pts = [POI.village, POI.banditCamp, POI.tigerRidge, POI.bamboo, POI.swamp, POI.haunted, POI.snow, POI.river];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i]!;
      const b = pts[j]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const l2 = dx * dx + dy * dy;
      let t = l2 > 0 ? ((x - a.x) * dx + (y - a.y) * dy) / l2 : 0;
      t = Math.max(0, Math.min(1, t));
      const px = a.x + dx * t;
      const py = a.y + dy * t;
      const bend = Math.sin(t * 6.2) * 40;
      const nx = px + (-dy / Math.sqrt(l2 || 1)) * bend * 0.15;
      const ny = py + (dx / Math.sqrt(l2 || 1)) * bend * 0.15;
      best = Math.min(best, dist(x, y, nx, ny));
    }
  }
  return best;
}

export function villageRadius(x: number, y: number): number {
  return dist(x, y, 0, 0);
}

export function biomeAt(seed: number, x: number, y: number): BiomeId {
  const vr = villageRadius(x, y);
  if (vr < 280) return "village";
  if (vr < 420 && distToRoad(x, y) < 42) return "village";
  const road = distToRoad(x, y);
  if (road < 26) return "road";

  const nx = x / 1400;
  const ny = y / 1400;
  const elev = fbm(nx * 1.2, ny * 1.2, seed + 11, 5);
  const moist = fbm(nx * 1.4 + 20, ny * 1.4, seed + 29, 4);
  const haunt = fbm(nx * 0.9 + 8, ny * 0.9, seed + 71, 3);
  const temp = fbm(nx * 0.7, ny * 0.9 + 4, seed + 47, 3);

  const dHaunt = dist(x, y, POI.haunted.x, POI.haunted.y);
  const dSnow = dist(x, y, POI.snow.x, POI.snow.y);
  const dSwamp = dist(x, y, POI.swamp.x, POI.swamp.y);
  const dBamboo = dist(x, y, POI.bamboo.x, POI.bamboo.y);
  const dRiver = dist(x, y, POI.river.x, POI.river.y);

  if (dHaunt < 520 || (haunt > 0.28 && dHaunt < 900)) return "haunted";
  if (dSnow < 620 || (elev > 0.28 && temp < -0.15)) return "snow";
  if (dSwamp < 540 || (moist > 0.22 && elev < -0.1 && dSwamp < 1100)) return "swamp";
  if (dBamboo < 520) return "bamboo";
  if (dRiver < 380 || (moist > 0.18 && Math.abs(y - POI.river.y) < 220)) return "riverside";
  if (elev > 0.08 || dist(x, y, POI.tigerRidge.x, POI.tigerRidge.y) < 700) return "mountain";
  if (vr < 1400) return "hanyang";
  if (moist > 0.1) return "bamboo";
  return "hanyang";
}

export function biomeBlend(seed: number, x: number, y: number): { id: BiomeId; w: number }[] {
  const here = biomeAt(seed, x, y);
  const samples: BiomeId[] = [here];
  const d = 22;
  samples.push(biomeAt(seed, x + d, y), biomeAt(seed, x - d, y), biomeAt(seed, x, y + d), biomeAt(seed, x, y - d));
  const counts = new Map<BiomeId, number>();
  for (const s of samples) counts.set(s, (counts.get(s) ?? 0) + 1);
  const out: { id: BiomeId; w: number }[] = [];
  for (const [id, n] of counts) out.push({ id, w: n / samples.length });
  out.sort((a, b) => b.w - a.w);
  return out;
}

export function biomeColor(seed: number, x: number, y: number): string {
  const blend = biomeBlend(seed, x, y);
  const a = BIOMES[blend[0]!.id];
  const r = randAt(worldToTile(x), worldToTile(y), seed, 3);
  return r > 0.55 ? a.grass2 : a.grass;
}

function villageLayout(seed: number): PropInst[] {
  const items: PropInst[] = [];
  const placed: { def: PropDefinition; x: number; y: number }[] = [
    { def: PROPS.gate!, x: 0, y: 210 },
    { def: PROPS.shop!, x: -120, y: -20 },
    { def: PROPS.house!, x: 130, y: -10 },
    { def: PROPS.house!, x: -40, y: 110 },
    { def: PROPS.shrine!, x: 40, y: -130 },
    { def: PROPS.house!, x: -200, y: 80 },
    { def: PROPS.house!, x: 210, y: 90 },
    { def: PROPS.lantern!, x: -60, y: 40 },
    { def: PROPS.lantern!, x: 70, y: 40 },
    { def: PROPS.lantern!, x: 0, y: -70 },
  ];
  for (const p of placed) {
    items.push({ id: `v_${p.def.id}_${p.x}_${p.y}`, def: p.def, x: p.x, y: p.y, variant: randAt(p.x | 0, p.y | 0, seed, 9), roof: p.def.roof });
  }
  return items;
}

function propForBiome(b: BiomeId): PropDefinition[] {
  return Object.values(PROPS).filter((p) => p.biomes.includes(b) && !p.roof && p.id !== "house" && p.id !== "shop" && p.id !== "gate");
}

export function buildChunk(seed: number, cx: number, cy: number): ChunkData {
  const tiles: BiomeId[] = [];
  const props: PropInst[] = [];
  const solids: Solid[] = [];
  const roofs: RoofRect[] = [];
  const ox = cx * CHUNK;
  const oy = cy * CHUNK;

  for (let ty = 0; ty < CHUNK_TILES; ty++) {
    for (let tx = 0; tx < CHUNK_TILES; tx++) {
      const wx = ox + tx * TILE + TILE * 0.5;
      const wy = oy + ty * TILE + TILE * 0.5;
      tiles.push(biomeAt(seed, wx, wy));
    }
  }

  if (cx === 0 && cy === 0) {
    props.push(...villageLayout(seed));
  }

  for (let i = 0; i < 18; i++) {
    const u = randAt(cx, cy, seed, 100 + i);
    const v = randAt(cx, cy, seed, 200 + i);
    const x = ox + u * CHUNK;
    const y = oy + v * CHUNK;
    const b = biomeAt(seed, x, y);
    if (b === "village" && dist(x, y, 0, 0) < 260) continue;
    const cands = propForBiome(b);
    if (!cands.length) continue;
    if (randAt(cx, cy, seed, 300 + i) > (b === "village" ? 0.3 : 0.62)) continue;
    const def = cands[Math.floor(randAt(cx, cy, seed, 400 + i) * cands.length)]!;
    const inst: PropInst = {
      id: `p_${cx}_${cy}_${i}`,
      def,
      x,
      y,
      variant: randAt(cx * 17 + i, cy, seed, 5),
      roof: def.roof,
    };
    props.push(inst);
  }

  for (const p of props) {
    if (p.def.solid) {
      const door = p.def.roof;
      solids.push({ x: p.x, y: p.y, r: p.def.radius, door });
    }
    if (p.def.roof) {
      roofs.push({ x: p.x - p.def.w * 0.5, y: p.y - p.def.h * 0.7, w: p.def.w, h: p.def.h * 0.85, alpha: 1, art: p.def.art });
    }
  }

  return { cx, cy, tiles, props, solids, roofs, lastUse: 0 };
}

export class TerrainCache {
  private map = new Map<string, ChunkData>();
  private order: string[] = [];
  constructor(
    private seed: number,
    readonly budget = 64,
  ) {}

  get(cx: number, cy: number, time: number): ChunkData {
    const k = chunkKey(cx, cy);
    let c = this.map.get(k);
    if (!c) {
      c = buildChunk(this.seed, cx, cy);
      this.map.set(k, c);
      this.order.push(k);
      this.evict();
    }
    c.lastUse = time;
    return c;
  }

  private evict(): void {
    while (this.map.size > this.budget) {
      let oldest = this.order[0]!;
      let ot = Infinity;
      for (const k of this.order) {
        const c = this.map.get(k);
        if (c && c.lastUse < ot) {
          ot = c.lastUse;
          oldest = k;
        }
      }
      this.map.delete(oldest);
      this.order = this.order.filter((k) => k !== oldest);
    }
  }

  around(x: number, y: number, time: number, r = 2): ChunkData[] {
    const cx = worldToChunk(x);
    const cy = worldToChunk(y);
    const out: ChunkData[] = [];
    for (let j = -r; j <= r; j++) {
      for (let i = -r; i <= r; i++) out.push(this.get(cx + i, cy + j, time));
    }
    return out;
  }

  size(): number {
    return this.map.size;
  }

  invalidate(): void {
    this.map.clear();
    this.order = [];
  }
}

export function tileBiome(chunk: ChunkData, wx: number, wy: number): BiomeId {
  const ox = chunk.cx * CHUNK_TILES;
  const oy = chunk.cy * CHUNK_TILES;
  const tx = worldToTile(wx) - ox;
  const ty = worldToTile(wy) - oy;
  if (tx < 0 || ty < 0 || tx >= CHUNK_TILES || ty >= CHUNK_TILES) return "hanyang";
  return chunk.tiles[ty * CHUNK_TILES + tx] ?? "hanyang";
}

export function biomeDef(id: BiomeId): BiomeDef {
  return BIOMES[id];
}

export { BIOME_IDS, poiList };
