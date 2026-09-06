import { applyPaletteCss } from "../art/palette";
import { preloadApprovedPng } from "../art/cache";
import { reviewContent } from "../review/verify";

export function bootPrep(): void {
  applyPaletteCss();
  preloadApprovedPng();
  const r = reviewContent();
  console.info(
    `[적월조선] 직 ${r.jobs} / 전직 ${r.adv} / 전직당 초식≥${r.skillsPerAdvMin} / 초식 ${r.skills} / 적 ${r.enemies} / 보스 ${r.bosses} / 바이옴 ${r.biomes} / 물산 ${r.items} / 캐시 ${r.cacheStable ? "안정" : "불안정"}`,
    r.ok ? "준비 완료" : r.notes,
  );
}
