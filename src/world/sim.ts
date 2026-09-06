import { CHUNK, TILE, chunkKey, worldToChunk } from "../core/coords";
import { Rng, STREAM_SALT, hash3 } from "../core/rng";
import { angTo, clamp, circleHit, dist, inArc, lerp, norm } from "../core/math";
import type {
  BaseJobId,
  Buff,
  Command,
  EquipSlot,
  Grade,
  ItemInstance,
  JobId,
  SimEvent,
  Stats,
} from "../core/types";
import { JOBS, SKILLS, jobById, skillsForJob, type SkillDef } from "../content/jobs";
import { ENEMIES, ENEMY_BY_ID, GRADE_MOD, type EnemyDef } from "../content/enemies";
import { ITEMS, SHOP_LIST, STARTER_BOOTS, STARTER_CHEST, STARTER_WEAPON, itemById } from "../content/items";
import { HUBS, LOOT_TABLES, NPCS, POI, SPAWN_FAMILY_TO_ENEMY, hubAt, restHubs, zoneAt } from "../content/world";
import { addStats } from "../content/jobs";
import { TerrainCache, biomeAt, distToRoad, type ChunkData, type Solid } from "./map";
import { pushOut } from "./collision";
import { loadSlot, saveSlot } from "../persistence/save";

export interface Actor {
  id: string;
  kind: "player" | "enemy" | "npc";
  defId: string;
  name: string;
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  facing: number;
  hp: number;
  hpMax: number;
  mp: number;
  radius: number;
  team: 0 | 1;
  grade: Grade;
  flash: number;
  stunUntil: number;
  invulnUntil: number;
  attackAnim: number;
  walkPhase: number;
  dead: boolean;
  spawnKey?: string;
  art: string;
  aiRole?: EnemyDef["ai"];
  aiT: number;
  aiTx: number;
  aiTy: number;
  attackCd: number;
  npcId?: string;
}

export interface Proj {
  id: string;
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  r: number;
  team: 0 | 1;
  damage: number;
  pierce: number;
  life: number;
  art: string;
  src: string;
}

export interface Aoe {
  x: number;
  y: number;
  r: number;
  wait: number;
  damage: number;
  team: 0 | 1;
  art: string;
  src: string;
}

export interface Drop {
  id: string;
  x: number;
  y: number;
  itemId: string;
  qty: number;
  age: number;
}

export interface ParticleBurst {
  x: number;
  y: number;
  kind: "hit" | "kill" | "loot" | "heal" | "skill" | "dash";
  t: number;
  ang: number;
}

export interface PlayerMeta {
  name: string;
  job: JobId;
  level: number;
  xp: number;
  gold: number;
  inventory: ItemInstance[];
  equip: Partial<Record<EquipSlot, string>>;
  bar: (string | null)[];
  flags: Record<string, boolean>;
  kills: Record<string, number>;
  lastHub?: string;
}

export interface ChunkPersist {
  killed: Record<string, number>;
}

export interface SaveBlob {
  v: 1;
  seed: number;
  time: number;
  tick: number;
  slot: number;
  player: { x: number; y: number; hp: number; mp: number; facing: number };
  meta: PlayerMeta;
  persist: Record<string, ChunkPersist>;
  fog: Record<string, number>;
  combatSeed: number;
  lootSeed: number;
  nextId: number;
  instSeq: number;
}

export interface Sim {
  seed: number;
  tick: number;
  time: number;
  paused: boolean;
  mode: "title" | "play" | "dead" | "ending";
  slot: number;
  player: Actor;
  meta: PlayerMeta;
  actors: Actor[];
  projectiles: Proj[];
  aoes: Aoe[];
  drops: Drop[];
  buffs: Buff[];
  nextId: number;
  moveAx: number;
  moveAy: number;
  aimX: number;
  aimY: number;
  events: SimEvent[];
  talk: { npcId: string; text: string; choices?: { label: string; job?: JobId }[] } | null;
  shopOpen: boolean;
  terrain: TerrainCache;
  persist: Record<string, ChunkPersist>;
  fog: Record<string, number>;
  combat: Rng;
  loot: Rng;
  skillCd: Record<string, number>;
  messages: { text: string; kind: SimEvent extends { kind: infer K } ? K : string; t: number }[];
  bursts: ParticleBurst[];
  postOn: boolean;
  saveHint?: string;
  trails: { x: number; y: number; a: number }[];
  instSeq: number;
}

function nid(sim: Sim, p: string): string {
  sim.nextId += 1;
  return `${p}${sim.nextId}`;
}

function xpNeed(level: number): number {
  return Math.floor(34 * Math.pow(level, 1.42));
}

export function playerStats(meta: PlayerMeta): Stats {
  const job = JOBS[meta.job];
  let s: Stats = { ...job.baseStats };
  const lv = meta.level - 1;
  s = addStats(s, {
    atk: (job.perLevel.atk ?? 0) * lv,
    def: (job.perLevel.def ?? 0) * lv,
    maxHp: (job.perLevel.maxHp ?? 0) * lv,
    maxMp: (job.perLevel.maxMp ?? 0) * lv,
    spd: (job.perLevel.spd ?? 0) * lv,
    crit: (job.perLevel.crit ?? 0) * lv,
    haste: (job.perLevel.haste ?? 0) * lv,
    luck: (job.perLevel.luck ?? 0) * lv,
  });
  for (const slot of Object.keys(meta.equip) as EquipSlot[]) {
    const instId = meta.equip[slot];
    if (!instId) continue;
    const inst = meta.inventory.find((i) => i.instId === instId);
    const it = inst ? itemById(inst.itemId) : undefined;
    if (it) s = addStats(s, it.stats);
  }
  return s;
}

function withBuffs(sim: Sim, s: Stats): Stats {
  let o = s;
  for (const b of sim.buffs) o = addStats(o, b.stats);
  o.spd = Math.max(48, o.spd);
  return o;
}

function emit(sim: Sim, e: SimEvent): void {
  sim.events.push(e);
  if (e.type === "message") sim.messages.push({ text: e.text, kind: e.kind, t: sim.time });
}

function addItem(sim: Sim, itemId: string, qty: number): void {
  if (itemId === "gold") {
    sim.meta.gold += qty;
    emit(sim, { type: "message", text: `엽전 ${qty}`, kind: "loot" });
    return;
  }
  const def = itemById(itemId);
  if (!def) return;
  if (def.stackMax > 1) {
    const exist = sim.meta.inventory.find((i) => i.itemId === itemId && i.qty < def.stackMax);
    if (exist) {
      exist.qty = Math.min(def.stackMax, exist.qty + qty);
      emit(sim, { type: "pickedUp", itemId, qty });
      emit(sim, { type: "message", text: `${def.name} ×${qty}`, kind: "loot" });
      return;
    }
  }
  sim.meta.inventory.push({ instId: `i${++sim.instSeq}`, itemId, qty });
  const instId = sim.meta.inventory[sim.meta.inventory.length - 1]!.instId;
  emit(sim, { type: "pickedUp", itemId, qty });
  emit(sim, { type: "message", text: `${def.name} ×${qty}`, kind: "loot" });
  tryAutoEquip(sim, instId);
}

