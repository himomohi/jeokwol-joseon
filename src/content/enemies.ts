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
};

export const ENEMY_BY_ID: Record<string, EnemyDef> = {
  ...Object.fromEntries(ENEMIES.map((e) => [e.id, e])),
  ...Object.fromEntries(
    Object.entries(ENEMY_ALIASES).map(([alias, id]) => {
      const def = ENEMIES.find((e) => e.id === id);
      if (!def) throw new Error(`없는 적 별칭 ${alias}→${id}`);
      return [alias, def];
    }),
  ),
};

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
