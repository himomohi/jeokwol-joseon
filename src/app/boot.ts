import { reviewContent } from "../review/verify";

export function bootPrep(): void {
  const r = reviewContent();
  console.info(
    `[적월조선] 직 ${r.jobs} / 전직 ${r.adv} / 전직당 초식≥${r.skillsPerAdvMin} / 적 ${r.enemies} / 보스 ${r.bosses} / 바이옴 ${r.biomes} / 물산 ${r.items}`,
    r.ok ? "준비 완료" : r.notes,
  );
}
