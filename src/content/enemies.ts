import type { AiRole, BiomeId, Grade } from "../core/types";

export type Family =
  | "pest"
  | "bandit"
  | "beast"
  | "dokkaebi"
  | "spirit"
  | "undead"
  | "military"
  | "wildlife"
  | "swamp"
  | "shrine"
  | "boss";

export interface EnemyDef {
  id: string;
  name: string;
  family: Family;
  biomes: BiomeId[];
  ai: AiRole;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  radius: number;
  xp: number;
  gold: number;
  loot: string;
  art: string;
  aggro: number;
  attackRange: number;
  attackCd: number;
  boss?: boolean;
  grades: Grade[];
}

const B = (
  id: string,
  name: string,
  family: Family,
  biomes: BiomeId[],
  ai: AiRole,
  hp: number,
  atk: number,
  def: number,
  spd: number,
  xp: number,
  loot: string,
  art: string,
  extra: Partial<EnemyDef> = {},
): EnemyDef => ({
  id,
  name,
  family,
  biomes,
  ai,
  hp,
  atk,
  def,
  spd,
  radius: extra.radius ?? 14,
  xp,
  gold: extra.gold ?? Math.round(xp * 0.35),
  loot,
  art,
  aggro: extra.aggro ?? 220,
  attackRange: extra.attackRange ?? 28,
  attackCd: extra.attackCd ?? 1.1,
  boss: extra.boss,
  grades: extra.grades ?? (extra.boss ? ["sang"] : ["ha", "jung", "sang"]),
  ...extra,
});