function makePlayer(name: string, job: BaseJobId): { actor: Actor; meta: PlayerMeta } {
  const j = JOBS[job];
  const meta: PlayerMeta = {
    name,
    job,
    level: 1,
    xp: 0,
    gold: 20,
    inventory: [],
    equip: {},
    bar: [j.skills[0] ?? null, j.skills[1] ?? null, j.skills[2] ?? null, j.skills[3] ?? null, null, null, null, null],
    flags: {},
    kills: {},
    lastHub: "village",
  };
  const actor: Actor = {
    id: "player",
    kind: "player",
    defId: job,
    name,
    x: 20,
    y: 40,
    px: 20,
    py: 40,
    vx: 0,
    vy: 0,
    facing: 0,
    hp: j.baseStats.maxHp,
    hpMax: j.baseStats.maxHp,
    mp: j.baseStats.maxMp,
    radius: 12,
    team: 0,
    grade: "ha",
    flash: 0,
    stunUntil: 0,
    invulnUntil: 0,
    attackAnim: 0,
    walkPhase: 0,
    dead: false,
    art: "player",
    aiT: 0,
    aiTx: 0,
    aiTy: 0,
    attackCd: 0,
  };
  return { actor, meta };
}

function giveStarter(sim: Sim): void {
  const w = STARTER_WEAPON[sim.meta.job] ?? "sword_rusty";
  addItem(sim, w, 1);
  addItem(sim, STARTER_CHEST, 1);
  addItem(sim, STARTER_BOOTS, 1);
  addItem(sim, "hp_small", 3);
}

function npcActors(): Actor[] {
  return NPCS.map((n) => ({
    id: n.id,
    kind: "npc" as const,
    defId: n.id,
    name: n.name,
    x: n.x,
    y: n.y,
    px: n.x,
    py: n.y,
    vx: 0,
    vy: 0,
    facing: 1.2,
    hp: 999,
    hpMax: 999,
    mp: 0,
    radius: 12,
    team: 0,
    grade: "ha" as const,
    flash: 0,
    stunUntil: 0,
    invulnUntil: 0,
    attackAnim: 0,
    walkPhase: 0,
    dead: false,
    art: n.role === "trainer" ? "npc_trainer" : n.role === "shop" ? "npc_shop" : "npc",
    aiT: 0,
    aiTx: n.x,
    aiTy: n.y,
    attackCd: 0,
    npcId: n.id,
  }));
}

export function createEmptySim(): Sim {
  const { actor, meta } = makePlayer("나그네", "musa");
  return {
    seed: 1,
    tick: 0,
    time: 0,
    paused: false,
    mode: "title",
    slot: 0,
    player: actor,
    meta,
    actors: [],
    projectiles: [],
    aoes: [],
    drops: [],
    buffs: [],
    nextId: 1,
    moveAx: 0,
    moveAy: 0,
    aimX: 40,
    aimY: 40,
    events: [],
    talk: null,
    shopOpen: false,
    terrain: new TerrainCache(1),
    persist: {},
    fog: {},
    combat: new Rng(1 ^ STREAM_SALT.combat),
    loot: new Rng(1 ^ STREAM_SALT.loot),
    skillCd: {},
    messages: [],
    bursts: [],
    postOn: true,
    trails: [],
    instSeq: 1,
  };
}

export function startNewGame(sim: Sim, name: string, job: BaseJobId, slot: number, seed?: number): void {
  const s = seed ?? (Math.floor(Math.random() * 0x7fffffff) ^ Date.now());
  const made = makePlayer(name || "나그네", job);
  sim.seed = s >>> 0;
  sim.tick = 0;
  sim.time = 0;
  sim.paused = false;
  sim.mode = "play";
  sim.slot = slot;
  sim.player = made.actor;
  sim.meta = made.meta;
  sim.actors = npcActors();
  sim.projectiles = [];
  sim.aoes = [];
  sim.drops = [];
  sim.buffs = [];
  sim.nextId = 10;
  sim.persist = {};
  sim.fog = {};
  sim.combat = new Rng(sim.seed ^ STREAM_SALT.combat);
  sim.loot = new Rng(sim.seed ^ STREAM_SALT.loot);
  sim.skillCd = {};
  sim.messages = [];
  sim.bursts = [];
  sim.talk = null;
  sim.shopOpen = false;
  sim.terrain = new TerrainCache(sim.seed);
  sim.instSeq = 1;
  giveStarter(sim);
  const st = playerStats(sim.meta);
  sim.player.hp = st.maxHp;
  sim.player.mp = st.maxMp;
  emit(sim, { type: "message", text: `적월 아래, ${JOBS[job].name} ${sim.meta.name}의 길이 열린다.`, kind: "info" });
}

export function snapshot(sim: Sim): SaveBlob {
  return {
    v: 1,
    seed: sim.seed,
    time: sim.time,
    tick: sim.tick,
    slot: sim.slot,
    player: { x: sim.player.x, y: sim.player.y, hp: sim.player.hp, mp: sim.player.mp, facing: sim.player.facing },
    meta: JSON.parse(JSON.stringify(sim.meta)) as PlayerMeta,
    persist: JSON.parse(JSON.stringify(sim.persist)) as Record<string, ChunkPersist>,
    fog: { ...sim.fog },
    combatSeed: sim.combat.seed(),
    lootSeed: sim.loot.seed(),
    nextId: sim.nextId,
    instSeq: sim.instSeq,
  };
}

export function applySave(sim: Sim, blob: SaveBlob): void {
  sim.seed = blob.seed;
  sim.time = blob.time;
  sim.tick = blob.tick;
  sim.slot = blob.slot;
  sim.mode = "play";
  sim.paused = false;
  sim.meta = blob.meta;
  sim.player.x = blob.player.x;
  sim.player.y = blob.player.y;
  sim.player.px = blob.player.x;
  sim.player.py = blob.player.y;
  sim.player.hp = blob.player.hp;
  sim.player.mp = blob.player.mp;
  sim.player.facing = blob.player.facing;
  sim.player.dead = blob.player.hp <= 0;
  sim.persist = blob.persist;
  sim.fog = blob.fog;
  sim.combat.setSeed(blob.combatSeed);
  sim.loot.setSeed(blob.lootSeed);
  sim.nextId = blob.nextId;
  sim.instSeq = blob.instSeq ?? 1;
  sim.actors = npcActors();
  sim.projectiles = [];
  sim.aoes = [];
  sim.drops = [];
  sim.buffs = [];
  sim.terrain = new TerrainCache(sim.seed);
  sim.talk = null;
  sim.shopOpen = false;
  sim.skillCd = {};
}

function persistOf(sim: Sim, cx: number, cy: number): ChunkPersist {
  const k = chunkKey(cx, cy);
  let p = sim.persist[k];
  if (!p) {
    p = { killed: {} };
    sim.persist[k] = p;
  }
  return p;
}

function enemiesNear(sim: Sim, x: number, y: number, r = 400): number {
  let n = 0;
  for (const a of sim.actors) {
    if (a.kind !== "enemy" || a.dead) continue;
    const def = ENEMY_BY_ID[a.defId];
    if (def?.boss) continue;
    if (dist(a.x, a.y, x, y) < r) n += 1;
  }
  return n;
}

function combatCapAt(x: number, y: number): number {
  const z = zoneAt(x, y);
  if (z?.tight) return 7;
  return 11;
}

function spawnPool(biome: ReturnType<typeof biomeAt>, z: ReturnType<typeof zoneAt>): EnemyDef[] {
  const allowed = new Set<string>();
  if (z) {
    for (const f of z.families) {
      for (const fam of SPAWN_FAMILY_TO_ENEMY[f] ?? [f]) allowed.add(fam);
    }
  }
  let pool = ENEMIES.filter((e) => !e.boss && e.biomes.includes(biome) && (!allowed.size || allowed.has(e.family)));
  if (!pool.length) pool = ENEMIES.filter((e) => !e.boss && e.biomes.includes(biome));
  return pool;
}

