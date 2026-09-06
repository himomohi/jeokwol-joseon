/** Independent deterministic RNG. Never share instances across world/art/combat/loot. */

export class Rng {
  private s: number;

  constructor(seed: number) {
    this.s = seed >>> 0 || 1;
  }

  seed(): number {
    return this.s;
  }

  setSeed(seed: number): void {
    this.s = seed >>> 0 || 1;
  }

  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  float(min = 0, max = 1): number {
    return min + this.next() * (max - min);
  }

  int(min: number, max: number): number {
    if (max <= min) return min;
    return min + Math.floor(this.next() * (max - min));
  }

  intInc(min: number, max: number): number {
    return this.int(min, max + 1);
  }

  chance(p: number): boolean {
    return this.next() < p;
  }

  pick<T>(arr: readonly T[]): T {
    return arr[this.int(0, arr.length)]!;
  }

  weighted<T extends { w: number }>(arr: readonly T[]): T {
    let sum = 0;
    for (const a of arr) sum += a.w;
    let r = this.next() * sum;
    for (const a of arr) {
      r -= a.w;
      if (r <= 0) return a;
    }
    return arr[arr.length - 1]!;
  }

  around(base: number, spread: number): number {
    return base + (this.next() * 2 - 1) * spread;
  }
}

export function hash2(a: number, b: number): number {
  let h = (a | 0) ^ 0x9e3779b9;
  h = Math.imul(h ^ (b | 0), 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  return h >>> 0;
}

export function hash3(a: number, b: number, c: number): number {
  return hash2(hash2(a, b), c);
}

export function hashStr(seed: number, key: string): number {
  let h = seed >>> 0;
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(h ^ key.charCodeAt(i), 0x01000193);
  }
  return h >>> 0;
}

export function coordRng(worldSeed: number, tx: number, ty: number, salt = 0): Rng {
  return new Rng(hash3(worldSeed, tx * 73856093, ty * 19349663) ^ salt);
}

export const STREAM_SALT = {
  world: 0x57a1d001,
  art: 0xa17e1100,
  combat: 0xc0ba77e1,
  loot: 0x1007e001,
} as const;
