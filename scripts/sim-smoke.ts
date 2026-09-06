import { applySave, createEmptySim, handleCommand, snapshot, step, type Sim } from "../src/world/sim";
import { reviewContent } from "../src/review/verify";
import { SKILLS } from "../src/content/jobs";
import { POI } from "../src/content/world";
import { ENEMY_BY_ID } from "../src/content/enemies";
import { itemById } from "../src/content/items";
import { loadSlot } from "../src/persistence/save";

const t0 = Date.now();
function wall(): number {
  return Date.now() - t0;
}
function budget(): void {
  if (wall() > 4500) throw new Error(`smoke wall ${wall()}ms`);
}

const r = reviewContent();
console.log("REVIEW", JSON.stringify(r));
if (!r.ok) throw new Error(r.notes.join(", "));
if (r.jobs !== 18 || r.adv !== 12) throw new Error(`직 규모 ${r.jobs}/${r.adv}`);
if (r.skills < 96) throw new Error(`초식 ${r.skills} < 96`);
if (r.biomes < 8) throw new Error(`바이옴 ${r.biomes} < 8`);
if (POI.banditBoss.boss !== "boss_bandit") throw new Error("산적두목 경로가 없다");
if (!ENEMY_BY_ID.bandit_thug || !ENEMY_BY_ID.boss_bandit) throw new Error("산적 카탈로그 ID가 없다");
if (!SKILLS.musa_slash || SKILLS.musa_slash.kind !== "slash") throw new Error("무사 내려베기가 없다");
budget();

function ticks(sim: Sim, n: number): void {
  for (let i = 0; i < n; i++) {
    budget();
    step(sim, 1 / 120);
  }
}

const sim = createEmptySim();
handleCommand(sim, { type: "newGame", name: "시험", job: "musa", slot: 0, seed: 1 });

sim.mode = "play";
sim.paused = false;
sim.player.x = POI.banditCamp.x;
sim.player.y = POI.banditCamp.y;
sim.player.px = sim.player.x;
sim.player.py = sim.player.y;
ticks(sim, 24);

let foe = sim.actors.find((a) => a.kind === "enemy" && !a.dead && !a.defId.startsWith("boss"));
if (!foe) throw new Error("산적야영에 적이 없다");

const beforeGear = new Set(sim.meta.inventory.map((i) => i.instId));
let hit = false;
let loot = false;
let killed = "";
let equipped = false;

foe.hp = Math.min(foe.hp, 12);
for (let i = 0; i < 240; i++) {
  budget();
  if (foe.dead) break;
  sim.player.hp = Math.max(sim.player.hp, 200);
  sim.player.mp = Math.max(sim.player.mp, 40);
  sim.player.invulnUntil = sim.time + 1;
  sim.player.x = foe.x + 12;
  sim.player.y = foe.y;
  handleCommand(sim, { type: "aim", x: foe.x, y: foe.y });
  handleCommand(sim, { type: "attack" });
  step(sim, 1 / 120);
  for (const e of sim.events) {
    if (e.type === "damaged" && e.src === "player") hit = true;
    if (e.type === "lootDropped") loot = true;
    if (e.type === "killed") killed = e.defId;
    if (e.type === "equipped") equipped = true;
  }
}
if (!foe.dead || !killed) throw new Error("처치 실패");
if (!hit) throw new Error("타격이 없다");
if (!loot) throw new Error("루트가 없다");

handleCommand(sim, { type: "pickupNearest" });
ticks(sim, 8);
for (const inst of sim.meta.inventory) {
  if (beforeGear.has(inst.instId)) continue;
  const it = itemById(inst.itemId);
  if (!it) continue;
  if (it.slot === "weapon" || it.slot === "helm" || it.slot === "chest" || it.slot === "legs" || it.slot === "boots" || it.slot === "accessory") {
    handleCommand(sim, { type: "equip", instId: inst.instId });
  }
}
equipped = equipped || sim.events.some((e) => e.type === "equipped");
if (!equipped) throw new Error("장착이 없다");
if (!sim.meta.equip.weapon && !sim.meta.equip.chest && !sim.meta.equip.helm) throw new Error("장비 칸이 비었다");

handleCommand(sim, { type: "save", slot: 0 });
const saved = sim.events.some((e) => e.type === "saved" && e.ok);
if (!saved) throw new Error("저장 실패");
const disk = loadSlot(0);
if (!disk.ok) throw new Error(disk.reason);

const loaded = createEmptySim();
handleCommand(loaded, { type: "load", slot: 0 });
if (loaded.meta.name !== "시험" || loaded.meta.job !== "musa") throw new Error("불러오기 실패");
if (Math.hypot(loaded.player.x - sim.player.x, loaded.player.y - sim.player.y) > 2) throw new Error("위치 유실");
applySave(createEmptySim(), snapshot(sim));

console.log("B-loop", { hit, loot, killed, equipped, slot: 0, wallMs: wall() });
console.log("OK");
