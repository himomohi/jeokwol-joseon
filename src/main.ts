import "./ui/style.css";
import { screenToWorld } from "./core/coords";
import { createEmptySim, handleCommand, nearestNpc, step } from "./world/sim";
import { Renderer } from "./rendering/renderer";
import { bindInput, consumeEdges, createInput } from "./app/input";
import { createLoop, tickLoop } from "./app/loop";
import { createUiState, doSave, mountUi, renderUi } from "./ui/ui";
import { AudioBus } from "./audio/audio";
import { bumpArt } from "./art/cache";
import { bootPrep } from "./app/boot";

const canvas = document.getElementById("world") as HTMLCanvasElement;
const uiRoot = document.getElementById("ui-root") as HTMLElement;

const sim = createEmptySim();
const renderer = new Renderer(canvas);
const input = createInput();
const loop = createLoop();
const ui = createUiState();
const audio = new AudioBus();
let lastEquip = "";
let lastUi = "";
let boot = true;

mountUi(uiRoot);
bootPrep();
bindInput(canvas, input, () => renderer.cam);

function resize(): void {
  renderer.resize(window.innerWidth, window.innerHeight, Math.min(2, window.devicePixelRatio || 1));
}
window.addEventListener("resize", resize);
resize();

canvas.addEventListener("pointerdown", () => {
  void audio.unlock();
});

function pumpInput(): void {
  if (sim.mode !== "play") {
    consumeEdges(input);
    return;
  }
  handleCommand(sim, { type: "move", ax: input.ax, ay: input.ay });
  const w = screenToWorld(renderer.cam, input.mx, input.my);
  handleCommand(sim, { type: "aim", x: w.x, y: w.y });
  if (input.attack) handleCommand(sim, { type: "attack" });
  if (input.pickup) handleCommand(sim, { type: "pickupNearest" });
  if (input.talk) {
    const n = nearestNpc(sim);
    if (n?.npcId) handleCommand(sim, { type: "talk", npcId: n.npcId });
  }
  if (input.rest) {
    handleCommand(sim, { type: "rest" });
    doSave(sim);
  }
  for (let i = 0; i < 8; i++) if (input.skills[i]) handleCommand(sim, { type: "useSkill", slot: i });
  if (input.toggle.inv) ui.panel = ui.panel === "inv" ? "none" : "inv";
  if (input.toggle.skills) ui.panel = ui.panel === "skills" ? "none" : "skills";
  if (input.toggle.map) ui.panel = ui.panel === "map" ? "none" : "map";
  if (input.toggle.char) ui.panel = ui.panel === "char" ? "none" : "char";
  if (input.toggle.help) ui.panel = ui.panel === "help" ? "none" : "help";
  if (input.toggle.pause) {
    sim.paused = !sim.paused;
    if (sim.paused) ui.panel = "none";
  }
  if (input.toggle.post) {
    sim.postOn = !sim.postOn;
    handleCommand(sim, { type: "setPost", on: sim.postOn });
  }
  consumeEdges(input);
}

function onEvents(): void {
  for (const e of sim.events) {
    if (e.type === "damaged") renderer.particles.burst(e.x, e.y, "hit", 6);
    if (e.type === "killed") {
      renderer.particles.burst(e.x, e.y, "kill", 14);
      audio.sfx("kill");
    }
    if (e.type === "pickedUp") audio.sfx("loot");
    if (e.type === "skillUsed") audio.sfx("skill");
    if (e.type === "leveledUp") audio.sfx("level");
    if (e.type === "equipped") bumpArt();
    if (e.type === "damaged" && e.src === "player") audio.sfx("hit");
  }
  const key = JSON.stringify(sim.meta.equip);
  if (key !== lastEquip) {
    lastEquip = key;
    bumpArt();
  }
}

function frame(tms: number): void {
  const now = tms / 1000;
  if (boot) {
    boot = false;
    renderUi(uiRoot, sim, ui, { fps: 0, fpsSim: 0, post: sim.postOn, webglLost: renderer.post.lost });
  }
  pumpInput();
  tickLoop(
    loop,
    now,
    sim.paused || sim.mode !== "play",
    (dt) => {
      step(sim, dt);
      renderer.particles.step(dt);
      onEvents();
    },
    (alpha) => {
      renderer.draw(sim, alpha);
      const sig =
        sim.mode === "title"
          ? `title|${ui.job}|${ui.slot}|${sim.saveHint ?? ""}`
          : `${sim.mode}|${sim.paused}|${ui.panel}|${Math.floor(sim.player.hp)}|${sim.meta.gold}|${sim.talk?.npcId ?? ""}|${sim.shopOpen}|${sim.messages.length}|${sim.meta.level}|${sim.meta.job}|${renderer.post.lost}|${Math.floor(now * 2)}|${sim.meta.inventory.length}|${sim.player.mp | 0}`;
      if (sig !== lastUi) {
        lastUi = sig;
        renderUi(uiRoot, sim, ui, { fps: loop.fps, fpsSim: loop.simFps, post: sim.postOn, webglLost: renderer.post.lost });
      }
    },
  );
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
