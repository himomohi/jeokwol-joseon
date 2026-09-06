import type { BiomeId } from "../core/types";
import type { PropDefinition } from "../core/types";

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
    name: "한양 근교",
    grass: "#3a5a3a",
    grass2: "#2f4a30",
    dirt: "#5a4a32",
    deco: "#2a6a32",
    ambient: "#c9b48a",
    fog: "rgba(40,30,20,0.08)",
    spawnDensity: 0.55,
    families: ["bandit", "wildlife", "military"],
  },
  mountain: {
    id: "mountain",
    name: "산악",
    grass: "#3a4a32",
    grass2: "#4a4a38",
    dirt: "#5a5040",
    deco: "#2a3a28",
    ambient: "#a8b0a0",
    fog: "rgba(20,24,20,0.12)",
    spawnDensity: 0.8,
    families: ["beast", "bandit", "wildlife", "dokkaebi"],
  },
  bamboo: {
    id: "bamboo",
    name: "대나무숲",
    grass: "#2a5a34",
    grass2: "#24502e",
    dirt: "#3a4a28",
    deco: "#1e6a38",
    ambient: "#8bbb90",
    fog: "rgba(20,40,24,0.16)",
    spawnDensity: 0.75,
    families: ["spirit", "dokkaebi", "wildlife", "beast"],
  },
  riverside: {
    id: "riverside",
    name: "강변",
    grass: "#3a6a48",
    grass2: "#3a5a40",
    dirt: "#6a6048",
    deco: "#2a7a50",
    ambient: "#9ab8c0",
    fog: "rgba(20,30,40,0.1)",
    water: "#2a5a6a",
    spawnDensity: 0.6,
    families: ["wildlife", "spirit", "bandit", "swamp"],
  },
  swamp: {
    id: "swamp",
    name: "늪/습지",
    grass: "#2a4a32",
    grass2: "#2a3a28",
    dirt: "#3a3a24",
    deco: "#3a5a28",
    ambient: "#6a7a58",
    fog: "rgba(20,32,18,0.22)",
    water: "#1a3a32",
    spawnDensity: 0.85,
    families: ["swamp", "undead", "wildlife"],
  },
  snow: {
    id: "snow",
    name: "설산",
    grass: "#d8e4ee",
    grass2: "#c4d4e0",
    dirt: "#8a9aaa",
    deco: "#8ab0c0",
    ambient: "#c8d8e8",
    fog: "rgba(220,230,240,0.18)",
    spawnDensity: 0.5,
    families: ["beast", "wildlife", "spirit"],
  },
  haunted: {
    id: "haunted",
    name: "폐사/원혼",
    grass: "#2a3228",
    grass2: "#242820",
    dirt: "#3a3428",
    deco: "#3a2830",
    ambient: "#6a4a68",
    fog: "rgba(40,10,30,0.28)",
    spawnDensity: 0.9,
    families: ["undead", "spirit", "dokkaebi", "shrine"],
  },
  road: {
    id: "road",
    name: "길",
    grass: "#6a5040",
    grass2: "#5a4434",
    dirt: "#7a5a40",
    deco: "#4a3a28",
    ambient: "#c0a878",
    fog: "rgba(40,30,16,0.06)",
    spawnDensity: 0.4,
    families: ["bandit", "military"],
  },
  village: {
    id: "village",
    name: "마을",
    grass: "#3a6a3a",
    grass2: "#4a5a32",
    dirt: "#6a5a40",
    deco: "#2a5a30",
    ambient: "#d0c090",
    fog: "rgba(40,30,16,0.04)",
    spawnDensity: 0.12,
    families: ["military"],
  },
};

