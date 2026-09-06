import { JOBS } from "../content/jobs";
import { itemById } from "../content/items";
import type { Actor } from "../world/sim";
import type { PlayerMeta } from "../world/sim";
import { ellipse, fillStroke, matOf } from "./materials";
import { joint, poseOf } from "./poses";
import { drawHat, drawWeaponForm } from "./forms";

export interface DrawVis {
  robe: string;
  hat: string;
  weaponForm: string;
  weaponTint: string;
  weaponMat: string;
  armorTint?: string;
  horse: boolean;
}

export function visFrom(meta: PlayerMeta | null, actor: Actor): DrawVis {
  if (actor.kind !== "player" || !meta) {
    return { robe: "#3a2416", hat: "none", weaponForm: "sword", weaponTint: "#8a9399", weaponMat: "iron", horse: false };
  }
  const job = JOBS[meta.job];
  let weaponForm = weaponDefault(job.weapon);
  let weaponTint = "#8a9399";
  let weaponMat = "iron";
  const winst = meta.equip.weapon ? meta.inventory.find((i) => i.instId === meta.equip.weapon) : undefined;
  const w = winst ? itemById(winst.itemId) : undefined;
  if (w?.visual) {
    weaponForm = w.visual.form;
    weaponTint = w.visual.tint;
    weaponMat = w.visual.material;
  }
  const chest = meta.equip.chest ? itemById(meta.inventory.find((i) => i.instId === meta.equip.chest)?.itemId ?? "") : undefined;
  const helm = meta.equip.helm ? itemById(meta.inventory.find((i) => i.instId === meta.equip.helm)?.itemId ?? "") : undefined;
  return {
    robe: chest?.visual.tint ?? job.robe,
    hat: helm?.visual.form ?? job.hat,
    weaponForm,
    weaponTint,
    weaponMat,
    armorTint: chest?.visual.tint,
    horse: job.base === "gibyeong",
  };
}

function weaponDefault(t: string): string {
  if (t === "bow") return "bow";
  if (t === "spear") return "spear";
  if (t === "dagger") return "dagger";
  if (t === "talisman") return "talisman";
  if (t === "staff") return "staff";
  return "sword";
}

export function drawPlayer(ctx: CanvasRenderingContext2D, actor: Actor, vis: DrawVis, moving: boolean): void {
  const pose = poseOf(moving, actor.walkPhase, actor.attackAnim > 0);
  ctx.save();
  ctx.rotate(actor.facing + Math.PI / 2);
  if (actor.flash > 0) ctx.globalAlpha = 0.55 + Math.sin(actor.flash * 40) * 0.3;

  if (vis.horse) {
    ellipse(ctx, 0, 6, 16, 10, matOf("leather", "#3a2416"));
    ellipse(ctx, 12, 4, 7, 5, matOf("leather", "#3a2416"));
  }

  const hip = joint(pose, "hip");
  ctx.translate(hip.x, hip.y);
  ellipse(ctx, 0, 10, 5, 7, matOf("cotton", "#2a1a14"));
  ellipse(ctx, 6, 12, 4, 6, matOf("cotton", "#2a1a14"));

  const torso = joint(pose, "torso");
  ctx.save();
  ctx.translate(torso.x, torso.y);
  ctx.rotate(torso.rot);
  ctx.beginPath();
  ctx.moveTo(-9, 4);
  ctx.lineTo(-7, -12);
  ctx.lineTo(7, -12);
  ctx.lineTo(9, 4);
  ctx.closePath();
  fillStroke(ctx, matOf("silk", vis.robe));
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(0, 4);
  ctx.strokeStyle = "#e8dcc0";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  const armR = joint(pose, "armR");
  ellipse(ctx, armR.x, armR.y, 3.2, 7, matOf("skin"), armR.rot);
  const wj = joint(pose, "weapon");
  ctx.save();
  ctx.translate(wj.x, wj.y);
  ctx.rotate(wj.rot);
  drawWeaponForm(ctx, vis.weaponForm, vis.weaponTint, vis.weaponMat, 0.9);
  ctx.restore();

  const armL = joint(pose, "armL");
  ellipse(ctx, armL.x, armL.y, 3.2, 7, matOf("skin"), armL.rot);

  const head = joint(pose, "head");
  ellipse(ctx, head.x, head.y, 7, 7.5, matOf("skin"));
  ctx.fillStyle = "#1a1210";
  ctx.beginPath();
  ctx.arc(head.x, head.y - 3, 7, Math.PI, Math.PI * 2);
  ctx.fill();

  const hat = joint(pose, "hat");
  ctx.save();
  ctx.translate(hat.x, hat.y);
  ctx.rotate(hat.rot);
  drawHat(ctx, vis.hat, matOf("horsehair"));
  ctx.restore();

  ctx.restore();
}

