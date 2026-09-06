import type { BaseJobId, JobId, SkillKind, Stats, WeaponType } from "../core/types";
import { PAL } from "../art/palette";

export const ZERO_STATS: Stats = {
  atk: 0,
  def: 0,
  maxHp: 0,
  maxMp: 0,
  spd: 0,
  crit: 0,
  haste: 0,
  luck: 0,
};

export function addStats(a: Stats, b: Partial<Stats>): Stats {
  return {
    atk: a.atk + (b.atk ?? 0),
    def: a.def + (b.def ?? 0),
    maxHp: a.maxHp + (b.maxHp ?? 0),
    maxMp: a.maxMp + (b.maxMp ?? 0),
    spd: a.spd + (b.spd ?? 0),
    crit: a.crit + (b.crit ?? 0),
    haste: a.haste + (b.haste ?? 0),
    luck: a.luck + (b.luck ?? 0),
  };
}

export function scaleStats(s: Stats, k: number): Stats {
  return {
    atk: s.atk * k,
    def: s.def * k,
    maxHp: s.maxHp * k,
    maxMp: s.maxMp * k,
    spd: s.spd * k,
    crit: s.crit,
    haste: s.haste,
    luck: s.luck,
  };
}

export interface JobDef {
  id: JobId;
  name: string;
  base: BaseJobId;
  tier: 1 | 2;
  weapon: WeaponType;
  hue: string;
  robe: string;
  hat: "gat" | "gatTall" | "songnak" | "manggeon" | "jeonrip" | "none";
  desc: string;
  baseStats: Stats;
  perLevel: Partial<Stats>;
  from?: JobId;
  reqLevel: number;
  reqFlag?: string;
  trainer: string;
  skills: string[];
}

