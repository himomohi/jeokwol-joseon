import { JOBS } from "../content/jobs";
import { itemById } from "../content/items";
import type { Actor } from "../world/sim";
import type { PlayerMeta } from "../world/sim";
import { PAL } from "./palette";
import { capsule, ellipse, fillStroke, horn, matOf, poly, type Mat } from "./materials";
import { rigOf } from "./poses";
import { drawHat, drawItemForm, drawWeaponForm } from "./forms";
import { blitPngOverlay, cachedStatic, pngKeyForJob, pngOverlay } from "./cache";
import { finite } from "./rig";

export interface DrawVis {
  robe: string;
  hat: string;
  weaponForm: string;
  weaponTint: string;
  weaponMat: string;
  armorKind: "robe" | "armor";
  horse: boolean;
  jobId?: string;
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
    jobId: job.id,
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
  const rig = rigOf(moving, actor.walkPhase, actor.attackAnim, vis.weaponForm);
  ctx.save();
  ctx.rotate(finite(actor.facing) + Math.PI / 2);
  if (actor.flash > 0) ctx.globalAlpha = 0.55 + Math.sin(actor.flash * 40) * 0.3;

  if (vis.horse) {
    const horse = cachedStatic("horse", 56, 40, drawHorse);
    ctx.drawImage(horse, -28, -4, 56, 40);
  }

  const silk = matOf("silk", vis.robe);
  const skin = matOf("skin");

  drawBaji(ctx, rig.footL.x, rig.footL.y, Math.atan2(rig.footL.y - rig.kneeL.y, rig.footL.x - rig.kneeL.x) - Math.PI / 2, matOf("cotton", PAL.earth_dark));
  drawBaji(ctx, rig.footR.x, rig.footR.y, Math.atan2(rig.footR.y - rig.kneeR.y, rig.footR.x - rig.kneeR.x) - Math.PI / 2, matOf("cotton", PAL.shadow_navy));

  ctx.save();
  ctx.translate(rig.torso.x, rig.torso.y);
  ctx.rotate(rig.torsoRot);
  const torsoC = cachedStatic(`torso:${vis.robe}:${vis.armorKind}`, 48, 52, (c) => drawTorso(c, vis.robe, vis.armorKind));
  ctx.drawImage(torsoC, -24, -26, 48, 52);
  ctx.restore();

  capsule(ctx, rig.shoulderL.x, rig.shoulderL.y, rig.elbowL.x, rig.elbowL.y, 2.3, silk);
  capsule(ctx, rig.elbowL.x, rig.elbowL.y, rig.handL.x, rig.handL.y, 2.1, silk);
  ellipse(ctx, rig.handL.x, rig.handL.y, 2.2, 2.4, skin);

  ctx.save();
  ctx.translate(rig.weapon.x, rig.weapon.y);
  ctx.rotate(rig.weaponRot);
  const wep = cachedStatic(`wep:${vis.weaponForm}:${vis.weaponTint}:${vis.weaponMat}`, 40, 56, (c) => {
    drawItemForm(c, vis.weaponForm, vis.weaponTint, vis.weaponMat, 0.95, "held");
  });
  ctx.drawImage(wep, -20, -28, 40, 56);
  ctx.restore();

  capsule(ctx, rig.shoulderR.x, rig.shoulderR.y, rig.elbowR.x, rig.elbowR.y, 2.3, silk);
  capsule(ctx, rig.elbowR.x, rig.elbowR.y, rig.handR.x, rig.handR.y, 2.1, silk);
  ellipse(ctx, rig.handR.x, rig.handR.y, 2.2, 2.4, skin);

  drawHead(ctx, rig.head.x, rig.head.y);

  ctx.save();
  ctx.translate(rig.hat.x, rig.hat.y);
  ctx.rotate(rig.hatRot);
  const hatC = cachedStatic(`hat:${vis.hat}`, 40, 36, (c) => drawHat(c, vis.hat, matOf("horsehair")));
  ctx.drawImage(hatC, -20, -20, 40, 36);
  ctx.restore();

  // Codegen rig always painted above. PNG is hint-only, never an early return.
  const pngKey = pngKeyForJob(vis.jobId);
  const sheet = pngKey ? pngOverlay(pngKey) : null;
  if (sheet) blitPngOverlay(ctx, sheet, actor.walkPhase, actor.attackAnim > 0, 64);

  ctx.restore();
}

function drawHorse(ctx: CanvasRenderingContext2D): void {
  const hide = matOf("leather", PAL.earth_dark);
  poly(ctx, [[-16, 8], [-14, -2], [10, -4], [16, 6], [12, 12], [-12, 12]], hide, 1.3);
  poly(ctx, [[10, -2], [18, -8], [22, -4], [16, 4]], hide, 1.2);
  ellipse(ctx, 20, -6, 5, 4, hide);
  poly(ctx, [[18, -9], [16, -14], [20, -10]], matOf("hair"), 1);
  capsule(ctx, -10, 10, -12, 16, 2, hide);
  capsule(ctx, 8, 10, 10, 16, 2, hide);
}

