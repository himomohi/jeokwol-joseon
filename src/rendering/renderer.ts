import { PAL, rgba } from "../art/palette";
import type { Camera } from "../core/coords";
import { clamp, lerp } from "../core/math";
import type { Sim } from "../world/sim";
import { interpActor } from "../world/sim";
import { drawEnemy, drawNpc, drawPlayer, drawShadow, visFrom } from "../art/actors";
import { drawChunkGround, drawProp, drawRoof } from "../art/worldArt";
import { groundDropCanvas } from "../art/cache";
import { ParticlePool } from "./particles";
import { drawLighting, type Light } from "./lighting";
import { PostFx } from "./post";

export class Renderer {
  display: HTMLCanvasElement;
  world: HTMLCanvasElement;
  wctx: CanvasRenderingContext2D;
  dctx: CanvasRenderingContext2D | null;
  post: PostFx;
  particles = new ParticlePool();
  cam: Camera = { x: 0, y: 0, zoom: 1.15, w: 800, h: 600 };
  camTx = 0;
  camTy = 0;
  narrow = false;

  constructor(display: HTMLCanvasElement) {
    this.display = display;
    this.world = document.createElement("canvas");
    this.wctx = this.world.getContext("2d", { alpha: false })!;
    this.dctx = display.getContext("2d");
    const glCanvas = document.createElement("canvas");
    this.post = new PostFx(glCanvas);
  }

  resize(cssW: number, cssH: number, dpr: number): void {
    const w = Math.max(320, Math.floor(cssW * dpr));
    const h = Math.max(240, Math.floor(cssH * dpr));
    this.display.width = w;
    this.display.height = h;
    this.world.width = w;
    this.world.height = h;
    this.post.canvas.width = w;
    this.post.canvas.height = h;
    this.cam.w = w;
    this.cam.h = h;
    this.narrow = cssW < 720;
    this.cam.zoom = this.narrow ? 1.15 : 1.48;
  }

  follow(x: number, y: number, dt: number): void {
    this.camTx = x;
    this.camTy = y;
    this.cam.x = lerp(this.cam.x, x, Math.min(1, dt * 8));
    this.cam.y = lerp(this.cam.y, y, Math.min(1, dt * 8));
  }

  draw(sim: Sim, alpha: number): void {
    const ctx = this.wctx;
    const w = this.world.width;
    const h = this.world.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PAL.bg_void;
    ctx.fillRect(0, 0, w, h);

    const p = interpActor(sim.player, alpha);
    this.follow(p.x, p.y, SIM_RENDER_DT);
    ctx.save();
    ctx.translate(w * 0.5, h * 0.5);
    ctx.scale(this.cam.zoom, this.cam.zoom);
    ctx.translate(-this.cam.x, -this.cam.y);

    const chunks = sim.terrain.around(sim.player.x, sim.player.y, sim.time, 2);
    for (const c of chunks) drawChunkGround(ctx, c, sim.seed);

    const drawables: { y: number; z: number; draw: () => void }[] = [];

    for (const c of chunks) {
      for (const pr of c.props) {
        if (pr.def.roof) continue;
        drawables.push({ y: pr.y, z: 0, draw: () => drawProp(ctx, pr) });
      }
    }

    for (const d of sim.drops) {
      drawables.push({
        y: d.y,
        z: 0,
        draw: () => {
          const ic = groundDropCanvas(d.itemId === "gold" ? "gold_pouch" : d.itemId);
          ctx.drawImage(ic, d.x - 12, d.y - 12, 24, 24);
        },
      });
    }

    const vis = visFrom(sim.meta, sim.player);
    const moving = Math.hypot(sim.player.vx, sim.player.vy) > 8;
    drawables.push({
      y: p.y,
      z: 1,
      draw: () => {
        ctx.save();
        ctx.translate(p.x, p.y);
        drawShadow(ctx, 16);
        ctx.scale(1.22, 1.22);
        drawPlayer(ctx, sim.player, vis, moving);
        ctx.restore();
      },
    });

    for (const a of sim.actors) {
      if (a.dead) continue;
      const ip = interpActor(a, alpha);
      drawables.push({
        y: ip.y,
        z: 1,
        draw: () => {
          ctx.save();
          ctx.translate(ip.x, ip.y);
          drawShadow(ctx, a.radius);
          ctx.scale(1.18, 1.18);
          if (a.kind === "npc") drawNpc(ctx, a);
          else drawEnemy(ctx, a);
          ctx.restore();
          if (a.kind === "enemy") {
            const ratio = clamp(a.hp / Math.max(1, a.hpMax), 0, 1);
            ctx.fillStyle = rgba(PAL.shadow_navy, 0.72);
            ctx.fillRect(ip.x - 12, ip.y - a.radius - 10, 24, 4);
            ctx.fillStyle = PAL.blood_main;
            ctx.fillRect(ip.x - 12, ip.y - a.radius - 10, 24 * ratio, 4);
          }
        },
      });
    }

    for (const pr of sim.projectiles) {
      const x = lerp(pr.px, pr.x, alpha);
      const y = lerp(pr.py, pr.y, alpha);
      drawables.push({
        y,
        z: 2,
        draw: () => {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.atan2(pr.vy, pr.vx));
          ctx.fillStyle = pr.team === 0 ? PAL.bone_light : PAL.blood_main;
          ctx.shadowColor = PAL.torch_warm;
          ctx.shadowBlur = 8;
          ctx.fillRect(-8, -2, 12, 4);
          ctx.restore();
        },
      });
    }