export const JOBS: Record<JobId, JobDef> = {
  musa: {
    id: "musa",
    name: "무사",
    base: "musa",
    tier: 1,
    weapon: "sword",
    hue: PAL.blood_mid,
    robe: PAL.blood_deep,
    hat: "gat",
    desc: "검과 창으로 전장을 여는 조선의 무인.",
    baseStats: { atk: 14, def: 8, maxHp: 140, maxMp: 40, spd: 128, crit: 0.06, haste: 1, luck: 4 },
    perLevel: { atk: 2.1, def: 1.4, maxHp: 16, maxMp: 3 },
    reqLevel: 1,
    trainer: "trainer_musa",
    skills: ["musa_slash", "musa_dash", "musa_guard", "musa_spin"],
  },
  gungsoo: {
    id: "gungsoo",
    name: "궁수",
    base: "gungsoo",
    tier: 1,
    weapon: "bow",
    hue: PAL.moss_cool,
    robe: PAL.env_mid,
    hat: "jeonrip",
    desc: "각궁으로 거리를 지배하는 사수.",
    baseStats: { atk: 13, def: 5, maxHp: 110, maxMp: 50, spd: 136, crit: 0.1, haste: 1, luck: 6 },
    perLevel: { atk: 2.0, def: 0.9, maxHp: 12, maxMp: 4, crit: 0.004 },
    reqLevel: 1,
    trainer: "trainer_gungsoo",
    skills: ["gung_shot", "gung_multi", "gung_step", "gung_mark"],
  },
  dosa: {
    id: "dosa",
    name: "도사",
    base: "dosa",
    tier: 1,
    weapon: "talisman",
    hue: PAL.env_cool,
    robe: PAL.shadow_navy,
    hat: "songnak",
    desc: "부적과 술법으로 원혼을 다스린다.",
    baseStats: { atk: 11, def: 5, maxHp: 100, maxMp: 90, spd: 124, crit: 0.05, haste: 1, luck: 8 },
    perLevel: { atk: 1.6, def: 0.8, maxHp: 10, maxMp: 8 },
    reqLevel: 1,
    trainer: "trainer_dosa",
    skills: ["dosa_tal", "dosa_ward", "dosa_pulse", "dosa_seal"],
  },
  uiwon: {
    id: "uiwon",
    name: "의원",
    base: "uiwon",
    tier: 1,
    weapon: "staff",
    hue: PAL.earth_mid,
    robe: PAL.earth_dark,
    hat: "manggeon",
    desc: "약과 침으로 살리고, 독으로 잠재운다.",
    baseStats: { atk: 9, def: 6, maxHp: 120, maxMp: 80, spd: 126, crit: 0.04, haste: 1, luck: 7 },
    perLevel: { atk: 1.3, def: 1.0, maxHp: 13, maxMp: 7 },
    reqLevel: 1,
    trainer: "trainer_uiwon",
    skills: ["ui_needle", "ui_salve", "ui_smoke", "ui_purge"],
  },
  dojeok: {
    id: "dojeok",
    name: "도적",
    base: "dojeok",
    tier: 1,
    weapon: "dagger",
    hue: PAL.shadow_navy,
    robe: PAL.bg_void,
    hat: "none",
    desc: "그림자에서 숨고, 틈에서 벤다.",
    baseStats: { atk: 12, def: 5, maxHp: 105, maxMp: 55, spd: 148, crit: 0.14, haste: 1.05, luck: 10 },
    perLevel: { atk: 1.8, def: 0.8, maxHp: 11, maxMp: 4, crit: 0.005 },
    reqLevel: 1,
    trainer: "trainer_dojeok",
    skills: ["doj_stab", "doj_dash", "doj_smoke", "doj_steal"],
  },
  gibyeong: {
    id: "gibyeong",
    name: "기병",
    base: "gibyeong",
    tier: 1,
    weapon: "spear",
    hue: PAL.earth_dark,
    robe: PAL.shadow_navy,
    hat: "jeonrip",
    desc: "말 위에서 창과 활을 다루는 기마무사.",
    baseStats: { atk: 13, def: 7, maxHp: 130, maxMp: 45, spd: 156, crit: 0.07, haste: 1, luck: 5 },
    perLevel: { atk: 2.0, def: 1.2, maxHp: 14, maxMp: 3, spd: 0.6 },
    reqLevel: 1,
    trainer: "trainer_gibyeong",
    skills: ["gi_charge", "gi_thrust", "gi_circle", "gi_banner"],
  },
  geomgaek: {
    id: "geomgaek",
    name: "검객",
    base: "musa",
    tier: 2,
    weapon: "sword",
    hue: PAL.blood_main,
    robe: PAL.blood_deep,
    hat: "gatTall",
    desc: "한 자루 검으로 달을 가른다.",
    baseStats: { atk: 18, def: 10, maxHp: 160, maxMp: 50, spd: 134, crit: 0.1, haste: 1.05, luck: 5 },
    perLevel: { atk: 2.6, def: 1.5, maxHp: 18, maxMp: 4, crit: 0.003 },
    from: "musa",
    reqLevel: 20,
    reqFlag: "trainer_geomgaek",
    trainer: "trainer_geomgaek",
    skills: [
      "geom_ilsom",
      "geom_combo",
      "geom_wind",
      "geom_moon",
      "geom_step",
      "geom_qi",
      "geom_focus",
      "geom_blood",
    ],
  },
  changbyeong: {
    id: "changbyeong",
    name: "창병",
    base: "musa",
    tier: 2,
    weapon: "spear",
    hue: PAL.earth_dark,
    robe: PAL.shadow_navy,
    hat: "gat",
    desc: "창끝으로 진형을 꿰뚫는다.",
    baseStats: { atk: 17, def: 12, maxHp: 175, maxMp: 45, spd: 130, crit: 0.07, haste: 1, luck: 4 },
    perLevel: { atk: 2.4, def: 1.8, maxHp: 20, maxMp: 3 },
    from: "musa",
    reqLevel: 20,
    reqFlag: "trainer_changbyeong",
    trainer: "trainer_changbyeong",
    skills: [
      "chang_pierce",
      "chang_sweep",
      "chang_wall",
      "chang_leap",
      "chang_storm",
      "chang_brace",
      "chang_line",
      "chang_sky",
    ],
  },
  singung: {
    id: "singung",
    name: "신궁",
    base: "gungsoo",
    tier: 2,
    weapon: "bow",
    hue: PAL.moss_cool,
    robe: PAL.env_mid,
    hat: "jeonrip",
    desc: "백보 밖의 숨결을 맞춘다.",
    baseStats: { atk: 17, def: 6, maxHp: 120, maxMp: 60, spd: 140, crit: 0.16, haste: 1.08, luck: 8 },
    perLevel: { atk: 2.5, def: 1.0, maxHp: 12, maxMp: 5, crit: 0.005 },
    from: "gungsoo",
    reqLevel: 20,
    reqFlag: "trainer_singung",
    trainer: "trainer_singung",
    skills: [
      "sin_pierce",
      "sin_rain",
      "sin_snipe",
      "sin_fan",
      "sin_retreat",
      "sin_mark",
      "sin_hawk",
      "sin_moon",
    ],
  },
  hwasal: {
    id: "hwasal",
    name: "화살사수",
    base: "gungsoo",
    tier: 2,
    weapon: "bow",
    hue: PAL.blood_mid,
    robe: PAL.blood_deep,
    hat: "jeonrip",
    desc: "화살에 불을 실어 진을 태운다.",
    baseStats: { atk: 16, def: 6, maxHp: 118, maxMp: 70, spd: 138, crit: 0.12, haste: 1.05, luck: 7 },
    perLevel: { atk: 2.3, def: 1.0, maxHp: 12, maxMp: 6 },
    from: "gungsoo",
    reqLevel: 20,
    reqFlag: "trainer_hwasal",
    trainer: "trainer_hwasal",
    skills: [
      "hwa_fire",
      "hwa_bomb",
      "hwa_cone",
      "hwa_ring",
      "hwa_oil",
      "hwa_burst",
      "hwa_dash",
      "hwa_meteor",
    ],
  },
  sulsa: {
    id: "sulsa",
    name: "술사",
    base: "dosa",
    tier: 2,
    weapon: "staff",
    hue: PAL.env_cool,
    robe: PAL.shadow_navy,
    hat: "songnak",
    desc: "뇌와 화로 원기를 부린다.",
    baseStats: { atk: 15, def: 6, maxHp: 108, maxMp: 120, spd: 126, crit: 0.08, haste: 1, luck: 9 },
    perLevel: { atk: 2.2, def: 0.9, maxHp: 11, maxMp: 10 },
    from: "dosa",
    reqLevel: 20,
    reqFlag: "trainer_sulsa",
    trainer: "trainer_sulsa",
    skills: [
      "sul_bolt",
      "sul_nova",
      "sul_chain",
      "sul_orb",
      "sul_storm",
      "sul_haste",
      "sul_rift",
      "sul_moon",
    ],
  },
  bujeoksa: {
    id: "bujeoksa",
    name: "부적사",
    base: "dosa",
    tier: 2,
    weapon: "talisman",
    hue: PAL.blood_mid,
    robe: PAL.blood_deep,
    hat: "songnak",
    desc: "종이에 신명을 가둔다.",
    baseStats: { atk: 14, def: 7, maxHp: 112, maxMp: 110, spd: 128, crit: 0.07, haste: 1, luck: 10 },
    perLevel: { atk: 2.0, def: 1.1, maxHp: 12, maxMp: 9 },
    from: "dosa",
    reqLevel: 20,
    reqFlag: "trainer_bujeoksa",
    trainer: "trainer_bujeoksa",
    skills: [
      "bu_tag",
      "bu_trap",
      "bu_ward",
      "bu_bind",
      "bu_burst",
      "bu_chain",
      "bu_field",
      "bu_exorcise",
    ],
  },
  myeongui: {
    id: "myeongui",
    name: "명의",
    base: "uiwon",
    tier: 2,
    weapon: "staff",
    hue: PAL.bone_light,
    robe: PAL.earth_dark,
    hat: "manggeon",
    desc: "손끝으로 맥을 돌리고 상처를 닫는다.",
    baseStats: { atk: 10, def: 8, maxHp: 140, maxMp: 110, spd: 128, crit: 0.05, haste: 1.05, luck: 8 },
    perLevel: { atk: 1.4, def: 1.2, maxHp: 16, maxMp: 9 },
    from: "uiwon",
    reqLevel: 20,
    reqFlag: "trainer_myeongui",
    trainer: "trainer_myeongui",
    skills: [
      "my_heal",
      "my_circle",
      "my_cleanse",
      "my_barrier",
      "my_needle",
      "my_pulse",
      "my_revive",
      "my_lotus",
    ],
  },
  dokgong: {
    id: "dokgong",
    name: "독공",
    base: "uiwon",
    tier: 2,
    weapon: "staff",
    hue: PAL.moss_cool,
    robe: PAL.env_mid,
    hat: "manggeon",
    desc: "독을 약으로, 약을 무기로.",
    baseStats: { atk: 13, def: 7, maxHp: 125, maxMp: 100, spd: 130, crit: 0.09, haste: 1, luck: 9 },
    perLevel: { atk: 1.8, def: 1.0, maxHp: 13, maxMp: 8 },
    from: "uiwon",
    reqLevel: 22,
    reqFlag: "trainer_dokgong",
    trainer: "trainer_dokgong",
    skills: [
      "dok_spit",
      "dok_cloud",
      "dok_needle",
      "dok_pool",
      "dok_bite",
      "dok_resist",
      "dok_burst",
      "dok_plague",
    ],
  },
  jagaek: {
    id: "jagaek",
    name: "자객",
    base: "dojeok",
    tier: 2,
    weapon: "dagger",
    hue: PAL.shadow_navy,
    robe: PAL.bg_void,
    hat: "none",
    desc: "숨결보다 빠르게 목을 가른다.",
    baseStats: { atk: 16, def: 6, maxHp: 115, maxMp: 60, spd: 158, crit: 0.2, haste: 1.12, luck: 12 },
    perLevel: { atk: 2.2, def: 0.9, maxHp: 12, maxMp: 4, crit: 0.006 },
    from: "dojeok",
    reqLevel: 20,
    reqFlag: "trainer_jagaek",
    trainer: "trainer_jagaek",
    skills: [
      "ja_open",
      "ja_shadow",
      "ja_fan",
      "ja_mark",
      "ja_blink",
      "ja_kill",
      "ja_poison",
      "ja_dance",
    ],
  },
  dogul: {
    id: "dogul",
    name: "도굴꾼",
    base: "dojeok",
    tier: 2,
    weapon: "dagger",
    hue: PAL.earth_dark,
    robe: PAL.shadow_navy,
    hat: "none",
    desc: "무덤과 폐사의 비밀을 캔다.",
    baseStats: { atk: 14, def: 7, maxHp: 122, maxMp: 65, spd: 150, crit: 0.15, haste: 1.06, luck: 16 },
    perLevel: { atk: 1.9, def: 1.0, maxHp: 13, maxMp: 5, luck: 0.4 },
    from: "dojeok",
    reqLevel: 22,
    reqFlag: "trainer_dogul",
    trainer: "trainer_dogul",
    skills: [
      "dg_trap",
      "dg_dust",
      "dg_hook",
      "dg_bomb",
      "dg_luck",
      "dg_dash",
      "dg_scan",
      "dg_curse",
    ],
  },
  gichang: {
    id: "gichang",
    name: "기창",
    base: "gibyeong",
    tier: 2,
    weapon: "spear",
    hue: PAL.blood_mid,
    robe: PAL.earth_dark,
    hat: "jeonrip",
    desc: "말갈기에 창끝이 실린다.",
    baseStats: { atk: 18, def: 11, maxHp: 155, maxMp: 50, spd: 168, crit: 0.08, haste: 1, luck: 5 },
    perLevel: { atk: 2.5, def: 1.6, maxHp: 17, maxMp: 3, spd: 0.7 },
    from: "gibyeong",
    reqLevel: 22,
    reqFlag: "trainer_gichang",
    trainer: "trainer_gichang",
    skills: [
      "gc_rush",
      "gc_trample",
      "gc_sweep",
      "gc_brace",
      "gc_line",
      "gc_roar",
      "gc_spin",
      "gc_break",
    ],
  },
  magung: {
    id: "magung",
    name: "마궁",
    base: "gibyeong",
    tier: 2,
    weapon: "bow",
    hue: PAL.moss_cool,
    robe: PAL.shadow_navy,
    hat: "jeonrip",
    desc: "달리는 말 위에서 달을 쏜다.",
    baseStats: { atk: 16, def: 8, maxHp: 138, maxMp: 55, spd: 172, crit: 0.13, haste: 1.08, luck: 6 },
    perLevel: { atk: 2.3, def: 1.2, maxHp: 14, maxMp: 4, spd: 0.8 },
    from: "gibyeong",
    reqLevel: 22,
    reqFlag: "trainer_magung",
    trainer: "trainer_magung",
    skills: [
      "mg_volley",
      "mg_kite",
      "mg_bomb",
      "mg_circle",
      "mg_gallop",
      "mg_mark",
      "mg_pierce",
      "mg_rain",
    ],
  },
};