function drawBaji(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number, m: Mat): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  poly(ctx, [[-5.5, -2], [5.2, -1], [4.2, 12], [-3.5, 13]], m, 1.2);
  poly(ctx, [[-3.8, 11], [4.4, 10.5], [3.6, 15], [-3, 15.5]], matOf("leather"), 1);
  ctx.restore();
}

function drawTorso(ctx: CanvasRenderingContext2D, robe: string, kind: "robe" | "armor"): void {
  if (kind === "armor") {
    poly(ctx, [[-11, 10], [-13, -7], [-6, -13], [7, -13], [13, -7], [12, 10]], matOf("steel", robe), 1.4);
    ctx.strokeStyle = PAL.ui_steel;
    ctx.lineWidth = 1;
    for (let y = -7; y <= 6; y += 4) {
      ctx.beginPath();
      ctx.moveTo(-10, y);
      ctx.lineTo(10, y);
      ctx.stroke();
    }
    poly(ctx, [[-5, -12], [0, -4], [5, -12]], matOf("silk", PAL.blood_mid), 1);
    return;
  }
  poly(ctx, [[-13, 12], [-8, -11], [8.5, -11], [14, 12]], matOf("silk", robe), 1.4);
  ctx.strokeStyle = PAL.bone_light;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.lineTo(1, 10);
  ctx.stroke();
  for (let i = -8; i <= 8; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, 2);
    ctx.lineTo(i + 1, 12);
    ctx.stroke();
  }
  poly(ctx, [[-4, -11], [0, -2], [4, -11]], matOf("cotton", PAL.bone_light), 1);
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.lineTo(7, -5);
  ctx.strokeStyle = PAL.blood_mid;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawHead(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ellipse(ctx, x, y, 6.4, 7, matOf("skin"));
  ellipse(ctx, x, y - 4, 6.2, 3.4, matOf("hair"));
  ellipse(ctx, x, y - 7, 2.4, 2.2, matOf("hair"));
}

function drawJoseonHuman(
  ctx: CanvasRenderingContext2D,
  robe: string,
  hat: string,
  kind: "robe" | "armor" = "robe",
  weapon?: { form: string; tint: string; mat: string },
): void {
  drawBaji(ctx, -4, 10, 0.12, matOf("cotton", PAL.earth_dark));
  drawBaji(ctx, 5, 11, -0.1, matOf("cotton", PAL.shadow_navy));
  drawTorso(ctx, robe, kind);
  capsule(ctx, -9, -6, -11, 4, 2.2, matOf("silk", robe));
  capsule(ctx, 9, -6, 11, 4, 2.2, matOf("silk", robe));
  drawHead(ctx, 0, -16);
  ctx.save();
  ctx.translate(0, -22);
  drawHat(ctx, hat, matOf("horsehair"));
  ctx.restore();
  if (weapon) {
    ctx.save();
    ctx.translate(12, -2);
    ctx.rotate(-0.7);
    drawWeaponForm(ctx, weapon.form, weapon.tint, weapon.mat, 0.72);
    ctx.restore();
  }
}

export function drawEnemy(ctx: CanvasRenderingContext2D, actor: Actor): void {
  ctx.save();
  ctx.rotate(actor.facing + Math.PI / 2);
  if (actor.flash > 0) ctx.filter = "brightness(1.8)";
  const art = actor.art;
  const g = actor.grade === "sang" ? 1.18 : actor.grade === "jung" ? 1.08 : 1;
  ctx.scale(g, g);

  const cached = cachedStatic(`enemy:${art}`, 88, 88, (c) => drawEnemyArt(c, art));
  ctx.drawImage(cached, -44, -44, 88, 88);

  const sheet = pngOverlay(art);
  if (sheet) {
    blitPngOverlay(
      ctx,
      sheet,
      actor.walkPhase,
      actor.attackAnim > 0,
      actor.grade === "sang" || art.includes("king") || art.includes("lady") ? 64 : 52,
    );
  }

  ctx.filter = "none";
  ctx.restore();
}

function drawEnemyArt(ctx: CanvasRenderingContext2D, art: string): void {
  const fn = ENEMY_DRAW[art] ?? ENEMY_DRAW.bandit!;
  fn(ctx, art);
}

type Drawer = (ctx: CanvasRenderingContext2D, art: string) => void;

