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
  const night = 0.22 + moon * 0.18;
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = `rgba(${30 + moon * 40}, ${12 + moon * 8}, ${18}, ${night})`;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";
  const budget = 18;
  let n = 0;
  for (const L of lights) {
    if (n++ >= budget) break;
    const sx = (L.x - camX) * zoom + w * 0.5;
    const sy = (L.y - camY) * zoom + h * 0.5;
    const grd = ctx.createRadialGradient(sx, sy, 4, sx, sy, L.r * zoom);
    grd.addColorStop(0, L.color);
    grd.addColorStop(1, "rgba(0,0,0,0)");
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
