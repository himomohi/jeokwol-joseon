import { screenToWorld, type Camera } from "../core/coords";

export interface Input {
  ax: number;
  ay: number;
  mx: number;
  my: number;
  attack: boolean;
  pickup: boolean;
  talk: boolean;
  rest: boolean;
  skills: boolean[];
  toggle: { inv: boolean; skills: boolean; map: boolean; char: boolean; pause: boolean; post: boolean; help: boolean };
}

export function createInput(): Input {
  return {
    ax: 0,
    ay: 0,
    mx: 0,
    my: 0,
    attack: false,
    pickup: false,
    talk: false,
    rest: false,
    skills: [false, false, false, false, false, false, false, false],
    toggle: { inv: false, skills: false, map: false, char: false, pause: false, post: false, help: false },
  };
}

export function bindInput(target: HTMLElement, input: Input, cam: () => Camera): void {
  const down = new Set<string>();
  const syncMove = (): void => {
    let x = 0;
    let y = 0;
    if (down.has("KeyW") || down.has("ArrowUp")) y -= 1;
    if (down.has("KeyS") || down.has("ArrowDown")) y += 1;
    if (down.has("KeyA") || down.has("ArrowLeft")) x -= 1;
    if (down.has("KeyD") || down.has("ArrowRight")) x += 1;
    input.ax = x;
    input.ay = y;
  };

  window.addEventListener("keydown", (e) => {
    if (e.repeat && ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "KeyJ", "KeyE", "KeyF"].includes(e.code)) return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
    if (e.target instanceof HTMLInputElement) return;
    down.add(e.code);
    syncMove();
    const n = Number(e.key);
    if (n >= 1 && n <= 8) input.skills[n - 1] = true;
    if (e.code === "KeyJ") input.attack = true;
    if (e.code === "KeyF") input.pickup = true;
    if (e.code === "KeyE") input.talk = true;
    if (e.code === "KeyR") input.rest = true;
    if (e.code === "KeyI") input.toggle.inv = true;
    if (e.code === "KeyK") input.toggle.skills = true;
    if (e.code === "KeyM") input.toggle.map = true;
    if (e.code === "KeyC") input.toggle.char = true;
    if (e.code === "Escape") input.toggle.pause = true;
    if (e.code === "KeyP") input.toggle.post = true;
    if (e.code === "Slash" || e.code === "F1") input.toggle.help = true;
  });
  window.addEventListener("keyup", (e) => {
    down.delete(e.code);
    syncMove();
  });
  window.addEventListener("blur", () => {
    down.clear();
    syncMove();
  });
  target.addEventListener("pointermove", (e) => {
    const r = target.getBoundingClientRect();
    input.mx = (e.clientX - r.left) * (target instanceof HTMLCanvasElement ? target.width / r.width : 1);
    input.my = (e.clientY - r.top) * (target instanceof HTMLCanvasElement ? target.height / r.height : 1);
  });
  target.addEventListener("pointerdown", (e) => {
    if (e.button === 0) input.attack = true;
  });
  target.addEventListener("contextmenu", (e) => e.preventDefault());

  void cam;
}

export function consumeEdges(input: Input): void {
  input.attack = false;
  input.pickup = false;
  input.talk = false;
  input.rest = false;
  input.skills.fill(false);
  input.toggle.inv = false;
  input.toggle.skills = false;
  input.toggle.map = false;
  input.toggle.char = false;
  input.toggle.pause = false;
  input.toggle.post = false;
  input.toggle.help = false;
}

export { screenToWorld };