function enemiesInChunk(sim: Sim, cx: number, cy: number): number {
  let n = 0;
  for (const a of sim.actors) {
    if (a.kind !== "enemy" || a.dead) continue;
    const def = ENEMY_BY_ID[a.defId];
    if (def?.boss) continue;
    if (worldToChunk(a.x) === cx && worldToChunk(a.y) === cy) n += 1;
  }
  return n;
}

function spawnEnemies(sim: Sim, chunk: ChunkData): void {
  const cx = chunk.cx;
  const cy = chunk.cy;
  const p = persistOf(sim, cx, cy);
  const ox = cx * CHUNK;
  const oy = cy * CHUNK;

  for (const poi of Object.values(POI)) {
    if (!poi.boss) continue;
    if (worldToChunk(poi.x) !== cx || worldToChunk(poi.y) !== cy) continue;
    const bid = poi.boss;
    const sk = `boss:${bid}`;
    if (sim.meta.flags[`killed_${bid}`]) continue;
    if (p.killed[sk]) continue;
    if (sim.actors.some((a) => a.spawnKey === sk)) continue;
    const def = ENEMY_BY_ID[bid];
    if (def) sim.actors.push(makeEnemy(sim, def, "sang", poi.x, poi.y, sk));
  }

  const midX = ox + CHUNK * 0.5;
  const midY = oy + CHUNK * 0.5;
  const zone = zoneAt(midX, midY);
  const onPath = !!zone || distToRoad(midX, midY) < 90;
  const capLocal = !onPath ? 2 : zone?.tight ? 6 : 10;
  const tries = capLocal + 5;
  for (let i = 0; i < tries; i++) {
    if (enemiesInChunk(sim, cx, cy) >= capLocal) break;
    if (enemiesNear(sim, sim.player.x, sim.player.y, 400) >= combatCapAt(sim.player.x, sim.player.y) && dist(midX, midY, sim.player.x, sim.player.y) < 520) break;
    const sk = `s:${cx}:${cy}:${i}`;
    if (p.killed[sk] && sim.time - p.killed[sk] < 90) continue;
    if (sim.actors.some((a) => a.spawnKey === sk)) continue;
    const rng = new Rng(hash3(sim.seed, cx * 31 + i, cy * 17) ^ STREAM_SALT.world);
    const x = ox + rng.float(24, CHUNK - 24);
    const y = oy + rng.float(24, CHUNK - 24);
    if (hubAt(x, y)) continue;
    const biome = biomeAt(sim.seed, x, y);
    if (biome === "village") continue;
    const z = zoneAt(x, y);
    const pool = spawnPool(biome, z);
    if (!pool.length) continue;
    const keep = !onPath ? 0.35 : z?.tight ? 0.55 : 0.62;
    if (rng.float() > keep) continue;
    const def = rng.pick(pool);
    const elite = z?.eliteBias ?? 0.08;
    const g: Grade = rng.chance(elite) ? "sang" : rng.chance(0.22 + elite) ? "jung" : "ha";
    const grade = def.grades.includes(g) ? g : def.grades[0]!;
    sim.actors.push(makeEnemy(sim, def, grade, x, y, sk));
  }
}

function makeEnemy(sim: Sim, def: EnemyDef, grade: Grade, x: number, y: number, spawnKey: string): Actor {
  const g = GRADE_MOD[grade];
  const z = zoneAt(x, y);
  const lv = z ? (z.lvMin + z.lvMax) * 0.5 : 4;
  const sc = def.boss ? 1 : 0.62 + lv * 0.038;
  return {
    id: nid(sim, "e"),
    kind: "enemy",
    defId: def.id,
    name: def.boss ? def.name : g.name === "일반" ? def.name : `${g.name} ${def.name}`,
    x,
    y,
    px: x,
    py: y,
    vx: 0,
    vy: 0,
    facing: rngFacing(sim),
    hp: def.hp * g.hp * sc,
    hpMax: def.hp * g.hp * sc,
    mp: 0,
    radius: def.radius,
    team: 1,
    grade,
    flash: 0,
    stunUntil: 0,
    invulnUntil: 0,
    attackAnim: 0,
    walkPhase: 0,
    dead: false,
    spawnKey,
    art: def.art,
    aiRole: def.ai,
    aiT: 0,
    aiTx: x,
    aiTy: y,
    attackCd: 0,
  };
}

function rngFacing(sim: Sim): number {
  return sim.combat.float(0, Math.PI * 2);
}

function solidsNear(sim: Sim, x: number, y: number): Solid[] {
  const chunks = sim.terrain.around(x, y, sim.time, 1);
  const s: Solid[] = [];
  for (const c of chunks) s.push(...c.solids);
  return s;
}

function resolveMove(sim: Sim, a: Actor, nx: number, ny: number): void {
  const ox = a.x;
  const oy = a.y;
  const tryPos = (x: number, y: number): { x: number; y: number } => {
    const solids = solidsNear(sim, x, y);
    return pushOut(x, y, a.radius, solids);
  };
  let p = tryPos(nx, ny);
  if (Math.hypot(p.x - nx, p.y - ny) > 0.2) {
    const px = tryPos(nx, oy);
    const py = tryPos(ox, ny);
    const dx = Math.hypot(px.x - ox, px.y - oy);
    const dy = Math.hypot(py.x - ox, py.y - oy);
    p = dx >= dy ? px : py;
  }
  nx = p.x;
  ny = p.y;
  for (const o of sim.actors) {
    if (o === a || o.dead || o.kind === "npc") continue;
    const dx = nx - o.x;
    const dy = ny - o.y;
    const d = Math.hypot(dx, dy);
    const min = a.radius + o.radius;
    if (d < min && d > 0.001) {
      const k = (min - d) * 0.4 / d;
      nx += dx * k;
      ny += dy * k;
    }
  }
  a.x = nx;
  a.y = ny;
}

function statsNow(sim: Sim): Stats {
  return withBuffs(sim, playerStats(sim.meta));
}

function deal(sim: Sim, src: Actor | { id: string; name: string }, target: Actor, amount: number, crit: boolean): void {
  if (target.dead || sim.time < target.invulnUntil) return;
  target.hp -= amount;
  target.flash = 0.12;
  emit(sim, { type: "damaged", id: target.id, amount, src: src.id, crit, x: target.x, y: target.y });
  sim.bursts.push({ x: target.x, y: target.y, kind: "hit", t: sim.time, ang: 0 });
  if (target.hp <= 0) kill(sim, target, src);
}

function kill(sim: Sim, target: Actor, src: Actor | { id: string }): void {
  if (target.dead) return;
  target.dead = true;
  target.hp = 0;
  if (target.kind !== "enemy") {
    if (target.kind === "player") {
      sim.mode = "dead";
      emit(sim, { type: "message", text: "쓰러졌다… 거점에서 다시 일어난다.", kind: "warn" });
    }
    return;
  }
  const def = ENEMY_BY_ID[target.defId];
  if (!def) return;
  const g = GRADE_MOD[target.grade];
  const xp = Math.round(def.xp * g.xp);
  emit(sim, { type: "killed", id: target.id, defId: def.id, x: target.x, y: target.y, xp });
  sim.bursts.push({ x: target.x, y: target.y, kind: "kill", t: sim.time, ang: 0 });
  sim.meta.kills[def.id] = (sim.meta.kills[def.id] ?? 0) + 1;
  if (def.boss) {
    sim.meta.flags[`killed_${def.id}`] = true;
    if (def.id === "boss_tiger") sim.meta.flags.quest_tiger = true;
    if (def.id === "boss_bandit") sim.meta.flags.quest_bandit_king = true;
    if (def.id === "boss_abbot") sim.meta.flags.quest_tomb = true;
    if (def.id === "boss_abbot") sim.meta.flags.quest_shrine = true;
    if (def.id === "boss_imugi") sim.meta.flags.quest_swamp = true;
    if (def.id === "boss_wraith") sim.meta.flags.quest_wraith = true;
    maybeEnding(sim);
  }
  if (src.id === "player") gainXp(sim, xp);
  rollLoot(sim, def, target.x, target.y);
  if (target.spawnKey) {
    const cx = worldToChunk(target.x);
    const cy = worldToChunk(target.y);
    persistOf(sim, cx, cy).killed[target.spawnKey] = sim.time;
  }
}

