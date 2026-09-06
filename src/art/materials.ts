export interface Mat {
  fill: string;
  stroke: string;
  sheen?: string;
}

export const MAT: Record<string, Mat> = {
  silk: { fill: "#8b1520", stroke: "#3a0c12", sheen: "#c45a50" },
  cotton: { fill: "#6a3a28", stroke: "#2a1810" },
  leather: { fill: "#5a3a22", stroke: "#2a1c10" },
  iron: { fill: "#8a9399", stroke: "#2a2e32", sheen: "#c8d0d4" },
  steel: { fill: "#c0c8d0", stroke: "#3a4048", sheen: "#eef2f6" },
  bloodsteel: { fill: "#8b1520", stroke: "#2a060a", sheen: "#e07070" },
  wood: { fill: "#6b4a2a", stroke: "#2a2010" },
  paper: { fill: "#e8dcc0", stroke: "#8b1520" },
  bone: { fill: "#e8dcc0", stroke: "#6a5040" },
  jade: { fill: "#5aaa7a", stroke: "#1a4030" },
  horn: { fill: "#8a6040", stroke: "#3a2818" },
  felt: { fill: "#3a2416", stroke: "#140c08" },
  horsehair: { fill: "#1a1a1a", stroke: "#000" },
  straw: { fill: "#c2a878", stroke: "#5a4030" },
  lacquer: { fill: "#8b2a14", stroke: "#2a0804" },
  ceramic: { fill: "#c9a46a", stroke: "#4a3020" },
  skin: { fill: "#d4a07a", stroke: "#6a4030" },
  hair: { fill: "#1a1210", stroke: "#000" },
};

export function matOf(id: string, tint?: string): Mat {
  const m = MAT[id] ?? MAT.cotton!;
  if (!tint) return m;
  return { ...m, fill: tint };
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
  ctx.fillStyle = m.fill;
  ctx.strokeStyle = m.stroke;
  ctx.lineWidth = lw;
  ctx.fill();
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
