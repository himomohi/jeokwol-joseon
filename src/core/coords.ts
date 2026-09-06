export const TILE = 48;
export const CHUNK_TILES = 16;
export const CHUNK = TILE * CHUNK_TILES;
export const SIM_HZ = 120;
export const SIM_DT = 1 / SIM_HZ;
export const MAX_FRAME = 0.08;

export function worldToTile(x: number): number {
  return Math.floor(x / TILE);
}

export function tileToWorld(t: number): number {
  return t * TILE + TILE * 0.5;
}

export function worldToChunk(x: number): number {
  return Math.floor(x / CHUNK);
}

export function chunkOrigin(c: number): number {
  return c * CHUNK;
}

export function chunkKey(cx: number, cy: number): string {
  return `${cx}:${cy}`;
}

export function parseChunkKey(k: string): { cx: number; cy: number } {
  const i = k.indexOf(":");
  return { cx: Number(k.slice(0, i)), cy: Number(k.slice(i + 1)) };
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
  w: number;
  h: number;
}

export function screenToWorld(cam: Camera, sx: number, sy: number): { x: number; y: number } {
  return {
    x: cam.x + (sx - cam.w * 0.5) / cam.zoom,
    y: cam.y + (sy - cam.h * 0.5) / cam.zoom,
  };
}

export function worldToScreen(cam: Camera, x: number, y: number): { x: number; y: number } {
  return {
    x: (x - cam.x) * cam.zoom + cam.w * 0.5,
    y: (y - cam.y) * cam.zoom + cam.h * 0.5,
  };
}
