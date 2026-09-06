import { JOBS } from "../content/jobs";
import { itemById } from "../content/items";
import type { Actor } from "../world/sim";
import type { PlayerMeta } from "../world/sim";
import { PAL, neighborStroke, rgba } from "./palette";
import { ellipse, fillStroke, matOf } from "./materials";
import { joint, poseOf } from "./poses";
import { drawHat, drawWeaponForm } from "./forms";

export interface DrawVis {
  robe: string;
  hat: string;
  weaponForm: string;
  weaponTint: string;
  weaponMat: string;
  armorKind: "robe" | "armor";
  horse: boolean;
}

export function visFrom(meta: PlayerMeta | null, actor: Actor): DrawVis {
  if (actor.kind !== "player" || !meta) {
    return { robe: PAL.earth_dark, hat: "none", weaponForm: "sword", weaponTint: PAL.ui_steel, weaponMat: "iron", armorKind: "robe", horse: false };
  }
  const job = JOBS[meta.job];
  let weaponForm = weaponDefault(job.weapon);
  let weaponTint: string = PAL.ui_steel;
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
    armorKind: chest?.visual.form === "armor" ? "armor" : "robe",
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
    ellipse(ctx, 0, 7, 17, 10, matOf("leather"));
    ellipse(ctx, 13, 4, 7, 5, matOf("leather"));
  }

  const hip = joint(pose, "hip");
  ctx.translate(hip.x, hip.y);
  ellipse(ctx, -3, 11, 5, 7, matOf("cotton"));
  ellipse(ctx, 6, 12, 4.2, 6, matOf("cotton"));

  const torso = joint(pose, "torso");
  ctx.save();
  ctx.translate(torso.x, torso.y);
  ctx.rotate(torso.rot);
  drawTorso(ctx, vis.robe, vis.armorKind);
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
  ellipse(ctx, head.x, head.y - 3, 7, 4, matOf("hair"));

  const hat = joint(pose, "hat");
  ctx.save();
  ctx.translate(hat.x, hat.y);
  ctx.rotate(hat.rot);
  drawHat(ctx, vis.hat, matOf("horsehair"));
  ctx.restore();

  ctx.restore();
}

