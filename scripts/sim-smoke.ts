import { applySave, createEmptySim, handleCommand, liveStats, snapshot, step, type Sim } from "../src/world/sim";
import { reviewContent } from "../src/review/verify";
import { JOBS, SKILLS } from "../src/content/jobs";
import { hubAt, POI, zoneAt } from "../src/content/world";
import { biomeAt } from "../src/world/map";
import { visFrom } from "../src/art/actors";
import { ENEMY_BY_ID } from "../src/content/enemies";
import { itemById } from "../src/content/items";
import { loadSlot } from "../src/persistence/save";

const r = reviewContent();
console.log("REVIEW", JSON.stringify(r));
if (!r.ok) throw new Error(r.notes.join(", "));
if (POI.banditBoss.boss !== "boss_bandit") throw new Error("산적두목 경로가 없다");
if (!ENEMY_BY_ID.bandit_thug || !ENEMY_BY_ID.boss_bandit) throw new Error("산적 카탈로그 ID가 없다");

function warp(sim: Sim, x: number, y: number, n = 16): void {
  sim.mode = "play";
  sim.paused = false;
  sim.player.dead = false;
  sim.player.x = x;
  sim.player.y = y;
  sim.player.px = x;
  sim.player.py = y;
  sim.moveAx = 0;
  sim.moveAy = 0;
  for (let i = 0; i < n; i++) step(sim, 1 / 120);
}

function fight(
  sim: Sim,
  pred: (a: { kind: string; dead: boolean; defId: string }) => boolean,
  max = 6000,
): { hit: boolean; loot: boolean; killed: string } {
  let hit = false;
  let loot = false;
  let killed = "";
  for (let i = 0; i < max; i++) {
    const t = sim.actors.find((a) => a.kind === "enemy" && !a.dead && pred(a));
    if (!t) break;
    sim.player.hp = Math.max(sim.player.hp, 900);
    sim.player.mp = Math.max(sim.player.mp, 90);
    sim.player.invulnUntil = sim.time + 2;
    sim.player.x = t.x + 14;
    sim.player.y = t.y;
    handleCommand(sim, { type: "aim", x: t.x, y: t.y });
    handleCommand(sim, { type: "attack" });
    handleCommand(sim, { type: "useSkill", slot: 1 });
    step(sim, 1 / 120);
    for (const e of sim.events) {
      if (e.type === "damaged" && e.src === "player") hit = true;
      if (e.type === "lootDropped") loot = true;
      if (e.type === "killed") killed = e.defId;
    }
    if (t.dead) return { hit, loot, killed: killed || t.defId };
  }
  throw new Error("처치 실패");
}

const sim = createEmptySim();
handleCommand(sim, { type: "newGame", name: "시험", job: "musa", slot: 0, seed: 1 });
const startX = sim.player.x;
for (let i = 0; i < 600; i++) {
  handleCommand(sim, { type: "move", ax: 1, ay: 0 });
  handleCommand(sim, { type: "aim", x: sim.player.x + 40, y: sim.player.y });
  step(sim, 1 / 120);
}
if (sim.player.x <= startX + 40) throw new Error("이동이 없다");
const rice = sim.actors.filter((a) => a.kind === "enemy" && !a.dead && !a.defId.startsWith("boss"));
console.log("pos", sim.player.x.toFixed(1), sim.player.y.toFixed(1), "enemies", rice.length);
if (!rice.length) throw new Error("근교 벼밭에 적이 없다");

const slash = SKILLS.musa_slash;
if (!slash || slash.kind !== "slash") throw new Error("무사 내려베기가 없다");
const vis0 = visFrom(sim.meta, sim.player);
const atk0 = liveStats(sim).atk;
const def0 = liveStats(sim).def;
const gear0 = sim.meta.inventory.filter((i) => {
  const it = itemById(i.itemId);
  return it && it.kind !== "consumable" && it.kind !== "misc";
}).length;

const k1 = fight(sim, (a) => a.kind === "enemy");
console.log("kill", k1.killed, "hit", k1.hit, "loot", k1.loot, "xp", sim.meta.xp, "gold", sim.meta.gold);
if (!k1.hit) throw new Error("히트가 없다");
if (!k1.loot) throw new Error("루트 드롭이 없다");
if (sim.meta.xp <= 0) throw new Error("경험치가 없다");

