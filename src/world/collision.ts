export interface Solid {
  x: number;
  y: number;
  r: number;
  door?: boolean;
}

export function pushOut(nx: number, ny: number, radius: number, solids: Solid[]): { x: number; y: number } {
  let x = nx;
  let y = ny;
  for (const s of solids) {
    const dx = x - s.x;
    const dy = y - s.y;
    const d = Math.hypot(dx, dy);
    const min = radius + s.r;
    if (d < min && d > 0.001) {
      if (s.door && y > s.y) continue;
      const k = (min - d) / d;
      x += dx * k;
      y += dy * k;
    }
  }
  return { x, y };
}