function gainXp(sim: Sim, amount: number): void {
  sim.meta.xp += amount;
  emit(sim, { type: "xpGained", amount });
  emit(sim, { type: "message", text: `경험치 +${amount}`, kind: "info" });
  while (sim.meta.xp >= xpNeed(sim.meta.level)) {
    sim.meta.xp -= xpNeed(sim.meta.level);
    sim.meta.level += 1;
    const st = playerStats(sim.meta);
    sim.player.hp = st.maxHp;
    sim.player.mp = st.maxMp;
    emit(sim, { type: "leveledUp", level: sim.meta.level });
    emit(sim, { type: "message", text: `급수가 ${sim.meta.level}급이 되었다.`, kind: "info" });
  }
}

function rollLoot(sim: Sim, def: EnemyDef, x: number, y: number): void {
  const table = LOOT_TABLES[def.loot] ?? LOOT_TABLES.loot_bandit!;
  const dropped: { itemId: string; qty: number }[] = [];
  const luck = playerStats(sim.meta).luck;
  const gearTable = table.filter((row) => isGearDrop(row.itemId));
  if (gearTable.length) {
    const row = sim.loot.weighted(gearTable);
    dropped.push({ itemId: row.itemId, qty: row.qty });
    sim.drops.push({ id: nid(sim, "d"), x: x + sim.loot.around(0, 8), y: y + sim.loot.around(0, 8), itemId: row.itemId, qty: row.qty, age: 0 });
  }
  const rolls = 1 + (sim.loot.chance((luck + (def.boss ? 40 : 8)) / 100) ? 1 : 0);
  for (let i = 0; i < rolls; i++) {
    const row = sim.loot.weighted(table);
    dropped.push({ itemId: row.itemId, qty: row.qty });
    sim.drops.push({ id: nid(sim, "d"), x: x + sim.loot.around(0, 10), y: y + sim.loot.around(0, 10), itemId: row.itemId, qty: row.qty, age: 0 });
  }
  if (def.gold) {
    const g = Math.max(1, Math.round(def.gold * GRADE_MOD[def.boss ? "sang" : "ha"].xp * sim.loot.float(0.7, 1.2)));
    sim.drops.push({ id: nid(sim, "d"), x: x + 6, y: y + 4, itemId: "gold", qty: g, age: 0 });
    dropped.push({ itemId: "gold", qty: Math.round(def.gold * GRADE_MOD[def.boss ? "sang" : "ha"].xp) });
  }
  emit(sim, { type: "lootDropped", items: dropped, x, y });
}

function isGearDrop(itemId: string): boolean {
  if (itemId === "gold") return false;
  const it = itemById(itemId);
  if (!it) return false;
  return it.slot === "weapon" || it.slot === "helm" || it.slot === "chest" || it.slot === "legs" || it.slot === "boots" || it.slot === "accessory";
}

function hitArc(sim: Sim, src: Actor, skill: SkillDef, power: number, atk: number, crit: number): void {
  const half = (skill.angle ?? 1) * 0.5;
  for (const t of targets(sim, src)) {
    if (inArc(src.x, src.y, src.facing, t.x, t.y, skill.range + t.radius, half) || dist(src.x, src.y, t.x, t.y) < src.radius + t.radius + 4) {
      applyHit(sim, src, t, atk, power, crit);
    }
  }
}

function targets(sim: Sim, src: Actor): Actor[] {
  const list: Actor[] = [];
  if (src.kind === "player") {
    for (const a of sim.actors) if (a.kind === "enemy" && !a.dead) list.push(a);
  } else {
    if (!sim.player.dead) list.push(sim.player);
  }
  return list;
}

function applyHit(sim: Sim, src: Actor | { id: string; name: string }, t: Actor, atk: number, power: number, critChance: number): void {
  const def = t.kind === "player" ? statsNow(sim).def : (ENEMY_BY_ID[t.defId]?.def ?? 4);
  const crit = sim.combat.chance(clamp(critChance, 0, 0.55));
  let d = atk * power * (100 / (100 + def));
  if (crit) d *= 1.55;
  d *= sim.combat.float(0.9, 1.08);
  deal(sim, src, t, Math.max(1, Math.round(d)), crit);
}

function execSkill(sim: Sim, actor: Actor, skill: SkillDef): void {
  const st = actor.kind === "player" ? statsNow(sim) : { atk: ENEMY_BY_ID[actor.defId]?.atk ?? 8, crit: 0.05, haste: 1 };
  const atk = actor.kind === "player" ? st.atk : (st.atk as number);
  const crit = actor.kind === "player" ? (st as Stats).crit : 0.05;
  actor.facing = angTo(actor.x, actor.y, sim.aimX, sim.aimY);
  actor.attackAnim = 0.2;
  sim.bursts.push({ x: actor.x, y: actor.y, kind: "skill", t: sim.time, ang: actor.facing });
  emit(sim, { type: "skillUsed", skillId: skill.id });

  switch (skill.kind) {
    case "slash":
      hitArc(sim, actor, skill, skill.power, atk, crit);
      pushTrail(sim, actor, skill.range);
      break;
    case "dash": {
      const d = skill.dist ?? 120;
      const n = norm(Math.cos(actor.facing), Math.sin(actor.facing));
      const tx = actor.x + n.x * d;
      const ty = actor.y + n.y * d;
      resolveMove(sim, actor, tx, ty);
      actor.invulnUntil = sim.time + 0.12;
      hitArc(sim, actor, { ...skill, range: Math.abs(d) * 0.35 + 28 }, skill.power, atk, crit);
      sim.bursts.push({ x: actor.x, y: actor.y, kind: "dash", t: sim.time, ang: actor.facing });
      break;
    }
    case "cone":
      hitArc(sim, actor, skill, skill.power, atk, crit);
      break;
    case "circle":
      for (const t of targets(sim, actor)) {
        if (dist(actor.x, actor.y, t.x, t.y) <= (skill.radius ?? 60) + t.radius) applyHit(sim, actor, t, atk, skill.power, crit);
      }
      break;
    case "projectile":
      spawnProj(sim, actor, skill, atk, crit);
      break;
    case "ground":
    case "groundAoe": {
      const range = skill.range || 160;
      let ax = sim.aimX;
      let ay = sim.aimY;
      const d = dist(actor.x, actor.y, ax, ay);
      if (d > range) {
        const n = norm(ax - actor.x, ay - actor.y);
        ax = actor.x + n.x * range;
        ay = actor.y + n.y * range;
      }
      sim.aoes.push({ x: ax, y: ay, r: skill.radius ?? 50, wait: skill.delay ?? 0.4, damage: atk * skill.power, team: actor.team, art: skill.id, src: actor.id });
      break;
    }
    case "buff":
      sim.buffs.push({
        id: skill.id,
        name: skill.name,
        until: sim.time + (skill.duration ?? 6),
        stats: { [skill.stat ?? "atk"]: skill.amount ?? 8 },
      });
      emit(sim, { type: "message", text: `${skill.name} 발동`, kind: "skill" });
      if (skill.id === "my_cleanse" || skill.id === "ui_purge") sim.buffs = sim.buffs.filter((b) => !b.dot);
      break;
    case "chain": {
      let srcX = actor.x;
      let srcY = actor.y;
      const used = new Set<string>();
      const jumps = skill.jumps ?? 3;
      for (let i = 0; i < jumps; i++) {
        let best: Actor | null = null;
        let bd = skill.range;
        for (const t of targets(sim, actor)) {
          if (used.has(t.id)) continue;
          const d = dist(srcX, srcY, t.x, t.y);
          if (d < bd) {
            bd = d;
            best = t;
          }
        }
        if (!best) break;
        used.add(best.id);
        applyHit(sim, actor, best, atk, skill.power * (1 - i * 0.08), crit);
        srcX = best.x;
        srcY = best.y;
      }
      break;
    }
    case "heal": {
      const amt = skill.amount ?? 30;
      actor.hp = Math.min(statsNow(sim).maxHp, actor.hp + amt);
      sim.bursts.push({ x: actor.x, y: actor.y, kind: "heal", t: sim.time, ang: 0 });
      emit(sim, { type: "message", text: `체력 +${amt}`, kind: "info" });
      break;
    }
    case "dot":
      for (const t of targets(sim, actor)) {
        if (dist(actor.x, actor.y, t.x, t.y) < (skill.range || 80) + t.radius) {
          applyHit(sim, actor, t, atk, skill.power, crit);
          sim.buffs.push({ id: `${skill.id}_${t.id}`, name: skill.name, until: sim.time + (skill.duration ?? 4), stats: {}, dot: atk * skill.power, tag: t.id });
        }
      }
      break;
  }
}

