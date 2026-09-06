import type { BiomeId, JobId } from "../core/types";
import type { PropDefinition } from "../core/types";
import { PAL, rgba } from "../art/palette";

export interface BiomeDef {
  id: BiomeId;
  name: string;
  grass: string;
  grass2: string;
  dirt: string;
  deco: string;
  ambient: string;
  fog: string;
  water?: string;
  spawnDensity: number;
  families: string[];
}

export const BIOMES: Record<BiomeId, BiomeDef> = {
  hanyang: {
    id: "hanyang",
    name: "근교 들녘",
    grass: PAL.moss_cool,
    grass2: PAL.earth_dark,
    dirt: PAL.earth_dark,
    deco: PAL.moss_cool,
    ambient: PAL.earth_mid,
    fog: rgba(PAL.bg_void, 0.08),
    spawnDensity: 0.55,
    families: ["pest", "bandit", "spirit"],
  },
  mountain: {
    id: "mountain",
    name: "산악",
    grass: PAL.earth_dark,
    grass2: PAL.env_mid,
    dirt: PAL.earth_dark,
    deco: PAL.shadow_navy,
    ambient: PAL.earth_mid,
    fog: rgba(PAL.shadow_navy, 0.14),
    spawnDensity: 0.8,
    families: ["beast", "bandit", "wildlife", "dokkaebi"],
  },
  bamboo: {
    id: "bamboo",
    name: "대나무숲",
    grass: PAL.moss_cool,
    grass2: PAL.earth_dark,
    dirt: PAL.earth_dark,
    deco: PAL.moss_cool,
    ambient: PAL.moss_cool,
    fog: rgba(PAL.env_mid, 0.16),
    spawnDensity: 0.75,
    families: ["spirit", "dokkaebi", "wildlife", "beast"],
  },
  riverside: {
    id: "riverside",
    name: "강변",
    grass: PAL.moss_cool,
    grass2: PAL.env_cool,
    dirt: PAL.earth_dark,
    deco: PAL.moss_cool,
    ambient: PAL.env_cool,
    fog: rgba(PAL.shadow_navy, 0.1),
    water: PAL.env_cool,
    spawnDensity: 0.6,
    families: ["wildlife", "spirit", "bandit", "swamp"],
  },
  swamp: {
    id: "swamp",
    name: "늪/습지",
    grass: PAL.env_mid,
    grass2: PAL.shadow_navy,
    dirt: PAL.earth_dark,
    deco: PAL.moss_cool,
    ambient: PAL.moss_cool,
    fog: rgba(PAL.bg_void, 0.22),
    water: PAL.shadow_navy,
    spawnDensity: 0.85,
    families: ["swamp", "pest"],
  },
  snow: {
    id: "snow",
    name: "설산",
    grass: PAL.ui_steel,
    grass2: PAL.bone_light,
    dirt: PAL.env_cool,
    deco: PAL.env_mid,
    ambient: PAL.bone_light,
    fog: rgba(PAL.bone_light, 0.14),
    spawnDensity: 0.5,
    families: ["beast", "wildlife", "spirit"],
  },
  haunted: {
    id: "haunted",
    name: "폐사/원혼",
    grass: PAL.bg_void,
    grass2: PAL.shadow_navy,
    dirt: PAL.earth_dark,
    deco: PAL.env_mid,
    ambient: PAL.earth_mid,
    fog: rgba(PAL.shadow_navy, 0.28),
    spawnDensity: 0.9,
    families: ["undead", "spirit", "shrine"],
  },
  road: {
    id: "road",
    name: "길",
    grass: PAL.earth_dark,
    grass2: PAL.earth_mid,
    dirt: PAL.earth_dark,
    deco: PAL.shadow_navy,
    ambient: PAL.earth_mid,
    fog: rgba(PAL.bg_void, 0.06),
    spawnDensity: 0.4,
    families: ["bandit"],
  },
  village: {
    id: "village",
    name: "마을",
    grass: PAL.moss_cool,
    grass2: PAL.earth_dark,
    dirt: PAL.earth_mid,
    deco: PAL.moss_cool,
    ambient: PAL.earth_mid,
    fog: rgba(PAL.bg_void, 0.04),
    spawnDensity: 0.12,
    families: ["military"],
  },
  hanseong_alley: {
    id: "hanseong_alley",
    name: "한성 골목",
    grass: PAL.earth_dark,
    grass2: PAL.shadow_navy,
    dirt: PAL.earth_mid,
    deco: PAL.env_mid,
    ambient: PAL.earth_mid,
    fog: rgba(PAL.bg_void, 0.1),
    spawnDensity: 0.5,
    families: ["bandit", "undead"],
  },
  jirisan_forest: {
    id: "jirisan_forest",
    name: "지리산 숲",
    grass: PAL.moss_cool,
    grass2: PAL.env_mid,
    dirt: PAL.earth_dark,
    deco: PAL.moss_cool,
    ambient: PAL.moss_cool,
    fog: rgba(PAL.env_mid, 0.14),
    spawnDensity: 0.78,
    families: ["beast", "spirit", "wildlife"],
  },
  ghost_palace: {
    id: "ghost_palace",
    name: "원혼 궁궐",
    grass: PAL.bg_void,
    grass2: PAL.shadow_navy,
    dirt: PAL.earth_dark,
    deco: PAL.env_mid,
    ambient: PAL.earth_mid,
    fog: rgba(PAL.shadow_navy, 0.3),
    spawnDensity: 0.88,
    families: ["undead", "spirit", "shrine"],
  },
  west_coast_mudflat: {
    id: "west_coast_mudflat",
    name: "서해 갯벌",
    grass: PAL.earth_dark,
    grass2: PAL.env_cool,
    dirt: PAL.earth_mid,
    deco: PAL.moss_cool,
    ambient: PAL.env_cool,
    fog: rgba(PAL.shadow_navy, 0.12),
    water: PAL.env_cool,
    spawnDensity: 0.62,
    families: ["swamp", "wildlife", "spirit"],
  },
  northern_frontier: {
    id: "northern_frontier",
    name: "북방 변새",
    grass: PAL.ui_steel,
    grass2: PAL.bone_light,
    dirt: PAL.env_cool,
    deco: PAL.env_mid,
    ambient: PAL.bone_light,
    fog: rgba(PAL.bone_light, 0.12),
    spawnDensity: 0.52,
    families: ["beast", "military", "wildlife"],
  },
  jeju_lava_field: {
    id: "jeju_lava_field",
    name: "제주 화산지",
    grass: PAL.earth_dark,
    grass2: PAL.shadow_navy,
    dirt: PAL.earth_mid,
    deco: PAL.metal_dark,
    ambient: PAL.earth_mid,
    fog: rgba(PAL.bg_void, 0.16),
    spawnDensity: 0.7,
    families: ["dokkaebi", "shrine", "beast"],
  },
  shaman_marsh: {
    id: "shaman_marsh",
    name: "무당 늪",
    grass: PAL.env_mid,
    grass2: PAL.shadow_navy,
    dirt: PAL.earth_dark,
    deco: PAL.moss_cool,
    ambient: PAL.moss_cool,
    fog: rgba(PAL.bg_void, 0.24),
    water: PAL.shadow_navy,
    spawnDensity: 0.86,
    families: ["swamp", "spirit"],
  },
  thunder_ridge: {
    id: "thunder_ridge",
    name: "뇌령",
    grass: PAL.env_cool,
    grass2: PAL.earth_dark,
    dirt: PAL.shadow_navy,
    deco: PAL.env_mid,
    ambient: PAL.env_cool,
    fog: rgba(PAL.shadow_navy, 0.18),
    spawnDensity: 0.72,
    families: ["dokkaebi", "spirit", "bandit"],
  },
};

