import { CATALOG_MONSTER_IDS, ENEMIES, ENEMY_BY_ID } from "../content/enemies";
import { CANONICAL_JOB_IDS, CATALOG_SKILL_IDS, JOB_ALIASES, JOBS, SKILLS } from "../content/jobs";
import { ITEMS } from "../content/items";
import { BIOMES, CATALOG_BIOME_IDS, CATALOG_LOOT_IDS, HUBS, LOOT_TABLES, NPCS, POI, ROAD_EDGES, ZONES } from "../content/world";
import { TerrainCache, biomeAt } from "../world/map";
import { MAT } from "../art/materials";
import { ART_PIPELINE } from "../art/cache";
import {
  KEY_LIGHT_DIR,
  LOCKED_16,
  PAL,
  PAL_INDEX,
  PALETTE_LOCKED,
  isEnvHex,
  isPaletteHex,
  isPureBlack,
  neighborStroke,
} from "../art/palette";

export interface ReviewReport {
  jobs: number;
  adv: number;
  skillsPerAdvMin: number;
  enemies: number;
  bosses: number;
  biomes: number;
  items: number;
  skills: number;
  cacheStable: boolean;
  ok: boolean;
  notes: string[];
}

export function reviewContent(): ReviewReport {
  const jobs = CANONICAL_JOB_IDS.map((id) => JOBS[id]);
  const adv = jobs.filter((j) => j.tier === 2);
  let min = 99;
  for (const j of adv) min = Math.min(min, j.skills.length);
  const enemies = ENEMIES.filter((e) => !e.boss);
  const bosses = ENEMIES.filter((e) => e.boss);
  const notes: string[] = [];
  if (jobs.filter((j) => j.tier === 1).length < 6) notes.push("기본 직이 6개 미만");
  if (adv.length < 12) notes.push("전직이 12개 미만");
  if (min < 8) notes.push("전직 스킬이 8개 미만인 길 있음");
  if (CATALOG_SKILL_IDS.length < 96) notes.push(`카탈로그 초식 ${CATALOG_SKILL_IDS.length} < 96`);
  for (const id of CATALOG_SKILL_IDS) {
    if (!SKILLS[id]) notes.push(`없는 카탈로그 초식 ${id}`);
  }
  for (const [alias, from] of Object.entries(JOB_ALIASES)) {
    if (!from || !JOBS[alias as keyof typeof JOBS] || JOBS[from] == null) notes.push(`직 별칭 ${alias} 누락`);
  }
  if (enemies.length < 48) notes.push(`적 원형 ${enemies.length} < 48`);
  if (bosses.length < 6) notes.push("보스 6 미만");
  if (CATALOG_MONSTER_IDS.length < 57) notes.push(`카탈로그 몬스터 ${CATALOG_MONSTER_IDS.length} < 57`);
  for (const id of CATALOG_MONSTER_IDS) {
    if (!ENEMY_BY_ID[id]) notes.push(`카탈로그 몬스터 ${id} 누락`);
  }
  if (Object.keys(BIOMES).length < 7) notes.push("바이옴 부족");
  for (const id of CATALOG_BIOME_IDS) {
    if (!BIOMES[id]) notes.push(`카탈로그 바이옴 ${id} 누락`);
  }
  if (CATALOG_LOOT_IDS.length < 20) notes.push(`카탈로그 루트 ${CATALOG_LOOT_IDS.length} < 20`);
  for (const id of CATALOG_LOOT_IDS) {
    if (!LOOT_TABLES[id]?.length) notes.push(`카탈로그 루트 ${id} 누락`);
  }
  if (HUBS.length < 5) notes.push("거점 5 미만");
  if (ROAD_EDGES.length < 8) notes.push("도로 줄기 부족");
  if (ZONES.length < 8) notes.push("존 테이블 부족");
  if (NPCS.filter((n) => n.advanceJob).length < 12) notes.push("전직 교관 12 미만");
  const gated = Object.values(JOBS).filter((j) => j.tier === 2 && (!j.reqFlag?.startsWith("trainer_") || j.reqLevel < 20));
  if (gated.length) notes.push("전직 게이트(Lv20·trainerFlag) 누락");
  const cache = new TerrainCache(12345, 4);
  for (let i = 0; i < 12; i++) cache.get(i, 0, i);
  const a = biomeAt(12345, 80, 90);
  const b = biomeAt(12345, 80, 90);
  const cacheStable = a === b && cache.size() <= 4;
  if (!cacheStable) notes.push("청크 캐시/시드 불일치");
  if (ROAD_EDGES.every((e) => e[0] !== "banditCamp" || e[1] !== "banditBoss")) notes.push("산적야영→두목 도로 없음");
  if (POI.banditBoss?.boss !== "boss_bandit") notes.push("산적두목 POI 없음");
  const missingSkills = Object.values(JOBS).flatMap((j) => j.skills).filter((id) => !SKILLS[id]);
  if (missingSkills.length) notes.push(`없는 초식 ${missingSkills.length}`);
  if (ART_PIPELINE !== "codegen") notes.push("아트 파이프라인이 codegen이 아님");
  const alley = ENEMY_BY_ID.alley_ghost;
  const wonhon = ENEMY_BY_ID.wonhon;
  if (!alley || (alley.art === wonhon?.art && alley.hp === wonhon?.hp)) notes.push("골목원혼이 원혼 별칭만");
  const herb = ENEMY_BY_ID.herb_golem;
  if (!herb || (herb.art === "statue" && herb.hp === ENEMY_BY_ID.stone_guard?.hp)) notes.push("약초골렘 아트/스탯 재사용");
  const arts = new Set(ENEMIES.map((e) => e.art));
  if (arts.size < 40) notes.push(`적 아트 키 ${arts.size} < 40`);
  reviewPalette(notes);
  return {
    jobs: jobs.length,
    adv: adv.length,
    skillsPerAdvMin: min,
    enemies: enemies.length,
    bosses: bosses.length,
    biomes: Object.keys(BIOMES).length,
    items: Object.keys(ITEMS).length,
    skills: Object.keys(SKILLS).length,
    cacheStable,
    ok: notes.length === 0,
    notes,
  };
}

