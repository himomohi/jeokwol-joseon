import { HUBS, NPCS, POI } from "../content/world";
import { TerrainCache, biomeAt, propForBiome } from "../world/map";
import {
  BIOME_PAIR,
  CAMP_TENT_MAX,
  DENSITY_MAX,
  DENSITY_WIN,
  HANSUNG_EAST_GATE,
  HANSUNG_EAST_TENT,
  SCREEN_R,
  START_BAMBOO_MIN,
  START_PINE_MIN,
  TRAINER_ANCHOR_R,
  fieldMix,
  isHanokArt,
  isMilitaryCampHub,
  isMilitaryNpc,
  tentSiteAllowed,
  trainerNeedsBuilding,
} from "../world/placement";
import type { PropInst } from "../world/map";

function gather(cache: TerrainCache, x: number, y: number, r = 1): PropInst[] {
  return cache.around(x, y, 0, r).flatMap((c) => c.props);
}

function artsOf(props: PropInst[]): string[] {
  return props.map((p) => p.def.art);
}

function countArt(props: PropInst[], art: string): number {
  return props.filter((p) => p.def.art === art).length;
}

export function reviewStartScene(notes: string[]): void {
  const cache = new TerrainCache(1, 16);
  const village = gather(cache, 0, 0, 1).filter((p) => Math.hypot(p.x, p.y) < 280);
  const pines = countArt(village, "pine");
  const bamboo = countArt(village, "bamboo");
  const tents = countArt(village, "tent");
  if (!village.some((p) => isHanokArt(p.def.art) && p.def.roof)) notes.push("시작 한옥 없음");
  if (pines < START_PINE_MIN) notes.push(`시작 소나무 ${pines} < ${START_PINE_MIN}`);
  if (bamboo < START_BAMBOO_MIN) notes.push(`시작 대나무 ${bamboo} < ${START_BAMBOO_MIN}`);
  if (tents > pines) notes.push("시작이 텐트 스팸");
  if (tents > 0) notes.push(`시작 마을에 천막 ${tents}`);

  const near = village.filter((p) => Math.hypot(p.x, p.y) < SCREEN_R);
  if (!near.some((p) => p.def.art === "pine")) notes.push("시작 화면 안에 소나무 없음");
  if (!near.some((p) => p.def.art === "bamboo")) notes.push("시작 화면 안에 대나무 없음");
  if (!near.some((p) => p.def.roof && isHanokArt(p.def.art))) notes.push("시작 화면 안에 한옥 없음");
}

export function reviewPlacement(notes: string[]): void {
  reviewStartScene(notes);
  const cache = new TerrainCache(1, 48);
  reviewTents(notes, cache);
  reviewCamps(notes, cache);
  reviewBiomeMix(notes, cache);
  reviewDensity(notes, cache);
  reviewTrainers(notes, cache);
  reviewDepthLayers(notes, cache);
}

function reviewTents(notes: string[], cache: TerrainCache): void {
  const samples: [number, number][] = [
    [0, 0],
    [POI.rice!.x, POI.rice!.y],
    [POI.pass!.x, POI.pass!.y],
    [POI.banditCamp!.x, POI.banditCamp!.y],
    [POI.outpost!.x, POI.outpost!.y],
    [POI.hansung!.x, POI.hansung!.y],
    [POI.bamboo!.x, POI.bamboo!.y],
    [POI.river!.x, POI.river!.y],
    [POI.swamp!.x, POI.swamp!.y],
    [POI.hermitage!.x, POI.hermitage!.y],
    [520, 0],
    [980, 0],
    [1600, 0],
  ];
  const tents: PropInst[] = [];
  const seen = new Set<string>();
  for (const [x, y] of samples) {
    for (const p of gather(cache, x, y, 1)) {
      if (p.def.art !== "tent" || seen.has(p.id)) continue;
      seen.add(p.id);
      tents.push(p);
      if (!tentSiteAllowed(p.x, p.y)) notes.push(`천막이 길/캠프가 아님 ${p.x | 0},${p.y | 0}`);
    }
  }

  const hansung = gather(cache, POI.hansung!.x, POI.hansung!.y, 1).filter((p) => {
    const h = HUBS.find((hub) => hub.id === "hansung")!;
    return Math.hypot(p.x - h.x, p.y - h.y) < h.r + 8;
  });
  const ht = hansung.filter((p) => p.def.art === "tent");
  if (ht.length !== 1) notes.push(`한성 천막 ${ht.length} ≠ 1`);
  if (ht[0] && Math.hypot(ht[0].x - HANSUNG_EAST_TENT.x, ht[0].y - HANSUNG_EAST_TENT.y) > 18) {
    notes.push("한성 천막이 동문이 아님");
  }
  if (Math.hypot(HANSUNG_EAST_TENT.x - HANSUNG_EAST_GATE.x, HANSUNG_EAST_TENT.y - HANSUNG_EAST_GATE.y) > 80) {
    notes.push("동문 천막이 문루에서 멀다");
  }

  const mixRoad = propForBiome("road");
  if (mixRoad.some((p) => p.id === "tent")) notes.push("필드 길 혼합에 천막이 있다");
}