export const PROPS: Record<string, PropDefinition> = {
  pine: { id: "pine", name: "소나무", biomes: ["hanyang", "village", "mountain", "snow"], w: 36, h: 64, radius: 12, solid: true, roof: false, layer: "prop", art: "pine" },
  bamboo: { id: "bamboo", name: "대나무", biomes: ["bamboo", "riverside", "hanyang", "village"], w: 18, h: 64, radius: 7, solid: true, roof: false, layer: "prop", art: "bamboo" },
  deadtree: { id: "deadtree", name: "고목", biomes: ["haunted", "swamp"], w: 26, h: 44, radius: 10, solid: true, roof: false, layer: "prop", art: "deadtree" },
  rock: { id: "rock", name: "바위", biomes: ["mountain", "snow", "riverside"], w: 22, h: 18, radius: 12, solid: true, roof: false, layer: "prop", art: "rock" },
  reed: { id: "reed", name: "갈대", biomes: ["riverside", "swamp"], w: 16, h: 28, radius: 4, solid: false, roof: false, layer: "prop", art: "reed" },
  bush: { id: "bush", name: "덤불", biomes: ["hanyang", "bamboo", "mountain"], w: 20, h: 16, radius: 8, solid: false, roof: false, layer: "prop", art: "bush" },
  lantern: { id: "lantern", name: "석등", biomes: ["village", "haunted"], w: 14, h: 26, radius: 6, solid: true, roof: false, layer: "prop", art: "lantern" },
  campfire: { id: "campfire", name: "모닥불", biomes: ["mountain", "road"], w: 18, h: 16, radius: 8, solid: false, roof: false, layer: "prop", art: "campfire" },
  grave: { id: "grave", name: "무덤", biomes: ["haunted"], w: 16, h: 22, radius: 8, solid: true, roof: false, layer: "prop", art: "grave" },
  house: { id: "house", name: "초가", biomes: ["village"], w: 120, h: 96, radius: 40, solid: true, roof: true, layer: "prop", art: "house" },
  shop: { id: "shop", name: "전방", biomes: ["village"], w: 124, h: 100, radius: 42, solid: true, roof: true, layer: "prop", art: "shop" },
  shrine: { id: "shrine", name: "사당", biomes: ["village", "haunted"], w: 100, h: 88, radius: 32, solid: true, roof: true, layer: "prop", art: "shrine" },
  gate: { id: "gate", name: "문루", biomes: ["village"], w: 130, h: 72, radius: 20, solid: true, roof: true, layer: "prop", art: "gate" },
  tent: { id: "tent", name: "군막", biomes: ["road"], w: 52, h: 40, radius: 20, solid: true, roof: false, layer: "prop", art: "tent" },
  wall: { id: "wall", name: "돌담", biomes: ["road", "mountain", "village"], w: 44, h: 22, radius: 16, solid: true, roof: false, layer: "prop", art: "wall" },
};