function spawnProj(sim: Sim, actor: Actor, skill: SkillDef, atk: number, crit: number): void {
  const ang = actor.facing;
  const spd = skill.speed ?? 400;
  sim.projectiles.push({
    id: nid(sim, "p"),
    x: actor.x + Math.cos(ang) * 16,
    y: actor.y + Math.sin(ang) * 16,
    px: actor.x,
    py: actor.y,
    vx: Math.cos(ang) * spd,
    vy: Math.sin(ang) * spd,
    r: 6,
    team: actor.team,
    damage: atk * skill.power * (sim.combat.chance(crit) ? 1.55 : 1),
    pierce: skill.pierce ?? 0,
    life: (skill.range || 300) / spd,
    art: skill.kind,
    src: actor.id,
  });
}

function pushTrail(sim: Sim, actor: Actor, range: number): void {
  const n = 6;
  for (let i = 0; i < n; i++) {
    const a = actor.facing - 0.7 + (i / (n - 1)) * 1.4;
    sim.trails.push({ x: actor.x + Math.cos(a) * (range * 0.7), y: actor.y + Math.sin(a) * (range * 0.7), a: 1 });
  }
}

function trySkill(sim: Sim, slot: number): void {
  if (sim.player.dead || sim.mode !== "play") return;
  const id = sim.meta.bar[slot];
  if (!id) return;
  const skill = SKILLS[id];
  if (!skill) return;
  const st = statsNow(sim);
  const cdLeft = (sim.skillCd[id] ?? 0) - sim.time;
  if (cdLeft > 0) return;
  if (sim.player.mp < skill.mp) return;
  sim.player.mp -= skill.mp;
  const haste = st.haste || 1;
  sim.skillCd[id] = sim.time + skill.cd / haste;
  execSkill(sim, sim.player, skill);
}

function basicAttack(sim: Sim): void {
  const id = sim.meta.bar[0];
  if (id) trySkill(sim, 0);
}

function pickup(sim: Sim): void {
  let best: Drop | null = null;
  let bd = 42;
  for (const d of sim.drops) {
    const dd = dist(sim.player.x, sim.player.y, d.x, d.y);
    if (dd < bd) {
      bd = dd;
      best = d;
    }
  }
  if (!best) return;
  sim.drops = sim.drops.filter((d) => d !== best);
  addItem(sim, best.itemId, best.qty);
  sim.bursts.push({ x: best.x, y: best.y, kind: "loot", t: sim.time, ang: 0 });
}

function canEquip(sim: Sim, it: NonNullable<ReturnType<typeof itemById>>): string | null {
  if (it.reqLevel && sim.meta.level < it.reqLevel) return `${it.reqLevel}급이 필요하다`;
  if (it.reqJob && !it.reqJob.includes(sim.meta.job)) return "이 직에는 맞지 않는다";
  return null;
}

function gearScore(it: NonNullable<ReturnType<typeof itemById>>): number {
  const s = it.stats;
  return (s.atk ?? 0) * 3 + (s.def ?? 0) * 2 + (s.maxHp ?? 0) * 0.12 + (s.maxMp ?? 0) * 0.08 + (s.spd ?? 0) * 0.15 + (s.crit ?? 0) * 40 + (s.luck ?? 0) * 0.4;
}

function tryAutoEquip(sim: Sim, instId: string): void {
  const inst = sim.meta.inventory.find((i) => i.instId === instId);
  const it = inst ? itemById(inst.itemId) : undefined;
  if (!it) return;
  if (it.slot !== "weapon" && it.slot !== "helm" && it.slot !== "chest" && it.slot !== "legs" && it.slot !== "boots" && it.slot !== "accessory") return;
  if (canEquip(sim, it)) return;
  const slot = it.slot;
  const curId = sim.meta.equip[slot];
  if (curId) {
    const cur = itemById(sim.meta.inventory.find((i) => i.instId === curId)?.itemId ?? "");
    if (cur && gearScore(it) <= gearScore(cur) + 0.05) return;
  }
  equipInst(sim, instId);
}

function equipInst(sim: Sim, instId: string): void {
  const inst = sim.meta.inventory.find((i) => i.instId === instId);
  const it = inst ? itemById(inst.itemId) : undefined;
  if (!it || (it.slot !== "weapon" && it.slot !== "helm" && it.slot !== "chest" && it.slot !== "legs" && it.slot !== "boots" && it.slot !== "accessory")) {
    if (it?.kind === "consumable") {
      useItem(sim, instId);
      return;
    }
    return;
  }
  const why = canEquip(sim, it);
  if (why) {
    emit(sim, { type: "message", text: why, kind: "warn" });
    return;
  }
  sim.meta.equip[it.slot as EquipSlot] = instId;
  const st = playerStats(sim.meta);
  sim.player.hp = Math.min(sim.player.hp, st.maxHp);
  sim.player.mp = Math.min(sim.player.mp, st.maxMp);
  emit(sim, { type: "equipped", itemId: it.id, slot: it.slot as EquipSlot });
  emit(sim, { type: "message", text: `${it.name} 장착`, kind: "info" });
}

function useItem(sim: Sim, instId: string): void {
  const inst = sim.meta.inventory.find((i) => i.instId === instId);
  const it = inst ? itemById(inst.itemId) : undefined;
  if (!it || it.kind !== "consumable") return;
  const st = statsNow(sim);
  if (it.heal) sim.player.hp = Math.min(st.maxHp, sim.player.hp + it.heal);
  if (it.mp) sim.player.mp = Math.min(st.maxMp, sim.player.mp + it.mp);
  if (it.id === "antidote") {
    sim.buffs = sim.buffs.filter((b) => !b.dot && b.id !== "hazard_poison");
    sim.buffs.push({ id: "poison_immune", name: "해독", until: sim.time + 18, stats: {} });
  }
  inst!.qty -= 1;
  if (inst!.qty <= 0) {
    sim.meta.inventory = sim.meta.inventory.filter((i) => i.instId !== instId);
    for (const k of Object.keys(sim.meta.equip) as EquipSlot[]) {
      if (sim.meta.equip[k] === instId) delete sim.meta.equip[k];
    }
  }
  emit(sim, { type: "message", text: `${it.name} 사용`, kind: "info" });
}

