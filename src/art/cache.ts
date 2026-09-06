import { iconCanvas } from "./icons";
import { ITEMS } from "../content/items";
import { drawItemForm } from "./forms";
import { nearestPal, parseHex } from "./palette";

const staticCache = new Map<string, HTMLCanvasElement>();
const pngCache = new Map<string, SnappedSheet | null>();
const pngTried = new Set<string>();
let gen = 0;

/**
 * Primary pipeline: joint/form/material codegen → Canvas cache → world blit.
 * PNG under public/sprites/ is an optional overlay for a few PASS-audited units.
 */
export const ART_PIPELINE = "codegen" as const;

export interface SnappedSheet {
  canvas: HTMLCanvasElement;
  frameW: number;
  frameH: number;
  frames: number;
  src: string;
}

/**
 * Approved overlay keys → candidate paths (64 / sheet64 first, 32 fallback).
 * Missing files fail soft; codegen stays.
 */
export const PNG_OVERLAY: Record<string, readonly string[]> = {
  player_musa: ["sprites/musa_64.png", "sprites/musa_32.png"],
  player_gungsoo: ["sprites/gungsa_64.png", "sprites/gungsa_32.png"],
  player_gungsa: ["sprites/gungsa_64.png", "sprites/gungsa_32.png"],
  bandit: ["sprites/bandit_64.png", "sprites/bandit_32.png"],
  bandit_blade: ["sprites/bandit_64.png", "sprites/bandit_32.png"],
  bandit_road: ["sprites/bandit_64.png", "sprites/bandit_32.png"],
  bandit_smuggler: ["sprites/bandit_64.png", "sprites/bandit_32.png"],
  bandit_chief: ["sprites/bandit_64.png", "sprites/bandit_32.png"],
  bandit_king: ["sprites/bandit_64.png", "sprites/bandit_32.png"],
  tiger_white: ["sprites/boss_baekho_sheet64.png", "sprites/boss_baekho_64.png", "sprites/boss_baekho_32.png"],
  gumiho: ["sprites/gumiho_sheet64.png", "sprites/gumiho_64.png", "sprites/gumiho_32.png"],
  gumiho_lady: ["sprites/gumiho_sheet64.png", "sprites/gumiho_64.png", "sprites/gumiho_32.png"],
};

const PLAYER_PNG: Record<string, string> = {
  musa: "player_musa",
  geomgaek: "player_musa",
  changbyeong: "player_musa",
  gungsoo: "player_gungsoo",
  gungsa: "player_gungsa",
  singung: "player_gungsoo",
  hwasal: "player_gungsoo",
  baekbal: "player_gungsoo",
  singijeonsu: "player_gungsoo",
};

export function bumpArt(): void {
  gen += 1;
  staticCache.clear();
  dropCache.clear();
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

const dropCache = new Map<string, HTMLCanvasElement>();

export function groundDropCanvas(itemId: string): HTMLCanvasElement {
  const k = `drop:${itemId}`;
  let c = dropCache.get(k);
  if (c) return c;
  c = document.createElement("canvas");
  c.width = 36;
  c.height = 36;
  const ctx = c.getContext("2d")!;
  ctx.translate(18, 20);
  const it = ITEMS[itemId];
  if (it) drawItemForm(ctx, it.visual.form, it.visual.tint, it.visual.material, 0.95, "ground");
  else {
    const ic = iconCanvas(itemId, 32);
    ctx.drawImage(ic, -16, -16);
  }
  dropCache.set(k, c);
  return c;
}

export function cacheSize(): number {
  return staticCache.size;
}

export function spriteUrl(rel: string): string {
  const base = typeof import.meta !== "undefined" && import.meta.env?.BASE_URL ? String(import.meta.env.BASE_URL) : "/";
  const prefix = base.endsWith("/") ? base : `${base}/`;
  const path = rel.replace(/^\//, "");
  return `${prefix}${path}`;
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

function packSheet(snapped: HTMLCanvasElement, src: string): SnappedSheet {
  const h = snapped.height || 32;
  const square = h === 32 || h === 64 ? h : 64;
  const frames = Math.max(1, Math.floor(snapped.width / square));
  const frameW = frames > 1 ? square : snapped.width;
  return { canvas: snapped, frameW, frameH: snapped.height, frames, src };
}

function loadFirst(key: string, paths: readonly string[], i = 0): void {
  if (i >= paths.length || typeof Image === "undefined") {
    pngCache.set(key, null);
    return;
  }
  const rel = paths[i]!;
  const im = new Image();
  im.onload = () => {
    const raw = document.createElement("canvas");
    raw.width = im.width;
    raw.height = im.height;
    raw.getContext("2d")!.drawImage(im, 0, 0);
    pngCache.set(key, packSheet(snapSheet(raw), rel));
  };
  im.onerror = () => loadFirst(key, paths, i + 1);
  im.src = spriteUrl(rel);
}

function kickPng(key: string): void {
  if (pngTried.has(key)) return;
  pngTried.add(key);
  const paths = PNG_OVERLAY[key];
  if (!paths?.length) {
    pngCache.set(key, null);
    return;
  }
  pngCache.set(key, null);
  loadFirst(key, paths, 0);
}

export function pngKeyForJob(jobId: string | undefined): string | null {
  if (!jobId) return null;
  return PLAYER_PNG[jobId] ?? null;
}

/** Palette-snapped sheet if an audited PNG loaded; otherwise null (codegen stays). */
export function pngOverlay(key: string): SnappedSheet | null {
  if (!PNG_OVERLAY[key]) return null;
  kickPng(key);
  return pngCache.get(key) ?? null;
}

export function frameIndex(sheet: SnappedSheet, walkPhase: number, attacking: boolean): number {
  if (sheet.frames <= 1) return 0;
  if (attacking) return sheet.frames - 1;
  return Math.floor(((walkPhase % 1) + 1) % 1 * (sheet.frames - (sheet.frames > 2 ? 1 : 0)));
}

/** Opaque drawImage overlay. Codegen underneath is the fallback while loading. */
export function blitPngOverlay(
  ctx: CanvasRenderingContext2D,
  sheet: SnappedSheet,
  walkPhase = 0,
  attacking = false,
  size?: number,
): void {
  const fi = frameIndex(sheet, walkPhase, attacking);
  const dw = size ?? sheet.frameW;
  const dh = size ?? sheet.frameH;
  ctx.drawImage(sheet.canvas, fi * sheet.frameW, 0, sheet.frameW, sheet.frameH, -dw / 2, -dh / 2 - 4, dw, dh);
}

export function preloadApprovedPng(): void {
  for (const k of Object.keys(PNG_OVERLAY)) kickPng(k);
}