export const BASE_JOBS: BaseJobId[] = ["musa", "gungsoo", "dosa", "uiwon", "dojeok", "gibyeong"];

export function advJobsOf(base: BaseJobId): JobDef[] {
  return Object.values(JOBS).filter((j) => j.tier === 2 && j.base === base);
}

export function jobById(id: JobId): JobDef {
  return JOBS[id];
}

export interface SkillDef {
  id: string;
  name: string;
  job: JobId;
  kind: SkillKind;
  mp: number;
  cd: number;
  power: number;
  range: number;
  radius?: number;
  angle?: number;
  duration?: number;
  speed?: number;
  pierce?: number;
  jumps?: number;
  delay?: number;
  dist?: number;
  stat?: keyof Stats;
  amount?: number;
  ticks?: number;
  desc: string;
}

function S(partial: SkillDef): SkillDef {
  return partial;
}

export const SKILLS: Record<string, SkillDef> = {};

function add(list: SkillDef[]): void {
  for (const s of list) SKILLS[s.id] = s;
}

add([
  S({ id: "musa_slash", name: "내려베기", job: "musa", kind: "slash", mp: 0, cd: 0.45, power: 1.0, range: 48, angle: 1.15, desc: "전방 부채꼴을 벤다. 공격력 100%." }),
  S({ id: "musa_dash", name: "돌진", job: "musa", kind: "dash", mp: 8, cd: 4.5, power: 0.85, range: 40, dist: 110, desc: "앞으로 돌진하며 경로의 적에게 85% 피해." }),
  S({ id: "musa_guard", name: "방패자세", job: "musa", kind: "buff", mp: 10, cd: 10, power: 0, range: 0, duration: 6, stat: "def", amount: 12, desc: "6초간 방어 +12." }),
  S({ id: "musa_spin", name: "회전베기", job: "musa", kind: "circle", mp: 12, cd: 6, power: 1.15, range: 0, radius: 56, desc: "주위 56 반경을 베어 115% 피해." }),

  S({ id: "gung_shot", name: "각궁시", job: "gungsoo", kind: "projectile", mp: 0, cd: 0.55, power: 1.0, range: 340, speed: 420, pierce: 0, desc: "화살 한 대. 공격력 100%." }),
  S({ id: "gung_multi", name: "연노", job: "gungsoo", kind: "cone", mp: 10, cd: 5, power: 0.7, range: 180, angle: 0.55, desc: "부채꼴로 화살비. 70%." }),
  S({ id: "gung_step", name: "후퇴사격", job: "gungsoo", kind: "dash", mp: 8, cd: 5, power: 0.6, range: 40, dist: -90, desc: "뒤로 물러나며 60% 타격." }),
  S({ id: "gung_mark", name: "과녁점", job: "gungsoo", kind: "buff", mp: 8, cd: 12, power: 0, range: 0, duration: 8, stat: "crit", amount: 0.12, desc: "8초간 치명타 +12%." }),

  S({ id: "dosa_tal", name: "부적시", job: "dosa", kind: "projectile", mp: 6, cd: 0.6, power: 0.95, range: 280, speed: 360, pierce: 1, desc: "부적을 날린다. 95%, 1관통." }),
  S({ id: "dosa_ward", name: "호신부", job: "dosa", kind: "buff", mp: 12, cd: 14, power: 0, range: 0, duration: 8, stat: "def", amount: 10, desc: "8초간 방어 +10." }),
  S({ id: "dosa_pulse", name: "원령파", job: "dosa", kind: "circle", mp: 14, cd: 7, power: 1.1, range: 0, radius: 72, desc: "주변 원혼파 110%." }),
  S({ id: "dosa_seal", name: "봉인진", job: "dosa", kind: "groundAoe", mp: 16, cd: 9, power: 1.25, range: 180, radius: 54, delay: 0.45, desc: "지연 폭발 진. 125%." }),

  S({ id: "ui_needle", name: "은침", job: "uiwon", kind: "projectile", mp: 5, cd: 0.5, power: 0.8, range: 220, speed: 400, pierce: 0, desc: "침을 던진다. 80%." }),
  S({ id: "ui_salve", name: "고약", job: "uiwon", kind: "heal", mp: 14, cd: 6, power: 0, range: 0, radius: 80, amount: 36, desc: "주위와 자신을 36 치유." }),
  S({ id: "ui_smoke", name: "약연", job: "uiwon", kind: "groundAoe", mp: 12, cd: 8, power: 0.7, range: 160, radius: 60, delay: 0.2, desc: "약연 장판 70%." }),
  S({ id: "ui_purge", name: "해독", job: "uiwon", kind: "buff", mp: 10, cd: 10, power: 0, range: 0, duration: 6, stat: "def", amount: 6, desc: "독을 씻고 방어 +6." }),

  S({ id: "doj_stab", name: "암습", job: "dojeok", kind: "slash", mp: 0, cd: 0.4, power: 0.9, range: 40, angle: 0.7, desc: "짧은 찌르기 90%." }),
  S({ id: "doj_dash", name: "그림자걸음", job: "dojeok", kind: "dash", mp: 8, cd: 3.5, power: 0.75, range: 36, dist: 130, desc: "돌진 암습 75%." }),
  S({ id: "doj_smoke", name: "연막", job: "dojeok", kind: "circle", mp: 10, cd: 8, power: 0.4, range: 0, radius: 64, desc: "연막과 약한 타격 40%." }),
  S({ id: "doj_steal", name: "손재주", job: "dojeok", kind: "buff", mp: 6, cd: 16, power: 0, range: 0, duration: 10, stat: "luck", amount: 12, desc: "10초간 행운 +12." }),

  S({ id: "gi_charge", name: "기마돌격", job: "gibyeong", kind: "dash", mp: 10, cd: 5, power: 1.1, range: 44, dist: 160, desc: "돌격 110%." }),
  S({ id: "gi_thrust", name: "창찌르기", job: "gibyeong", kind: "slash", mp: 0, cd: 0.5, power: 1.05, range: 58, angle: 0.45, desc: "긴 창 찌르기 105%." }),
  S({ id: "gi_circle", name: "선회", job: "gibyeong", kind: "circle", mp: 12, cd: 7, power: 1.0, range: 0, radius: 70, desc: "선회 타격 100%." }),
  S({ id: "gi_banner", name: "군기", job: "gibyeong", kind: "buff", mp: 12, cd: 14, power: 0, range: 0, duration: 8, stat: "atk", amount: 8, desc: "8초간 공격 +8." }),
]);