function talkNpc(sim: Sim, npcId: string): void {
  const n = NPCS.find((x) => x.id === npcId);
  if (!n) return;
  if (n.role === "shop") {
    sim.shopOpen = true;
    sim.talk = { npcId, text: n.lines[0]! };
    return;
  }
  if (n.role === "inn") {
    sim.talk = { npcId, text: "거점에서 쉬면 상처가 아물고, 행적이 기록된다. (R 휴식 · 저장은 메뉴)" };
    return;
  }
  if (n.role === "trainer") {
    if (n.trainerFlag && !sim.meta.flags[n.trainerFlag]) {
      sim.meta.flags[n.trainerFlag] = true;
      emit(sim, { type: "message", text: `${n.name}의 표식을 받았다.`, kind: "info" });
    }
    const playerBase = JOBS[sim.meta.job].base;
    if (n.job && n.job !== playerBase) {
      sim.talk = { npcId, text: "다른 길의 교관이다. 제 몸을 찾아가거라." };
      return;
    }
    if (n.advanceJob) {
      const j = jobById(n.advanceJob);
      const has = !j.reqFlag || !!sim.meta.flags[j.reqFlag];
      const lvOk = sim.meta.level >= j.reqLevel;
      const note = !lvOk ? ` ${j.reqLevel}급이 되어야 한다.` : !has ? " 표식은 얻었으나 아직 문이 닫혀 있다." : " 전직할 수 있다.";
      sim.talk = {
        npcId,
        text: `${n.lines.join("\n")}\n${note}`,
        choices: [{ label: `${j.name}로 전직 (${j.reqLevel}급)`, job: j.id }],
      };
      return;
    }
    sim.talk = { npcId, text: n.lines.join("\n") };
    return;
  }
  sim.talk = { npcId, text: sim.combat.pick(n.lines) };
}

function tryAdvance(sim: Sim, jobId: JobId): void {
  const j = jobById(jobId);
  if (j.tier !== 2) return;
  if (JOBS[sim.meta.job].base !== j.base) {
    emit(sim, { type: "message", text: "다른 길의 교관이다", kind: "warn" });
    return;
  }
  if (sim.meta.job === jobId) {
    emit(sim, { type: "message", text: "이미 그 길이다", kind: "warn" });
    return;
  }
  if (JOBS[sim.meta.job].tier === 2 && sim.meta.job !== j.from) {
    emit(sim, { type: "message", text: "이미 전직했다", kind: "warn" });
    return;
  }
  if (sim.meta.level < j.reqLevel) {
    emit(sim, { type: "message", text: `${j.reqLevel}급이 되어야 한다`, kind: "warn" });
    return;
  }
  if (j.reqFlag && !sim.meta.flags[j.reqFlag]) {
    emit(sim, { type: "message", text: "교관의 표식이 없다. 한성에서 길을 묻고 그 자리를 밟아라.", kind: "warn" });
    return;
  }
  sim.meta.job = jobId;
  const skills = skillsForJob(jobId);
  sim.meta.bar = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => skills[i]?.id ?? null);
  const st = playerStats(sim.meta);
  sim.player.hp = st.maxHp;
  sim.player.mp = st.maxMp;
  emit(sim, { type: "jobAdvanced", job: jobId });
  emit(sim, { type: "message", text: `${j.name}(으)로 전직했다. 새로운 초식이 열린다.`, kind: "info" });
  sim.talk = null;
}

function buy(sim: Sim, itemId: string): void {
  const it = itemById(itemId);
  if (!it) return;
  if (sim.meta.gold < it.value) {
    emit(sim, { type: "message", text: "엽전이 부족하다", kind: "warn" });
    return;
  }
  sim.meta.gold -= it.value;
  addItem(sim, itemId, 1);
}

function sell(sim: Sim, instId: string): void {
  const inst = sim.meta.inventory.find((i) => i.instId === instId);
  const it = inst ? itemById(inst.itemId) : undefined;
  if (!it || it.kind === "quest") return;
  const gold = Math.max(1, Math.floor(it.value * 0.4) * inst!.qty);
  sim.meta.gold += gold;
  sim.meta.inventory = sim.meta.inventory.filter((i) => i.instId !== instId);
  for (const k of Object.keys(sim.meta.equip) as EquipSlot[]) if (sim.meta.equip[k] === instId) delete sim.meta.equip[k];
  emit(sim, { type: "message", text: `${it.name} 팔아 엽전 ${gold}`, kind: "loot" });
}

function rest(sim: Sim): void {
  const hub = hubAt(sim.player.x, sim.player.y);
  const nearInn = sim.actors.some((a) => {
    if (a.kind !== "npc" || !a.npcId) return false;
    const n = NPCS.find((x) => x.id === a.npcId);
    return n?.role === "inn" && dist(sim.player.x, sim.player.y, a.x, a.y) < 80;
  });
  if (sim.mode !== "dead" && !hub?.rest && !nearInn) {
    emit(sim, { type: "message", text: "거점(무명촌·한성·초소·나루·암자)에서만 편히 쉴 수 있다", kind: "warn" });
    return;
  }
  const st = statsNow(sim);
  sim.player.hp = st.maxHp;
  sim.player.mp = st.maxMp;
  sim.buffs = sim.buffs.filter((b) => b.id !== "hazard_poison" && b.id !== "hazard_chill");
  if (sim.mode === "dead") {
    sim.mode = "play";
    sim.player.dead = false;
    const dest = respawnHub(sim);
    sim.player.x = dest.x + 20;
    sim.player.y = dest.y + 40;
    sim.player.px = sim.player.x;
    sim.player.py = sim.player.y;
  } else if (hub) {
    sim.meta.lastHub = hub.id;
  }
  emit(sim, { type: "message", text: "거점에서 숨을 고쳤다.", kind: "info" });
}

function respawnHub(sim: Sim): { x: number; y: number } {
  const visited = restHubs().filter((h) => sim.meta.flags[`hub_${h.id}`] || h.id === sim.meta.lastHub);
  const list = visited.length ? visited : [HUBS.find((h) => h.id === "village")!];
  let best = list[0]!;
  let bd = Infinity;
  for (const h of list) {
    const d = dist(sim.player.x, sim.player.y, h.x, h.y);
    if (d < bd) {
      bd = d;
      best = h;
    }
  }
  return best;
}