function drawTorso(ctx: CanvasRenderingContext2D, robe: string, kind: "robe" | "armor"): void {
  ctx.beginPath();
  if (kind === "armor") {
    ctx.moveTo(-11, 7);
    ctx.lineTo(-13, -8);
    ctx.lineTo(-6, -13);
    ctx.lineTo(7, -13);
    ctx.lineTo(13, -8);
    ctx.lineTo(12, 7);
    ctx.closePath();
    fillStroke(ctx, matOf("steel", robe));
    ctx.strokeStyle = neighborStroke(robe);
    ctx.lineWidth = 1;
    for (let y = -8; y <= 4; y += 4) {
      ctx.beginPath();
      ctx.moveTo(-10, y);
      ctx.lineTo(10, y);
      ctx.stroke();
    }
  } else {
    ctx.moveTo(-12, 10);
    ctx.lineTo(-7.5, -12);
    ctx.lineTo(8, -12);
    ctx.lineTo(13, 10);
    ctx.closePath();
    fillStroke(ctx, matOf("silk", robe));
    ctx.strokeStyle = PAL.bone_light;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(0, 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.lineTo(8, -8);
    ctx.stroke();
  }
}

function drawJoseonHuman(ctx: CanvasRenderingContext2D, robe: string, hat: string, kind: "robe" | "armor" = "robe"): void {
  drawTorso(ctx, robe, kind);
  ellipse(ctx, 0, -13, 6.5, 7, matOf("skin"));
  drawHat(ctx, hat, matOf("horsehair"));
}

export function drawEnemy(ctx: CanvasRenderingContext2D, actor: Actor): void {
  ctx.save();
  ctx.rotate(actor.facing + Math.PI / 2);
  if (actor.flash > 0) ctx.filter = "brightness(1.8)";
  const art = actor.art;
  const g = actor.grade === "sang" ? 1.18 : actor.grade === "jung" ? 1.08 : 1;
  ctx.scale(g, g);

  if (art.startsWith("tiger")) {
    const fur = art.includes("white") ? PAL.bone_light : art.includes("blood") ? PAL.blood_mid : PAL.earth_dark;
    ellipse(ctx, 0, 0, 16, 9, matOf("leather", fur));
    ellipse(ctx, 14, -4, 8, 6, matOf("leather", fur));
    ctx.fillStyle = PAL.shadow_navy;
    for (let i = -8; i <= 8; i += 5) ctx.fillRect(i, -6, 2, 10);
    ellipse(ctx, -12, 4, 4, 3, matOf("leather", fur));
  } else if (art === "wolf" || art === "boar" || art === "bear" || art === "goat" || art === "beast") {
    const c = art === "bear" ? PAL.earth_dark : art === "boar" ? PAL.earth_mid : PAL.shadow_navy;
    ellipse(ctx, 0, 0, art === "bear" ? 16 : 12, 8, matOf("leather", c));
    ellipse(ctx, 11, -3, 6, 5, matOf("leather", c));
  } else if (art.startsWith("dokkaebi") || art === "will_o") {
    ellipse(ctx, 0, -2, 8, 11, matOf("silk", art.includes("iron") ? PAL.ui_steel : PAL.moss_cool));
    ctx.beginPath();
    ctx.moveTo(-6, -12);
    ctx.lineTo(-10, -20);
    ctx.lineTo(-2, -12);
    ctx.moveTo(6, -12);
    ctx.lineTo(10, -20);
    ctx.lineTo(2, -12);
    ctx.fillStyle = PAL.bone_light;
    ctx.fill();
    if (art === "will_o") {
      ctx.shadowColor = PAL.torch_hot;
      ctx.shadowBlur = 12;
      ellipse(ctx, 0, 0, 7, 7, matOf("silk", PAL.torch_hot));
    }
  } else if (art === "gumiho" || art === "gumiho_lady" || art === "fox") {
    const fur = art === "gumiho_lady" ? PAL.blood_mid : PAL.earth_mid;
    ellipse(ctx, 0, 0, 9, 12, matOf("silk", fur));
    for (let i = 0; i < (art.includes("gumiho") ? 5 : 1); i++) {
      ellipse(ctx, -8 - i, 6 + i * 2, 4, 10, matOf("silk", fur), 0.6 + i * 0.15);
    }
    ellipse(ctx, 0, -14, 6, 6, matOf("skin"));
  } else if (art === "ghost" || art === "ghost_long" || art === "spirit") {
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(-8, 12);
    ctx.quadraticCurveTo(-12, -8, 0, -14);
    ctx.quadraticCurveTo(12, -8, 8, 12);
    ctx.closePath();
    fillStroke(ctx, matOf("silk", PAL.ui_steel));
  } else if (art === "gangsi" || art === "skel" || art === "reaper") {
    ellipse(ctx, 0, 0, 8, 13, matOf("cotton", art === "reaper" ? PAL.bg_void : PAL.bone_light));
    ellipse(ctx, 0, -14, 6, 6, matOf("bone"));
    if (art === "reaper") drawHat(ctx, "songnak", matOf("horsehair"));
  } else if (art === "soldier" || art === "soldier_bow" || art === "officer" || art === "cavalry" || art.includes("bandit")) {
    const robe = art.includes("officer") ? PAL.blood_mid : art.includes("bandit") ? PAL.earth_dark : PAL.moss_cool;
    const hat = art === "cavalry" || art === "officer" ? "jeonrip" : art.includes("bandit") ? "gat" : "jeonrip";
    const kind = art === "officer" || art === "soldier" || art === "soldier_bow" ? "armor" : "robe";
    drawJoseonHuman(ctx, robe, hat, kind);
    if (art === "cavalry") ellipse(ctx, 0, 10, 14, 8, matOf("leather"));
  } else if (art === "croc" || art === "imugi" || art === "imugi_king") {
    ellipse(ctx, 0, 0, 18, 8, matOf("jade", PAL.moss_cool));
    ellipse(ctx, 16, -2, 8, 5, matOf("jade", PAL.moss_cool));
  } else if (art === "statue" || art === "mask" || art === "bell" || art === "lantern" || art === "abbot") {
    ellipse(ctx, 0, 0, 10, 14, matOf("iron", PAL.earth_dark));
    ellipse(ctx, 0, -14, 7, 7, matOf("iron", PAL.earth_mid));
    if (art === "abbot") drawHat(ctx, "songnak", matOf("silk", PAL.earth_dark));
  } else if (art === "witch") {
    drawJoseonHuman(ctx, PAL.moss_cool, "songnak");
  } else if (art === "bird") {
    ellipse(ctx, 0, 0, 8, 5, matOf("hair"));
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(0, -4);
    ctx.lineTo(12, 0);
    ctx.fillStyle = PAL.shadow_navy;
    ctx.fill();
  } else if (art === "snake" || art === "bug" || art === "rat") {
    ellipse(ctx, 0, 0, art === "snake" ? 12 : 6, 4, matOf("leather", PAL.moss_cool));
  } else {
    drawJoseonHuman(ctx, PAL.earth_dark, "gat");
  }
  ctx.filter = "none";
  ctx.restore();
}

export function drawNpc(ctx: CanvasRenderingContext2D, actor: Actor): void {
  ctx.save();
  ctx.rotate(0.15);
  const robe = actor.art === "npc_trainer" ? PAL.blood_mid : actor.art === "npc_shop" ? PAL.earth_mid : PAL.earth_dark;
  const hat = actor.art === "npc_shop" ? "manggeon" : "gat";
  drawJoseonHuman(ctx, robe, hat);
  ctx.restore();
}

export function drawShadow(ctx: CanvasRenderingContext2D, r: number): void {
  ctx.save();
  ctx.scale(1, 0.45);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PAL.bg_void, 0.42);
  ctx.fill();
  ctx.restore();
}
