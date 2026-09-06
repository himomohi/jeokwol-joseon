import { MAX_FRAME, SIM_DT } from "../core/coords";

export interface Loop {
  acc: number;
  last: number;
  fps: number;
  simFps: number;
  frames: number;
  simFrames: number;
  fpsT: number;
}

export function createLoop(): Loop {
  return { acc: 0, last: performance.now() / 1000, fps: 0, simFps: 0, frames: 0, simFrames: 0, fpsT: 0 };
}

export function tickLoop(
  loop: Loop,
  now: number,
  paused: boolean,
  step: (dt: number) => void,
  render: (alpha: number) => void,
): void {
  let dt = now - loop.last;
  loop.last = now;
  if (dt > MAX_FRAME) dt = MAX_FRAME;
  loop.frames += 1;
  loop.fpsT += dt;
  if (loop.fpsT >= 0.5) {
    loop.fps = loop.frames / loop.fpsT;
    loop.simFps = loop.simFrames / loop.fpsT;
    loop.frames = 0;
    loop.simFrames = 0;
    loop.fpsT = 0;
  }
  if (!paused) {
    loop.acc += dt;
    let guard = 0;
    while (loop.acc >= SIM_DT && guard++ < 8) {
      step(SIM_DT);
      loop.acc -= SIM_DT;
      loop.simFrames += 1;
    }
    if (guard >= 8) loop.acc = 0;
  }
  const alpha = paused ? 1 : loop.acc / SIM_DT;
  render(alpha);
}