function reviewCamps(notes: string[], cache: TerrainCache): void {
  for (const hub of HUBS) {
    if (hub.layout !== "camp") continue;
    const props = gather(cache, hub.x, hub.y, 1).filter((p) => Math.hypot(p.x - hub.x, p.y - hub.y) < hub.r + 12);
    const tents = countArt(props, "tent");
    const fires = countArt(props, "campfire");
    if (tents > CAMP_TENT_MAX) notes.push(`${hub.name} 천막 ${tents} > ${CAMP_TENT_MAX}`);
    if (fires < 1) notes.push(`${hub.name} 모닥불 없음`);
  }
  const bandit = gather(cache, POI.banditCamp!.x, POI.banditCamp!.y, 1).filter(
    (p) => Math.hypot(p.x - POI.banditCamp!.x, p.y - POI.banditCamp!.y) < 80,
  );
  if (countArt(bandit, "tent") > CAMP_TENT_MAX) notes.push("산적 야영 천막 과다");
  if (countArt(bandit, "campfire") < 1) notes.push("산적 야영 모닥불 없음");

  const hermit = HUBS.find((h) => h.id === "hermitage")!;
  const hp = gather(cache, hermit.x, hermit.y, 1).filter((p) => Math.hypot(p.x - hermit.x, p.y - hermit.y) < hermit.r);
  if (countArt(hp, "tent") > 0) notes.push("암자에 군막이 있다");
  if (!hp.some((p) => p.def.art === "shrine" && p.def.roof)) notes.push("암자 사당 없음");
}

function reviewBiomeMix(notes: string[], cache: TerrainCache): void {
  for (const [id, pair] of Object.entries(BIOME_PAIR)) {
    const mix = fieldMix(id as keyof typeof BIOME_PAIR);
    const arts = new Set(mix.map((p) => p.art));
    if (!arts.has(pair![0]) || !arts.has(pair![1])) notes.push(`${id} 필드 혼합에 ${pair!.join("+")} 없음`);
    if (mix.some((p) => p.id === "tent")) notes.push(`${id} 필드 혼합에 천막`);
  }

  const suburb = gather(cache, POI.rice!.x, POI.rice!.y, 1).filter((p) => biomeAt(1, p.x, p.y) === "hanyang" && !p.def.roof);
  const swamp = gather(cache, POI.swamp!.x, POI.swamp!.y, 1).filter((p) => biomeAt(1, p.x, p.y) === "swamp" && !p.def.roof);
  if (suburb.length && !suburb.some((p) => p.def.art === "pine")) notes.push("근교에 소나무 스폰 없음");
  if (suburb.length && !suburb.some((p) => p.def.art === "bamboo")) notes.push("근교에 대나무 스폰 없음");
  if (swamp.length && !swamp.some((p) => p.def.art === "reed")) notes.push("늪에 갈대 스폰 없음");
  if (swamp.length && !swamp.some((p) => p.def.art === "deadtree")) notes.push("늪에 고목 스폰 없음");
}

function reviewDensity(notes: string[], cache: TerrainCache): void {
  const spots: [number, number][] = [
    [0, 0],
    [POI.rice!.x, POI.rice!.y],
    [POI.hansung!.x, POI.hansung!.y],
    [POI.swamp!.x, POI.swamp!.y],
  ];
  for (const [x, y] of spots) {
    const field = gather(cache, x, y, 1).filter((p) => p.id.startsWith("p_"));
    for (const p of field) {
      const n = field.filter((q) => Math.hypot(q.x - p.x, q.y - p.y) < DENSITY_WIN).length;
      if (n > DENSITY_MAX + 1) {
        notes.push(`필드 밀도 과다 ${x | 0},${y | 0}`);
        return;
      }
    }
  }
}

function reviewTrainers(notes: string[], cache: TerrainCache): void {
  for (const n of NPCS) {
    if (!trainerNeedsBuilding(n) && n.role !== "trainer") continue;
    const props = gather(cache, n.x, n.y, 1);
    const anchors = props.filter((p) => isHanokArt(p.def.art) && p.def.roof);
    const tents = props.filter((p) => p.def.art === "tent");
    let ad = Infinity;
    for (const a of anchors) ad = Math.min(ad, Math.hypot(n.x - a.x, n.y - a.y));
    let td = Infinity;
    for (const t of tents) td = Math.min(td, Math.hypot(n.x - t.x, n.y - t.y));
    const hub = HUBS.find((h) => Math.hypot(n.x - h.x, n.y - h.y) < h.r);
    const military = isMilitaryNpc(n.id) || isMilitaryCampHub(hub);
    if (n.role === "trainer" || trainerNeedsBuilding(n)) {
      if (!military && ad > TRAINER_ANCHOR_R) notes.push(`${n.name}이 집/전방/사당/문루에 안 붙음`);
      if (!military && td < 36 && td + 8 < ad) notes.push(`${n.name}이 천막 NPC`);
    }
  }
}

function reviewDepthLayers(notes: string[], cache: TerrainCache): void {
  const village = gather(cache, 0, 0, 0);
  const roofs = cache.around(0, 0, 0, 0).flatMap((c) => c.roofs);
  if (!village.some((p) => p.def.roof)) notes.push("한옥 roof 레이어 없음");
  if (roofs.length < 3) notes.push("지붕 오버레이 부족");
  const chunk = cache.get(0, 0, 0);
  if (chunk.props.some((p) => p.def.roof && !chunk.roofs.some((r) => r.art === p.def.art))) {
    notes.push("지붕이 한옥과 어긋남");
  }
}

export { artsOf };
