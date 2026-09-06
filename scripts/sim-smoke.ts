import { applySave, createEmptySim, handleCommand, liveStats, snapshot, step } from "../src/world/sim";
import { reviewContent } from "../src/review/verify";
import { JOBS } from "../src/content/jobs";

const r = reviewContent();
console.log("REVIEW", JSON.stringify(r));
if (!r.ok) throw new Error(r.notes.join(", "));

const sim = createEmptySim();
handleCommand(sim, { type: "newGame", name: "시험", job: "musa", slot: 0, seed: 1 });
const atk = liveStats(sim).atk;
for (let i = 0; i < 600; i++) {
  handleCommand(sim, { type: "move", ax: -1, ay: 0 });
  handleCommand(sim, { type: "aim", x: sim.player.x - 40, y: sim.player.y });
  step(sim, 1 / 120);
}
const enemies = sim.actors.filter((a) => a.kind === "enemy" && !a.dead && !a.defId.startsWith("boss"));
console.log("pos", sim.player.x.toFixed(1), sim.player.y.toFixed(1), "atk", atk, "enemies", enemies.length, "chunks", sim.terrain.size());
if (!enemies.length) throw new Error("마을 서쪽에 적이 없다");

enemies.sort((a, b) => a.hpMax - b.hpMax);
const e = enemies[0]!;
sim.player.x = e.x + 18;
sim.player.y = e.y;
handleCommand(sim, { type: "aim", x: e.x, y: e.y });
for (let i = 0; i < 900; i++) {
  handleCommand(sim, { type: "attack" });
  step(sim, 1 / 120);
  if (e.dead) break;
}
console.log("kill", e.name, "dead", e.dead, "xp", sim.meta.xp, "gold", sim.meta.gold, "drops", sim.drops.length, "hpLeft", e.hp);
if (!e.dead) throw new Error("적을 죽이지 못했다");
if (sim.meta.xp <= 0) throw new Error("경험치가 없다");

const before = liveStats(sim).atk;
const rusty = sim.meta.inventory.find((i) => i.itemId === "sword_rusty");
if (!rusty || sim.meta.equip.weapon !== rusty.instId) throw new Error("시작 무기가 없다");
const after = liveStats(sim).atk;
if (after < before) throw new Error("장착 스탯이 줄었다");
console.log("equip atk", before, after);

sim.meta.level = 8;
handleCommand(sim, { type: "advanceJob", jobId: "geomgaek" });
console.log("job", sim.meta.job, JOBS[sim.meta.job].name, "bar", sim.meta.bar.filter(Boolean).length);
if (sim.meta.job !== "geomgaek") throw new Error("전직 실패");
if (sim.meta.bar.filter(Boolean).length < 8) throw new Error("전직 초식이 8개 미만");

const blob = snapshot(sim);
const loaded = createEmptySim();
applySave(loaded, blob);
if (loaded.meta.job !== "geomgaek") throw new Error("불러오기 전직 유실");
if (Math.abs(loaded.player.x - sim.player.x) > 0.1) throw new Error("위치 유실");
console.log("OK");