export const LOOT_TABLES: Record<string, { w: number; itemId: string; qty: number }[]> = {
  loot_bandit: [
    { w: 28, itemId: "gold", qty: 6 },
    { w: 16, itemId: "hp_small", qty: 1 },
    { w: 16, itemId: "sword_rusty", qty: 1 },
    { w: 14, itemId: "helm_gat", qty: 1 },
    { w: 10, itemId: "chest_leather", qty: 1 },
  ],
  loot_bandit_rare: [
    { w: 30, itemId: "gold", qty: 28 },
    { w: 12, itemId: "sword_ring", qty: 1 },
    { w: 10, itemId: "chest_leather", qty: 1 },
    { w: 8, itemId: "hp_mid", qty: 1 },
  ],
  loot_beast: [
    { w: 40, itemId: "gold", qty: 8 },
    { w: 12, itemId: "acc_norigae", qty: 1 },
    { w: 10, itemId: "hp_small", qty: 1 },
  ],
  loot_beast_rare: [
    { w: 24, itemId: "gold", qty: 32 },
    { w: 14, itemId: "acc_tiger", qty: 1 },
    { w: 10, itemId: "chest_leather", qty: 1 },
  ],
  loot_dok: [
    { w: 30, itemId: "gold", qty: 10 },
    { w: 12, itemId: "mp_small", qty: 1 },
    { w: 8, itemId: "tal_paper", qty: 1 },
  ],
  loot_spirit: [
    { w: 30, itemId: "gold", qty: 12 },
    { w: 14, itemId: "mp_small", qty: 1 },
    { w: 8, itemId: "acc_tal", qty: 1 },
  ],
  loot_spirit_rare: [
    { w: 20, itemId: "gold", qty: 40 },
    { w: 10, itemId: "tal_red", qty: 1 },
    { w: 8, itemId: "acc_moon", qty: 1 },
  ],
  loot_undead: [
    { w: 36, itemId: "gold", qty: 8 },
    { w: 12, itemId: "mp_small", qty: 1 },
    { w: 8, itemId: "dagger_iron", qty: 1 },
  ],
  loot_undead_rare: [
    { w: 20, itemId: "gold", qty: 40 },
    { w: 10, itemId: "staff_jade", qty: 1 },
    { w: 8, itemId: "acc_tal", qty: 1 },
  ],
  loot_military: [
    { w: 30, itemId: "gold", qty: 10 },
    { w: 10, itemId: "spear_wood", qty: 1 },
    { w: 8, itemId: "helm_jeonrip", qty: 1 },
  ],
  loot_military_rare: [
    { w: 20, itemId: "gold", qty: 36 },
    { w: 10, itemId: "chest_scale", qty: 1 },
    { w: 8, itemId: "helm_iron", qty: 1 },
  ],
  loot_wild: [
    { w: 50, itemId: "gold", qty: 4 },
    { w: 12, itemId: "hp_small", qty: 1 },
  ],
  loot_swamp: [
    { w: 34, itemId: "gold", qty: 8 },
    { w: 12, itemId: "antidote", qty: 1 },
    { w: 8, itemId: "staff_oak", qty: 1 },
  ],
  loot_swamp_rare: [
    { w: 20, itemId: "gold", qty: 36 },
    { w: 10, itemId: "staff_venom", qty: 1 },
    { w: 8, itemId: "antidote", qty: 2 },
  ],
  loot_shrine: [
    { w: 24, itemId: "gold", qty: 16 },
    { w: 12, itemId: "tal_red", qty: 1 },
    { w: 8, itemId: "acc_tal", qty: 1 },
  ],
  loot_boss_tiger: [
    { w: 100, itemId: "quest_tiger_fang", qty: 1 },
    { w: 80, itemId: "acc_tiger", qty: 1 },
    { w: 40, itemId: "chest_moon", qty: 1 },
    { w: 100, itemId: "gold", qty: 120 },
  ],
  loot_boss_bandit: [
    { w: 80, itemId: "sword_moon", qty: 1 },
    { w: 100, itemId: "gold", qty: 100 },
    { w: 20, itemId: "chest_scale", qty: 1 },
  ],
  loot_boss_gumiho: [
    { w: 80, itemId: "tal_moon", qty: 1 },
    { w: 60, itemId: "acc_moon", qty: 1 },
    { w: 100, itemId: "gold", qty: 140 },
  ],
  loot_boss_abbot: [
    { w: 100, itemId: "quest_abbot_bead", qty: 1 },
    { w: 70, itemId: "staff_lotus", qty: 1 },
    { w: 100, itemId: "gold", qty: 130 },
  ],
  loot_boss_snow: [
    { w: 70, itemId: "bow_hawk", qty: 1 },
    { w: 50, itemId: "chest_moon", qty: 1 },
    { w: 100, itemId: "gold", qty: 150 },
  ],
  loot_boss_imugi: [
    { w: 70, itemId: "spear_blood", qty: 1 },
    { w: 50, itemId: "staff_venom", qty: 1 },
    { w: 100, itemId: "gold", qty: 160 },
  ],
  loot_boss_wraith: [
    { w: 100, itemId: "tal_moon", qty: 1 },
    { w: 70, itemId: "staff_lotus", qty: 1 },
    { w: 40, itemId: "chest_moon", qty: 1 },
    { w: 100, itemId: "gold", qty: 180 },
  ],
};