function reviewPalette(notes: string[]): void {
  const po = [
    "#0B0A14",
    "#162033",
    "#243552",
    "#3D5278",
    "#6E6256",
    "#B5A48C",
    "#EDE4D4",
    "#3F0A12",
    "#8A1220",
    "#C41E3A",
    "#F24555",
    "#8A6414",
    "#E0A81C",
    "#F0C86A",
    "#2F5A48",
    "#6A7380",
  ];
  if (!PALETTE_LOCKED) notes.push("팔레트 잠금 아님");
  if (LOCKED_16.length !== 16 || LOCKED_16.some((c, i) => c !== po[i])) notes.push("잠금 16 hex 불일치");
  if (PAL.blood_main !== LOCKED_16[9] || PAL.blood_hot !== LOCKED_16[10] || PAL.torch_warm !== LOCKED_16[12]) {
    notes.push("PAL 별칭 이탈");
  }
  if (PAL_INDEX.some((c, i) => c !== LOCKED_16[i])) notes.push("PAL_INDEX 이탈");
  if (KEY_LIGHT_DIR.x >= 0 || KEY_LIGHT_DIR.y >= 0) notes.push("키라이트 NW 아님");
  if (PAL_INDEX.some(isPureBlack)) notes.push("팔레트에 #000");
  if (PAL_INDEX.some((c) => isPureBlack(neighborStroke(c)))) notes.push("아웃라인 #000");
  if (Object.values(MAT).some((m) => isPureBlack(m.fill) || isPureBlack(m.stroke))) notes.push("재료 #000");
  const badTint = Object.values(ITEMS).filter((it) => it.visual?.tint && !isPaletteHex(it.visual.tint));
  if (badTint.length) notes.push(`물산 tint 이탈 ${badTint.length}`);
  const badJob = Object.values(JOBS).filter((j) => !isPaletteHex(j.hue) || !isPaletteHex(j.robe));
  if (badJob.length) notes.push(`직 색 이탈 ${badJob.length}`);
  for (const b of Object.values(BIOMES)) {
    for (const f of [b.grass, b.grass2, b.dirt, b.deco, b.water]) {
      if (!f) continue;
      if (!isEnvHex(f)) notes.push(`환경에 핏/횃불 ${b.id}`);
    }
  }
}

