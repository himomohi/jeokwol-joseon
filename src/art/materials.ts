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

export function fillStroke(ctx: CanvasRenderingContext2D, m: Mat, lw = 1.4): void {
  const raw = neighborStroke(m.fill);
  const stroke = isPureBlack(raw) ? PAL.shadow_navy : raw;
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
