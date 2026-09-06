import { iconCanvas } from "./icons";
import { nearestPal, parseHex } from "./palette";

const staticCache = new Map<string, HTMLCanvasElement>();
const pngCache = new Map<string, HTMLCanvasElement | null>();
let gen = 0;

/**
 * Primary pipeline: joint/form/material codegen → Canvas cache → world blit.
 * PNG under public/sprites/ is an optional overlay for a few PASS-audited units.
 */
export const ART_PIPELINE = "codegen" as const;

/** Approved Grok CLI pixel sheets — exception overlay only. */
export const PNG_OVERLAY: Record<string, string> = {
  player_musa: "sprites/musa_64.png",
  player_gungsoo: "sprites/gungsa_64.png",
  player_gungsa: "sprites/gungsa_64.png",
  bandit_king: "sprites/bandit_64.png",
  gumiho_lady: "sprites/gumiho_64.png",
  tiger_white: "sprites/boss_baekho_64.png",
};

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

function spriteUrl(rel: string): string {
  const base = typeof import.meta !== "undefined" && import.meta.env?.BASE_URL ? import.meta.env.BASE_URL : "/";
  return `${base}${rel}`.replace(/\/{2,}/g, "/").replace(":/", "://");
}

function snapSheet(src: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext("2d")!;
  ctx.drawImage(src, 0, 0);
  const img = ctx.getImageData(0, 0, out.width, out.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3] ?? 0;
    const r = d[i] ?? 0;
    const g = d[i + 1] ?? 0;
    const b = d[i + 2] ?? 0;
    if (a < 18 || r + g + b < 22) {
      d[i + 3] = 0;
      continue;
    }
    const hex = nearestPal(`#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`);
    const p = parseHex(hex);
    d[i] = p.r;
    d[i + 1] = p.g;
    d[i + 2] = p.b;
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

function kickPng(key: string): void {
  if (pngCache.has(key)) return;
  const rel = PNG_OVERLAY[key];
  if (!rel || typeof Image === "undefined") {
    pngCache.set(key, null);
    return;
  }
  pngCache.set(key, null);
  const im = new Image();
  im.onload = () => {
    const raw = document.createElement("canvas");
    raw.width = im.width;
    raw.height = im.height;
    raw.getContext("2d")!.drawImage(im, 0, 0);
    pngCache.set(key, snapSheet(raw));
  };
  im.onerror = () => pngCache.set(key, null);
  im.src = spriteUrl(rel);
}

/** Palette-snapped PNG if the audited sheet has loaded; otherwise null (codegen stays). */
export function pngOverlay(key: string): HTMLCanvasElement | null {
  if (!PNG_OVERLAY[key]) return null;
  kickPng(key);
  return pngCache.get(key) ?? null;
}

export function preloadApprovedPng(): void {
  for (const k of Object.keys(PNG_OVERLAY)) kickPng(k);
}