const ENEMY_DRAW: Record<string, Drawer> = {
  tiger: drawTiger,
  tiger_white: drawTiger,
  tiger_blood: drawTiger,
  wolf: drawWolf,
  wolf_black: drawWolf,
  wolf_frost: drawWolf,
  dog: drawWolf,
  boar: drawBoar,
  bear: drawBear,
  goat: drawGoat,
  beast: drawBeastling,
  dokkaebi: drawDokkaebi,
  dokkaebi_iron: drawDokkaebi,
  dokkaebi_small: drawDokkaebi,
  dokkaebi_fire: drawDokkaebi,
  dokkaebi_club: drawDokkaebi,
  dokkaebi_shadow: drawDokkaebi,
  will_o: drawWillO,
  gumiho: drawGumiho,
  gumiho_lady: drawGumiho,
  fox: drawGumiho,
  ghost: drawGhost,
  ghost_long: drawGhost,
  ghost_mirror: drawGhost,
  ghost_water: drawGhost,
  spirit: drawGhost,
  spirit_moon: drawGhost,
  spirit_wind: drawWindSprite,
  sansin: drawSansin,
  gangsi: drawGangsi,
  skel: drawSkel,
  gravekeep: drawSkel,
  reaper: drawReaper,
  bandit: drawBandit,
  bandit_bow: drawBandit,
  bandit_blade: drawBandit,
  bandit_road: drawBandit,
  bandit_smuggler: drawBandit,
  bandit_chief: drawBandit,
  bandit_king: drawBandit,
  soldier: drawSoldier,
  soldier_bow: drawSoldier,
  soldier_deserter: drawSoldier,
  pojol: drawSoldier,
  officer: drawSoldier,
  cavalry: drawSoldier,
  croc: drawCroc,
  imugi: drawImugi,
  imugi_king: drawImugi,
  statue: drawStatue,
  mask: drawMask,
  bell: drawBell,
  lantern: drawLanternSpirit,
  abbot: drawAbbot,
  witch: drawWitch,
  bird: drawBird,
  crow: drawBird,
  eagle: drawBird,
  snake: drawSnake,
  bug: drawBug,
  spider: drawSpider,
  rat: drawRat,
  leech: drawLeech,
  mud_crab: drawCrab,
  herb_golem: drawHerbGolem,
  tree_spirit: drawTreeSpirit,
  harubang: drawHarubang,
  curse_doll: drawCurseDoll,
  poison_toad: drawToad,
  paper_talon: drawPaperTalon,
  singijeon: drawSingijeon,
  salt_elem: drawSalt,
  lava_scarab: drawScarab,
  ember: drawEmber,
  basalt: drawBasalt,
  ash_hound: drawWolf,
  cloud_serpent: drawImugi,
  flute_spirit: drawFlute,
  armor_specter: drawArmorSpecter,
  eunuch: drawEunuch,
  palace_maid: drawGhost,
  court_assassin: drawAssassin,
  tide_priest: drawWitch,
  storm_monk: drawDokkaebi,
  mokwoo: drawMokwoo,
  drowned: drawDrowned,
};

function tigerFur(art: string): string {
  if (art.includes("white")) return PAL.bone_light;
  if (art.includes("blood")) return PAL.blood_mid;
  return PAL.earth_dark;
}

function drawTiger(ctx: CanvasRenderingContext2D, art: string): void {
  const fur = matOf("leather", tigerFur(art));
  const stripe = art.includes("white") ? PAL.shadow_navy : PAL.bg_void;
  poly(ctx, [[-16, 6], [-14, -6], [10, -8], [16, 2], [12, 10], [-12, 11]], fur, 1.4);
  poly(ctx, [[10, -6], [18, -12], [22, -6], [16, 2]], fur, 1.2);
  ellipse(ctx, 18, -8, 7, 5.5, fur);
  poly(ctx, [[14, -12], [12, -18], [16, -13]], fur, 1);
  poly(ctx, [[20, -12], [22, -18], [18, -12]], fur, 1);
  ctx.fillStyle = stripe;
  for (const [x, y, w, h] of [[-8, -5, 2.2, 12], [-2, -6, 2, 13], [4, -5, 2.2, 11], [14, -10, 1.6, 8]] as const) {
    ctx.fillRect(x, y, w, h);
  }
  poly(ctx, [[-14, 4], [-22, -2], [-16, 8]], fur, 1);
  ellipse(ctx, 20, -7, 1.4, 1.2, matOf("silk", PAL.blood_hot));
}

function drawWolf(ctx: CanvasRenderingContext2D, art: string): void {
  const c =
    art === "wolf_frost" ? PAL.bone_light :
    art === "wolf_black" || art === "ash_hound" ? PAL.bg_void :
    art === "dog" ? PAL.earth_mid : PAL.shadow_navy;
  const fur = matOf("leather", c);
  poly(ctx, [[-12, 5], [-10, -5], [8, -6], [13, 2], [8, 9], [-8, 9]], fur, 1.3);
  poly(ctx, [[8, -4], [16, -8], [18, -3], [12, 3]], fur, 1.2);
  horn(ctx, 14, -8, 12, -14, 1.6, fur);
  horn(ctx, 17, -8, 19, -14, 1.6, fur);
  poly(ctx, [[-10, 3], [-18, 0], [-12, 7]], fur, 1);
}