export const ENEMIES: EnemyDef[] = [
  B("bandit_foot", "산적졸개", "bandit", ["hanyang", "mountain", "road"], "meleeChase", 42, 8, 3, 90, 14, "loot_bandit", "bandit"),
  B("bandit_bow", "산적궁수", "bandit", ["hanyang", "mountain", "bamboo"], "rangedKite", 34, 9, 2, 88, 16, "loot_bandit", "bandit_bow", { attackRange: 180, attackCd: 1.4 }),
  B("bandit_blade", "칼잡이", "bandit", ["hanyang", "road", "village"], "flank", 48, 11, 4, 108, 18, "loot_bandit", "bandit"),
  B("bandit_road", "노상강도", "bandit", ["road", "hanyang"], "charge", 55, 12, 5, 120, 20, "loot_bandit", "bandit"),
  B("bandit_deserter", "탈영병", "bandit", ["hanyang", "riverside"], "meleeChase", 60, 13, 6, 100, 22, "loot_military", "soldier"),
  B("bandit_smuggler", "밀수꾼", "bandit", ["riverside", "swamp"], "flank", 40, 9, 3, 112, 15, "loot_bandit", "bandit"),
  B("bandit_cross", "쇠뇌수", "bandit", ["mountain", "bamboo"], "rangedKite", 36, 12, 3, 84, 19, "loot_bandit", "bandit_bow", { attackRange: 210 }),
  B("bandit_chief", "산적두령", "bandit", ["mountain"], "charge", 90, 16, 8, 96, 36, "loot_bandit_rare", "bandit_chief", { grades: ["jung", "sang"], radius: 16 }),
  B("stray_dog", "떠돌이개", "wildlife", ["hanyang", "village", "road"], "flank", 28, 8, 2, 145, 10, "loot_wild", "wolf", { radius: 10 }),
  B("forest_spider", "숲거미", "wildlife", ["bamboo", "mountain"], "flank", 26, 11, 1, 120, 12, "loot_wild", "bug", { radius: 9 }),
  B("frost_wolf", "서리늑대", "beast", ["snow"], "flank", 58, 14, 5, 148, 24, "loot_beast", "wolf"),
  B("marsh_leech", "늪거머리", "swamp", ["swamp"], "meleeChase", 22, 10, 0, 70, 10, "loot_swamp", "bug", { radius: 8 }),
  B("mirror_shade", "거울그림자", "undead", ["haunted"], "flank", 64, 16, 4, 118, 30, "loot_undead_rare", "ghost"),

  B("tiger", "산호랑이", "beast", ["mountain", "bamboo", "snow"], "charge", 80, 16, 6, 130, 32, "loot_beast", "tiger", { radius: 18, attackRange: 32 }),
  B("white_tiger", "흰호랑이", "beast", ["snow", "mountain"], "charge", 110, 18, 8, 134, 44, "loot_beast_rare", "tiger_white", { radius: 18 }),
  B("wolf", "늑대", "beast", ["mountain", "hanyang", "snow"], "flank", 38, 10, 3, 140, 14, "loot_beast", "wolf"),
  B("black_wolf", "흑늑대", "beast", ["mountain", "haunted"], "flank", 52, 13, 4, 146, 20, "loot_beast", "wolf"),
  B("boar", "멧돼지", "beast", ["mountain", "bamboo"], "charge", 70, 14, 7, 118, 22, "loot_beast", "boar", { radius: 16 }),
  B("bear", "반달가슴곰", "beast", ["mountain", "snow"], "groundSlam", 120, 17, 10, 90, 40, "loot_beast_rare", "bear", { radius: 20, attackRange: 40 }),

  B("dok_fire", "불도깨비", "dokkaebi", ["mountain", "haunted", "bamboo"], "rangedKite", 48, 12, 4, 100, 24, "loot_dok", "dokkaebi", { attackRange: 160 }),
  B("dok_iron", "쇠도깨비", "dokkaebi", ["mountain", "haunted"], "meleeChase", 85, 15, 10, 80, 30, "loot_dok", "dokkaebi_iron"),
  B("dok_club", "방망이도깨비", "dokkaebi", ["bamboo", "mountain"], "groundSlam", 72, 16, 6, 92, 28, "loot_dok", "dokkaebi", { attackRange: 36 }),
  B("dok_trick", "장난도깨비", "dokkaebi", ["hanyang", "village", "bamboo"], "flank", 32, 8, 2, 150, 16, "loot_dok", "dokkaebi_small", { radius: 11 }),
  B("dok_shadow", "그림자도깨비", "dokkaebi", ["haunted", "bamboo"], "flank", 44, 13, 3, 128, 26, "loot_dok", "dokkaebi"),
  B("dok_fireball", "도깨비불", "dokkaebi", ["haunted", "swamp"], "rangedKite", 28, 11, 1, 160, 18, "loot_dok", "will_o", { radius: 10, attackRange: 150 }),

  B("gumiho", "구미호", "spirit", ["bamboo", "haunted", "mountain"], "rangedKite", 95, 17, 6, 120, 48, "loot_spirit_rare", "gumiho", { radius: 16, attackRange: 170, grades: ["jung", "sang"] }),
  B("fox_spirit", "여우령", "spirit", ["bamboo", "hanyang"], "flank", 40, 11, 3, 140, 20, "loot_spirit", "fox"),
  B("sansin", "산신령", "spirit", ["mountain", "snow"], "patrol", 80, 12, 8, 70, 34, "loot_spirit", "spirit", { attackRange: 150 }),
  B("moon_spirit", "달령", "spirit", ["haunted", "snow"], "rangedKite", 52, 14, 4, 110, 28, "loot_spirit", "spirit"),
  B("water_ghost", "물귀신", "spirit", ["riverside", "swamp"], "meleeChase", 46, 13, 3, 100, 22, "loot_spirit", "ghost"),
  B("wind_sprite", "바람요정", "spirit", ["mountain", "riverside"], "rangedKite", 30, 10, 2, 155, 16, "loot_spirit", "spirit", { radius: 10 }),

  B("wonhon", "원혼", "undead", ["haunted", "swamp"], "meleeChase", 36, 10, 2, 80, 15, "loot_undead", "ghost"),
  B("virgin_ghost", "처녀귀신", "undead", ["haunted"], "flank", 50, 14, 3, 110, 26, "loot_undead", "ghost_long"),
  B("gangsi", "강시", "undead", ["haunted", "village"], "charge", 88, 16, 9, 70, 34, "loot_undead", "gangsi", { radius: 16 }),
  B("skel_soldier", "해골병사", "undead", ["haunted", "mountain"], "patrol", 54, 12, 7, 85, 20, "loot_undead", "skel"),
  B("jeoseung", "저승사자", "undead", ["haunted"], "patrol", 100, 18, 8, 95, 50, "loot_undead_rare", "reaper", { grades: ["jung", "sang"] }),
  B("gravekeep", "무덤지기", "undead", ["haunted"], "groundSlam", 70, 13, 8, 78, 28, "loot_undead", "skel"),

  B("geumwi", "금위군", "military", ["hanyang", "village", "road"], "meleeChase", 70, 14, 10, 100, 26, "loot_military", "soldier"),
  B("pojol", "포졸", "military", ["hanyang", "village"], "patrol", 50, 10, 6, 92, 16, "loot_military", "soldier"),
  B("cavalry_patrol", "기병순라", "military", ["hanyang", "road"], "charge", 78, 15, 8, 150, 30, "loot_military", "cavalry", { radius: 16 }),
  B("gung_dae", "궁수대", "military", ["hanyang", "road"], "rangedKite", 40, 13, 4, 96, 22, "loot_military", "soldier_bow", { attackRange: 200 }),
  B("byeolgam", "별감", "military", ["village", "hanyang"], "flank", 64, 15, 7, 110, 28, "loot_military_rare", "officer"),
  B("uigeumbu", "의금부나장", "military", ["hanyang"], "meleeChase", 90, 17, 11, 104, 36, "loot_military_rare", "officer"),

  B("eagle", "독수리", "wildlife", ["mountain", "snow"], "rangedKite", 34, 11, 2, 150, 14, "loot_wild", "bird", { radius: 12, attackRange: 130 }),
  B("beastling", "산짐승", "pest", ["mountain", "bamboo", "hanyang"], "meleeChase", 32, 8, 3, 120, 10, "loot_wild", "beast"),
  B("viper", "독사", "wildlife", ["swamp", "bamboo", "riverside"], "flank", 24, 12, 1, 100, 12, "loot_wild", "snake", { radius: 9 }),
  B("goat", "산양", "wildlife", ["mountain", "snow"], "charge", 48, 10, 5, 125, 14, "loot_wild", "goat"),
  B("crows", "까마귀떼", "wildlife", ["haunted", "hanyang"], "flank", 22, 8, 1, 160, 10, "loot_wild", "bird", { radius: 11 }),

  B("croc", "늪악어", "swamp", ["swamp", "riverside"], "charge", 95, 16, 9, 80, 32, "loot_swamp", "croc", { radius: 18 }),
  B("plague_rat", "역병쥐", "pest", ["swamp", "village", "hanyang"], "flank", 20, 8, 1, 140, 8, "loot_swamp", "rat", { radius: 8 }),
  B("bug", "독충", "pest", ["swamp", "bamboo", "hanyang"], "meleeChase", 18, 9, 0, 130, 8, "loot_swamp", "bug", { radius: 8 }),
  B("imugi", "이무기", "swamp", ["swamp", "riverside"], "groundSlam", 130, 18, 10, 88, 52, "loot_swamp_rare", "imugi", { radius: 22, grades: ["jung", "sang"] }),
  B("plague_witch", "역병무당", "swamp", ["swamp", "haunted"], "rangedKite", 60, 15, 5, 90, 34, "loot_swamp_rare", "witch", { attackRange: 180 }),

  B("stone_guard", "석수호위", "shrine", ["haunted", "mountain"], "patrol", 100, 14, 14, 60, 36, "loot_shrine", "statue", { radius: 18 }),
  B("mask_guard", "가면신장", "shrine", ["haunted", "village"], "meleeChase", 75, 15, 10, 85, 32, "loot_shrine", "mask"),
  B("lantern", "등롱령", "shrine", ["haunted", "village"], "rangedKite", 36, 12, 4, 100, 20, "loot_shrine", "lantern", { attackRange: 160 }),
  B("bell_spirit", "범종령", "shrine", ["haunted"], "groundSlam", 88, 16, 8, 70, 38, "loot_shrine", "bell"),

  B("boss_tiger", "적월호랑이", "boss", ["mountain"], "charge", 520, 24, 12, 140, 220, "loot_boss_tiger", "tiger_blood", { boss: true, radius: 26, attackRange: 40, aggro: 360 }),
  B("boss_bandit", "산적두목", "boss", ["hanyang", "road"], "meleeChase", 320, 18, 12, 108, 160, "loot_boss_bandit", "bandit_king", { boss: true, radius: 20 }),
  B("boss_gumiho", "구미호 아씨", "spirit", ["bamboo"], "rangedKite", 500, 23, 10, 125, 240, "loot_boss_gumiho", "gumiho_lady", { boss: true, radius: 18, attackRange: 200 }),
  B("boss_abbot", "폐사 주지", "boss", ["haunted"], "groundSlam", 560, 21, 16, 80, 230, "loot_boss_abbot", "abbot", { boss: true, radius: 20 }),
  B("boss_snow", "설산 백호", "boss", ["snow"], "charge", 600, 26, 14, 145, 250, "loot_boss_snow", "tiger_white", { boss: true, radius: 24 }),
  B("boss_imugi", "늪의 이무기왕", "boss", ["swamp"], "groundSlam", 640, 25, 15, 90, 260, "loot_boss_imugi", "imugi_king", { boss: true, radius: 28, attackRange: 50 }),
  B("boss_wraith", "원혼대승", "boss", ["haunted"], "groundSlam", 720, 28, 16, 88, 280, "loot_boss_wraith", "reaper", { boss: true, radius: 22, attackRange: 46, aggro: 380 }),
];