LOOT_TABLES.loot_hanseong_alley = LOOT_TABLES.loot_bandit!;
LOOT_TABLES.loot_jirisan = LOOT_TABLES.loot_beast!;
LOOT_TABLES.loot_ghost_palace = LOOT_TABLES.loot_undead_rare!;
LOOT_TABLES.loot_mudflat = LOOT_TABLES.loot_swamp!;
LOOT_TABLES.loot_frontier = LOOT_TABLES.loot_military!;
LOOT_TABLES.loot_jeju = LOOT_TABLES.loot_dok!;
LOOT_TABLES.loot_marsh = LOOT_TABLES.loot_swamp_rare!;
LOOT_TABLES.loot_ridge = LOOT_TABLES.loot_spirit!;
LOOT_TABLES.loot_palace = LOOT_TABLES.loot_shrine!;
LOOT_TABLES.loot_elite = LOOT_TABLES.loot_bandit_rare!;

/** Coordinator catalog loot IDs (20). Extra sim boss/family tables stay in LOOT_TABLES. */
export const CATALOG_LOOT_IDS = [
  "loot_hanseong_alley",
  "loot_jirisan",
  "loot_ghost_palace",
  "loot_mudflat",
  "loot_frontier",
  "loot_jeju",
  "loot_marsh",
  "loot_ridge",
  "loot_palace",
  "loot_elite",
  "loot_bandit",
  "loot_beast",
  "loot_dok",
  "loot_spirit",
  "loot_undead",
  "loot_military",
  "loot_wild",
  "loot_swamp",
  "loot_shrine",
  "loot_boss_bandit",
] as const;

