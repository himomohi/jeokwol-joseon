import type { BiomeId } from "../core/types";
import type { PropDefinition } from "../core/types";
import { HUBS, NPCS, POI, PROPS, hubAt, nearestHub, type HubDef, type NpcDef } from "../content/world";

/** Level-designer locks. Guide fidelity still beats spawn convenience. */
export const SCREEN_R = 220;
export const START_PINE_MIN = 3;
export const START_BAMBOO_MIN = 2;
export const CAMP_TENT_MAX = 2;
export const FIELD_MIN_SEP = 86;
export const FIELD_ATTEMPTS = 10;
export const FIELD_KEEP = 0.44;
export const DENSITY_WIN = 168;
export const DENSITY_MAX = 5;
export const TRAINER_ANCHOR_R = 78;
export const HANSUNG_EAST_GATE = { x: 2470, y: 8 };
export const HANSUNG_EAST_TENT = { x: 2460, y: 36 };

export const ANCHOR_ARTS = new Set(["house", "shop", "shrine", "gate"]);
export const HANOK_ARTS = new Set(["house", "shop", "shrine", "gate"]);
export const MILITARY_HUB_IDS = new Set(["outpost", "ferryman"]);
export const MILITARY_NPC_IDS = new Set(["camp_outpost", "camp_ferry", "trainer_changbyeong"]);

export interface DesignedProp {
  id: string;
  def: PropDefinition;
  x: number;
  y: number;
}

export function doorPos(bx: number, by: number, def: PropDefinition, side = 0): { x: number; y: number } {
  return { x: bx + side, y: by + Math.max(28, def.radius * 0.82) };
}

export function isHanokArt(art: string): boolean {
  return HANOK_ARTS.has(art);
}

export function isMilitaryNpc(id: string): boolean {
  return MILITARY_NPC_IDS.has(id);
}

export function isMilitaryCampHub(hub: HubDef | undefined): boolean {
  return !!hub && (hub.layout === "camp" && MILITARY_HUB_IDS.has(hub.id));
}

/** Field mix. Tents are never in the random bag — only designed road/camp sites. */
export function fieldMix(b: BiomeId): PropDefinition[] {
  const pine = PROPS.pine!;
  const bamboo = PROPS.bamboo!;
  const dead = PROPS.deadtree!;
  const reed = PROPS.reed!;
  const rock = PROPS.rock!;
  const bush = PROPS.bush!;
  const grave = PROPS.grave!;
  const lantern = PROPS.lantern!;
  const wall = PROPS.wall ?? rock;
  switch (b) {
    case "hanyang":
    case "village":
    case "jirisan_forest":
      return [pine, pine, pine, bamboo, bamboo, bush];
    case "bamboo":
      return [bamboo, bamboo, bamboo, pine, bush];
    case "swamp":
    case "shaman_marsh":
      return [reed, reed, dead, dead, bush];
    case "riverside":
    case "west_coast_mudflat":
      return [reed, reed, bamboo, rock];
    case "mountain":
    case "thunder_ridge":
      return [pine, pine, rock, dead];
    case "snow":
    case "northern_frontier":
      return [pine, rock, rock];
    case "haunted":
    case "ghost_palace":
      return [dead, dead, grave, lantern];
    case "road":
    case "hanseong_alley":
      return [wall, wall, rock];
    case "jeju_lava_field":
      return [rock, dead, pine];
    default:
      return [pine, bamboo];
  }
}

export const BIOME_PAIR: Partial<Record<BiomeId, [string, string]>> = {
  hanyang: ["pine", "bamboo"],
  village: ["pine", "bamboo"],
  jirisan_forest: ["pine", "bamboo"],
  swamp: ["reed", "deadtree"],
  shaman_marsh: ["reed", "deadtree"],
  riverside: ["reed", "bamboo"],
  west_coast_mudflat: ["reed", "rock"],
  mountain: ["pine", "rock"],
  haunted: ["deadtree", "grave"],
  bamboo: ["bamboo", "pine"],
};

export function pickFieldProp(b: BiomeId, i: number, u: number): PropDefinition {
  const mix = fieldMix(b);
  const pair = BIOME_PAIR[b];
  if (pair && i < pair.length) {
    const want = pair[i]!;
    const hit = mix.find((p) => p.art === want || p.id === want);
    if (hit) return hit;
  }
  return mix[Math.floor(u * mix.length)] ?? mix[0]!;
}

export function fieldKeepChance(b: BiomeId, extraRock: boolean): number {
  if (extraRock) return 0.38;
  if (b === "village") return 0.22;
  if (b === "road") return 0.34;
  return FIELD_KEEP;
}

export function tooClose(
  x: number,
  y: number,
  placed: ReadonlyArray<{ x: number; y: number; r?: number }>,
  minSep = FIELD_MIN_SEP,
): boolean {
  for (const p of placed) {
    const need = minSep + (p.r ?? 0) * 0.2;
    if (Math.hypot(x - p.x, y - p.y) < need) return true;
  }
  return false;
}

export function windowDensity(
  x: number,
  y: number,
  placed: ReadonlyArray<{ x: number; y: number }>,
  win = DENSITY_WIN,
): number {
  let n = 0;
  for (const p of placed) {
    if (Math.hypot(x - p.x, y - p.y) < win) n++;
  }
  return n;
}

export function hansungExtras(): DesignedProp[] {
  const house = PROPS.house!;
  const shop = PROPS.shop!;
  return [
    { id: "hansung_hyemin", def: house, x: 2400, y: -70 },
    { id: "hansung_pharmacy", def: shop, x: 2260, y: 176 },
  ];
}