const ENEMY_ALIASES: Record<string, string> = {
  bandit_thug: "bandit_foot",
  bandit_slinger: "bandit_bow",
  elite_bandit_chief: "boss_bandit",
  wild_boar: "boar",
  mountain_wolf: "wolf",
  elite_white_tiger: "white_tiger",
  deserter_spearman: "bandit_deserter",
  black_bear: "bear",
  will_o_wisp_ko: "dok_fireball",
  elite_mud_shaman: "plague_witch",
  rice_thief_rat: "plague_rat",
  gumiho_cub: "fox_spirit",
  tomb_bone_soldier: "skel_soldier",
  boss_sangu_baekho: "boss_tiger",
  boss_gumiho_seolhwa: "boss_gumiho",
  boss_mangjang_mukcheol: "boss_abbot",
  boss_imugi_cheoryong: "boss_imugi",
  boss_heukmudang_dari: "boss_wraith",
};

const CATALOG_UNIQUE: { id: string; from: string; name: string; loot?: string; art?: string; biomes?: BiomeId[] }[] = [
  { id: "alley_ghost", from: "wonhon", name: "골목원혼", loot: "loot_hanseong_alley", biomes: ["hanyang", "village", "hanseong_alley"] },
  { id: "pickpocket_spirit", from: "fox_spirit", name: "소매치기령", loot: "loot_spirit", biomes: ["hanyang", "hanseong_alley"] },
  { id: "tree_sprit", from: "sansin", name: "나무정령", loot: "loot_jirisan", biomes: ["bamboo", "jirisan_forest"] },
  { id: "herb_golem", from: "stone_guard", name: "약초골렘", loot: "loot_shrine", art: "statue", biomes: ["bamboo", "jirisan_forest"] },
  { id: "palace_maid_ghost", from: "virgin_ghost", name: "궁녀원혼", loot: "loot_ghost_palace", biomes: ["haunted", "ghost_palace"] },
  { id: "eunuch_wraith", from: "jeoseung", name: "내시원혼", loot: "loot_ghost_palace", biomes: ["haunted", "ghost_palace"] },
  { id: "armor_specter", from: "mask_guard", name: "갑주유령", loot: "loot_palace", biomes: ["haunted", "ghost_palace"] },
  { id: "lament_flute_spirit", from: "moon_spirit", name: "곡적령", loot: "loot_spirit_rare", biomes: ["haunted", "ghost_palace"] },
  { id: "elite_court_assassin", from: "byeolgam", name: "궁중자객", loot: "loot_elite", biomes: ["hanyang", "hanseong_alley"] },
  { id: "mud_crab", from: "bug", name: "갯벌게", loot: "loot_mudflat", art: "croc", biomes: ["riverside", "west_coast_mudflat"] },
  { id: "salt_elemental", from: "wind_sprite", name: "소금정령", loot: "loot_mudflat", biomes: ["riverside", "west_coast_mudflat"] },
  { id: "drowned_soldier", from: "skel_soldier", name: "익사병사", loot: "loot_undead", biomes: ["riverside", "west_coast_mudflat"] },
  { id: "elite_tide_priest", from: "plague_witch", name: "조수신관", loot: "loot_spirit_rare", biomes: ["riverside", "west_coast_mudflat"] },
  { id: "deserter_archer", from: "bandit_bow", name: "탈영궁수", loot: "loot_military", biomes: ["hanyang", "road"] },
  { id: "elite_border_captain", from: "uigeumbu", name: "변장수", loot: "loot_frontier", biomes: ["snow", "northern_frontier"] },
  { id: "siege_mokwoo", from: "stone_guard", name: "공성목우", loot: "loot_military_rare", biomes: ["mountain", "jeju_lava_field"] },
  { id: "lava_scarab", from: "bug", name: "용암풍뎅이", loot: "loot_jeju", biomes: ["mountain", "jeju_lava_field"] },
  { id: "ember_sprit", from: "dok_fire", name: "불씨정령", loot: "loot_jeju", biomes: ["mountain", "jeju_lava_field"] },
  { id: "basalt_golem", from: "stone_guard", name: "현무암골렘", loot: "loot_shrine", biomes: ["mountain", "jeju_lava_field"] },
  { id: "ash_hound", from: "wolf", name: "재개", loot: "loot_beast", biomes: ["mountain", "jeju_lava_field"] },
  { id: "elite_harubang_warden", from: "mask_guard", name: "돌하르방", loot: "loot_shrine", biomes: ["mountain", "jeju_lava_field"] },
  { id: "curse_doll", from: "dok_trick", name: "저주인형", loot: "loot_marsh", biomes: ["swamp", "shaman_marsh"] },
  { id: "poison_toad", from: "viper", name: "독두꺼비", loot: "loot_swamp", biomes: ["swamp", "shaman_marsh"] },
  { id: "paper_talon_spirit", from: "wind_sprite", name: "지발령", loot: "loot_ridge", biomes: ["mountain", "thunder_ridge"] },
  { id: "storm_hawk", from: "eagle", name: "폭풍수리", loot: "loot_ridge", biomes: ["mountain", "thunder_ridge"] },
  { id: "thunder_sprite", from: "dok_fireball", name: "뇌령", loot: "loot_dok", biomes: ["mountain", "thunder_ridge"] },
  { id: "ridge_bandit_raider", from: "bandit_road", name: "능선산적", loot: "loot_bandit", biomes: ["mountain", "thunder_ridge"] },
  { id: "cloud_serpent_hatchling", from: "imugi", name: "구름뱀새끼", loot: "loot_spirit", biomes: ["mountain", "thunder_ridge"] },
  { id: "elite_storm_monk", from: "dok_iron", name: "뇌승", loot: "loot_dok", biomes: ["mountain", "thunder_ridge"] },
  { id: "singijeon_drone", from: "crows", name: "신기전", loot: "loot_military", art: "bird", biomes: ["hanyang", "riverside"] },
  { id: "night_watch_corrupt", from: "pojol", name: "타락순라", loot: "loot_military", biomes: ["hanyang", "hanseong_alley"] },
  { id: "boss_palace_queen", from: "boss_gumiho", name: "궁중여왕혼", loot: "loot_boss_gumiho", biomes: ["haunted", "ghost_palace"] },
  { id: "boss_harubang_jowang", from: "boss_abbot", name: "돌하르방 조왕", loot: "loot_boss_abbot", biomes: ["mountain", "jeju_lava_field"] },
];

