import { iconCanvas } from "./icons";

const staticCache = new Map<string, HTMLCanvasElement>();
let gen = 0;

export function bumpArt(): void {
  gen += 1;
  staticCache.clear();
}

export function cachedStatic(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
  const k = `${gen}:${key}:${w}x${h}`;
  let c = staticCache.get(k);
  if (c) return c;
  c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.translate(w / 2, h / 2);
  draw(ctx);
  staticCache.set(k, c);
  return c;
}

export function groundDropCanvas(itemId: string): HTMLCanvasElement {
  return iconCanvas(itemId, 32);
}

export function cacheSize(): number {
  return staticCache.size;
}
