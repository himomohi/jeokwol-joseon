/**
 * FINAL Joseon locked-16. Product-owner lock — do not add swatches.
 * Pillars: silhouette ID first; low-sat env; blood_main/hot + torch only for
 * life / VFX / UI / light; no #000 outlines (neighbor swatches);
 * Joseon hats / cheollik / armor; readable with post OFF.
 * Key light: northwest (canvas −x, −y).
 */
export const LOCKED_16 = [
  "#0B0A14", // 00 bg_void
  "#162033", // 01 shadow_navy
  "#243552", // 02 env_mid
  "#3D5278", // 03 env_cool
  "#6E6256", // 04 earth_dark
  "#B5A48C", // 05 earth_mid
  "#EDE4D4", // 06 bone_light
  "#3F0A12", // 07 blood_deep
  "#8A1220", // 08 blood_mid
  "#C41E3A", // 09 blood_main (char / VFX / UI only)
  "#F24555", // 10 blood_hot (char / VFX / UI only)
  "#8A6414", // 11 metal_dark
  "#E0A81C", // 12 torch_warm (light / UI)
  "#F0C86A", // 13 torch_hot (light / UI)
  "#2F5A48", // 14 moss_cool
  "#6A7380", // 15 ui_steel
] as const;

export type PalHex = (typeof LOCKED_16)[number];

export const PAL_NAMES = [
  "bg_void",
  "shadow_navy",
  "env_mid",
  "env_cool",
  "earth_dark",
  "earth_mid",
  "bone_light",
  "blood_deep",
  "blood_mid",
  "blood_main",
  "blood_hot",
  "metal_dark",
  "torch_warm",
  "torch_hot",
  "moss_cool",
  "ui_steel",
] as const;

export type PalName = (typeof PAL_NAMES)[number];

export const PAL = {
  bg_void: LOCKED_16[0],
  shadow_navy: LOCKED_16[1],
  env_mid: LOCKED_16[2],
  env_cool: LOCKED_16[3],
  earth_dark: LOCKED_16[4],
  earth_mid: LOCKED_16[5],
  bone_light: LOCKED_16[6],
  blood_deep: LOCKED_16[7],
  blood_mid: LOCKED_16[8],
  blood_main: LOCKED_16[9],
  blood_hot: LOCKED_16[10],
  metal_dark: LOCKED_16[11],
  torch_warm: LOCKED_16[12],
  torch_hot: LOCKED_16[13],
  moss_cool: LOCKED_16[14],
  ui_steel: LOCKED_16[15],
} as const;

export const PAL_INDEX: PalHex[] = [...LOCKED_16];

export const PALETTE_LOCKED = true;

/** Low-sat env + metal / moss / steel. No blood (07–10), no torch (12–13). */
export const ENV_INDEX = [0, 1, 2, 3, 4, 5, 6, 11, 14, 15];

/** Character / life / VFX / UI crimson. */
export const LIFE_INDEX = [7, 8, 9, 10];

/** Torch — light and UI only. */
export const TORCH_INDEX = [12, 13];

/** Northwest in canvas space (x right, y down). */
export const KEY_LIGHT_DIR = Object.freeze({ x: -0.68, y: -0.52 });

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function parseHex(hex: string): Rgb {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return {
    r: parseInt(n.slice(0, 2), 16) || 0,
    g: parseInt(n.slice(2, 4), 16) || 0,
    b: parseInt(n.slice(4, 6), 16) || 0,
  };
}

