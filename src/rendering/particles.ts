export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  kind: "spark" | "smoke" | "glow" | "leaf" | "blood";
}

export class ParticlePool {
  list: Particle[] = [];
  budget = 280;

  spawn(p: Omit<Particle, "max"> & { max?: number }): void {
    if (this.list.length >= this.budget) this.list.shift();
    this.list.push({ ...p, max: p.max ?? p.life });
  }

  burst(x: number, y: number, kind: string, n = 8): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 20 + Math.random() * 80;
      if (kind === "hit") this.spawn({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.25, size: 2.5, color: "#e8dcc0", kind: "spark" });
      else if (kind === "kill") this.spawn({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, life: 0.45, size: 3, color: "#8b1520", kind: "blood" });
      else if (kind === "heal") this.spawn({ x, y, vx: Math.cos(a) * 10, vy: -30 - Math.random() * 20, life: 0.5, size: 3, color: "#7ad0a0", kind: "glow" });
      else if (kind === "loot") this.spawn({ x, y, vx: Math.cos(a) * 20, vy: -40, life: 0.4, size: 3, color: "#c9a46a", kind: "glow" });
      else if (kind === "dash") this.spawn({ x, y, vx: Math.cos(a) * 30, vy: Math.sin(a) * 30, life: 0.3, size: 4, color: "#c9b48a", kind: "smoke" });
      else this.spawn({ x, y, vx: Math.cos(a) * 40, vy: Math.sin(a) * 40, life: 0.35, size: 3, color: "#c45a40", kind: "glow" });
    }
  }

  step(dt: number): void {
    for (const p of this.list) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.kind === "glow" ? -10 : 40) * dt;
      p.life -= dt;
    }
    this.list = this.list.filter((p) => p.life > 0);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.list) {
      const a = p.life / p.max;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      if (p.kind === "glow") {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.4 + a), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }
}