add([
  S({ id: "geom_ilsom", name: "일섬", job: "geomgaek", kind: "slash", mp: 8, cd: 1.2, power: 1.45, range: 56, angle: 0.85, desc: "한 획. 145%." }),
  S({ id: "geom_combo", name: "연속베기", job: "geomgaek", kind: "slash", mp: 10, cd: 3.2, power: 1.1, range: 50, angle: 1.4, desc: "넓은 연속베기 110%." }),
  S({ id: "geom_wind", name: "검풍", job: "geomgaek", kind: "cone", mp: 14, cd: 6, power: 1.2, range: 130, angle: 0.7, desc: "검기 부채 120%." }),
  S({ id: "geom_moon", name: "월광참", job: "geomgaek", kind: "circle", mp: 16, cd: 8, power: 1.35, range: 0, radius: 70, desc: "달빛 원참 135%." }),
  S({ id: "geom_step", name: "순보", job: "geomgaek", kind: "dash", mp: 10, cd: 4, power: 0.9, range: 40, dist: 140, desc: "순보 돌진 90%." }),
  S({ id: "geom_qi", name: "검기", job: "geomgaek", kind: "projectile", mp: 12, cd: 5, power: 1.15, range: 260, speed: 480, pierce: 2, desc: "검기파 115%, 2관통." }),
  S({ id: "geom_focus", name: "집중", job: "geomgaek", kind: "buff", mp: 8, cd: 12, power: 0, range: 0, duration: 7, stat: "crit", amount: 0.18, desc: "7초 치명 +18%." }),
  S({ id: "geom_blood", name: "혈월참", job: "geomgaek", kind: "groundAoe", mp: 22, cd: 14, power: 1.8, range: 90, radius: 64, delay: 0.25, desc: "혈월 참격 180%." }),

  S({ id: "chang_pierce", name: "투창", job: "changbyeong", kind: "projectile", mp: 8, cd: 2.2, power: 1.2, range: 240, speed: 500, pierce: 3, desc: "창 투척 120%, 3관통." }),
  S({ id: "chang_sweep", name: "횡소", job: "changbyeong", kind: "cone", mp: 12, cd: 5, power: 1.15, range: 90, angle: 1.5, desc: "넓은 횡소 115%." }),
  S({ id: "chang_wall", name: "창벽", job: "changbyeong", kind: "slash", mp: 0, cd: 0.55, power: 1.1, range: 64, angle: 0.4, desc: "찌르기 110%." }),
  S({ id: "chang_leap", name: "도약창", job: "changbyeong", kind: "dash", mp: 12, cd: 6, power: 1.25, range: 50, dist: 150, desc: "도약 찌르기 125%." }),
  S({ id: "chang_storm", name: "창우", job: "changbyeong", kind: "circle", mp: 16, cd: 8, power: 1.3, range: 0, radius: 68, desc: "창우 130%." }),
  S({ id: "chang_brace", name: "방어진", job: "changbyeong", kind: "buff", mp: 10, cd: 12, power: 0, range: 0, duration: 8, stat: "def", amount: 16, desc: "8초 방어 +16." }),
  S({ id: "chang_line", name: "직선돌파", job: "changbyeong", kind: "dash", mp: 14, cd: 7, power: 1.4, range: 48, dist: 190, desc: "긴 돌파 140%." }),
  S({ id: "chang_sky", name: "천창", job: "changbyeong", kind: "groundAoe", mp: 20, cd: 13, power: 1.7, range: 100, radius: 58, delay: 0.35, desc: "낙하 창 170%." }),

  S({ id: "sin_pierce", name: "관통시", job: "singung", kind: "projectile", mp: 8, cd: 1.4, power: 1.25, range: 420, speed: 560, pierce: 4, desc: "관통시 125%." }),
  S({ id: "sin_rain", name: "화살비", job: "singung", kind: "groundAoe", mp: 16, cd: 8, power: 1.4, range: 260, radius: 72, delay: 0.4, desc: "화살비 140%." }),
  S({ id: "sin_snipe", name: "정조준", job: "singung", kind: "projectile", mp: 14, cd: 6, power: 2.1, range: 480, speed: 640, pierce: 1, desc: "정조준 210%." }),
  S({ id: "sin_fan", name: "부채살", job: "singung", kind: "cone", mp: 12, cd: 5, power: 0.95, range: 220, angle: 0.7, desc: "부채살 95%." }),
  S({ id: "sin_retreat", name: "도약후퇴", job: "singung", kind: "dash", mp: 8, cd: 5, power: 0.5, range: 36, dist: -110, desc: "후퇴 50%." }),
  S({ id: "sin_mark", name: "과녁인", job: "singung", kind: "buff", mp: 8, cd: 10, power: 0, range: 0, duration: 8, stat: "atk", amount: 10, desc: "8초 공격 +10." }),
  S({ id: "sin_hawk", name: "매의눈", job: "singung", kind: "buff", mp: 10, cd: 14, power: 0, range: 0, duration: 8, stat: "crit", amount: 0.2, desc: "치명 +20%." }),
  S({ id: "sin_moon", name: "월궁", job: "singung", kind: "circle", mp: 18, cd: 12, power: 1.5, range: 0, radius: 80, desc: "달 화살원 150%." }),

  S({ id: "hwa_fire", name: "화시", job: "hwasal", kind: "projectile", mp: 7, cd: 0.7, power: 1.1, range: 320, speed: 440, pierce: 0, desc: "불화살 110%." }),
  S({ id: "hwa_bomb", name: "폭시", job: "hwasal", kind: "groundAoe", mp: 14, cd: 6, power: 1.35, range: 240, radius: 60, delay: 0.3, desc: "폭발시 135%." }),
  S({ id: "hwa_cone", name: "화염부채", job: "hwasal", kind: "cone", mp: 12, cd: 5, power: 1.15, range: 150, angle: 0.85, desc: "화염부채 115%." }),
  S({ id: "hwa_ring", name: "화륜", job: "hwasal", kind: "circle", mp: 16, cd: 8, power: 1.25, range: 0, radius: 66, desc: "화륜 125%." }),
  S({ id: "hwa_oil", name: "유염", job: "hwasal", kind: "dot", mp: 12, cd: 9, power: 0.35, range: 200, duration: 5, ticks: 5, radius: 50, desc: "5초 화상 틱 35%." }),
  S({ id: "hwa_burst", name: "연소", job: "hwasal", kind: "chain", mp: 16, cd: 10, power: 0.9, range: 160, jumps: 4, desc: "연소 연쇄 4회 90%." }),
  S({ id: "hwa_dash", name: "화신보", job: "hwasal", kind: "dash", mp: 8, cd: 5, power: 0.7, range: 36, dist: 120, desc: "화신 이동 70%." }),
  S({ id: "hwa_meteor", name: "적월시", job: "hwasal", kind: "groundAoe", mp: 24, cd: 15, power: 2.0, range: 220, radius: 80, delay: 0.55, desc: "적월 낙하 200%." }),

  S({ id: "sul_bolt", name: "뇌전", job: "sulsa", kind: "projectile", mp: 10, cd: 0.65, power: 1.05, range: 300, speed: 400, pierce: 1, desc: "뇌전 105%." }),
  S({ id: "sul_nova", name: "원기폭", job: "sulsa", kind: "circle", mp: 16, cd: 7, power: 1.35, range: 0, radius: 78, desc: "원기폭 135%." }),
  S({ id: "sul_chain", name: "연쇄뢰", job: "sulsa", kind: "chain", mp: 18, cd: 8, power: 1.05, range: 200, jumps: 5, desc: "연쇄뢰 5회 105%." }),
  S({ id: "sul_orb", name: "영주", job: "sulsa", kind: "projectile", mp: 12, cd: 4, power: 1.2, range: 260, speed: 280, pierce: 3, desc: "영주 120%." }),
  S({ id: "sul_storm", name: "풍뢰진", job: "sulsa", kind: "groundAoe", mp: 20, cd: 10, power: 1.5, range: 200, radius: 70, delay: 0.4, desc: "풍뢰진 150%." }),
  S({ id: "sul_haste", name: "신행", job: "sulsa", kind: "buff", mp: 10, cd: 12, power: 0, range: 0, duration: 6, stat: "haste", amount: 0.25, desc: "6초 가속 +25%." }),
  S({ id: "sul_rift", name: "균열", job: "sulsa", kind: "dash", mp: 12, cd: 6, power: 0.8, range: 40, dist: 150, desc: "공간 도약 80%." }),
  S({ id: "sul_moon", name: "적월술", job: "sulsa", kind: "groundAoe", mp: 26, cd: 16, power: 1.9, range: 180, radius: 84, delay: 0.5, desc: "적월술 190%." }),

  S({ id: "bu_tag", name: "부적탄", job: "bujeoksa", kind: "projectile", mp: 7, cd: 0.55, power: 1.0, range: 280, speed: 380, pierce: 1, desc: "부적탄 100%." }),
  S({ id: "bu_trap", name: "함정부", job: "bujeoksa", kind: "groundAoe", mp: 12, cd: 5, power: 1.2, range: 160, radius: 48, delay: 0.7, desc: "지연 함정 120%." }),
  S({ id: "bu_ward", name: "결계", job: "bujeoksa", kind: "buff", mp: 14, cd: 14, power: 0, range: 0, duration: 8, stat: "def", amount: 14, desc: "결계 방어 +14." }),
  S({ id: "bu_bind", name: "속박부", job: "bujeoksa", kind: "dot", mp: 12, cd: 8, power: 0.3, range: 180, duration: 4, ticks: 4, radius: 40, desc: "속박 틱 30%." }),
  S({ id: "bu_burst", name: "파부", job: "bujeoksa", kind: "circle", mp: 14, cd: 7, power: 1.25, range: 0, radius: 70, desc: "파부 125%." }),
  S({ id: "bu_chain", name: "연결부", job: "bujeoksa", kind: "chain", mp: 16, cd: 9, power: 0.95, range: 180, jumps: 4, desc: "연결부 4회 95%." }),
  S({ id: "bu_field", name: "진법", job: "bujeoksa", kind: "groundAoe", mp: 18, cd: 11, power: 1.4, range: 150, radius: 76, delay: 0.35, desc: "진법 140%." }),
  S({ id: "bu_exorcise", name: "퇴마", job: "bujeoksa", kind: "cone", mp: 20, cd: 12, power: 1.7, range: 140, angle: 0.9, desc: "퇴마 부채 170%." }),

  S({ id: "my_heal", name: "회춘", job: "myeongui", kind: "heal", mp: 12, cd: 4, power: 0, range: 0, radius: 90, amount: 48, desc: "치유 48." }),
  S({ id: "my_circle", name: "약원", job: "myeongui", kind: "heal", mp: 18, cd: 8, power: 0, range: 0, radius: 140, amount: 32, desc: "넓은 치유 32." }),
  S({ id: "my_cleanse", name: "청혈", job: "myeongui", kind: "buff", mp: 10, cd: 10, power: 0, range: 0, duration: 8, stat: "luck", amount: 6, desc: "상태이상 씻음." }),
  S({ id: "my_barrier", name: "약방패", job: "myeongui", kind: "buff", mp: 14, cd: 12, power: 0, range: 0, duration: 7, stat: "def", amount: 18, desc: "방어 +18." }),
  S({ id: "my_needle", name: "침술탄", job: "myeongui", kind: "projectile", mp: 8, cd: 0.7, power: 0.95, range: 240, speed: 420, pierce: 0, desc: "침술탄 95%." }),
  S({ id: "my_pulse", name: "맥동", job: "myeongui", kind: "circle", mp: 12, cd: 6, power: 1.0, range: 0, radius: 70, desc: "맥동 타격 100%." }),
  S({ id: "my_revive", name: "회생", job: "myeongui", kind: "heal", mp: 24, cd: 20, power: 0, range: 0, radius: 40, amount: 90, desc: "응급 회생 90." }),
  S({ id: "my_lotus", name: "연화진", job: "myeongui", kind: "groundAoe", mp: 16, cd: 10, power: 0.8, range: 120, radius: 70, delay: 0.2, desc: "연화 장판 80%+치유." }),

  S({ id: "dok_spit", name: "독침", job: "dokgong", kind: "projectile", mp: 7, cd: 0.55, power: 0.9, range: 250, speed: 400, pierce: 0, desc: "독침 90%." }),
  S({ id: "dok_cloud", name: "독운", job: "dokgong", kind: "circle", mp: 14, cd: 7, power: 1.1, range: 0, radius: 72, desc: "독운 110%." }),
  S({ id: "dok_needle", name: "독혈침", job: "dokgong", kind: "dot", mp: 12, cd: 6, power: 0.4, range: 200, duration: 6, ticks: 6, radius: 36, desc: "6초 중독 40%." }),
  S({ id: "dok_pool", name: "독지", job: "dokgong", kind: "groundAoe", mp: 14, cd: 8, power: 1.2, range: 170, radius: 62, delay: 0.3, desc: "독지 120%." }),
  S({ id: "dok_bite", name: "사교", job: "dokgong", kind: "slash", mp: 8, cd: 2, power: 1.15, range: 46, angle: 0.8, desc: "사교 115%." }),
  S({ id: "dok_resist", name: "내독", job: "dokgong", kind: "buff", mp: 10, cd: 14, power: 0, range: 0, duration: 10, stat: "def", amount: 10, desc: "내독 방어 +10." }),
  S({ id: "dok_burst", name: "폭독", job: "dokgong", kind: "cone", mp: 16, cd: 8, power: 1.3, range: 120, angle: 0.75, desc: "폭독 130%." }),
  S({ id: "dok_plague", name: "역병", job: "dokgong", kind: "chain", mp: 20, cd: 13, power: 1.0, range: 170, jumps: 5, desc: "역병 연쇄 5회." }),

  S({ id: "ja_open", name: "목긋기", job: "jagaek", kind: "slash", mp: 6, cd: 0.85, power: 1.35, range: 42, angle: 0.5, desc: "급소 135%." }),
  S({ id: "ja_shadow", name: "잠행", job: "jagaek", kind: "buff", mp: 10, cd: 12, power: 0, range: 0, duration: 5, stat: "spd", amount: 24, desc: "잠행 이속 +24." }),
  S({ id: "ja_fan", name: "비도부채", job: "jagaek", kind: "cone", mp: 12, cd: 5, power: 1.05, range: 110, angle: 0.9, desc: "비도 105%." }),
  S({ id: "ja_mark", name: "표식", job: "jagaek", kind: "buff", mp: 8, cd: 10, power: 0, range: 0, duration: 8, stat: "crit", amount: 0.22, desc: "치명 +22%." }),
  S({ id: "ja_blink", name: "점멸", job: "jagaek", kind: "dash", mp: 10, cd: 3.5, power: 0.95, range: 38, dist: 150, desc: "점멸 95%." }),
  S({ id: "ja_kill", name: "암살", job: "jagaek", kind: "slash", mp: 16, cd: 8, power: 2.0, range: 44, angle: 0.4, desc: "암살 200%." }),
  S({ id: "ja_poison", name: "독비수", job: "jagaek", kind: "dot", mp: 10, cd: 7, power: 0.35, range: 80, duration: 5, ticks: 5, radius: 28, desc: "독비수 틱." }),
  S({ id: "ja_dance", name: "살무도", job: "jagaek", kind: "circle", mp: 18, cd: 11, power: 1.45, range: 0, radius: 60, desc: "살무도 145%." }),

  S({ id: "dg_trap", name: "함정설치", job: "dogul", kind: "groundAoe", mp: 10, cd: 5, power: 1.25, range: 140, radius: 46, delay: 0.8, desc: "함정 125%." }),
  S({ id: "dg_dust", name: "분진", job: "dogul", kind: "cone", mp: 10, cd: 6, power: 0.85, range: 100, angle: 1.0, desc: "분진 85%." }),
  S({ id: "dg_hook", name: "갈고리", job: "dogul", kind: "projectile", mp: 8, cd: 0.7, power: 0.95, range: 200, speed: 420, pierce: 0, desc: "갈고리 95%." }),
  S({ id: "dg_bomb", name: "화약포", job: "dogul", kind: "groundAoe", mp: 16, cd: 8, power: 1.5, range: 170, radius: 58, delay: 0.4, desc: "화약 150%." }),
  S({ id: "dg_luck", name: "도굴안", job: "dogul", kind: "buff", mp: 8, cd: 16, power: 0, range: 0, duration: 12, stat: "luck", amount: 18, desc: "행운 +18." }),
  S({ id: "dg_dash", name: "묘혈질주", job: "dogul", kind: "dash", mp: 8, cd: 4, power: 0.7, range: 36, dist: 140, desc: "질주 70%." }),
  S({ id: "dg_scan", name: "유물탐지", job: "dogul", kind: "circle", mp: 6, cd: 8, power: 0.5, range: 0, radius: 90, desc: "탐지파 50%." }),
  S({ id: "dg_curse", name: "묘독", job: "dogul", kind: "dot", mp: 14, cd: 10, power: 0.4, range: 150, duration: 6, ticks: 6, radius: 50, desc: "묘독 틱." }),

  S({ id: "gc_rush", name: "창기습격", job: "gichang", kind: "dash", mp: 10, cd: 4.5, power: 1.3, range: 48, dist: 180, desc: "습격 130%." }),
  S({ id: "gc_trample", name: "말발굽", job: "gichang", kind: "circle", mp: 12, cd: 6, power: 1.2, range: 0, radius: 64, desc: "말발굽 120%." }),
  S({ id: "gc_sweep", name: "기창횡", job: "gichang", kind: "cone", mp: 12, cd: 5, power: 1.2, range: 100, angle: 1.2, desc: "횡격 120%." }),
  S({ id: "gc_brace", name: "마갑", job: "gichang", kind: "buff", mp: 10, cd: 12, power: 0, range: 0, duration: 8, stat: "def", amount: 14, desc: "마갑 +14." }),
  S({ id: "gc_line", name: "돌파선", job: "gichang", kind: "dash", mp: 16, cd: 8, power: 1.5, range: 50, dist: 210, desc: "돌파선 150%." }),
  S({ id: "gc_roar", name: "군호", job: "gichang", kind: "buff", mp: 10, cd: 14, power: 0, range: 0, duration: 8, stat: "atk", amount: 10, desc: "군호 공격 +10." }),
  S({ id: "gc_spin", name: "선회창", job: "gichang", kind: "circle", mp: 14, cd: 7, power: 1.25, range: 0, radius: 72, desc: "선회창 125%." }),
  S({ id: "gc_break", name: "파진", job: "gichang", kind: "groundAoe", mp: 20, cd: 12, power: 1.7, range: 90, radius: 70, delay: 0.25, desc: "파진 170%." }),

  S({ id: "mg_volley", name: "기마연사", job: "magung", kind: "projectile", mp: 6, cd: 0.45, power: 0.95, range: 300, speed: 500, pierce: 0, desc: "기마연사 95%." }),
  S({ id: "mg_kite", name: "유격", job: "magung", kind: "dash", mp: 8, cd: 3.5, power: 0.6, range: 36, dist: -100, desc: "유격 후퇴." }),
  S({ id: "mg_bomb", name: "화전", job: "magung", kind: "groundAoe", mp: 14, cd: 7, power: 1.3, range: 220, radius: 56, delay: 0.3, desc: "화전 130%." }),
  S({ id: "mg_circle", name: "선회시", job: "magung", kind: "circle", mp: 14, cd: 8, power: 1.15, range: 0, radius: 80, desc: "선회시 115%." }),
  S({ id: "mg_gallop", name: "질주", job: "magung", kind: "buff", mp: 8, cd: 10, power: 0, range: 0, duration: 6, stat: "spd", amount: 28, desc: "질주 이속 +28." }),
  S({ id: "mg_mark", name: "기표", job: "magung", kind: "buff", mp: 8, cd: 12, power: 0, range: 0, duration: 8, stat: "crit", amount: 0.14, desc: "치명 +14%." }),
  S({ id: "mg_pierce", name: "마상관통", job: "magung", kind: "projectile", mp: 12, cd: 5, power: 1.35, range: 360, speed: 560, pierce: 3, desc: "관통 135%." }),
  S({ id: "mg_rain", name: "기우", job: "magung", kind: "groundAoe", mp: 20, cd: 13, power: 1.6, range: 240, radius: 78, delay: 0.45, desc: "기우 160%." }),
]);

export function skillsForJob(job: JobId): SkillDef[] {
  const j = JOBS[job];
  const ids = new Set(j.skills);
  if (j.from) {
    for (const s of JOBS[j.from].skills) ids.add(s);
  }
  return [...ids].map((id) => SKILLS[id]).filter(Boolean);
}

export function tooltipFor(s: SkillDef): string {
  const bits = [`${s.name}`, s.desc, `소모 마력 ${s.mp} · 재사용 ${s.cd.toFixed(1)}초`];
  if (s.power) bits.push(`위력 ${Math.round(s.power * 100)}%`);
  if (s.range) bits.push(`사거리 ${s.range}`);
  if (s.radius) bits.push(`반경 ${s.radius}`);
  return bits.join("\n");
}