export function lum(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export function distRgb(a: string, b: string): number {
  const A = parseHex(a);
  const B = parseHex(b);
  const dr = A.r - B.r;
  const dg = A.g - B.g;
  const db = A.b - B.b;
  return dr * dr + dg * dg + db * db;
}

export function rgba(hex: string, a: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r},${g},${b},${a})`;
}

export function mixRgb(a: string, b: string, t: number): Rgb {
  const A = parseHex(a);
  const B = parseHex(b);
  const u = Number.isFinite(t) ? Math.max(0, Math.min(1, t)) : 0;
  return {
    r: A.r + (B.r - A.r) * u,
    g: A.g + (B.g - A.g) * u,
    b: A.b + (B.b - A.b) * u,
  };
}

export function rgbToHex(c: Rgb): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}

export function mixHex(a: string, b: string, t: number): string {
  return rgbToHex(mixRgb(a, b, t));
}

export function mixWeighted(parts: ReadonlyArray<{ hex: string; w: number }>): string {
  let r = 0;
  let g = 0;
  let b = 0;
  let wsum = 0;
  for (const p of parts) {
    const w = Number.isFinite(p.w) && p.w > 0 ? p.w : 0;
    if (!w) continue;
    const c = parseHex(p.hex);
    r += c.r * w;
    g += c.g * w;
    b += c.b * w;
    wsum += w;
  }
  if (wsum <= 1e-8) return PAL.env_mid;
  return rgbToHex({ r: r / wsum, g: g / wsum, b: b / wsum });
}

export function nearestPal(hex: string, set: number[] = PAL_INDEX.map((_, i) => i)): string {
  let best = PAL_INDEX[set[0] ?? 0]!;
  let bd = Infinity;
  for (const i of set) {
    const c = PAL_INDEX[i]!;
    const d = distRgb(hex, c);
    if (d < bd) {
      bd = d;
      best = c;
    }
  }
  return best;
}

export function snapEnv(hex: string): string {
  return nearestPal(hex, ENV_INDEX);
}

export function snapLife(hex: string): string {
  return nearestPal(hex);
}

/** Darker (or adjacent) palette neighbor for strokes. Never #000. */
export function neighborStroke(fill: string): string {
  const L = lum(fill);
  const others = PAL_INDEX.filter((c) => c.toLowerCase() !== fill.toLowerCase());
  const darker = others.filter((c) => lum(c) < L - 2);
  const pool = (darker.length ? darker : others).slice().sort((a, b) => distRgb(fill, a) - distRgb(fill, b));
  const best = pool[0] ?? PAL.shadow_navy;
  return isPureBlack(best) ? PAL.bg_void : best;
}

export function neighborLight(fill: string): string {
  const L = lum(fill);
  let best: PalHex = PAL.bone_light;
  let bd = Infinity;
  for (const c of PAL_INDEX) {
    if (lum(c) <= L + 4) continue;
    const d = distRgb(fill, c);
    if (d < bd) {
      bd = d;
      best = c;
    }
  }
  return best;
}

export function isPureBlack(hex: string): boolean {
  const h = hex.replace("#", "").toLowerCase();
  return h === "000" || h === "000000";
}

export function hexKey(hex: string): string {
  return hex.replace("#", "").toLowerCase();
}

export function isPaletteHex(hex: string): boolean {
  if (!hex || hex.startsWith("rgba") || hex.startsWith("rgb(")) return false;
  const k = hexKey(hex);
  return PAL_INDEX.some((c) => hexKey(c) === k);
}

export function isEnvHex(hex: string): boolean {
  const k = hexKey(hex);
  return ENV_INDEX.some((i) => hexKey(PAL_INDEX[i]!) === k);
}

/** CSS theme mapped from the locked 16. Applied at boot so UI cannot drift. */
export const CSS_THEME: Record<string, string> = {
  "--ink": PAL.bg_void,
  "--paper": PAL.bone_light,
  "--gold": PAL.torch_warm,
  "--gold-hot": PAL.torch_hot,
  "--blood": PAL.blood_main,
  "--blood-mid": PAL.blood_mid,
  "--blood-hot": PAL.blood_hot,
  "--blood-deep": PAL.blood_deep,
  "--muted": PAL.ui_steel,
  "--navy": PAL.shadow_navy,
  "--env": PAL.env_mid,
  "--env-cool": PAL.env_cool,
  "--moss": PAL.moss_cool,
  "--earth": PAL.earth_dark,
};

export function applyPaletteCss(root?: HTMLElement | null): void {
  const el = root ?? (typeof document !== "undefined" ? document.documentElement : null);
  if (!el) return;
  for (const [k, v] of Object.entries(CSS_THEME)) el.style.setProperty(k, v);
  el.style.setProperty("--panel", rgba(PAL.bg_void, 0.86));
  el.style.setProperty("--line", rgba(PAL.torch_warm, 0.45));
}
