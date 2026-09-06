import type { CharacterPose, JointId } from "../core/types";

const J = (x: number, y: number, rot: number, scale?: number) => ({ x, y, rot, scale });

export const POSES: Record<string, CharacterPose> = {
  idle: {
    id: "idle",
    duration: 0.8,
    joints: {
      hip: J(0, 0, 0),
      torso: J(0, -10, 0),
      head: J(0, -22, 0),
      hat: J(0, -30, 0),
      armL: J(-8, -12, 0.2),
      armR: J(8, -12, -0.2),
      handL: J(-10, -2, 0.1),
      handR: J(10, -2, -0.1),
      legL: J(-5, 8, 0.05),
      legR: J(5, 8, -0.05),
      weapon: J(14, -4, -0.6),
      offhand: J(-12, -2, 0.4),
      tail: J(-6, 4, 0.8),
    },
  },
  walk0: {
    id: "walk0",
    duration: 0.2,
    joints: {
      hip: J(0, 1, 0),
      torso: J(0, -10, 0.05),
      head: J(0, -22, 0),
      hat: J(0, -30, 0.04),
      armL: J(-8, -12, 0.5),
      armR: J(8, -12, -0.5),
      handL: J(-12, 2, 0.3),
      handR: J(12, -6, -0.4),
      legL: J(-6, 8, 0.45),
      legR: J(6, 8, -0.45),
      weapon: J(16, -8, -0.9),
      offhand: J(-12, 0, 0.3),
      tail: J(-8, 4, 1.0),
    },
  },
  walk1: {
    id: "walk1",
    duration: 0.2,
    joints: {
      hip: J(0, 0, 0),
      torso: J(0, -10, -0.05),
      head: J(0, -22, 0),
      hat: J(0, -30, -0.04),
      armL: J(-8, -12, -0.45),
      armR: J(8, -12, 0.45),
      handL: J(-12, -6, -0.2),
      handR: J(12, 2, 0.3),
      legL: J(-6, 8, -0.4),
      legR: J(5, 8, 0.45),
      weapon: J(14, 0, -0.4),
      offhand: J(-12, -4, 0.5),
      tail: J(-4, 4, 0.5),
    },
  },
  attack: {
    id: "attack",
    duration: 0.18,
    joints: {
      hip: J(0, 0, 0.1),
      torso: J(2, -10, 0.25),
      head: J(1, -22, 0.1),
      hat: J(1, -30, 0.1),
      armL: J(-10, -10, -0.4),
      armR: J(12, -14, -1.2),
      handL: J(-8, 0, 0),
      handR: J(20, -10, -1.4),
      legL: J(-6, 8, 0.2),
      legR: J(8, 8, -0.2),
      weapon: J(26, -12, -1.5),
      offhand: J(-10, 0, 0.2),
      tail: J(-8, 2, 1.1),
    },
  },
};

export function poseOf(moving: boolean, phase: number, attacking: boolean): CharacterPose {
  if (attacking) return POSES.attack!;
  if (!moving) return POSES.idle!;
  return (phase % 1 < 0.5 ? POSES.walk0 : POSES.walk1)!;
}

export function joint(p: CharacterPose, id: JointId): { x: number; y: number; rot: number; scale: number } {
  const j = p.joints[id] ?? { x: 0, y: 0, rot: 0 };
  return { x: j.x, y: j.y, rot: j.rot, scale: j.scale ?? 1 };
}