export function handleCommand(sim: Sim, cmd: Command): void {
  switch (cmd.type) {
    case "newGame":
      startNewGame(sim, cmd.name, cmd.job, cmd.slot, cmd.seed);
      break;
    case "move":
      sim.moveAx = cmd.ax;
      sim.moveAy = cmd.ay;
      break;
    case "aim":
      sim.aimX = cmd.x;
      sim.aimY = cmd.y;
      break;
    case "attack":
      basicAttack(sim);
      break;
    case "useSkill":
      trySkill(sim, cmd.slot);
      break;
    case "pickupNearest":
      pickup(sim);
      break;
    case "equip":
      equipInst(sim, cmd.instId);
      break;
    case "unequip":
      delete sim.meta.equip[cmd.slot];
      break;
    case "useItem":
      useItem(sim, cmd.instId);
      break;
    case "dropItem": {
      const inst = sim.meta.inventory.find((i) => i.instId === cmd.instId);
      if (!inst) break;
      sim.drops.push({ id: nid(sim, "d"), x: sim.player.x + 16, y: sim.player.y + 8, itemId: inst.itemId, qty: inst.qty, age: 0 });
      sim.meta.inventory = sim.meta.inventory.filter((i) => i.instId !== inst.instId);
      for (const k of Object.keys(sim.meta.equip) as EquipSlot[]) if (sim.meta.equip[k] === inst.instId) delete sim.meta.equip[k];
      break;
    }
    case "talk":
      talkNpc(sim, cmd.npcId);
      break;
    case "buy":
      buy(sim, cmd.itemId);
      break;
    case "sell":
      sell(sim, cmd.instId);
      break;
    case "advanceJob":
      tryAdvance(sim, cmd.jobId);
      break;
    case "assignSkill":
      sim.meta.bar[cmd.barSlot] = cmd.skillId;
      break;
    case "rest":
      rest(sim);
      break;
    case "togglePause":
      sim.paused = !sim.paused;
      break;
    case "setPost":
      sim.postOn = cmd.on;
      break;
    case "dismissTalk":
      sim.talk = null;
      sim.shopOpen = false;
      break;
    case "save": {
      sim.slot = cmd.slot;
      const r = saveSlot(cmd.slot, snapshot(sim));
      sim.saveHint = r.ok ? `${cmd.slot + 1}자리에 기록했다` : r.reason;
      emit(sim, { type: "saved", slot: cmd.slot, ok: r.ok, reason: r.reason });
      break;
    }
    case "load": {
      const r = loadSlot(cmd.slot);
      if (!r.ok) {
        sim.saveHint = r.reason;
        emit(sim, { type: "loaded", slot: cmd.slot, ok: false, reason: r.reason });
        break;
      }
      applySave(sim, r.blob);
      sim.slot = cmd.slot;
      sim.saveHint = `${cmd.slot + 1}자리를 불러왔다`;
      emit(sim, { type: "loaded", slot: cmd.slot, ok: true });
      break;
    }
    default:
      break;
  }
}

function tickAi(sim: Sim, a: Actor, dt: number): void {
  if (a.kind !== "enemy" || a.dead) return;
  const def = ENEMY_BY_ID[a.defId];
  if (!def) return;
  const p = sim.player;
  const d = dist(a.x, a.y, p.x, p.y);
  a.attackCd = Math.max(0, a.attackCd - dt);
  if (p.dead) {
    a.vx = 0;
    a.vy = 0;
    return;
  }
  const aggro = def.aggro;
  const role = a.aiRole ?? "meleeChase";
  if (d > aggro) {
    a.aiT -= dt;
    if (a.aiT <= 0) {
      a.aiTx = a.x + sim.combat.around(0, 80);
      a.aiTy = a.y + sim.combat.around(0, 80);
      a.aiT = sim.combat.float(1.2, 2.5);
    }
    steer(a, a.aiTx, a.aiTy, def.spd * 0.45, dt);
    return;
  }
  a.facing = angTo(a.x, a.y, p.x, p.y);
  if (role === "rangedKite") {
    if (d < def.attackRange * 0.45) steer(a, a.x - Math.cos(a.facing) * 40, a.y - Math.sin(a.facing) * 40, def.spd, dt);
    else if (d > def.attackRange * 0.85) steer(a, p.x, p.y, def.spd * 0.7, dt);
    else {
      a.vx *= 0.8;
      a.vy *= 0.8;
    }
    if (d < def.attackRange && a.attackCd <= 0) {
      a.attackCd = def.attackCd;
      spawnProj(sim, a, { id: "ai", name: "시", job: "gungsoo", kind: "projectile", mp: 0, cd: 1, power: 1, range: def.attackRange, speed: 280, pierce: 0, desc: "" }, def.atk, 0.05);
    }
    return;
  }
  if (role === "flank") {
    const side = angTo(a.x, a.y, p.x, p.y) + 1.2;
    steer(a, p.x + Math.cos(side) * 50, p.y + Math.sin(side) * 50, def.spd, dt);
  } else if (role === "charge") {
    if (a.aiT <= 0) {
      a.aiT = 1.6;
      a.aiTx = p.x;
      a.aiTy = p.y;
    }
    a.aiT -= dt;
    steer(a, a.aiTx, a.aiTy, def.spd * 1.35, dt);
  } else if (role === "groundSlam") {
    steer(a, p.x, p.y, def.spd * 0.8, dt);
    if (d < def.attackRange && a.attackCd <= 0) {
      a.attackCd = def.attackCd + 0.4;
      a.attackAnim = 0.3;
      for (const t of targets(sim, a)) {
        if (dist(a.x, a.y, t.x, t.y) < 54) applyHit(sim, a, t, def.atk, 1.3, 0.05);
      }
    }
    return;
  } else if (role === "patrol") {
    if (d < aggro * 0.6) steer(a, p.x, p.y, def.spd, dt);
    else {
      a.aiT -= dt;
      if (a.aiT <= 0) {
        a.aiTx = a.x + sim.combat.around(0, 90);
        a.aiTy = a.y + sim.combat.around(0, 90);
        a.aiT = 2;
      }
      steer(a, a.aiTx, a.aiTy, def.spd * 0.5, dt);
    }
  } else {
    steer(a, p.x, p.y, def.spd, dt);
  }
  if (d < def.attackRange && a.attackCd <= 0) {
    a.attackCd = def.attackCd;
    a.attackAnim = 0.2;
    applyHit(sim, a, p, def.atk, 1, 0.04);
  }
}

function steer(a: Actor, tx: number, ty: number, spd: number, dt: number): void {
  const n = norm(tx - a.x, ty - a.y);
  a.vx = n.x * spd;
  a.vy = n.y * spd;
  a.facing = Math.atan2(n.y, n.x) || a.facing;
  a.walkPhase += dt * 6;
}

function tickFog(sim: Sim): void {
  const r = 9;
  const tx = Math.floor(sim.player.x / TILE);
  const ty = Math.floor(sim.player.y / TILE);
  for (let j = -r; j <= r; j++) {
    for (let i = -r; i <= r; i++) {
      if (i * i + j * j > r * r) continue;
      sim.fog[`${tx + i}:${ty + j}`] = 1;
    }
  }
}

function tickHazards(sim: Sim): void {
  if (sim.player.dead) return;
  if (hubAt(sim.player.x, sim.player.y)) {
    sim.buffs = sim.buffs.filter((b) => b.id !== "hazard_poison" && b.id !== "hazard_chill");
    return;
  }
  const z = zoneAt(sim.player.x, sim.player.y);
  const biome = biomeAt(sim.seed, sim.player.x, sim.player.y);
  const immune = sim.buffs.some((b) => b.id === "poison_immune" && b.until > sim.time);
  const poison = (z?.hazard === "poison" || biome === "swamp") && !immune;
  const chill = z?.hazard === "chill" || biome === "snow";
  const bump = (id: string, name: string, stats: Partial<Stats>, dot: number) => {
    const exist = sim.buffs.find((b) => b.id === id);
    if (!exist) {
      sim.buffs.push({ id, name, until: sim.time + 1.4, stats, dot, tag: "player" });
      emit(sim, { type: "message", text: name, kind: "warn" });
    } else exist.until = sim.time + 1.4;
  };
  if (poison) bump("hazard_poison", "늪독이 맥을 문다", {}, 5);
  else sim.buffs = sim.buffs.filter((b) => b.id !== "hazard_poison");
  if (chill) bump("hazard_chill", "한기가 뼈를 벤다", { spd: -38 }, 3);
  else sim.buffs = sim.buffs.filter((b) => b.id !== "hazard_chill");
}

