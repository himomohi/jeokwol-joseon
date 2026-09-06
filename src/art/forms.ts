import type { WeaponType } from "../core/types";
import { ellipse, fillStroke, matOf, roundRect, type Mat } from "./materials";

export function drawWeaponForm(ctx: CanvasRenderingContext2D, form: string, tint: string, material: string, scale = 1): void {
  const m = matOf(material, tint);
  ctx.save();
  ctx.scale(scale, scale);
  switch (form) {
    case "sword":
      ctx.beginPath();
      ctx.moveTo(0, 14);
      ctx.lineTo(3, -18);
      ctx.lineTo(0, -22);
      ctx.lineTo(-3, -18);
      ctx.closePath();
      fillStroke(ctx, m, 1.2);
      ctx.beginPath();
      ctx.rect(-6, 8, 12, 3);
      fillStroke(ctx, matOf("iron"));
      break;
    case "spear":
      ctx.beginPath();
      ctx.moveTo(0, 18);
      ctx.lineTo(2, -16);
      ctx.lineTo(0, -24);
      ctx.lineTo(-2, -16);
      ctx.closePath();
      fillStroke(ctx, m, 1);
      break;
    case "bow":
      ctx.beginPath();
      ctx.arc(-2, 0, 16, -1.1, 1.1);
      ctx.strokeStyle = m.stroke;
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-2, -14);
      ctx.lineTo(8, 0);
      ctx.lineTo(-2, 14);
      ctx.strokeStyle = "#e8dcc0";
      ctx.lineWidth = 1;
      ctx.stroke();
      break;
    case "dagger":
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.lineTo(2, -10);
      ctx.lineTo(0, -14);
      ctx.lineTo(-2, -10);
      ctx.closePath();
      fillStroke(ctx, m);
      break;
    case "talisman":
      roundRect(ctx, -6, -10, 12, 18, 1);
      fillStroke(ctx, m, 1);
      ctx.fillStyle = "#8b1520";
      ctx.fillRect(-3, -6, 6, 2);
      ctx.fillRect(-2, -2, 4, 8);
      break;
    case "staff":
      ctx.beginPath();
      ctx.moveTo(0, 16);
      ctx.lineTo(0, -18);
      ctx.strokeStyle = m.stroke;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -20, 5, 0, Math.PI * 2);
      fillStroke(ctx, matOf("jade"));
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
      ctx.beginPath();
      ctx.moveTo(-3, 6);
      ctx.lineTo(0, -10);
      ctx.lineTo(3, 6);
      ctx.closePath();
      fillStroke(ctx, m);
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
      ctx.stroke();
      break;
    default:
      ellipse(ctx, 0, 0, 6, 6, m);
  }
  ctx.restore();
}

export function drawHat(ctx: CanvasRenderingContext2D, kind: string, m: Mat): void {
  ctx.save();
  if (kind === "gat" || kind === "gatTall") {
    ctx.beginPath();
    ctx.ellipse(0, 0, kind === "gatTall" ? 14 : 12, 3.5, 0, 0, Math.PI * 2);
    fillStroke(ctx, matOf("horsehair"));
    ctx.beginPath();
    ctx.rect(-3, -10, 6, 10);
    fillStroke(ctx, matOf("horsehair"));
  } else if (kind === "jeonrip") {
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 4, 0, 0, Math.PI * 2);
    fillStroke(ctx, m);
    ctx.beginPath();
    ctx.ellipse(0, -4, 7, 5, 0, 0, Math.PI * 2);
    fillStroke(ctx, m);
  } else if (kind === "songnak") {
    ctx.beginPath();
    ctx.moveTo(-10, 2);
    ctx.lineTo(0, -12);
    ctx.lineTo(10, 2);
    ctx.closePath();
    fillStroke(ctx, m);
  } else if (kind === "manggeon") {
    ctx.beginPath();
    ctx.arc(0, 2, 7, Math.PI, Math.PI * 2);
    fillStroke(ctx, matOf("hair"));
  } else if (kind === "helm") {
    ctx.beginPath();
    ctx.arc(0, 0, 9, Math.PI, Math.PI * 2);
    fillStroke(ctx, matOf("iron"));
  }
  ctx.restore();
}

export function weaponFormOf(t: WeaponType): string {
  if (t === "sword") return "sword";
  if (t === "spear") return "spear";
  if (t === "bow") return "bow";
  if (t === "dagger") return "dagger";
  if (t === "talisman") return "talisman";
  return "staff";
}