export const PROPS: Record<string, PropDefinition> = {
  pine: { id: "pine", name: "소나무", biomes: ["hanyang", "mountain", "snow"], w: 28, h: 48, radius: 10, solid: true, roof: false, layer: "prop", art: "pine" },
  bamboo: { id: "bamboo", name: "대나무", biomes: ["bamboo", "riverside"], w: 14, h: 56, radius: 6, solid: true, roof: false, layer: "prop", art: "bamboo" },
  deadtree: { id: "deadtree", name: "고목", biomes: ["haunted", "swamp"], w: 26, h: 44, radius: 10, solid: true, roof: false, layer: "prop", art: "deadtree" },
  rock: { id: "rock", name: "바위", biomes: ["mountain", "snow", "riverside"], w: 22, h: 18, radius: 12, solid: true, roof: false, layer: "prop", art: "rock" },
  reed: { id: "reed", name: "갈대", biomes: ["riverside", "swamp"], w: 16, h: 28, radius: 4, solid: false, roof: false, layer: "prop", art: "reed" },
  bush: { id: "bush", name: "덤불", biomes: ["hanyang", "bamboo", "mountain"], w: 20, h: 16, radius: 8, solid: false, roof: false, layer: "prop", art: "bush" },
  lantern: { id: "lantern", name: "석등", biomes: ["village", "haunted"], w: 14, h: 26, radius: 6, solid: true, roof: false, layer: "prop", art: "lantern" },
  campfire: { id: "campfire", name: "모닥불", biomes: ["mountain", "road"], w: 18, h: 16, radius: 8, solid: false, roof: false, layer: "prop", art: "campfire" },
  grave: { id: "grave", name: "무덤", biomes: ["haunted"], w: 16, h: 22, radius: 8, solid: true, roof: false, layer: "prop", art: "grave" },
  house: { id: "house", name: "초가", biomes: ["village"], w: 86, h: 70, radius: 40, solid: true, roof: true, layer: "prop", art: "house" },
  shop: { id: "shop", name: "전방", biomes: ["village"], w: 90, h: 74, radius: 42, solid: true, roof: true, layer: "prop", art: "shop" },
  shrine: { id: "shrine", name: "사당", biomes: ["village", "haunted"], w: 70, h: 64, radius: 32, solid: true, roof: true, layer: "prop", art: "shrine" },
  gate: { id: "gate", name: "문루", biomes: ["village"], w: 100, h: 40, radius: 20, solid: true, roof: true, layer: "prop", art: "gate" },
  tent: { id: "tent", name: "군막", biomes: ["road", "hanyang"], w: 48, h: 36, radius: 20, solid: true, roof: false, layer: "prop", art: "tent" },
};

export const LOOT_TABLES: Record<string, { w: number; itemId: string; qty: number }[]> = {
  loot_bandit: [
    { w: 40, itemId: "gold", qty: 6 },
    { w: 18, itemId: "hp_small", qty: 1 },
    { w: 8, itemId: "sword_rusty", qty: 1 },
    { w: 6, itemId: "helm_gat", qty: 1 },
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
};

export interface NpcDef {
  id: string;
  name: string;
  role: "trainer" | "shop" | "inn" | "flavor";
  job?: string;
  lines: string[];
}

export const NPCS: NpcDef[] = [
  { id: "trainer_musa", name: "검교 박 첨지", role: "trainer", job: "musa", lines: ["칼끝은 마음을 따른다.", "8급이 되면 검객이나 창병으로 전직할 수 있다."] },
  { id: "trainer_gungsoo", name: "각궁 최 사수", role: "trainer", job: "gungsoo", lines: ["숨과 현을 맞춰라.", "산적왕을 처단하면 화살사수의 길이 열린다."] },
  { id: "trainer_dosa", name: "현무관 도사", role: "trainer", job: "dosa", lines: ["적월이 뜨면 원혼이 걷는다.", "폐사를 정화하면 부적사의 인을 받을 수 있다."] },
  { id: "trainer_uiwon", name: "혜민서 의원", role: "trainer", job: "uiwon", lines: ["산 자와 죽은 자를 가리지 마라.", "늪의 이무기를 잠재우면 독공의 맥이 열린다."] },
  { id: "trainer_dojeok", name: "그림자의 노파", role: "trainer", job: "dojeok", lines: ["발소리는 거짓말이다.", "폐사 염주를 가져오면 도굴꾼의 눈을 열어 주마."] },
  { id: "trainer_gibyeong", name: "마구간의 교련관", role: "trainer", job: "gibyeong", lines: ["말과 한 몸이 되어라.", "적월호랑이를 쓰러뜨리면 마궁의 길을 허락한다."] },
  { id: "shop_weapon", name: "무기전 김 서방", role: "shop", lines: ["좋은 철을 들여왔다. 골라 보게."] },
  { id: "shop_herb", name: "약재상 한 씨", role: "shop", lines: ["환약과 영단이 있다. 적월 아래선 독을 조심하게."] },
  { id: "innkeep", name: "주막 주인", role: "inn", lines: ["쉬어 가게. 저장은 주막에서 하는 것이 안전하다."] },
  { id: "villager_a", name: "아낙", role: "flavor", lines: ["달이 붉어지고부터 산적이 늘었어.", "북쪽에 폐사가 있지. 가까이 가지 마."] },
  { id: "villager_b", name: "나무꾼", role: "flavor", lines: ["대나무숲에서 여우 울음이 들린다.", "길은 한양을 중심으로 사방으로 나 있다."] },
];

export const POI = {
  village: { x: 0, y: 0, name: "한양 근교 마을" },
  banditCamp: { x: 980, y: -420, name: "산적 캠프" },
  tigerRidge: { x: -1100, y: -900, name: "적월 능선" },
  bamboo: { x: 1400, y: 700, name: "대나무 골" },
  swamp: { x: -900, y: 1200, name: "역병 늪" },
  haunted: { x: 400, y: -1500, name: "폐사" },
  snow: { x: -1600, y: -1600, name: "설산" },
  river: { x: 600, y: 1100, name: "한강 기슭" },
};