function maybeEnding(sim: Sim): void {
  if (sim.mode !== "play") return;
  if (!sim.meta.flags.killed_boss_wraith || !sim.meta.flags.ending_rift) return;
  sim.mode = "ending";
  emit(sim, { type: "ending" });
  emit(sim, { type: "message", text: "적월이 갈라지고, 조선의 밤이 한 숨 고른다.", kind: "info" });
}

function tickProgress(sim: Sim): void {
  const hub = hubAt(sim.player.x, sim.player.y);
  if (hub) {
    sim.meta.flags[`hub_${hub.id}`] = true;
    sim.meta.lastHub = hub.id;
  }
  for (const [k, poi] of Object.entries(POI)) {
    const d = dist(sim.player.x, sim.player.y, poi.x, poi.y);
    if (d < 240) sim.meta.flags[`poi_${k}`] = true;
    if (poi.flag && d < 88 && !sim.meta.flags[poi.flag]) {
      sim.meta.flags[poi.flag] = true;
      emit(sim, { type: "message", text: `${poi.name}의 표식을 받았다.`, kind: "info" });
    }
    if (k === "dojo" && d < 88) sim.meta.flags.trainer_magung = true;
    if (k === "rift" && d < 160) {
      if (!sim.meta.flags.ending_rift) {
        sim.meta.flags.ending_rift = true;
        emit(sim, { type: "message", text: "적월의 균열이 발밑에서 숨 쉰다. 행적의 끝이 보인다.", kind: "warn" });
      }
      maybeEnding(sim);
    }
  }
  for (const n of NPCS) {
    if (!n.trainerFlag) continue;
    if (dist(sim.player.x, sim.player.y, n.x, n.y) < 70 && !sim.meta.flags[n.trainerFlag]) {
      sim.meta.flags[n.trainerFlag] = true;
      emit(sim, { type: "message", text: `${n.name}의 자리를 밟았다.`, kind: "info" });
    }
  }
}

export function step(sim: Sim, dt: number): void {
  if (sim.mode !== "play" || sim.paused) return;
  sim.tick += 1;
  sim.time += dt;

  for (const a of [sim.player, ...sim.actors]) {
    a.px = a.x;
    a.py = a.y;
    a.flash = Math.max(0, a.flash - dt);
    a.attackAnim = Math.max(0, a.attackAnim - dt);
  }
  for (const p of sim.projectiles) {
    p.px = p.x;
    p.py = p.y;
  }

  const st = statsNow(sim);
  sim.player.hp = Math.min(sim.player.hp, st.maxHp);
  sim.player.mp = Math.min(sim.player.mp, st.maxMp);
  if (!sim.player.dead) {
    const n = norm(sim.moveAx, sim.moveAy);
    const spd = st.spd * (n.x || n.y ? 1 : 0);
    sim.player.vx = n.x * spd;
    sim.player.vy = n.y * spd;
    if (n.x || n.y) {
      sim.player.facing = Math.atan2(n.y, n.x);
      sim.player.walkPhase += dt * 8;
    }
    sim.player.mp = Math.min(st.maxMp, sim.player.mp + dt * 3.2);
    resolveMove(sim, sim.player, sim.player.x + sim.player.vx * dt, sim.player.y + sim.player.vy * dt);
    sim.player.facing = angTo(sim.player.x, sim.player.y, sim.aimX, sim.aimY);
    tickHazards(sim);
  }

  const chunks = sim.terrain.around(sim.player.x, sim.player.y, sim.time, 2);
  for (const c of chunks) {
    if (!c.spawned) {
      spawnEnemies(sim, c);
      c.spawned = true;
    }
  }

  for (const a of sim.actors) {
    if (a.kind === "enemy" && !a.dead) {
      if (dist(a.x, a.y, sim.player.x, sim.player.y) > 520) {
        a.vx = 0;
        a.vy = 0;
        continue;
      }
      tickAi(sim, a, dt);
      resolveMove(sim, a, a.x + a.vx * dt, a.y + a.vy * dt);
    }
  }

  for (const p of sim.projectiles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    const list = p.team === 0 ? sim.actors.filter((a) => a.kind === "enemy" && !a.dead) : sim.player.dead ? [] : [sim.player];
    for (const t of list) {
      if (circleHit(p.x, p.y, p.r, t.x, t.y, t.radius)) {
        deal(sim, { id: p.src, name: "" }, t, Math.round(p.damage), false);
        p.pierce -= 1;
        if (p.pierce < 0) p.life = 0;
      }
    }
  }
  sim.projectiles = sim.projectiles.filter((p) => p.life > 0);

  for (const aoe of sim.aoes) {
    aoe.wait -= dt;
    if (aoe.wait <= 0) {
      const list = aoe.team === 0 ? sim.actors.filter((a) => a.kind === "enemy" && !a.dead) : [sim.player];
      for (const t of list) {
        if (dist(aoe.x, aoe.y, t.x, t.y) <= aoe.r + t.radius) deal(sim, { id: aoe.src, name: "" }, t, Math.round(aoe.damage), false);
      }
      sim.bursts.push({ x: aoe.x, y: aoe.y, kind: "skill", t: sim.time, ang: 0 });
    }
  }
  sim.aoes = sim.aoes.filter((a) => a.wait > 0);

  sim.buffs = sim.buffs.filter((b) => b.until > sim.time);
  for (const b of sim.buffs) {
    if (b.dot && b.tag) {
      const t = b.tag === "player" || b.tag === sim.player.id ? sim.player : sim.actors.find((a) => a.id === b.tag);
      if (t && !t.dead && sim.tick % Math.round(1 / dt) === 0) deal(sim, { id: "dot", name: b.name }, t, Math.max(1, Math.round(b.dot)), false);
    }
  }

  for (const d of sim.drops) d.age += dt;
  sim.drops = sim.drops.filter((d) => d.age < 80);
  if (sim.drops.length) {
    for (const d of [...sim.drops]) {
      if (dist(sim.player.x, sim.player.y, d.x, d.y) < 34) {
        sim.drops = sim.drops.filter((x) => x !== d);
        addItem(sim, d.itemId, d.qty);
      }
    }
  }

  sim.actors = sim.actors.filter((a) => {
    if (a.kind === "npc") return true;
    if (a.dead) return false;
    const dx = worldToChunk(a.x) - worldToChunk(sim.player.x);
    const dy = worldToChunk(a.y) - worldToChunk(sim.player.y);
    return Math.abs(dx) <= 3 && Math.abs(dy) <= 3;
  });

  for (const t of sim.trails) t.a -= dt * 3;
  sim.trails = sim.trails.filter((t) => t.a > 0);
  sim.bursts = sim.bursts.filter((b) => sim.time - b.t < 0.6);
  sim.messages = sim.messages.filter((m) => sim.time - m.t < 4);

  tickFog(sim);
  tickProgress(sim);
}

export function nearestNpc(sim: Sim): Actor | null {
  let best: Actor | null = null;
  let bd = 48;
  for (const a of sim.actors) {
    if (a.kind !== "npc") continue;
    const d = dist(sim.player.x, sim.player.y, a.x, a.y);
    if (d < bd) {
      bd = d;
      best = a;
    }
  }
  return best;
}

export function interpActor(a: Actor, alpha: number): { x: number; y: number } {
  return { x: lerp(a.px, a.x, alpha), y: lerp(a.py, a.y, alpha) };
}

export { xpNeed, SHOP_LIST, ITEMS };

export function liveStats(sim: Sim): Stats {
  return statsNow(sim);
}