function drawBoar(ctx: CanvasRenderingContext2D): void {
  const hide = matOf("leather", PAL.earth_mid);
  poly(ctx, [[-12, 6], [-8, -6], [10, -5], [14, 4], [8, 11], [-8, 11]], hide, 1.3);
  ellipse(ctx, 14, 0, 6, 5, hide);
  horn(ctx, 16, 2, 22, 6, 1.4, matOf("bone"));
  horn(ctx, 16, 0, 22, -4, 1.4, matOf("bone"));
  ctx.fillStyle = PAL.shadow_navy;
  for (let i = -6; i < 8; i += 3) ctx.fillRect(i, -6, 1.4, 5);
}

function drawBear(ctx: CanvasRenderingContext2D): void {
  const hide = matOf("leather", PAL.earth_dark);
  poly(ctx, [[-14, 8], [-12, -8], [10, -8], [16, 4], [10, 13], [-10, 13]], hide, 1.4);
  ellipse(ctx, 14, -4, 7, 6, hide);
  ellipse(ctx, 10, -10, 3, 3, hide);
  ellipse(ctx, 16, -10, 3, 3, hide);
  ellipse(ctx, 2, 4, 5, 4, matOf("cotton", PAL.bone_light));
}

function drawGoat(ctx: CanvasRenderingContext2D): void {
  const hide = matOf("leather", PAL.earth_mid);
  poly(ctx, [[-10, 5], [-6, -4], [8, -4], [12, 4], [6, 10], [-6, 10]], hide, 1.2);
  ellipse(ctx, 12, -2, 5, 4, hide);
  horn(ctx, 10, -5, 8, -14, 1.3, matOf("horn"));
  horn(ctx, 13, -5, 16, -14, 1.3, matOf("horn"));
}

function drawBeastling(ctx: CanvasRenderingContext2D): void {
  const hide = matOf("leather", PAL.earth_dark);
  poly(ctx, [[-8, 4], [-5, -4], [6, -4], [9, 3], [5, 8], [-5, 8]], hide, 1.2);
  ellipse(ctx, 8, -2, 4, 3.4, hide);
}

function drawDokkaebi(ctx: CanvasRenderingContext2D, art: string): void {
  const robe =
    art.includes("iron") ? PAL.ui_steel :
    art.includes("fire") ? PAL.blood_mid :
    art.includes("shadow") ? PAL.bg_void :
    PAL.moss_cool;
  const s = art.includes("small") ? 0.78 : 1;
  ctx.save();
  ctx.scale(s, s);
  poly(ctx, [[-9, 12], [-8, -6], [8, -6], [9, 12]], matOf("leather", robe), 1.3);
  drawHead(ctx, 0, -12);
  horn(ctx, -5, -18, -10, -26, 2.2, matOf("bone"));
  horn(ctx, 5, -18, 10, -26, 2.2, matOf("bone"));
  ctx.fillStyle = PAL.blood_hot;
  ctx.fillRect(-3, -12, 2, 2);
  ctx.fillRect(1, -12, 2, 2);
  if (art.includes("club") || art === "dokkaebi" || art === "storm_monk") {
    ctx.save();
    ctx.translate(12, 0);
    ctx.rotate(-0.5);
    drawWeaponForm(ctx, "bangmangi", PAL.earth_mid, "wood", 0.7);
    ctx.restore();
  }
  ctx.restore();
}

function drawWillO(ctx: CanvasRenderingContext2D): void {
  ctx.shadowColor = PAL.torch_hot;
  ctx.shadowBlur = 14;
  ellipse(ctx, 0, 0, 7, 8, matOf("silk", PAL.torch_hot));
  ellipse(ctx, 0, -8, 3, 4, matOf("silk", PAL.torch_warm));
  ctx.shadowBlur = 0;
}

function drawGumiho(ctx: CanvasRenderingContext2D, art: string): void {
  const fur = art === "gumiho_lady" ? PAL.blood_mid : art === "fox" ? PAL.earth_mid : PAL.earth_dark;
  const tails = art === "fox" ? 1 : art === "gumiho_lady" ? 9 : 5;
  for (let i = 0; i < tails; i++) {
    const a = -0.4 + i * 0.22;
    ctx.save();
    ctx.rotate(a);
    poly(ctx, [[-6, 4], [-14 - i, 10 + i], [-4, 14], [2, 8]], matOf("silk", fur), 1.1);
    ctx.restore();
  }
  if (art === "gumiho_lady") {
    drawJoseonHuman(ctx, PAL.blood_mid, "none", "robe");
    horn(ctx, -4, -22, -7, -28, 1.6, matOf("leather", fur));
    horn(ctx, 4, -22, 7, -28, 1.6, matOf("leather", fur));
  } else {
    poly(ctx, [[-7, 8], [-6, -6], [6, -6], [7, 8]], matOf("silk", fur), 1.2);
    ellipse(ctx, 0, -12, 5.5, 5, matOf("skin"));
    horn(ctx, -3, -16, -6, -22, 1.4, matOf("leather", fur));
    horn(ctx, 3, -16, 6, -22, 1.4, matOf("leather", fur));
  }
}