export const CATALOG_BIOME_IDS = [
  "hanseong_alley",
  "jirisan_forest",
  "ghost_palace",
  "west_coast_mudflat",
  "northern_frontier",
  "jeju_lava_field",
  "shaman_marsh",
  "thunder_ridge",
] as const;

export interface NpcDef {
  id: string;
  name: string;
  role: "trainer" | "shop" | "inn" | "flavor";
  job?: string;
  advanceJob?: JobId;
  trainerFlag?: string;
  x: number;
  y: number;
  lines: string[];
}

export const NPCS: NpcDef[] = [
  { id: "trainer_musa", name: "검교 박 첨지", role: "trainer", job: "musa", x: -138, y: 16, lines: ["칼끝은 마음을 따른다.", "전직은 한성 무관청과 동문 군영이다. 스무 급이 되면 찾아가거라."] },
  { id: "trainer_gungsoo", name: "각궁 최 사수", role: "trainer", job: "gungsoo", x: -102, y: 18, lines: ["숨과 현을 맞춰라.", "백발은 대숲 오두막, 신기전은 강변 병기창에 있다."] },
  { id: "trainer_dosa", name: "현무관 도사", role: "trainer", job: "dosa", x: 26, y: -98, lines: ["적월이 뜨면 원혼이 걷는다.", "한성 관상감에서 천문을, 폐사 사찰에서 부적을 묻거라."] },
  { id: "trainer_uiwon", name: "무명촌 의원", role: "trainer", job: "uiwon", x: 54, y: -96, lines: ["산 자와 죽은 자를 가리지 마라.", "침은 한성 혜민서, 독객은 약방 지하, 약사는 늪 약초원이다."] },
  { id: "trainer_dojeok", name: "그림자의 노파", role: "trainer", job: "dojeok", x: -200, y: 114, lines: ["발소리는 거짓말이다.", "흑의는 한성 밤골목, 금강은 산속 암자에 숨는다."] },
  { id: "trainer_gibyeong", name: "마구간의 교련관", role: "trainer", job: "gibyeong", x: 210, y: 124, lines: ["말과 한 몸이 되어라.", "염화의 창과 마궁은 산 수련장에서 익힌다."] },
  { id: "shop_weapon", name: "무기전 김 서방", role: "shop", x: -120, y: 22, lines: ["좋은 철을 들여왔다. 골라 보게."] },
  { id: "shop_herb", name: "약재상 한 씨", role: "shop", x: -150, y: 24, lines: ["환약과 영단이 있다. 늪에 들면 해독환을 잊지 말게."] },
  { id: "innkeep", name: "주막 주인", role: "inn", x: 148, y: 24, lines: ["쉬어 가게. 저장은 주막에서 하는 것이 안전하다.", "동녘 벼밭을 지나면 돌담 고갯길이 나온다."] },
  { id: "villager_a", name: "아낙", role: "flavor", x: 60, y: 90, lines: ["달이 붉어지고부터 산적이 늘었어.", "고갯길 너머 야영에 두목이 있다. 한성은 그 너머다."] },
  { id: "villager_b", name: "나무꾼", role: "flavor", x: -40, y: 150, lines: ["길은 하나다. 동쪽으로만 나 있다.", "벼밭의 쥐와 산적을 베면 급수가 오른다."] },

  { id: "hint_herald", name: "한성 포졸", role: "flavor", x: 2200, y: 40, lines: ["무관청은 광장 서편, 동문 군영은 해 뜨는 쪽이다.", "관상감·혜민서·밤골목·약방은 성 안이다. 백발은 대숲, 신기전은 강변, 약사는 늪, 염화는 산, 부적과 금강은 사찰과 암자다."] },
  { id: "innkeep_hansung", name: "한성 주막", role: "inn", x: 2320, y: 52, lines: ["외곽 주막이다. 한성에서 숨을 고르고 스무 급에 교관을 찾거라."] },
  { id: "shop_hansung", name: "한성 전방", role: "shop", x: 2080, y: 48, lines: ["도성 물산이다. 골라 보게."] },
  { id: "hint_pharmacy", name: "약방 심부름꾼", role: "flavor", x: 2284, y: 210, lines: ["독객의 맥은 지하에 있다. 스승은 늪 약초원의 약사에게도 있다.", "해독환 없이 늪에 들지 마라."] },
  { id: "hint_temple", name: "외곽 사당지기", role: "flavor", x: 2318, y: -116, lines: ["부적의 인은 폐사 사찰에 있다. 금강은 암자 노승에게 묻거라."] },

  { id: "trainer_geomgaek", name: "무관청 검교", role: "trainer", job: "musa", advanceJob: "geomgaek", trainerFlag: "trainer_geomgaek", x: 2110, y: -6, lines: ["한 자루로 달을 가르려면 이 마당을 밟아야 한다.", "스무 급, 이 자리의 표식이면 검객의 길을 연다."] },
  { id: "trainer_changbyeong", name: "동문 창교", role: "trainer", job: "musa", advanceJob: "changbyeong", trainerFlag: "trainer_changbyeong", x: 2470, y: 32, lines: ["동문 군영의 창끝이다.", "스무 급이면 창병의 진을 가르친다."] },
  { id: "trainer_sulsa", name: "관상감 천문사", role: "trainer", job: "dosa", advanceJob: "sulsa", trainerFlag: "trainer_sulsa", x: 2282, y: -116, lines: ["별이 적월에 가려도 수는 남는다.", "스무 급에 술사의 원을 연다."] },
  { id: "trainer_myeongui", name: "혜민서 침의", role: "trainer", job: "uiwon", advanceJob: "myeongui", trainerFlag: "trainer_myeongui", x: 2400, y: -36, lines: ["맥은 손끝에서 돈다.", "스무 급이면 명의의 침을 전한다."] },
  { id: "trainer_jagaek", name: "밤골목 흑의", role: "trainer", job: "dojeok", advanceJob: "jagaek", trainerFlag: "trainer_jagaek", x: 2160, y: 164, lines: ["등불이 꺼진 골목이다.", "스무 급, 이 그늘을 지나면 자객이다."] },
  { id: "trainer_dokgong", name: "약방 지하 독객", role: "trainer", job: "uiwon", advanceJob: "dokgong", trainerFlag: "trainer_dokgong", x: 2260, y: 210, lines: ["지하 약방에서 독을 가른다.", "스물두 급. 늪 약초원을 밟아도 같은 표식이다."] },
  { id: "trainer_hwasal", name: "병기창 화포장", role: "trainer", job: "gungsoo", advanceJob: "hwasal", trainerFlag: "trainer_hwasal", x: 2820, y: -706, lines: ["신기전의 연기가 강물에 눕는다.", "스무 급이면 화살사수의 화약을 맡긴다."] },
  { id: "trainer_singung", name: "대숲 백발", role: "trainer", job: "gungsoo", advanceJob: "singung", trainerFlag: "trainer_singung", x: 2760, y: 714, lines: ["백보 밖 숨결이 들린다.", "이 오두막을 찾은 스무 급에게 신궁을 전한다."] },
  { id: "trainer_bujeoksa", name: "폐사 부적승", role: "trainer", job: "dosa", advanceJob: "bujeoksa", trainerFlag: "trainer_bujeoksa", x: 5920, y: 74, lines: ["종이에 신명을 가둔다.", "스무 급, 이 사찰의 표식이면 부적사다."] },
  { id: "trainer_dogul", name: "암자 금강", role: "trainer", job: "dojeok", advanceJob: "dogul", trainerFlag: "trainer_dogul", x: 5804, y: 238, lines: ["무덤의 문을 여는 금강이다.", "스물두 급. 암자를 밟으면 도굴꾼의 눈이 열린다."] },
  { id: "trainer_gichang", name: "염화 창교", role: "trainer", job: "gibyeong", advanceJob: "gichang", trainerFlag: "trainer_gichang", x: 4404, y: -56, lines: ["산 수련장의 창끝이 불꽃을 머금는다.", "스물두 급이면 기창의 길을 허락한다."] },
  { id: "trainer_magung", name: "염화 마궁", role: "trainer", job: "gibyeong", advanceJob: "magung", trainerFlag: "trainer_magung", x: 4436, y: -56, lines: ["달리는 말 위에서 달을 쏜다.", "같은 수련장이다. 스물두 급이면 마궁이다."] },
  { id: "trainer_yaksa", name: "늪 약사", role: "trainer", job: "uiwon", advanceJob: "dokgong", trainerFlag: "trainer_dokgong", x: 3520, y: 234, lines: ["약초원의 독이 약이 된다.", "이 밭을 밟으면 독객의 표식을 받는다."] },

  { id: "camp_outpost", name: "초소 병사", role: "flavor", x: 1750, y: 28, lines: ["산적두목을 베고 왔는가. 한성은 동녘 불빛이다.", "초소에서 숨을 고를 수 있다."] },
  { id: "camp_ferry", name: "뱃사공", role: "flavor", x: 2680, y: -700, lines: ["강을 따라 병기창이 있다. 신기전의 연기가 난다.", "나루에서 쉬어 가게."] },
  { id: "camp_hermit", name: "암자 노승", role: "flavor", x: 5838, y: 238, lines: ["폐사 너머 원혼대승이 앉았다. 균열은 더 동녘이다.", "암자 마루에서 한기를 떨구거라."] },
];

