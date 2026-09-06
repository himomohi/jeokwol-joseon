import { ENEMIES } from "../content/enemies";
import { SKILLS, JOBS } from "../content/jobs";
import { ITEMS } from "../content/items";
import { BIOMES } from "../content/world";
import { TerrainCache, biomeAt } from "../world/map";

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
  const jobs = Object.values(JOBS);
  const adv = jobs.filter((j) => j.tier === 2);
  let min = 99;
  for (const j of adv) min = Math.min(min, j.skills.length);
  const enemies = ENEMIES.filter((e) => !e.boss);
  const bosses = ENEMIES.filter((e) => e.boss);
  const notes: string[] = [];
  if (jobs.filter((j) => j.tier === 1).length < 6) notes.push("기본 직이 6개 미만");
  if (adv.length < 12) notes.push("전직이 12개 미만");
  if (min < 8) notes.push("전직 스킬이 8개 미만인 길 있음");
  if (enemies.length < 48) notes.push(`적 원형 ${enemies.length} < 48`);
  if (bosses.length < 6) notes.push("보스 6 미만");
  if (Object.keys(BIOMES).length < 7) notes.push("바이옴 부족");
  const cache = new TerrainCache(12345, 4);
  for (let i = 0; i < 12; i++) cache.get(i, 0, i);
  const a = biomeAt(12345, 80, 90);
  const b = biomeAt(12345, 80, 90);
  const cacheStable = a === b && cache.size() <= 4;
  if (!cacheStable) notes.push("청크 캐시/시드 불일치");
  const missingSkills = Object.values(JOBS).flatMap((j) => j.skills).filter((id) => !SKILLS[id]);
  if (missingSkills.length) notes.push(`없는 초식 ${missingSkills.length}`);
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
