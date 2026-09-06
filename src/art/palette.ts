/**
 * Joseon locked-16 working palette (PROPOSAL until user locks).
 * Env stays low-sat. Blood crimson and torch are for life / VFX / UI only.
 * Outlines use a neighbor swatch — never pure #000.
 * Key light comes from the northwest.
 */
export const PAL = {
  bg_void: "#0B0A14",
  shadow_navy: "#162033",
  env_mid: "#243552",
  env_cool: "#3D5278",
  earth_dark: "#6E6256",
  earth_mid: "#B5A48C",
  bone_light: "#EDE4D4",
  blood_deep: "#3F0A12",
  blood_mid: "#8A1220",
  blood_main: "#C41E3A",
  blood_hot: "#F24555",
  metal_dark: "#8A6414",
  torch_warm: "#E0A81C",
  torch_hot: "#F0C86A",
  moss_cool: "#2F5A48",
  ui_steel: "#6A7380",
} as const;

export type PalName = keyof typeof PAL;
export type PalHex = (typeof PAL)[PalName];

export const PAL_INDEX: PalHex[] = [
  PAL.bg_void,
  PAL.shadow_navy,
  PAL.env_mid,
  PAL.env_cool,
  PAL.earth_dark,
  PAL.earth_mid,
  PAL.bone_light,
  PAL.blood_deep,
  PAL.blood_mid,
  PAL.blood_main,
  PAL.blood_hot,
  PAL.metal_dark,
  PAL.torch_warm,
  PAL.torch_hot,
  PAL.moss_cool,
  PAL.ui_steel,
];

/** Low-sat environment + metal/moss/steel. No blood_main/hot, no torch. */
export const ENV_INDEX = [0, 1, 2, 3, 4, 5, 6, 11, 14, 15];

/** Character / life / VFX / UI crimson. */
export const LIFE_INDEX = [7, 8, 9, 10];

/** Torch — light and UI only. */
export const TORCH_INDEX = [12, 13];

/** Northwest in canvas space (x right, y down). */
export const KEY_LIGHT_DIR = { x: -0.68, y: -0.52 };

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

/** CSS theme mapped from the working 16. Applied at boot so UI cannot drift. */
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