export const TRAINERS = NPCS.filter((n) => n.role === "trainer");

export type SpawnFamily = "pest" | "bandit" | "bamboo" | "river" | "swamp" | "mountain" | "snow" | "wraith";

export interface PoiDef {
  x: number;
  y: number;
  name: string;
  boss?: string;
  flag?: string;
}

export const POI: Record<string, PoiDef> = {
  village: { x: 0, y: 0, name: "무명촌" },
  rice: { x: 520, y: 40, name: "근교 벼밭" },
  pass: { x: 980, y: -60, name: "돌담 고갯길" },
  banditCamp: { x: 1380, y: -80, name: "산적 야영" },
  banditBoss: { x: 1480, y: -100, name: "산적두목", boss: "boss_bandit" },
  outpost: { x: 1750, y: 20, name: "초소" },
  hansung: { x: 2200, y: 0, name: "한성 외곽" },
  mugwan: { x: 2110, y: -40, name: "무관청", flag: "trainer_geomgaek" },
  eastcamp: { x: 2470, y: 8, name: "동문 군영", flag: "trainer_changbyeong" },
  gwansang: { x: 2300, y: -150, name: "관상감", flag: "trainer_sulsa" },
  hyemin: { x: 2400, y: -70, name: "혜민서", flag: "trainer_myeongui" },
  alley: { x: 2160, y: 130, name: "밤골목", flag: "trainer_jagaek" },
  pharmacy: { x: 2260, y: 176, name: "약방 지하", flag: "trainer_dokgong" },
  bamboo: { x: 2800, y: 720, name: "대숲", boss: "boss_gumiho" },
  bambooHut: { x: 2760, y: 680, name: "대숲 오두막", flag: "trainer_singung" },
  river: { x: 2780, y: -780, name: "강변" },
  arsenal: { x: 2820, y: -740, name: "병기창", flag: "trainer_hwasal" },
  ferryman: { x: 2680, y: -700, name: "뱃사공 나루" },
  swamp: { x: 3600, y: 180, name: "역병 늪", boss: "boss_imugi" },
  garden: { x: 3520, y: 200, name: "약초원", flag: "trainer_dokgong" },
  mountain: { x: 4400, y: -120, name: "산악" },
  dojo: { x: 4420, y: -90, name: "산 수련장", flag: "trainer_gichang" },
  tigerRidge: { x: 4480, y: -420, name: "적월 능선", boss: "boss_tiger" },
  snow: { x: 5200, y: -640, name: "설산", boss: "boss_snow" },
  haunted: { x: 6000, y: 80, name: "폐사", boss: "boss_abbot" },
  temple: { x: 5920, y: 40, name: "폐사 사찰", flag: "trainer_bujeoksa" },
  hermitage: { x: 5820, y: 220, name: "암자", flag: "trainer_dogul" },
  wraithAbbot: { x: 6180, y: 40, name: "원혼대승", boss: "boss_wraith" },
  rift: { x: 6600, y: 0, name: "엔드 균열" },
};

