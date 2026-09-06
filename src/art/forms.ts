import type { WeaponType } from "../core/types";
import { PAL } from "./palette";
import { ellipse, fillStroke, horn, matOf, poly, roundRect, type Mat } from "./materials";

/** Shared weapon silhouettes — held, icon, and ground drop all call this. */
export function drawWeaponForm(ctx: CanvasRenderingContext2D, form: string, tint: string, material: string, scale = 1): void {
  const m = matOf(material, tint);
  ctx.save();
  ctx.scale(scale, scale);
  switch (form) {
    case "sword":
    case "hwando":
      drawHwando(ctx, m);
      break;
    case "spear":
      drawSpear(ctx, m);
      break;
    case "bow":
      drawGakgung(ctx, m);
      break;
    case "dagger":
      drawDagger(ctx, m);
      break;
    case "talisman":
      drawTalisman(ctx, m);
      break;
    case "staff":
      drawStaff(ctx, m);
      break;
    case "gourd":
      ellipse(ctx, 0, -4, 6, 8, m);
      ellipse(ctx, 0, -12, 3, 4, m);
      break;
    case "pouch":
      roundRect(ctx, -7, -6, 14, 12, 3);
      fillStroke(ctx, m);
      break;
    case "fang":
      poly(ctx, [[-3, 6], [0, -10], [3, 6]], m);
      break;
    case "amulet":
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      fillStroke(ctx, m);
      break;
    case "norigae":
      ctx.beginPath();
      ctx.arc(0, -4, 4, 0, Math.PI * 2);
      fillStroke(ctx, matOf("jade"));
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 10);
      ctx.strokeStyle = PAL.moss_cool;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      break;
    case "club":
    case "bangmangi":
      drawBangmangi(ctx, m);
      break;
    default:
      ellipse(ctx, 0, 0, 6, 6, m);
  }
  ctx.restore();
}

/** 환도 — curved blade, ring pommel, neighbor-swatch outline. */
function drawHwando(ctx: CanvasRenderingContext2D, m: Mat): void {
  ctx.beginPath();
  ctx.moveTo(1, 16);
  ctx.quadraticCurveTo(5, -2, 2, -20);
  ctx.lineTo(0, -24);
  ctx.quadraticCurveTo(-2, -18, -2, 14);
  ctx.closePath();
  fillStroke(ctx, m, 1.3);
  ctx.beginPath();
  ctx.moveTo(-1, -6);
  ctx.quadraticCurveTo(2, -4, 1, -18);
  ctx.strokeStyle = PAL.bone_light;
  ctx.lineWidth = 0.8;
  ctx.stroke();
  poly(ctx, [[-7, 9], [7, 9], [6, 13], [-6, 13]], matOf("iron"), 1);
  ctx.beginPath();
  ctx.arc(0, 17, 3.2, 0, Math.PI * 2);
  fillStroke(ctx, matOf("iron"), 1);
}

function drawSpear(ctx: CanvasRenderingContext2D, m: Mat): void {
  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.lineTo(1.6, -8);
  ctx.lineTo(-1.6, -8);
  ctx.closePath();
  fillStroke(ctx, matOf("wood"), 1);
  poly(ctx, [[0, -26], [4, -10], [0, -8], [-4, -10]], m, 1.2);
  ctx.beginPath();
  ctx.moveTo(3, -9);
  ctx.lineTo(8, -6);
  ctx.strokeStyle = PAL.blood_mid;
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

function drawGakgung(ctx: CanvasRenderingContext2D, m: Mat): void {
  ctx.beginPath();
  ctx.moveTo(-4, -16);
  ctx.quadraticCurveTo(-16, 0, -4, 16);
  ctx.strokeStyle = m.stroke;
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-4, -16);
  ctx.quadraticCurveTo(-10, 0, -4, 16);
  ctx.strokeStyle = m.fill;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-4, -15);
  ctx.lineTo(7, 0);
  ctx.lineTo(-4, 15);
  ctx.strokeStyle = PAL.bone_light;
  ctx.lineWidth = 1;
  ctx.stroke();
  ellipse(ctx, -4, 0, 2.2, 3, matOf("horn"));
}

function drawDagger(ctx: CanvasRenderingContext2D, m: Mat): void {
  poly(ctx, [[0, 9], [2.4, -8], [0, -15], [-2.2, -8]], m, 1.1);
  poly(ctx, [[-5, 6], [5, 6], [4, 9], [-4, 9]], matOf("iron"), 1);
}

function drawTalisman(ctx: CanvasRenderingContext2D, m: Mat): void {
  roundRect(ctx, -6, -11, 12, 20, 1);
  fillStroke(ctx, m, 1);
  ctx.fillStyle = PAL.blood_main;
  ctx.fillRect(-3.5, -7, 7, 2);
  ctx.fillRect(-1.4, -5, 2.8, 11);
  ctx.fillRect(-3, 2, 6, 1.6);
}

function drawStaff(ctx: CanvasRenderingContext2D, m: Mat): void {
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.lineTo(0, -16);
  ctx.strokeStyle = m.stroke;
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -20, 5.4, 0, Math.PI * 2);
  fillStroke(ctx, matOf("jade"), 1.2);
  ctx.beginPath();
  ctx.arc(0, -20, 2.2, 0, Math.PI * 2);
  ctx.fillStyle = PAL.bone_light;
  ctx.fill();
}