const gear1 = sim.meta.inventory.filter((i) => {
  const it = itemById(i.itemId);
  return it && it.kind !== "consumable" && it.kind !== "misc";
}).length;
const visKill = visFrom(sim.meta, sim.player);
const connected =
  gear1 > gear0 ||
  !!sim.meta.equip.helm ||
  liveStats(sim).def > def0 ||
  visKill.hat !== vis0.hat ||
  visKill.armorKind !== vis0.armorKind ||
  visKill.robe !== vis0.robe;
if (!connected) throw new Error("처치 루트가 장착으로 이어지지 않았다");
console.log("B natural loot→equip", "gear", gear0, gear1, "helm", !!sim.meta.equip.helm, "def", def0, liveStats(sim).def);

const defLoot0 = liveStats(sim).def;
sim.drops.push({ id: "b-loot", x: sim.player.x, y: sim.player.y, itemId: "chest_scale", qty: 1, age: 0 });
step(sim, 1 / 120);
if (sim.drops.some((d) => d.id === "b-loot")) handleCommand(sim, { type: "pickupNearest" });
if (liveStats(sim).def <= defLoot0) throw new Error("루트 장착 스탯이 안 올랐다");
if (visFrom(sim.meta, sim.player).armorKind !== "armor") throw new Error("루트 장착 실루엣이 안 바뀌었다");
console.log("B loop loot→equip def", defLoot0, liveStats(sim).def);

sim.meta.level = Math.max(sim.meta.level, 3);
sim.meta.gold += 400;
handleCommand(sim, { type: "buy", itemId: "sword_ring" });
handleCommand(sim, { type: "buy", itemId: "chest_scale" });
const ring = sim.meta.inventory.find((i) => i.itemId === "sword_ring");
const scale = sim.meta.inventory.find((i) => i.itemId === "chest_scale");
if (!ring || !scale) throw new Error("장착할 물산이 없다");
handleCommand(sim, { type: "equip", instId: ring.instId });
handleCommand(sim, { type: "equip", instId: scale.instId });
const atk1 = liveStats(sim).atk;
const vis1 = visFrom(sim.meta, sim.player);
if (atk1 <= atk0) throw new Error("장착 공격이 오르지 않았다");
if (vis1.weaponTint === vis0.weaponTint && vis1.armorKind === vis0.armorKind && vis1.robe === vis0.robe) {
  throw new Error("실루엣이 바뀌지 않았다");
}
if (vis1.armorKind !== "armor") throw new Error("미늘갑 실루엣이 아니다");
console.log("equip atk", atk0, atk1, "sil", vis0.armorKind, vis1.armorKind, vis0.weaponTint, vis1.weaponTint);

warp(sim, POI.banditCamp.x, POI.banditCamp.y);
const camp = fight(sim, (a) => ENEMY_BY_ID[a.defId]?.family === "bandit" || a.defId.startsWith("bandit"));
console.log("bandit", camp.killed);

warp(sim, POI.banditBoss.x, POI.banditBoss.y);
const boss = fight(sim, (a) => a.defId === "boss_bandit");
if (boss.killed !== "boss_bandit") throw new Error("산적두목을 베지 못했다");
if (!sim.meta.flags.killed_boss_bandit) throw new Error("두목 처치 표식이 없다");
console.log("boss_bandit", boss.hit, boss.loot);

handleCommand(sim, { type: "save", slot: 0 });
const savedEv = sim.events.find((e) => e.type === "saved");
if (!savedEv || savedEv.type !== "saved" || !savedEv.ok) throw new Error("저장 실패");
const disk = loadSlot(0);
if (!disk.ok) throw new Error(disk.reason);
const loaded = createEmptySim();
handleCommand(loaded, { type: "load", slot: 0 });
if (loaded.meta.job !== sim.meta.job) throw new Error("불러오기 직 유실");
if (Math.abs(loaded.player.x - sim.player.x) > 0.1) throw new Error("위치 유실");
if (!loaded.meta.flags.killed_boss_bandit) throw new Error("불러오기 두목 표식 유실");
console.log("save/load slot0", loaded.meta.name, loaded.meta.job);