export const CATALOG_MONSTER_IDS = [
  "bandit_thug",
  "bandit_slinger",
  "stray_dog",
  "alley_ghost",
  "pickpocket_spirit",
  "wild_boar",
  "mountain_wolf",
  "tree_sprit",
  "forest_spider",
  "elite_white_tiger",
  "herb_golem",
  "palace_maid_ghost",
  "eunuch_wraith",
  "armor_specter",
  "lament_flute_spirit",
  "elite_court_assassin",
  "mud_crab",
  "water_ghost",
  "salt_elemental",
  "drowned_soldier",
  "elite_tide_priest",
  "deserter_spearman",
  "deserter_archer",
  "black_bear",
  "frost_wolf",
  "elite_border_captain",
  "siege_mokwoo",
  "lava_scarab",
  "ember_sprit",
  "basalt_golem",
  "ash_hound",
  "elite_harubang_warden",
  "marsh_leech",
  "curse_doll",
  "will_o_wisp_ko",
  "poison_toad",
  "elite_mud_shaman",
  "paper_talon_spirit",
  "storm_hawk",
  "thunder_sprite",
  "ridge_bandit_raider",
  "cloud_serpent_hatchling",
  "elite_storm_monk",
  "singijeon_drone",
  "night_watch_corrupt",
  "rice_thief_rat",
  "gumiho_cub",
  "tomb_bone_soldier",
  "elite_bandit_chief",
  "mirror_shade",
  "boss_sangu_baekho",
  "boss_palace_queen",
  "boss_gumiho_seolhwa",
  "boss_mangjang_mukcheol",
  "boss_heukmudang_dari",
  "boss_imugi_cheoryong",
  "boss_harubang_jowang",
] as const;