function drawBangmangi(ctx: CanvasRenderingContext2D, m: Mat): void {
  ctx.beginPath();
  ctx.moveTo(0, 14);
  ctx.lineTo(2, -6);
  ctx.lineTo(-2, -6);
  ctx.closePath();
  fillStroke(ctx, matOf("wood"), 1);
  ellipse(ctx, 0, -12, 7, 8, m);
}

export function drawHat(ctx: CanvasRenderingContext2D, kind: string, m: Mat): void {
  ctx.save();
  if (kind === "gat" || kind === "gatTall" || kind === "heukrip") {
    drawGat(ctx, kind === "gatTall" ? 1.18 : 1);
  } else if (kind === "jeonrip" || kind === "jeollip") {
    drawJeonrip(ctx, m);
  } else if (kind === "songnak") {
    drawSongnak(ctx, m);
  } else if (kind === "manggeon") {
    drawManggeon(ctx);
  } else if (kind === "helm") {
    drawHelm(ctx);
  } else if (kind === "satgat") {
    drawSatgat(ctx);
  } else if (kind === "official") {
    drawOfficialHat(ctx);
  }
  ctx.restore();
}

/** 흑립 — wide horsehair brim + cylinder crown. The Joseon read. */
function drawGat(ctx: CanvasRenderingContext2D, tall: number): void {
  const brim = matOf("horsehair", PAL.shadow_navy);
  ctx.beginPath();
  ctx.ellipse(0, 2, 15.5, 4.6, 0, 0, Math.PI * 2);
  fillStroke(ctx, brim, 1.3);
  ctx.beginPath();
  ctx.ellipse(0, 1.2, 12, 3.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = PAL.env_mid;
  ctx.globalAlpha = 0.35;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.moveTo(-3.4, 1);
  ctx.lineTo(-3.8, -11 * tall);
  ctx.lineTo(3.8, -11 * tall);
  ctx.lineTo(3.4, 1);
  ctx.closePath();
  fillStroke(ctx, brim, 1.2);
  ctx.beginPath();
  ctx.ellipse(0, -11 * tall, 4.2, 1.6, 0, 0, Math.PI * 2);
  fillStroke(ctx, brim, 1);
}

/** 전립 — military felt hat with crimson plume. */
function drawJeonrip(ctx: CanvasRenderingContext2D, m: Mat): void {
  ctx.beginPath();
  ctx.ellipse(0, 1, 11.5, 4.2, 0, 0, Math.PI * 2);
  fillStroke(ctx, m, 1.2);
  ctx.beginPath();
  ctx.ellipse(0, -4, 7.2, 5.4, 0, 0, Math.PI * 2);
  fillStroke(ctx, m, 1.2);
  poly(ctx, [[-1.2, -8], [0, -16], [1.2, -8]], matOf("silk", PAL.blood_main), 1);
}

/** 송낙 — pointed bamboo rain hat (도사). */
function drawSongnak(ctx: CanvasRenderingContext2D, m: Mat): void {
  poly(ctx, [[-11, 3], [0, -13], [11, 3]], m, 1.3);
  ctx.beginPath();
  ctx.moveTo(-7, 1);
  ctx.lineTo(0, -9);
  ctx.lineTo(7, 1);
  ctx.strokeStyle = PAL.earth_dark;
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

function drawManggeon(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.arc(0, 3, 7.2, Math.PI, Math.PI * 2);
  fillStroke(ctx, matOf("hair"), 1);
  ctx.beginPath();
  ctx.moveTo(-7, 2);
  ctx.lineTo(7, 2);
  ctx.strokeStyle = PAL.earth_dark;
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

function drawHelm(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.arc(0, 2, 9.2, Math.PI, Math.PI * 2);
  fillStroke(ctx, matOf("iron"), 1.3);
  ctx.beginPath();
  ctx.ellipse(0, 2, 10, 3, 0, 0, Math.PI * 2);
  fillStroke(ctx, matOf("iron"), 1);
  horn(ctx, 0, -6, 0, -14, 1.4, matOf("iron"));
}

/** 삿갓 — conical straw, bandit read. */
function drawSatgat(ctx: CanvasRenderingContext2D): void {
  const m = matOf("straw");
  poly(ctx, [[-13, 4], [0, -12], [13, 4]], m, 1.3);
  ctx.beginPath();
  ctx.moveTo(-8, 2);
  ctx.lineTo(0, -8);
  ctx.lineTo(8, 2);
  ctx.strokeStyle = PAL.earth_dark;
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

/** 사모 — court official. */
function drawOfficialHat(ctx: CanvasRenderingContext2D): void {
  const m = matOf("horsehair");
  poly(ctx, [[-7, 2], [-7, -8], [7, -8], [7, 2]], m, 1.2);
  ctx.beginPath();
  ctx.moveTo(7, -6);
  ctx.lineTo(14, -10);
  ctx.lineTo(7, -3);
  ctx.closePath();
  fillStroke(ctx, m, 1);
}

export function weaponFormOf(t: WeaponType): string {
  if (t === "sword") return "sword";
  if (t === "spear") return "spear";
  if (t === "bow") return "bow";
  if (t === "dagger") return "dagger";
  if (t === "talisman") return "talisman";
  return "staff";
}