function drawGhost(ctx: CanvasRenderingContext2D, art: string): void {
  ctx.globalAlpha = 0.88;
  const tint =
    art === "ghost_water" ? PAL.env_cool :
    art === "ghost_mirror" ? PAL.ui_steel :
    art === "palace_maid" || art === "ghost_long" ? PAL.bone_light :
    PAL.ui_steel;
  ctx.beginPath();
  ctx.moveTo(-9, 14);
  ctx.quadraticCurveTo(-14, -4, 0, -16);
  ctx.quadraticCurveTo(14, -4, 9, 14);
  ctx.quadraticCurveTo(0, 10, -9, 14);
  ctx.closePath();
  fillStroke(ctx, matOf("silk", tint), 1.2);
  drawHead(ctx, 0, -14);
  if (art === "ghost_long" || art === "palace_maid") {
    poly(ctx, [[-4, -16], [-12, 8], [-2, -10]], matOf("hair"), 1);
    poly(ctx, [[4, -16], [12, 10], [2, -10]], matOf("hair"), 1);
  }
  ctx.globalAlpha = 1;
}

function drawWindSprite(ctx: CanvasRenderingContext2D): void {
  ctx.globalAlpha = 0.8;
  ellipse(ctx, 0, 0, 6, 8, matOf("silk", PAL.env_cool));
  ctx.beginPath();
  ctx.moveTo(-10, 2);
  ctx.quadraticCurveTo(0, -10, 10, 2);
  ctx.strokeStyle = PAL.bone_light;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawSansin(ctx: CanvasRenderingContext2D): void {
  drawJoseonHuman(ctx, PAL.earth_mid, "songnak", "robe");
  ellipse(ctx, 10, 8, 5, 4, matOf("leather", PAL.earth_dark));
}

function drawGangsi(ctx: CanvasRenderingContext2D): void {
  poly(ctx, [[-8, 12], [-7, -8], [7, -8], [8, 12]], matOf("cotton", PAL.bone_light), 1.3);
  drawHead(ctx, 0, -14);
  poly(ctx, [[-7, -20], [-7, -10], [7, -10], [7, -20]], matOf("horsehair"), 1);
  poly(ctx, [[-3, -16], [3, -16], [3, -8], [-3, -8]], matOf("paper", PAL.blood_main), 1);
}

function drawSkel(ctx: CanvasRenderingContext2D, art: string): void {
  const robe = art === "gravekeep" ? PAL.earth_dark : PAL.bone_light;
  poly(ctx, [[-7, 11], [-6, -7], [6, -7], [7, 11]], matOf("bone", robe), 1.2);
  ellipse(ctx, 0, -13, 5.5, 5.5, matOf("bone"));
  ctx.fillStyle = PAL.shadow_navy;
  ctx.fillRect(-2.4, -14, 1.6, 2);
  ctx.fillRect(0.8, -14, 1.6, 2);
}

function drawReaper(ctx: CanvasRenderingContext2D): void {
  poly(ctx, [[-10, 14], [-8, -8], [8, -8], [10, 14]], matOf("silk", PAL.bg_void), 1.3);
  drawHead(ctx, 0, -14);
  ctx.save();
  ctx.translate(0, -20);
  drawHat(ctx, "official", matOf("horsehair"));
  ctx.restore();
  ctx.save();
  ctx.translate(14, -2);
  ctx.rotate(-0.8);
  drawWeaponForm(ctx, "staff", PAL.bone_light, "bone", 0.7);
  ctx.restore();
}

function drawBandit(ctx: CanvasRenderingContext2D, art: string): void {
  const robe =
    art === "bandit_king" || art === "bandit_chief" ? PAL.blood_deep :
    art === "bandit_smuggler" ? PAL.shadow_navy :
    art === "bandit_road" ? PAL.earth_mid :
    PAL.earth_dark;
  const hat = art === "bandit_chief" || art === "bandit_king" ? "satgat" : "satgat";
  const wep =
    art === "bandit_bow" ? { form: "bow", tint: PAL.earth_mid, mat: "wood" } :
    { form: "sword", tint: PAL.ui_steel, mat: "iron" };
  drawJoseonHuman(ctx, robe, hat, "robe", wep);
  if (art === "bandit_king") {
    ctx.save();
    ctx.translate(0, -8);
    ellipse(ctx, 0, 14, 8, 3, matOf("silk", PAL.blood_mid));
    ctx.restore();
  }
}

function drawSoldier(ctx: CanvasRenderingContext2D, art: string): void {
  const robe =
    art === "officer" ? PAL.blood_mid :
    art === "pojol" ? PAL.moss_cool :
    art === "soldier_deserter" ? PAL.earth_dark :
    PAL.shadow_navy;
  const hat = art === "officer" ? "jeonrip" : art === "cavalry" ? "jeonrip" : art === "pojol" ? "jeonrip" : "helm";
  const kind = art === "soldier_deserter" ? "robe" : "armor";
  const wep =
    art === "soldier_bow" ? { form: "bow", tint: PAL.earth_dark, mat: "wood" } :
    { form: "spear", tint: PAL.ui_steel, mat: "iron" };
  if (art === "cavalry") {
    const horse = cachedStatic("horse", 56, 40, drawHorse);
    ctx.drawImage(horse, -28, -2, 56, 40);
  }
  drawJoseonHuman(ctx, robe, hat, kind, wep);
}

function drawCroc(ctx: CanvasRenderingContext2D): void {
  const hide = matOf("jade", PAL.moss_cool);
  poly(ctx, [[-16, 4], [-10, -5], [12, -4], [20, 2], [12, 8], [-12, 8]], hide, 1.3);
  poly(ctx, [[16, 0], [26, -2], [24, 4]], hide, 1);
  ctx.fillStyle = PAL.earth_dark;
  for (let i = -8; i < 10; i += 4) ctx.fillRect(i, -4, 2.4, 2);
}

function drawImugi(ctx: CanvasRenderingContext2D, art: string): void {
  const hide = matOf("jade", art === "cloud_serpent" ? PAL.env_cool : PAL.moss_cool);
  ctx.beginPath();
  ctx.moveTo(-18, 6);
  ctx.quadraticCurveTo(-6, -10, 4, 2);
  ctx.quadraticCurveTo(12, 10, 20, -2);
  ctx.lineTo(22, 4);
  ctx.quadraticCurveTo(10, 14, 2, 6);
  ctx.quadraticCurveTo(-8, 2, -18, 10);
  ctx.closePath();
  fillStroke(ctx, hide, 1.4);
  ellipse(ctx, 20, -4, 6, 4.5, hide);
  if (art.includes("king")) {
    horn(ctx, 18, -7, 16, -14, 1.6, matOf("horn"));
    horn(ctx, 22, -7, 24, -14, 1.6, matOf("horn"));
  }
}

function drawStatue(ctx: CanvasRenderingContext2D): void {
  const st = matOf("stone", PAL.earth_dark);
  poly(ctx, [[-9, 14], [-10, -6], [10, -6], [9, 14]], st, 1.4);
  ellipse(ctx, 0, -12, 7, 7, st);
  poly(ctx, [[-8, -18], [0, -22], [8, -18]], st, 1);
}

function drawMask(ctx: CanvasRenderingContext2D): void {
  drawJoseonHuman(ctx, PAL.earth_dark, "none", "armor");
  ellipse(ctx, 0, -16, 7, 7.5, matOf("lacquer", PAL.blood_mid));
  ctx.fillStyle = PAL.bone_light;
  ctx.fillRect(-3, -18, 2, 2);
  ctx.fillRect(1, -18, 2, 2);
}

function drawBell(ctx: CanvasRenderingContext2D): void {
  const m = matOf("iron", PAL.metal_dark);
  ctx.beginPath();
  ctx.moveTo(-10, -8);
  ctx.quadraticCurveTo(0, -16, 10, -8);
  ctx.lineTo(8, 10);
  ctx.quadraticCurveTo(0, 14, -8, 10);
  ctx.closePath();
  fillStroke(ctx, m, 1.4);
  ellipse(ctx, 0, -14, 3, 3, matOf("iron"));
}

function drawLanternSpirit(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = PAL.earth_dark;
  ctx.fillRect(-2, 8, 4, 6);
  ctx.shadowColor = PAL.torch_hot;
  ctx.shadowBlur = 10;
  poly(ctx, [[-7, -8], [7, -8], [6, 8], [-6, 8]], matOf("paper", PAL.torch_warm), 1.2);
  ctx.shadowBlur = 0;
}

function drawAbbot(ctx: CanvasRenderingContext2D): void {
  drawJoseonHuman(ctx, PAL.earth_dark, "songnak", "robe", { form: "staff", tint: PAL.moss_cool, mat: "jade" });
}

function drawWitch(ctx: CanvasRenderingContext2D): void {
  drawJoseonHuman(ctx, PAL.moss_cool, "songnak", "robe", { form: "talisman", tint: PAL.bone_light, mat: "paper" });
}

function drawBird(ctx: CanvasRenderingContext2D, art: string): void {
  const c = art === "eagle" ? PAL.earth_mid : PAL.bg_void;
  ellipse(ctx, 0, 0, 6, 4, matOf("hair", c));
  poly(ctx, [[-16, 2], [0, -6], [16, 2], [0, 1]], matOf("hair", PAL.shadow_navy), 1.2);
  poly(ctx, [[6, 0], [12, -2], [8, 2]], matOf("straw"), 1);
}

function drawSnake(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.moveTo(-12, 3);
  ctx.quadraticCurveTo(-2, -6, 6, 2);
  ctx.quadraticCurveTo(12, 6, 14, 0);
  ctx.strokeStyle = PAL.moss_cool;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke();
  ellipse(ctx, 14, -1, 3, 2.4, matOf("leather", PAL.moss_cool));
}

function drawBug(ctx: CanvasRenderingContext2D): void {
  ellipse(ctx, 0, 0, 5, 3.4, matOf("leather", PAL.moss_cool));
  ctx.strokeStyle = PAL.earth_dark;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-4, -3);
  ctx.lineTo(-8, -6);
  ctx.moveTo(4, -3);
  ctx.lineTo(8, -6);
  ctx.stroke();
}