const gung = createEmptySim();
handleCommand(gung, { type: "newGame", name: "시", job: "gungsoo", slot: 1, seed: 1 });
if (!SKILLS.gung_shot || SKILLS.gung_shot.kind !== "projectile") throw new Error("궁수 각궁시가 없다");
warp(gung, 520, 40);
const ge = gung.actors.find((a) => a.kind === "enemy" && !a.dead);
if (!ge) throw new Error("궁수 표적이 없다");
gung.player.x = ge.x - 70;
gung.player.y = ge.y;
gung.player.mp = 80;
handleCommand(gung, { type: "aim", x: ge.x, y: ge.y });
handleCommand(gung, { type: "useSkill", slot: 0 });
let gungHit = gung.events.some((e) => e.type === "skillUsed" && e.skillId === "gung_shot");
const hpBefore = ge.hp;
for (let i = 0; i < 240; i++) {
  step(gung, 1 / 120);
  if (gung.events.some((e) => e.type === "damaged" && e.src === "player")) gungHit = true;
  if (ge.hp < hpBefore) gungHit = true;
  if (gungHit) break;
}
if (!gungHit) throw new Error("궁수 초식이 맞지 않았다");
console.log("gungsoo skill", SKILLS.gung_shot.name, "ok");

sim.meta.level = 20;
sim.meta.flags.trainer_geomgaek = true;
handleCommand(sim, { type: "advanceJob", jobId: "geomgaek" });
console.log("job", sim.meta.job, JOBS[sim.meta.job].name, "bar", sim.meta.bar.filter(Boolean).length);
if (sim.meta.job !== "geomgaek") throw new Error("전직 실패");
if (sim.meta.bar.filter(Boolean).length < 8) throw new Error("전직 초식이 8개 미만");

const blob = snapshot(sim);
const snap2 = createEmptySim();
applySave(snap2, blob);
if (snap2.meta.job !== "geomgaek") throw new Error("불러오기 전직 유실");

if (zoneAt(520, 40)?.id !== "rice") throw new Error("근교 벼밭 존이 없다");
if (hubAt(0, 0)?.id !== "village") throw new Error("무명촌 거점이 없다");
if (hubAt(2200, 0)?.id !== "hansung") throw new Error("한성 거점이 없다");
if (biomeAt(1, 980, -60) !== "road") throw new Error("돌담 고갯길이 길이 아니다");

const gate = createEmptySim();
handleCommand(gate, { type: "newGame", name: "시험", job: "musa", slot: 0, seed: 1 });
gate.meta.level = 20;
handleCommand(gate, { type: "advanceJob", jobId: "geomgaek" });
if (gate.meta.job === "geomgaek") throw new Error("표식 없이 전직됨");
gate.player.x = 2160;
gate.player.y = -40;
for (let i = 0; i < 20; i++) step(gate, 1 / 120);
if (!gate.meta.flags.trainer_geomgaek) throw new Error("무관청 표식이 없다");
handleCommand(gate, { type: "advanceJob", jobId: "geomgaek" });
if (gate.meta.job !== "geomgaek") throw new Error("무관청 표식 전직 실패");

const swampHp = gate.player.hp;
gate.player.dead = false;
gate.mode = "play";
gate.player.hp = Math.max(swampHp, 120);
gate.player.x = 3480;
gate.player.y = 260;
const hpBeforeSw = gate.player.hp;
for (let i = 0; i < 240; i++) step(gate, 1 / 120);
if (gate.player.hp >= hpBeforeSw) throw new Error("늪독이 없다");

gate.player.dead = false;
gate.mode = "play";
gate.player.hp = 200;
gate.buffs = [];
const snowSpd = liveStats(gate).spd;
gate.player.x = 5080;
gate.player.y = -480;
for (let i = 0; i < 80; i++) step(gate, 1 / 120);
if (liveStats(gate).spd >= snowSpd) throw new Error("설산 한기가 없다");

sim.meta.gold += 800;
handleCommand(sim, { type: "buy", itemId: "sword_blood" });
const blood = sim.meta.inventory.find((i) => i.itemId === "sword_blood");
if (blood) handleCommand(sim, { type: "equip", instId: blood.instId });
sim.meta.level = 28;
warp(sim, POI.wraithAbbot.x, POI.wraithAbbot.y, 24);
const wraith = fight(sim, (a) => a.defId === "boss_wraith", 8000);
if (wraith.killed !== "boss_wraith") throw new Error("원혼대승을 베지 못했다");
warp(sim, POI.rift.x, POI.rift.y, 24);
if (!sim.meta.flags.ending_rift) throw new Error("균열 표식이 없다");
if (sim.mode !== "ending") throw new Error("엔드가 열리지 않았다");
console.log("ending", sim.mode, "wraith", wraith.loot);

console.log("OK");
