export const TAU = Math.PI * 2;

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function invLerp(a: number, b: number, v: number): number {
  if (b === a) return 0;
  return clamp((v - a) / (b - a), 0, 1);
}

export function smoothstep(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

export function len(x: number, y: number): number {
  return Math.hypot(x, y);
}

export function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

export function norm(x: number, y: number): { x: number; y: number } {
  const l = Math.hypot(x, y);
  if (l < 1e-8) return { x: 0, y: 0 };
  return { x: x / l, y: y / l };
}

export function angTo(ax: number, ay: number, bx: number, by: number): number {
  return Math.atan2(by - ay, bx - ax);
}

export function angNorm(a: number): number {
  let r = a % TAU;
  if (r > Math.PI) r -= TAU;
  if (r < -Math.PI) r += TAU;
  return r;
}

export function angDiff(a: number, b: number): number {
  return angNorm(b - a);
}

export function lerpAng(a: number, b: number, t: number): number {
  return a + angDiff(a, b) * t;
}

export function inArc(
  ox: number,
  oy: number,
  facing: number,
  tx: number,
  ty: number,
  range: number,
  halfArc: number,
): boolean {
  const dx = tx - ox;
  const dy = ty - oy;
  const d = Math.hypot(dx, dy);
  if (d > range || d < 0.01) return d <= range && d < 0.01 ? true : d <= range && Math.abs(angDiff(facing, Math.atan2(dy, dx))) <= halfArc;
  return Math.abs(angDiff(facing, Math.atan2(dy, dx))) <= halfArc;
}

export function circleHit(
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number,
): boolean {
  const r = ar + br;
  return (ax - bx) * (ax - bx) + (ay - by) * (ay - by) <= r * r;
}

export function aabbOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function id2(prefix: string, n: number): string {
  return `${prefix}_${n.toString(36)}`;
}