function drawSpider(ctx: CanvasRenderingContext2D): void {
  ellipse(ctx, 0, 0, 5, 4, matOf("leather", PAL.shadow_navy));
  ctx.strokeStyle = PAL.earth_dark;
  ctx.lineWidth = 1.3;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * 4, -1);
    ctx.lineTo(s * 11, -6);
    ctx.moveTo(s * 4, 1);
    ctx.lineTo(s * 11, 6);
    ctx.stroke();
  }
}

function drawRat(ctx: CanvasRenderingContext2D): void {
  ellipse(ctx, 0, 1, 5, 3.2, matOf("leather", PAL.earth_dark));
  ellipse(ctx, 5, 0, 3, 2.4, matOf("leather", PAL.earth_dark));
  ctx.beginPath();
  ctx.moveTo(-5, 2);
  ctx.quadraticCurveTo(-12, 6, -10, 10);
  ctx.strokeStyle = PAL.earth_mid;
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function drawLeech(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.moveTo(-8, 2);
  ctx.quadraticCurveTo(0, -4, 8, 2);
  ctx.quadraticCurveTo(0, 5, -8, 2);
  fillStroke(ctx, matOf("leather", PAL.blood_deep), 1);
}

function drawCrab(ctx: CanvasRenderingContext2D): void {
  ellipse(ctx, 0, 0, 8, 5, matOf("leather", PAL.earth_mid));
  poly(ctx, [[8, -2], [14, -6], [12, 0]], matOf("bone"), 1);
  poly(ctx, [[-8, -2], [-14, -6], [-12, 0]], matOf("bone"), 1);
}

function drawHerbGolem(ctx: CanvasRenderingContext2D): void {
  const st = matOf("stone", PAL.moss_cool);
  poly(ctx, [[-9, 14], [-8, -4], [8, -4], [9, 14]], st, 1.3);
  ellipse(ctx, 0, -10, 6, 6, st);
  ctx.fillStyle = PAL.moss_cool;
  ctx.fillRect(-3, -16, 2, 6);
  ctx.fillRect(1, -18, 2, 8);
}

function drawTreeSpirit(ctx: CanvasRenderingContext2D): void {
  poly(ctx, [[-4, 12], [-3, -8], [3, -8], [4, 12]], matOf("wood"), 1.3);
  ellipse(ctx, 0, -14, 10, 8, matOf("jade", PAL.moss_cool));
  ellipse(ctx, -6, -10, 5, 4, matOf("jade", PAL.env_mid));
}

function drawHarubang(ctx: CanvasRenderingContext2D): void {
  const st = matOf("stone", PAL.earth_mid);
  poly(ctx, [[-10, 14], [-9, -4], [9, -4], [10, 14]], st, 1.4);
  ellipse(ctx, 0, -10, 8, 8, st);
  ctx.fillStyle = PAL.shadow_navy;
  ctx.fillRect(-3, -12, 2, 2);
  ctx.fillRect(1, -12, 2, 2);
  poly(ctx, [[-4, -6], [4, -6], [0, -2]], st, 1);
}

function drawCurseDoll(ctx: CanvasRenderingContext2D): void {
  poly(ctx, [[-6, 10], [-5, -4], [5, -4], [6, 10]], matOf("cotton", PAL.blood_deep), 1.2);
  ellipse(ctx, 0, -8, 5, 5, matOf("cotton", PAL.bone_light));
  ctx.beginPath();
  ctx.moveTo(-3, -8);
  ctx.lineTo(3, -6);
  ctx.moveTo(-3, -6);
  ctx.lineTo(3, -8);
  ctx.strokeStyle = PAL.blood_main;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawToad(ctx: CanvasRenderingContext2D): void {
  ellipse(ctx, 0, 2, 8, 5.5, matOf("leather", PAL.moss_cool));
  ellipse(ctx, 6, -2, 4, 3.5, matOf("leather", PAL.moss_cool));
  ellipse(ctx, 5, -4, 1.6, 1.6, matOf("silk", PAL.torch_hot));
}

function drawPaperTalon(ctx: CanvasRenderingContext2D): void {
  poly(ctx, [[-8, 6], [0, -12], [8, 6]], matOf("paper"), 1.2);
  ctx.fillStyle = PAL.blood_main;
  ctx.fillRect(-2, -4, 4, 8);
}

function drawSingijeon(ctx: CanvasRenderingContext2D): void {
  poly(ctx, [[-3, 10], [-2, -10], [2, -10], [3, 10]], matOf("wood"), 1.2);
  poly(ctx, [[-6, -6], [0, -16], [6, -6]], matOf("paper", PAL.bone_light), 1);
  ellipse(ctx, 0, 12, 3, 3, matOf("silk", PAL.torch_hot));
}

function drawSalt(ctx: CanvasRenderingContext2D): void {
  poly(ctx, [[-7, 8], [0, -12], [7, 8]], matOf("bone"), 1.3);
  ellipse(ctx, 0, 0, 5, 5, matOf("cotton", PAL.bone_light));
}

function drawScarab(ctx: CanvasRenderingContext2D): void {
  ellipse(ctx, 0, 0, 6, 4, matOf("leather", PAL.metal_dark));
  ctx.fillStyle = PAL.torch_warm;
  ctx.fillRect(-2, -2, 4, 3);
}

function drawEmber(ctx: CanvasRenderingContext2D): void {
  ctx.shadowColor = PAL.torch_hot;
  ctx.shadowBlur = 10;
  ellipse(ctx, 0, 0, 6, 7, matOf("silk", PAL.blood_hot));
  ctx.shadowBlur = 0;
}

function drawBasalt(ctx: CanvasRenderingContext2D): void {
  const st = matOf("stone", PAL.bg_void);
  poly(ctx, [[-10, 12], [-6, -8], [6, -8], [10, 12]], st, 1.4);
  ellipse(ctx, 0, -12, 6, 6, st);
}

function drawFlute(ctx: CanvasRenderingContext2D): void {
  drawGhost(ctx, "spirit");
  ctx.beginPath();
  ctx.moveTo(8, -4);
  ctx.lineTo(16, -10);
  ctx.strokeStyle = PAL.bone_light;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawArmorSpecter(ctx: CanvasRenderingContext2D): void {
  ctx.globalAlpha = 0.8;
  drawJoseonHuman(ctx, PAL.ui_steel, "helm", "armor", { form: "sword", tint: PAL.bone_light, mat: "steel" });
  ctx.globalAlpha = 1;
}

function drawEunuch(ctx: CanvasRenderingContext2D): void {
  drawJoseonHuman(ctx, PAL.shadow_navy, "official", "robe");
}

function drawAssassin(ctx: CanvasRenderingContext2D): void {
  drawJoseonHuman(ctx, PAL.bg_void, "none", "robe", { form: "dagger", tint: PAL.blood_deep, mat: "steel" });
}

function drawMokwoo(ctx: CanvasRenderingContext2D): void {
  poly(ctx, [[-12, 10], [-10, -8], [10, -8], [12, 10]], matOf("wood"), 1.4);
  ellipse(ctx, 0, -12, 6, 6, matOf("wood"));
  ctx.fillStyle = PAL.earth_dark;
  ctx.fillRect(-8, -2, 16, 2);
}

function drawDrowned(ctx: CanvasRenderingContext2D): void {
  ctx.globalAlpha = 0.75;
  drawJoseonHuman(ctx, PAL.env_cool, "helm", "armor", { form: "spear", tint: PAL.ui_steel, mat: "iron" });
  ctx.globalAlpha = 1;
}

export function drawNpc(ctx: CanvasRenderingContext2D, actor: Actor): void {
  ctx.save();
  ctx.rotate(0.08);
  const robe = actor.art === "npc_trainer" ? PAL.blood_mid : actor.art === "npc_shop" ? PAL.earth_mid : PAL.earth_dark;
  const hat = actor.art === "npc_shop" ? "manggeon" : "gat";
  const body = cachedStatic(`npc:${actor.art}`, 64, 64, (c) => {
    drawJoseonHuman(c, robe, hat, "robe");
  });
  ctx.drawImage(body, -32, -32, 64, 64);
  ctx.restore();
}

export function drawShadow(ctx: CanvasRenderingContext2D, r: number): void {
  ctx.save();
  ctx.scale(1, 0.45);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(11,10,20,0.42)";
  ctx.fill();
  ctx.restore();
}

export const ENEMY_ART_KEYS = Object.keys(ENEMY_DRAW);