    for (const aoe of sim.aoes) {
      drawables.push({
        y: aoe.y,
        z: 0,
        draw: () => {
          ctx.save();
          ctx.strokeStyle = rgba(PAL.blood_main, 0.8);
          ctx.fillStyle = rgba(PAL.blood_deep, 0.18 + Math.max(0, 0.2 - aoe.wait));
          ctx.beginPath();
          ctx.arc(aoe.x, aoe.y, aoe.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        },
      });
    }

    drawables.sort((a, b) => a.y - b.y || a.z - b.z);
    for (const d of drawables) d.draw();

    ctx.save();
    ctx.strokeStyle = rgba(PAL.bone_light, 0.55);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    let first = true;
    for (const t of sim.trails) {
      ctx.globalAlpha = t.a;
      if (first) ctx.moveTo(t.x, t.y);
      else ctx.lineTo(t.x, t.y);
      first = false;
    }
    ctx.stroke();
    ctx.restore();

    this.particles.draw(ctx);

    const roofs: { x: number; y: number; w: number; h: number; alpha: number }[] = [];
    for (const c of chunks) {
      for (const r of c.roofs) {
        const inside = p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h;
        r.alpha = lerp(r.alpha, inside ? 0.18 : 1, 0.12);
        roofs.push(r);
      }
    }
    for (const r of roofs) drawRoof(ctx, r.x, r.y, r.w, r.h, r.alpha);

    ctx.restore();

    const moon = 0.55 + 0.45 * Math.sin(sim.time * 0.04);
    const lights: Light[] = [
      { x: p.x, y: p.y, r: 160, color: rgba(PAL.torch_warm, 0.26), intensity: 0.62 },
    ];
    for (const c of chunks) {
      for (const pr of c.props) {
        if (pr.def.art === "lantern" || pr.def.art === "campfire") {
          lights.push({
            x: pr.x,
            y: pr.y,
            r: pr.def.art === "campfire" ? 90 : 70,
            color: rgba(PAL.torch_hot, 0.32),
            intensity: 0.78,
          });
        }
      }
    }
    drawLighting(ctx, w, h, this.cam.x, this.cam.y, this.cam.zoom, lights, moon);

    const dctx = this.dctx;
    if (!dctx) return;
    dctx.setTransform(1, 0, 0, 1, 0, 0);
    try {
      if (sim.postOn && !this.post.lost && this.post.apply(this.world)) {
        dctx.drawImage(this.post.canvas, 0, 0, w, h);
      } else {
        dctx.drawImage(this.world, 0, 0);
      }
    } catch {
      dctx.drawImage(this.world, 0, 0);
    }
  }
}

const SIM_RENDER_DT = 1 / 60;
