import { drawEnemy, drawPlayer, type DrawVis } from "./actors";
import { PAL } from "./palette";
import { preloadApprovedPng } from "./cache";
import type { Actor } from "../world/sim";
import { drawBamboo, drawHanok, drawHanokRoof, drawPine, drawTent, drawTile } from "./worldArt";
import { PROPS } from "../content/world";

function dummy(art: string, facing = -Math.PI / 2): Actor {
  return {
    id: art,
    kind: "enemy",
    defId: art,
    name: art,
    x: 0,
    y: 0,
    px: 0,
    py: 0,
    vx: 0,
    vy: 0,
    facing,
    hp: 1,
    hpMax: 1,
    mp: 0,
    radius: 14,
    team: 1,
    grade: "ha",
    flash: 0,
    stunUntil: 0,
    invulnUntil: 0,
    attackAnim: 0,
    walkPhase: 0,
    dead: false,
    art,
    aiRole: "meleeChase",
    aiT: 0,
    aiTx: 0,
    aiTy: 0,
    attackCd: 0,
  };
}

const KEYS: { label: string; art?: string; player?: DrawVis }[] = [
  { label: "무사", player: { robe: PAL.blood_deep, hat: "gat", weaponForm: "sword", weaponTint: PAL.ui_steel, weaponMat: "iron", armorKind: "robe", horse: false, jobId: "musa" } },
  { label: "궁수", player: { robe: PAL.env_mid, hat: "jeollip", weaponForm: "bow", weaponTint: PAL.earth_dark, weaponMat: "wood", armorKind: "robe", horse: false, jobId: "gungsoo" } },
  { label: "산적", art: "bandit" },
  { label: "포졸", art: "pojol" },
  { label: "호랑이", art: "tiger" },
  { label: "도깨비", art: "dokkaebi" },
  { label: "구미호", art: "gumiho" },
  { label: "이무기", art: "imugi" },
];

export function paintJoseonSheet(canvas: HTMLCanvasElement): void {
  preloadApprovedPng();
  const ctx = canvas.getContext("2d")!;
  const cell = 96;
  const cols = 4;
  const rows = Math.ceil(KEYS.length / cols);
  canvas.width = cols * cell;
  canvas.height = rows * cell + 24;
  ctx.fillStyle = PAL.env_mid;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "11px serif";
  ctx.textAlign = "center";
  KEYS.forEach((row, i) => {
    const x = (i % cols) * cell + cell / 2;
    const y = Math.floor(i / cols) * cell + 50;
    ctx.save();
    ctx.translate(x, y);
    if (row.player) {
      const a = dummy("player");
      a.kind = "player";
      drawPlayer(ctx, a, row.player, false);
    } else {
      drawEnemy(ctx, dummy(row.art!));
    }
    ctx.restore();
    ctx.fillStyle = PAL.bone_light;
    ctx.fillText(row.label, x, Math.floor(i / cols) * cell + cell - 8);
  });
}

export function paintWorldQa(canvas: HTMLCanvasElement): void {
  canvas.width = 1100;
  canvas.height = 640;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = PAL.bg_void;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "13px serif";
  ctx.fillStyle = PAL.bone_light;

  ctx.fillText("ground village / hanyang / road", 16, 18);
  for (let i = 0; i < 8; i++) {
    drawTile(ctx, "village", 16 + i * 48, 28, 1);
    drawTile(ctx, "hanyang", 16 + i * 48, 80, 1);
    drawTile(ctx, "road", 16 + i * 48, 132, 1);
  }

  ctx.fillText("tent", 420, 18);
  ctx.save();
  ctx.translate(500, 90);
  drawTent(ctx);
  ctx.restore();

  ctx.fillText("hanok + roof", 620, 18);
  ctx.save();
  ctx.translate(720, 110);
  drawHanok(ctx, "house", PROPS.house.w, PROPS.house.h);
  drawHanokRoof(ctx, -70, -72, 140, 70);
  ctx.restore();

  ctx.fillText("pine", 16, 210);
  ctx.save();
  ctx.translate(90, 320);
  drawPine(ctx);
  ctx.restore();

  ctx.fillText("bamboo", 200, 210);
  ctx.save();
  ctx.translate(270, 320);
  drawBamboo(ctx);
  ctx.restore();

  ctx.fillText("shop", 400, 210);
  ctx.save();
  ctx.translate(500, 300);
  drawHanok(ctx, "shop", PROPS.shop.w, PROPS.shop.h);
  drawHanokRoof(ctx, -74, -76, 148, 74);
  ctx.restore();
}