/** Roofed anchors at trainer POIs that are not covered by a hub house/shop/shrine/gate. */
export function poiStructures(): DesignedProp[] {
  const house = PROPS.house!;
  const shop = PROPS.shop!;
  const shrine = PROPS.shrine!;
  return [
    { id: "poi_bambooHut", def: house, x: POI.bambooHut!.x, y: POI.bambooHut!.y },
    { id: "poi_arsenal", def: shop, x: POI.arsenal!.x, y: POI.arsenal!.y },
    { id: "poi_garden", def: shrine, x: POI.garden!.x, y: POI.garden!.y },
    { id: "poi_dojo", def: house, x: POI.dojo!.x, y: POI.dojo!.y },
    { id: "poi_temple", def: shrine, x: POI.temple!.x, y: POI.temple!.y },
  ];
}

/** Camps may have tents. Village/Hanseong interiors may not, except the east-gate one. */
export function designedCampProps(): DesignedProp[] {
  const tent = PROPS.tent!;
  const fire = PROPS.campfire!;
  const c = POI.banditCamp!;
  return [
    { id: "camp_bandit_t0", def: tent, x: c.x - 28, y: c.y - 8 },
    { id: "camp_bandit_t1", def: tent, x: c.x + 32, y: c.y + 10 },
    { id: "camp_bandit_fire", def: fire, x: c.x, y: c.y + 6 },
  ];
}

export function biomeAccentProps(): DesignedProp[] {
  const swamp = POI.swamp!;
  const rice = POI.rice!;
  return [
    { id: "accent_swamp_dead0", def: PROPS.deadtree!, x: swamp.x, y: swamp.y + 200 },
    { id: "accent_swamp_dead1", def: PROPS.deadtree!, x: swamp.x + 180, y: swamp.y + 180 },
    { id: "accent_swamp_reed0", def: PROPS.reed!, x: swamp.x - 80, y: swamp.y + 220 },
    { id: "accent_rice_pine0", def: PROPS.pine!, x: rice.x - 90, y: rice.y + 50 },
    { id: "accent_rice_bamboo0", def: PROPS.bamboo!, x: rice.x + 70, y: rice.y - 40 },
  ];
}

export function designedFieldProps(): DesignedProp[] {
  return [...poiStructures(), ...designedCampProps(), ...biomeAccentProps()];
}

export function designedTentSites(): { x: number; y: number; why: string }[] {
  const outpost = HUBS.find((h) => h.id === "outpost")!;
  const ferry = HUBS.find((h) => h.id === "ferryman")!;
  const bandit = POI.banditCamp!;
  return [
    { x: HANSUNG_EAST_TENT.x, y: HANSUNG_EAST_TENT.y, why: "hansung-east-gate" },
    { x: outpost.x - 28, y: outpost.y - 8, why: "outpost" },
    { x: outpost.x + 32, y: outpost.y + 10, why: "outpost" },
    { x: ferry.x - 28, y: ferry.y - 8, why: "ferry" },
    { x: ferry.x + 32, y: ferry.y + 10, why: "ferry" },
    { x: bandit.x - 28, y: bandit.y - 8, why: "bandit-camp" },
    { x: bandit.x + 32, y: bandit.y + 10, why: "bandit-camp" },
  ];
}

export function tentSiteAllowed(x: number, y: number): boolean {
  for (const s of designedTentSites()) {
    if (Math.hypot(x - s.x, y - s.y) < 22) return true;
  }
  const hub = hubAt(x, y);
  if (hub && isMilitaryCampHub(hub)) return true;
  return false;
}

export function nearestDesignedAnchor(x: number, y: number): { x: number; y: number; art: string; d: number } | undefined {
  let best: { x: number; y: number; art: string; d: number } | undefined;
  const pts: { x: number; y: number; art: string }[] = [
    { x: -120, y: -20, art: "shop" },
    { x: 130, y: -10, art: "house" },
    { x: -40, y: 110, art: "house" },
    { x: 40, y: -130, art: "shrine" },
    { x: -200, y: 80, art: "house" },
    { x: 210, y: 90, art: "house" },
    { x: 0, y: 210, art: "gate" },
    { x: 1920, y: 8, art: "gate" },
    { x: HANSUNG_EAST_GATE.x, y: HANSUNG_EAST_GATE.y, art: "gate" },
    { x: 2080, y: 16, art: "shop" },
    { x: 2320, y: 20, art: "house" },
    { x: 2160, y: 130, art: "house" },
    { x: 2300, y: -150, art: "shrine" },
    { x: 2000, y: 90, art: "house" },
    { x: 2360, y: 110, art: "house" },
    { x: 2110, y: -40, art: "house" },
    { x: 2400, y: -70, art: "house" },
    { x: 2260, y: 176, art: "shop" },
    { x: 5820, y: 204, art: "shrine" },
  ];
  for (const s of poiStructures()) pts.push({ x: s.x, y: s.y, art: s.def.art });
  for (const p of pts) {
    const d = Math.hypot(x - p.x, y - p.y);
    if (!best || d < best.d) best = { ...p, d };
  }
  return best;
}

export function trainerNeedsBuilding(n: NpcDef): boolean {
  return n.role === "trainer" || (n.role === "flavor" && n.id.startsWith("camp_") && !isMilitaryNpc(n.id));
}

export function placedNpc(n: NpcDef): { x: number; y: number } {
  return { x: n.x, y: n.y };
}

export function blockedByDesigned(x: number, y: number): boolean {
  if (hubAt(x, y)) return true;
  for (const s of designedFieldProps()) {
    if (Math.hypot(x - s.x, y - s.y) < s.def.radius + 40) return true;
  }
  return false;
}

export { nearestHub, NPCS };
