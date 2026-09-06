import { KEY_LIGHT_DIR, PAL, isPureBlack, nearestPal, neighborLight, neighborStroke, rgba, snapEnv } from "./palette";

export interface Mat {
  fill: string;
  stroke: string;
  sheen?: string;
}

export const MAT: Record<string, Mat> = {
  silk: { fill: PAL.blood_mid, stroke: PAL.blood_deep, sheen: PAL.blood_hot },
  cotton: { fill: PAL.earth_dark, stroke: PAL.shadow_navy },
  leather: { fill: PAL.earth_dark, stroke: PAL.shadow_navy },
  iron: { fill: PAL.ui_steel, stroke: PAL.shadow_navy, sheen: PAL.bone_light },
  steel: { fill: PAL.ui_steel, stroke: PAL.env_mid, sheen: PAL.bone_light },
  bloodsteel: { fill: PAL.blood_main, stroke: PAL.blood_deep, sheen: PAL.blood_hot },
  wood: { fill: PAL.earth_dark, stroke: PAL.shadow_navy },
  paper: { fill: PAL.bone_light, stroke: PAL.blood_deep },
  bone: { fill: PAL.bone_light, stroke: PAL.earth_dark },
  jade: { fill: PAL.moss_cool, stroke: PAL.env_mid },
  horn: { fill: PAL.earth_dark, stroke: PAL.shadow_navy },
  felt: { fill: PAL.earth_dark, stroke: PAL.shadow_navy },
  horsehair: { fill: PAL.shadow_navy, stroke: PAL.env_mid },
  straw: { fill: PAL.earth_mid, stroke: PAL.earth_dark },
  lacquer: { fill: PAL.blood_mid, stroke: PAL.blood_deep, sheen: PAL.torch_warm },
  ceramic: { fill: PAL.earth_mid, stroke: PAL.earth_dark },
  skin: { fill: PAL.earth_mid, stroke: PAL.earth_dark },
  hair: { fill: PAL.bg_void, stroke: PAL.shadow_navy },
  stone: { fill: PAL.env_mid, stroke: PAL.shadow_navy, sheen: PAL.ui_steel },
};

export function matOf(id: string, tint?: string): Mat {
  const m = MAT[id] ?? MAT.cotton!;
  const fill = nearestPal(tint ?? m.fill);
  return {
    fill,
    stroke: neighborStroke(fill),
    sheen: m.sheen ?? neighborLight(fill),
  };
}

/** World / prop fills — never blood_main/hot or torch. */
export function matEnv(id: string, tint?: string): Mat {
  const m = MAT[id] ?? MAT.cotton!;
  const fill = snapEnv(tint ?? m.fill);
  return {
    fill,
    stroke: neighborStroke(fill),
    sheen: neighborLight(fill),
  };
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function safeStroke(hex: string): string {
  const raw = neighborStroke(hex);
  return isPureBlack(raw) ? PAL.shadow_navy : raw;
}

export function fillStroke(ctx: CanvasRenderingContext2D, m: Mat, lw = 1.4): void {
  const stroke = safeStroke(m.fill);
  ctx.fillStyle = m.fill;
  ctx.fill();
  const sheen = m.sheen ?? neighborLight(m.fill);
  ctx.save();
  ctx.clip();
  const g = ctx.createLinearGradient(KEY_LIGHT_DIR.x * 30, KEY_LIGHT_DIR.y * 30, -KEY_LIGHT_DIR.x * 18, -KEY_LIGHT_DIR.y * 16);
  g.addColorStop(0, rgba(sheen, 0.34));
  g.addColorStop(0.5, rgba(sheen, 0));
  ctx.fillStyle = g;
  ctx.fillRect(-72, -72, 144, 144);
  ctx.restore();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
}

export function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, m: Mat, rot = 0): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  fillStroke(ctx, m);
  ctx.restore();
}

export function poly(ctx: CanvasRenderingContext2D, pts: ReadonlyArray<readonly [number, number]>, m: Mat, lw = 1.4): void {
  if (pts.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(pts[0]![0], pts[0]![1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]![0], pts[i]![1]);
  ctx.closePath();
  fillStroke(ctx, m, lw);
}

export function quadCurve(
  ctx: CanvasRenderingContext2D,
  pts: ReadonlyArray<readonly [number, number]>,
  m: Mat,
  lw = 1.4,
): void {
  if (pts.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(pts[0]![0], pts[0]![1]);
  for (let i = 1; i < pts.length - 1; i += 2) {
    const c = pts[i]!;
    const p = pts[i + 1] ?? pts[pts.length - 1]!;
    ctx.quadraticCurveTo(c[0], c[1], p[0], p[1]);
  }
  ctx.closePath();
  fillStroke(ctx, m, lw);
}

/** Joint limb: rounded capsule from (x1,y1) to (x2,y2). */
export function capsule(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: number,
  m: Mat,
): void {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  ctx.beginPath();
  ctx.moveTo(x1 + nx * r, y1 + ny * r);
  ctx.lineTo(x2 + nx * r, y2 + ny * r);
  ctx.arc(x2, y2, r, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI);
  ctx.lineTo(x1 - nx * r, y1 - ny * r);
  ctx.arc(x1, y1, r, Math.atan2(-ny, -nx), Math.atan2(ny, nx));
  ctx.closePath();
  fillStroke(ctx, m, 1.2);
}

export function horn(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tipX: number,
  tipY: number,
  w: number,
  m: Mat,
): void {
  const dx = tipX - x;
  const dy = tipY - y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * w;
  const ny = (dx / len) * w;
  poly(ctx, [
    [x + nx, y + ny],
    [tipX, tipY],
    [x - nx, y - ny],
  ], m, 1.1);
}