export interface HubDef {
  id: string;
  x: number;
  y: number;
  r: number;
  name: string;
  rest: boolean;
  layout: "village" | "hansung" | "camp" | "shrine";
}

export const HUBS: HubDef[] = [
  { id: "village", x: 0, y: 0, r: 250, name: "무명촌", rest: true, layout: "village" },
  { id: "outpost", x: 1750, y: 20, r: 88, name: "초소", rest: true, layout: "camp" },
  { id: "hansung", x: 2200, y: 0, r: 320, name: "한성 외곽", rest: true, layout: "hansung" },
  { id: "ferryman", x: 2680, y: -700, r: 80, name: "뱃사공 나루", rest: true, layout: "camp" },
  { id: "hermitage", x: 5820, y: 220, r: 84, name: "암자", rest: true, layout: "shrine" },
];

export interface ZoneDef {
  id: string;
  poi: string;
  r: number;
  biome: BiomeId;
  lvMin: number;
  lvMax: number;
  tight: boolean;
  families: SpawnFamily[];
  eliteBias: number;
  hazard?: "poison" | "chill";
}

export const ZONES: ZoneDef[] = [
  { id: "rice", poi: "rice", r: 360, biome: "hanyang", lvMin: 1, lvMax: 5, tight: false, families: ["pest", "bandit"], eliteBias: 0.05 },
  { id: "pass", poi: "pass", r: 200, biome: "road", lvMin: 4, lvMax: 7, tight: true, families: ["bandit"], eliteBias: 0.1 },
  { id: "banditCamp", poi: "banditCamp", r: 240, biome: "hanyang", lvMin: 6, lvMax: 8, tight: false, families: ["bandit"], eliteBias: 0.16 },
  { id: "bamboo", poi: "bamboo", r: 420, biome: "bamboo", lvMin: 9, lvMax: 14, tight: true, families: ["bamboo"], eliteBias: 0.12 },
  { id: "river", poi: "river", r: 400, biome: "riverside", lvMin: 12, lvMax: 17, tight: false, families: ["river"], eliteBias: 0.1 },
  { id: "swamp", poi: "swamp", r: 480, biome: "swamp", lvMin: 16, lvMax: 22, tight: false, families: ["swamp"], eliteBias: 0.18, hazard: "poison" },
  { id: "mountain", poi: "mountain", r: 460, biome: "mountain", lvMin: 20, lvMax: 26, tight: false, families: ["mountain"], eliteBias: 0.2 },
  { id: "snow", poi: "snow", r: 500, biome: "snow", lvMin: 26, lvMax: 32, tight: false, families: ["snow"], eliteBias: 0.22, hazard: "chill" },
  { id: "haunted", poi: "haunted", r: 420, biome: "haunted", lvMin: 30, lvMax: 36, tight: true, families: ["wraith"], eliteBias: 0.38 },
  { id: "wraith", poi: "wraithAbbot", r: 260, biome: "haunted", lvMin: 32, lvMax: 36, tight: true, families: ["wraith"], eliteBias: 0.5 },
];