export const ENEMY_BY_ID: Record<string, EnemyDef> = Object.fromEntries(ENEMIES.map((e) => [e.id, e]));

for (const [alias, id] of Object.entries(ENEMY_ALIASES)) {
  const def = ENEMY_BY_ID[id];
  if (!def) throw new Error(`없는 적 별칭 ${alias}→${id}`);
  ENEMY_BY_ID[alias] = def;
}

for (const row of CATALOG_UNIQUE) {
  const src = ENEMY_BY_ID[row.from];
  if (!src) throw new Error(`없는 원형 ${row.from}`);
  ENEMY_BY_ID[row.id] = {
    ...src,
    id: row.id,
    name: row.name,
    loot: row.loot ?? src.loot,
    art: row.art ?? src.art,
    biomes: row.biomes ?? src.biomes,
  };
}

export const GRADE_MOD: Record<Grade, { hp: number; atk: number; xp: number; name: string }> = {
  ha: { hp: 1, atk: 1, xp: 1, name: "일반" },
  jung: { hp: 1.55, atk: 1.25, xp: 1.6, name: "정예" },
  sang: { hp: 2.4, atk: 1.55, xp: 2.4, name: "우두머리" },
};

export function enemyLabel(def: EnemyDef, g: Grade): string {
  if (def.boss) return def.name;
  if (g === "ha") return def.name;
  return `${GRADE_MOD[g].name} ${def.name}`;
}
