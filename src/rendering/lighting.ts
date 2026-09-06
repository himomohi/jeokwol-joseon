import { KEY_LIGHT_DIR, PAL, rgba } from "../art/palette";

export interface Light {
  x: number;
  y: number;
  r: number;
  color: string;
  intensity: number;
}

export function drawLighting(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  camX: number,
  camY: number,
  zoom: number,
  lights: Light[],
  moon: number,
): void {
  const night = 0.12 + moon * 0.07;
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = rgba(PAL.shadow_navy, night);
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";
  const nw: Light = {
    x: camX + KEY_LIGHT_DIR.x * 340,
    y: camY + KEY_LIGHT_DIR.y * 340,
    r: 980,
    color: rgba(PAL.torch_warm, 0.16),
    intensity: 0.42,
  };
  const all = [nw, ...lights];
  const budget = 18;
  let i = 0;
  for (const L of all) {
    if (i++ >= budget) break;
    const sx = (L.x - camX) * zoom + w * 0.5;
    const sy = (L.y - camY) * zoom + h * 0.5;
    const grd = ctx.createRadialGradient(sx, sy, 4, sx, sy, L.r * zoom);
    grd.addColorStop(0, L.color);
    grd.addColorStop(1, rgba(PAL.bg_void, 0));
    ctx.globalAlpha = L.intensity;
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(sx, sy, L.r * zoom, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}