export const ROAD_EDGES: [string, string][] = [
  ["village", "rice"],
  ["rice", "pass"],
  ["pass", "banditCamp"],
  ["banditCamp", "banditBoss"],
  ["banditBoss", "outpost"],
  ["outpost", "hansung"],
  ["hansung", "bamboo"],
  ["hansung", "river"],
  ["hansung", "swamp"],
  ["river", "ferryman"],
  ["swamp", "mountain"],
  ["mountain", "dojo"],
  ["mountain", "tigerRidge"],
  ["mountain", "snow"],
  ["snow", "haunted"],
  ["haunted", "temple"],
  ["haunted", "hermitage"],
  ["haunted", "wraithAbbot"],
  ["wraithAbbot", "rift"],
];

export const SPAWN_FAMILY_TO_ENEMY: Record<SpawnFamily, string[]> = {
  pest: ["pest"],
  bandit: ["bandit"],
  bamboo: ["spirit", "dokkaebi", "wildlife", "beast"],
  river: ["wildlife", "spirit", "bandit", "swamp"],
  swamp: ["swamp", "pest"],
  mountain: ["beast", "wildlife", "dokkaebi", "bandit", "shrine"],
  snow: ["beast", "wildlife", "spirit", "military"],
  wraith: ["undead", "spirit", "shrine"],
};

export function nearestHub(x: number, y: number): HubDef {
  let best = HUBS[0]!;
  let bd = Infinity;
  for (const h of HUBS) {
    const d = Math.hypot(x - h.x, y - h.y);
    if (d < bd) {
      bd = d;
      best = h;
    }
  }
  return best;
}

export function hubAt(x: number, y: number): HubDef | undefined {
  let best: HubDef | undefined;
  let bestR = Infinity;
  for (const h of HUBS) {
    const d = Math.hypot(x - h.x, y - h.y);
    if (d < h.r && d / h.r < bestR) {
      bestR = d / h.r;
      best = h;
    }
  }
  return best;
}

export function zoneAt(x: number, y: number): ZoneDef | undefined {
  let best: ZoneDef | undefined;
  let bestK = Infinity;
  for (const z of ZONES) {
    const p = POI[z.poi];
    if (!p) continue;
    const d = Math.hypot(x - p.x, y - p.y);
    if (d < z.r && d / z.r < bestK) {
      bestK = d / z.r;
      best = z;
    }
  }
  return best;
}

export function restHubs(): HubDef[] {
  return HUBS.filter((h) => h.rest);
}

