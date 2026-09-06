import { ITEMS } from "../content/items";
import { drawWeaponForm } from "./forms";

const cache = new Map<string, HTMLCanvasElement>();

export function iconCanvas(itemId: string, size = 48): HTMLCanvasElement {
  const k = `${itemId}:${size}`;
  let c = cache.get(k);
  if (c) return c;
  c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const it = ITEMS[itemId];
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "rgba(20,10,12,0.4)";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(size / 2, size / 2);
  ctx.scale(size / 48, size / 48);
  if (it) drawWeaponForm(ctx, it.visual.form, it.visual.tint, it.visual.material, 1.15);
  else {
    ctx.fillStyle = "#c9a46a";
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  cache.set(k, c);
  return c;
}

export function iconSvg(itemId: string): string {
  const it = ITEMS[itemId];
  const tint = it?.visual.tint ?? "#c9a46a";
  const form = it?.visual.form ?? "amulet";
  const path = formPath(form);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="6" fill="#1a0c10"/><g fill="${tint}" stroke="#14080c" stroke-width="1">${path}</g></svg>`;
}

function formPath(form: string): string {
  switch (form) {
    case "sword":
      return `<polygon points="16,4 19,22 16,26 13,22"/>`;
    case "spear":
      return `<polygon points="16,3 18,24 16,28 14,24"/>`;
    case "bow":
      return `<path d="M10 6 Q22 16 10 26" fill="none" stroke-width="2"/><line x1="10" y1="6" x2="10" y2="26"/>`;
    case "dagger":
      return `<polygon points="16,6 18,20 16,24 14,20"/>`;
    case "talisman":
      return `<rect x="11" y="6" width="10" height="18" rx="1"/>`;
    case "staff":
      return `<rect x="15" y="8" width="2" height="18"/><circle cx="16" cy="7" r="4"/>`;
    case "gourd":
      return `<ellipse cx="16" cy="18" rx="6" ry="8"/><ellipse cx="16" cy="9" rx="3" ry="4"/>`;
    case "gat":
      return `<ellipse cx="16" cy="20" rx="10" ry="3"/><rect x="14" y="8" width="4" height="12"/>`;
    case "robe":
      return `<path d="M10 28 L12 10 L16 6 L20 10 L22 28 Z"/>`;
    case "fang":
      return `<polygon points="16,6 20,24 12,24"/>`;
    default:
      return `<circle cx="16" cy="16" r="8"/>`;
  }
}

export function invalidateArtCaches(): void {
  cache.clear();
}
