import { clamp, lerp, smoothstep } from "../core/math";
import { weaponTipOffset } from "./forms";

/** Shared with sim so trail phase matches the drawn swing. */
export const ATTACK_DUR = 0.22;
export const PLAYER_DRAW_SCALE = 1.22;

/** Local 3D: x right, y forward (depth), z up. Projected to top-down 3/4. */
export const DEPTH_X = 0.38;
export const DEPTH_Y = 0.26;
export const HEIGHT = 1;

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export function finite(n: number, fb = 0): number {
  return Number.isFinite(n) ? n : fb;
}

export function v3(x: number, y: number, z: number): Vec3 {
  return { x: finite(x), y: finite(y), z: finite(z) };
}

/** Depth + height style 2D projection of a 3D-ish joint. NaN-safe. */
export function project3(p: Vec3): Vec2 {
  const x = finite(finite(p.x) + finite(p.y) * DEPTH_X);
  const y = finite(-finite(p.z) * HEIGHT + finite(p.y) * DEPTH_Y);
  return { x, y };
}

/**
 * 2-bone IK elbow (or knee). Pole leans out to `side` and slightly back/up.
 * Degenerate / NaN inputs collapse to a safe mid-bone.
 */
export function solveElbow(sh: Vec3, hand: Vec3, upper: number, lower: number, side: number): Vec3 {
  const ul = finite(upper, 6);
  const ll = finite(lower, 5.5);
  const dx = finite(hand.x - sh.x);
  const dy = finite(hand.y - sh.y);
  const dz = finite(hand.z - sh.z);
  let d = Math.hypot(dx, dy, dz);
  if (!Number.isFinite(d) || d < 1e-4) d = 1e-4;
  const maxd = Math.max(0.2, ul + ll - 0.12);
  const mind = Math.abs(ul - ll) + 0.12;
  const t = clamp(d, mind, maxd);
  const fx = dx / d;
  const fy = dy / d;
  const fz = dz / d;
  const u = (ul * ul - ll * ll + t * t) / (2 * t);
  const hh = Math.sqrt(Math.max(0, ul * ul - u * u));
  let px = finite(side, 1);
  let py = -0.35;
  let pz = 0.55;
  const dot = px * fx + py * fy + pz * fz;
  px -= dot * fx;
  py -= dot * fy;
  pz -= dot * fz;
  let pl = Math.hypot(px, py, pz);
  if (!Number.isFinite(pl) || pl < 1e-5) {
    px = 0;
    py = 1;
    pz = 0;
    pl = 1;
  }
  px /= pl;
  py /= pl;
  pz /= pl;
  return v3(sh.x + fx * u + px * hh, sh.y + fy * u + py * hh, sh.z + fz * u + pz * hh);
}

export interface RigInput {
  moving: boolean;
  walkPhase: number;
  attackT: number;
  weaponForm: string;
}

export interface SolvedRig {
  hip: Vec2;
  torso: Vec2;
  torsoRot: number;
  head: Vec2;
  hat: Vec2;
  hatRot: number;
  shoulderL: Vec2;
  elbowL: Vec2;
  handL: Vec2;
  shoulderR: Vec2;
  elbowR: Vec2;
  handR: Vec2;
  footL: Vec2;
  footR: Vec2;
  kneeL: Vec2;
  kneeR: Vec2;
  weapon: Vec2;
  weaponRot: number;
  weaponTip: Vec2;
  offhand: Vec2;
}

export function attackPhase(attackAnim: number): number {
  if (attackAnim <= 0) return 0;
  return clamp(1 - finite(attackAnim) / ATTACK_DUR, 0, 1);
}

function walkMotion(phase: number) {
  const p = ((finite(phase) % 1) + 1) % 1;
  const swing = Math.sin(p * Math.PI * 2);
  const bob = Math.abs(Math.sin(p * Math.PI * 2));
  return {
    hipX: swing * 1.35,
    hipZ: bob * 1.5,
    torsoTwist: swing * 0.22,
    torsoY: swing * 0.75,
    legL: swing,
    legR: -swing,
    armL: -swing,
    armR: swing,
  };
}

function attackMotion(t: number) {
  const u = clamp(finite(t), 0, 1);
  const wind = smoothstep(clamp(u / 0.28, 0, 1));
  const slash = smoothstep(clamp((u - 0.2) / 0.5, 0, 1));
  const follow = smoothstep(clamp((u - 0.7) / 0.3, 0, 1));
  return {
    torsoTwist: -0.52 * wind + 0.88 * slash - 0.16 * follow,
    hipX: -2.4 * wind + 4.4 * slash,
    hipZ: 1.7 * wind * (1 - slash),
    torsoY: -1.3 * wind + 2.5 * slash,
    weaponYaw: -1.4 * (1 - slash) + 1.8 * slash,
    weaponZ: 14 * wind - 9 * slash,
    weaponY: -7.5 * wind + 13 * slash,
    weaponX: 6 + 11 * slash,
  };
}

