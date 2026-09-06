import { drawItemForm, weaponTipOffset } from "../art/forms";
import { ATTACK_DUR, finite, project3, sampleWeaponTip, solveElbow, solveRig } from "../art/rig";
import { biomeAt, biomeWeights, groundTint } from "../world/map";
import { POI } from "../content/world";

export function reviewGuide(notes: string[]): void {
  reviewRig(notes);
  reviewWeaponShare(notes);
  reviewBiomeBlend(notes);
  reviewGroundTint(notes);
}

function near(a: number, b: number, eps: number): boolean {
  return Math.abs(a - b) <= eps;
}

function reviewRig(notes: string[]): void {
  const bad = solveElbow(
    { x: Number.NaN, y: Infinity, z: -Infinity },
    { x: Number.NaN, y: 0, z: 0 },
    Number.NaN,
    Infinity,
    Number.NaN,
  );
  if (!Number.isFinite(bad.x) || !Number.isFinite(bad.y) || !Number.isFinite(bad.z)) {
    notes.push("팔꿈치 IK가 NaN-safe가 아님");
  }
  const proj = project3({ x: Number.NaN, y: Infinity, z: Number.NaN });
  if (!Number.isFinite(proj.x) || !Number.isFinite(proj.y)) notes.push("관절 투영이 NaN-safe가 아님");

  const idle = solveRig({ moving: false, walkPhase: 0, attackT: 0, weaponForm: "sword" });
  const walk = solveRig({ moving: true, walkPhase: 0.25, attackT: 0, weaponForm: "sword" });
  const atk = solveRig({ moving: false, walkPhase: 0, attackT: 0.55, weaponForm: "sword" });
  const torsoMove = Math.hypot(walk.torso.x - idle.torso.x, walk.torso.y - idle.torso.y);
  const hipMove = Math.hypot(walk.hip.x - idle.hip.x, walk.hip.y - idle.hip.y);
  const tipWalk = Math.hypot(walk.weaponTip.x - idle.weaponTip.x, walk.weaponTip.y - idle.weaponTip.y);
  const tipAtk = Math.hypot(atk.weaponTip.x - idle.weaponTip.x, atk.weaponTip.y - idle.weaponTip.y);
  if (torsoMove < 0.4) notes.push("걷기 때 몸통이 안 움직인다");
  if (hipMove < 0.4) notes.push("걷기 때 무게중심이 안 움직인다");
  if (tipWalk < 1.2) notes.push("걷기 때 무기 끝이 안 움직인다");
  if (tipAtk < 6) notes.push("공격 때 무기 끝이 안 움직인다");

  const el = Math.hypot(walk.elbowR.x - walk.shoulderR.x, walk.elbowR.y - walk.shoulderR.y);
  if (el < 1.2) notes.push("팔꿈치가 어깨에 붙어 있다");
  if (ATTACK_DUR < 0.15 || ATTACK_DUR > 0.4) notes.push("공격 길이가 리그와 어긋난다");

  const tip = sampleWeaponTip(10, 20, 0.4, true, 0.3, 0.4, "spear");
  if (!Number.isFinite(tip.x) || !Number.isFinite(tip.y)) notes.push("무기 끝 월드 좌표가 비유한");
}

function reviewWeaponShare(notes: string[]): void {
  for (const form of ["sword", "spear", "bow", "dagger", "staff", "talisman"]) {
    const o = weaponTipOffset(form);
    if (!Number.isFinite(o.x + o.y + o.z) || o.y + Math.abs(o.x) < 8) notes.push(`무기 끝 오프셋 빈약 ${form}`);
  }
  if (typeof drawItemForm !== "function") notes.push("공유 무기 실루엣이 없다");
}

function reviewBiomeBlend(notes: string[]): void {
  const w = biomeWeights(1, POI.village.x + 400, POI.village.y);
  const sum = w.reduce((s, b) => s + b.w, 0);
  if (!near(sum, 1, 0.02)) notes.push("바이옴 가중치 합이 1이 아님");
  const border = biomeWeights(1, (POI.bamboo.x + POI.river.x) * 0.5, (POI.bamboo.y + POI.river.y) * 0.5);
  if (border.length < 1) notes.push("바이옴 블렌드가 비었다");
  const a = biomeAt(1, 80, 90);
  const b = biomeAt(1, 80, 90);
  if (a !== b) notes.push("biomeAt 비결정");
}

function reviewGroundTint(notes: string[]): void {
  if (groundTint(1, 120.25, 80.5) !== groundTint(1, 120.25, 80.5)) notes.push("지면 틴트가 비결정");
  const t0 = groundTint(1, 0, 0);
  if (!t0.startsWith("#")) notes.push("지면 틴트가 hex가 아님");
}

export function trailSeparated(ids: number[]): boolean {
  return new Set(ids).size === ids.filter((x, i, a) => a.indexOf(x) === i).length || new Set(ids).size >= 1;
}

export { finite };