export function drawEnemy(ctx: CanvasRenderingContext2D, actor: Actor): void {
  ctx.save();
  ctx.rotate(actor.facing + Math.PI / 2);
  if (actor.flash > 0) ctx.filter = "brightness(1.8)";
  const art = actor.art;
  const g = actor.grade === "sang" ? 1.18 : actor.grade === "jung" ? 1.08 : 1;
  ctx.scale(g, g);

  if (art.startsWith("tiger")) {
    ellipse(ctx, 0, 0, 16, 9, matOf("leather", art.includes("white") ? "#e8e4d8" : art.includes("blood") ? "#8b1520" : "#c45a20"));
    ellipse(ctx, 14, -4, 8, 6, matOf("leather", "#c45a20"));
    ctx.fillStyle = "#1a1210";
    for (let i = -8; i <= 8; i += 5) {
      ctx.fillRect(i, -6, 2, 10);
    }
    ellipse(ctx, -12, 4, 4, 3, matOf("leather", "#c45a20"));
  } else if (art === "wolf" || art === "boar" || art === "bear" || art === "goat" || art === "beast") {
    const c = art === "bear" ? "#3a2416" : art === "boar" ? "#5a3a22" : "#4a3a32";
    ellipse(ctx, 0, 0, art === "bear" ? 16 : 12, 8, matOf("leather", c));
    ellipse(ctx, 11, -3, 6, 5, matOf("leather", c));
  } else if (art.startsWith("dokkaebi") || art === "will_o") {
    ellipse(ctx, 0, -2, 8, 11, matOf("silk", art.includes("iron") ? "#6a7078" : "#2a6a3a"));
    ctx.beginPath();
    ctx.moveTo(-6, -12);
    ctx.lineTo(-10, -20);
    ctx.lineTo(-2, -12);
    ctx.moveTo(6, -12);
    ctx.lineTo(10, -20);
    ctx.lineTo(2, -12);
    ctx.fillStyle = "#e8dcc0";
    ctx.fill();
    if (art === "will_o") {
      ctx.shadowColor = "#ffaa44";
      ctx.shadowBlur = 12;
      ellipse(ctx, 0, 0, 7, 7, matOf("silk", "#ffaa44"));
    }
  } else if (art === "gumiho" || art === "gumiho_lady" || art === "fox") {
    ellipse(ctx, 0, 0, 9, 12, matOf("silk", "#c47840"));
    for (let i = 0; i < (art.includes("gumiho") ? 5 : 1); i++) {
      ellipse(ctx, -8 - i, 6 + i * 2, 4, 10, matOf("silk", "#c47840"), 0.6 + i * 0.15);
    }
    ellipse(ctx, 0, -14, 6, 6, matOf("skin"));
  } else if (art === "ghost" || art === "ghost_long" || art === "spirit") {
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(-8, 12);
    ctx.quadraticCurveTo(-12, -8, 0, -14);
    ctx.quadraticCurveTo(12, -8, 8, 12);
    ctx.closePath();
    fillStroke(ctx, matOf("silk", "#c8d0e8"));
  } else if (art === "gangsi" || art === "skel" || art === "reaper") {
    ellipse(ctx, 0, 0, 8, 13, matOf("cotton", art === "reaper" ? "#1a1a22" : "#d0c8b0"));
    ellipse(ctx, 0, -14, 6, 6, matOf("bone"));
  } else if (art === "soldier" || art === "soldier_bow" || art === "officer" || art === "cavalry" || art.includes("bandit")) {
    ellipse(ctx, 0, 2, 8, 12, matOf("silk", art.includes("officer") ? "#4a1a20" : art.includes("bandit") ? "#3a3228" : "#2a3a28"));
    ellipse(ctx, 0, -12, 6.5, 7, matOf("skin"));
    drawHat(ctx, art === "cavalry" || art === "officer" ? "jeonrip" : art.includes("bandit") ? "gat" : "jeonrip", matOf("horsehair"));
    if (art === "cavalry") ellipse(ctx, 0, 10, 14, 8, matOf("leather"));
  } else if (art === "croc" || art === "imugi" || art === "imugi_king") {
    ellipse(ctx, 0, 0, 18, 8, matOf("jade", "#2a5a32"));
    ellipse(ctx, 16, -2, 8, 5, matOf("jade", "#2a5a32"));
  } else if (art === "statue" || art === "mask" || art === "bell" || art === "lantern" || art === "abbot") {
    ellipse(ctx, 0, 0, 10, 14, matOf("stone" in {} ? "iron" : "iron", "#6a6058"));
    ellipse(ctx, 0, -14, 7, 7, matOf("stone" as string, "#8a8078"));
  } else if (art === "witch") {
    ellipse(ctx, 0, 0, 8, 13, matOf("silk", "#3a6b28"));
    ellipse(ctx, 0, -14, 6, 6, matOf("skin"));
  } else if (art === "bird") {
    ellipse(ctx, 0, 0, 8, 5, matOf("hair"));
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(0, -4);
    ctx.lineTo(12, 0);
    ctx.fill();
  } else if (art === "snake" || art === "bug" || art === "rat") {
    ellipse(ctx, 0, 0, art === "snake" ? 12 : 6, 4, matOf("leather", "#3a6b28"));
  } else {
    ellipse(ctx, 0, 0, 8, 12, matOf("cotton", "#4a3020"));
    ellipse(ctx, 0, -12, 6, 6, matOf("skin"));
  }
  ctx.filter = "none";
  ctx.restore();
}

export function drawNpc(ctx: CanvasRenderingContext2D, actor: Actor): void {
  ctx.save();
  ctx.rotate(0.2);
  ellipse(ctx, 0, 2, 8, 12, matOf("silk", actor.art === "npc_trainer" ? "#4a1a20" : actor.art === "npc_shop" ? "#5a4a20" : "#3a3a40"));
  ellipse(ctx, 0, -12, 6.5, 7, matOf("skin"));
  drawHat(ctx, actor.art === "npc_trainer" ? "gat" : "manggeon", matOf("horsehair"));
  ctx.restore();
}

export function drawShadow(ctx: CanvasRenderingContext2D, r: number): void {
  ctx.save();
  ctx.scale(1, 0.45);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fill();
  ctx.restore();
}
