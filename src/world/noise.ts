import { hash2, hash3 } from "../core/rng";

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function grad(ix: number, iy: number, seed: number): number {
  return (hash3(ix, iy, seed) / 4294967296) * 2 - 1;
}

export function valueNoise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = fade(x - x0);
  const fy = fade(y - y0);
  const a = grad(x0, y0, seed);
  const b = grad(x0 + 1, y0, seed);
  const c = grad(x0, y0 + 1, seed);
  const d = grad(x0 + 1, y0 + 1, seed);
  return lerp(lerp(a, b, fx), lerp(c, d, fx), fy);
}

export function fbm(x: number, y: number, seed: number, octaves = 4): number {
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let n = 0;
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(x * freq, y * freq, seed + i * 1013) * amp;
    n += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / n;
}

export function randAt(tx: number, ty: number, seed: number, salt = 0): number {
  return hash2(hash3(tx, ty, seed), salt) / 4294967296;
}