export function solveRig(input: RigInput): SolvedRig {
  const moving = !!input.moving && input.attackT <= 0;
  const w = walkMotion(input.walkPhase);
  const at = input.attackT > 0 ? attackMotion(input.attackT) : null;

  const hipX = at ? at.hipX : moving ? w.hipX : 0;
  const hipZ = at ? at.hipZ : moving ? w.hipZ : 0;
  const twist = at ? at.torsoTwist : moving ? w.torsoTwist : 0;
  const torsoY = 1.2 + (at ? at.torsoY : moving ? w.torsoY : 0);

  const hip = v3(hipX, 0, hipZ);
  const torso = v3(hipX + twist * 2.2, torsoY, hipZ + 10);
  const head = v3(torso.x + twist * 1.3, torso.y + 1.5, torso.z + 10);
  const hat = v3(head.x, head.y + 0.4, head.z + 7);

  const shL = v3(torso.x - 8, torso.y + 0.45, torso.z + 3.6);
  const shR = v3(torso.x + 8, torso.y + 0.45, torso.z + 3.6);

  const handL = v3(
    shL.x - 2 + (moving ? w.armL * 3.2 : 0),
    shL.y + 1 + (moving ? w.armL * 4.2 : 0),
    shL.z - 8 + (moving ? -w.armL * 2.2 : 0),
  );
  const handR = v3(
    shR.x + 2 + (at ? at.weaponX * 0.42 : moving ? w.armR * 3.2 : 0),
    shR.y + 1 + (at ? at.weaponY * 0.36 : moving ? w.armR * 4.2 : 0),
    shR.z - 8 + (at ? at.weaponZ * 0.36 : moving ? -w.armR * 2.2 : 0),
  );

  const elbowL = solveElbow(shL, handL, 6.2, 5.6, -1);
  const elbowR = solveElbow(shR, handR, 6.2, 5.6, 1);

  const footL = v3(
    hip.x - 4.6 + (moving ? w.legL * 1.3 : 0),
    hip.y + (moving ? w.legL * 5.2 : 0.4),
    hip.z - 11 + (moving ? Math.max(0, w.legL) * 2.3 : 0),
  );
  const footR = v3(
    hip.x + 4.6 + (moving ? w.legR * 1.3 : 0),
    hip.y + (moving ? w.legR * 5.2 : 0.4),
    hip.z - 11 + (moving ? Math.max(0, w.legR) * 2.3 : 0),
  );
  const hipL = v3(hip.x - 3.2, hip.y, hip.z - 1);
  const hipR = v3(hip.x + 3.2, hip.y, hip.z - 1);
  const kneeL = solveElbow(hipL, footL, 6.5, 6.2, -0.45);
  const kneeR = solveElbow(hipR, footR, 6.5, 6.2, 0.45);

  const wep = v3(
    handR.x + 3.2 + (at ? at.weaponX * 0.22 : moving ? w.armR * 1.4 : 0),
    handR.y + (at ? at.weaponY * 0.18 : 0.55),
    handR.z + 2.2 + (at ? at.weaponZ * 0.22 : 1),
  );
  const tipOff = weaponTipOffset(input.weaponForm);
  const yaw = at ? at.weaponYaw : moving ? -0.55 + w.armR * 0.38 : -0.55;
  const cy = Math.cos(finite(yaw));
  const sy = Math.sin(finite(yaw));
  const tip3 = v3(
    wep.x + tipOff.x * cy - tipOff.y * sy,
    wep.y + tipOff.z,
    wep.z + tipOff.x * sy + tipOff.y * cy,
  );

  const wep2 = project3(wep);
  const tip2 = project3(tip3);
  const weaponRot = finite(Math.atan2(tip2.y - wep2.y, tip2.x - wep2.x) + Math.PI / 2);

  return {
    hip: project3(hip),
    torso: project3(torso),
    torsoRot: finite(twist),
    head: project3(head),
    hat: project3(hat),
    hatRot: finite(twist * 0.4),
    shoulderL: project3(shL),
    elbowL: project3(elbowL),
    handL: project3(handL),
    shoulderR: project3(shR),
    elbowR: project3(elbowR),
    handR: project3(handR),
    footL: project3(footL),
    footR: project3(footR),
    kneeL: project3(kneeL),
    kneeR: project3(kneeR),
    weapon: wep2,
    weaponRot,
    weaponTip: tip2,
    offhand: project3(handL),
  };
}

export function weaponTipWorld(ax: number, ay: number, facing: number, scale: number, rig: SolvedRig): Vec2 {
  const a = finite(facing) + Math.PI / 2;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const lx = finite(rig.weaponTip.x) * finite(scale, 1);
  const ly = finite(rig.weaponTip.y) * finite(scale, 1);
  return {
    x: finite(ax + lx * c - ly * s),
    y: finite(ay + lx * s + ly * c),
  };
}

export function sampleWeaponTip(
  ax: number,
  ay: number,
  facing: number,
  moving: boolean,
  walkPhase: number,
  attackT: number,
  form: string,
  scale = PLAYER_DRAW_SCALE,
): Vec2 {
  const rig = solveRig({ moving, walkPhase, attackT, weaponForm: form || "sword" });
  return weaponTipWorld(ax, ay, facing, scale, rig);
}

export function lerpVec2(a: Vec2, b: Vec2, t: number): Vec2 {
  const u = clamp(finite(t), 0, 1);
  return { x: finite(lerp(a.x, b.x, u)), y: finite(lerp(a.y, b.y, u)) };
}
