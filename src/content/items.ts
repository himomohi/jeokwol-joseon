import type { ItemRecipe, JobId, WeaponType } from "../core/types";

function w(
  id: string,
  name: string,
  weaponType: WeaponType,
  atk: number,
  value: number,
  form: string,
  material: string,
  tint: string,
  extra: Partial<ItemRecipe> = {},
): ItemRecipe {
  return {
    id,
    name,
    kind: "weapon",
    slot: "weapon",
    weaponType,
    stats: { atk, ...(extra.stats ?? {}) },
    visual: { form, material, tint },
    value,
    stackMax: 1,
    desc: extra.desc ?? `${name}. 공격 +${atk}`,
    reqJob: extra.reqJob,
    reqLevel: extra.reqLevel,
  };
}

function a(
  id: string,
  name: string,
  slot: ItemRecipe["slot"],
  stats: ItemRecipe["stats"],
  value: number,
  form: string,
  material: string,
  tint: string,
  desc?: string,
): ItemRecipe {
  return {
    id,
    name,
    kind: "armor",
    slot,
    stats,
    visual: { form, material, tint },
    value,
    stackMax: 1,
    desc: desc ?? name,
  };
}

function c(id: string, name: string, heal: number, mp: number, value: number, form: string, tint: string): ItemRecipe {
  return {
    id,
    name,
    kind: "consumable",
    slot: "consumable",
    stats: {},
    visual: { form, material: "ceramic", tint },
    value,
    stackMax: 20,
    heal,
    mp,
    desc: [heal ? `체력 +${heal}` : "", mp ? `마력 +${mp}` : ""].filter(Boolean).join(" · "),
  };
}

const swordJobs: JobId[] = ["musa", "geomgaek"];
const spearJobs: JobId[] = ["musa", "changbyeong", "gibyeong", "gichang"];
const bowJobs: JobId[] = ["gungsoo", "singung", "hwasal", "gibyeong", "magung"];
const daggerJobs: JobId[] = ["dojeok", "jagaek", "dogul"];
const talJobs: JobId[] = ["dosa", "bujeoksa", "sulsa"];
const staffJobs: JobId[] = ["dosa", "sulsa", "uiwon", "myeongui", "dokgong"];

export const ITEMS: Record<string, ItemRecipe> = {};

function put(it: ItemRecipe): void {
  ITEMS[it.id] = it;
}

put(w("sword_rusty", "녹슨 환도", "sword", 6, 12, "sword", "iron", "#6a6e72", { reqJob: swordJobs }));
put(w("sword_ring", "환도", "sword", 11, 40, "sword", "iron", "#8a9399", { reqJob: swordJobs, reqLevel: 3 }));
put(w("sword_moon", "월광환도", "sword", 18, 160, "sword", "steel", "#c9d4e0", { reqJob: ["geomgaek"], reqLevel: 8, stats: { crit: 0.05 } }));
put(w("sword_blood", "적월환도", "sword", 24, 420, "sword", "bloodsteel", "#8b1520", { reqJob: ["geomgaek"], reqLevel: 12, stats: { crit: 0.08 } }));
put(w("spear_wood", "목창", "spear", 7, 14, "spear", "wood", "#6b4a2a", { reqJob: spearJobs }));
put(w("spear_iron", "철창", "spear", 13, 50, "spear", "iron", "#8a9399", { reqJob: spearJobs, reqLevel: 3 }));
put(w("spear_sky", "청룡창", "spear", 20, 180, "spear", "steel", "#7aa0c4", { reqJob: ["changbyeong", "gichang"], reqLevel: 8 }));
put(w("spear_blood", "혈룡창", "spear", 25, 400, "spear", "bloodsteel", "#8b1520", { reqJob: ["changbyeong", "gichang"], reqLevel: 12 }));
put(w("bow_oak", "각궁", "bow", 7, 16, "bow", "wood", "#6b4a2a", { reqJob: bowJobs }));
put(w("bow_horn", "각궁·뿔", "bow", 13, 55, "bow", "horn", "#8a6040", { reqJob: bowJobs, reqLevel: 3 }));
put(w("bow_hawk", "매의 각궁", "bow", 19, 190, "bow", "horn", "#c9a46a", { reqJob: ["singung", "magung"], reqLevel: 8, stats: { crit: 0.06 } }));
put(w("bow_fire", "화우궁", "bow", 22, 380, "bow", "lacquer", "#8b2a14", { reqJob: ["hwasal", "magung"], reqLevel: 8 }));
put(w("dagger_iron", "단도", "dagger", 6, 14, "dagger", "iron", "#8a9399", { reqJob: daggerJobs }));
put(w("dagger_shadow", "암도", "dagger", 12, 60, "dagger", "steel", "#3a3a48", { reqJob: daggerJobs, reqLevel: 3, stats: { crit: 0.06 } }));
put(w("dagger_kill", "자객비수", "dagger", 18, 200, "dagger", "bloodsteel", "#5a1020", { reqJob: ["jagaek"], reqLevel: 8, stats: { crit: 0.1 } }));
put(w("dagger_tomb", "묘혈비수", "dagger", 16, 210, "dagger", "bone", "#cfc6b0", { reqJob: ["dogul"], reqLevel: 8, stats: { luck: 8 } }));
put(w("tal_paper", "부적첩", "talisman", 6, 18, "talisman", "paper", "#e8dcc0", { reqJob: talJobs }));
put(w("tal_red", "적부", "talisman", 12, 70, "talisman", "paper", "#c45a40", { reqJob: talJobs, reqLevel: 3 }));
put(w("tal_moon", "월부", "talisman", 18, 220, "talisman", "paper", "#8b1520", { reqJob: ["bujeoksa", "sulsa"], reqLevel: 8, stats: { maxMp: 20 } }));
put(w("staff_oak", "목장", "staff", 5, 16, "staff", "wood", "#6b4a2a", { reqJob: staffJobs }));
put(w("staff_jade", "옥장", "staff", 11, 80, "staff", "jade", "#5aaa7a", { reqJob: staffJobs, reqLevel: 3, stats: { maxMp: 15 } }));
put(w("staff_lotus", "연화장", "staff", 15, 230, "staff", "jade", "#d0c070", { reqJob: ["myeongui"], reqLevel: 8, stats: { maxHp: 30 } }));
put(w("staff_venom", "독사장", "staff", 17, 240, "staff", "bone", "#5aaa40", { reqJob: ["dokgong"], reqLevel: 8 }));

put(a("helm_gat", "흑립", "helm", { def: 3 }, 20, "gat", "horsehair", "#1a1a1a"));
put(a("helm_jeonrip", "전립", "helm", { def: 4, spd: 4 }, 30, "jeonrip", "felt", "#3a2416"));
put(a("helm_songnak", "송낙", "helm", { def: 2, maxMp: 12 }, 28, "songnak", "silk", "#3b2d6b"));
put(a("helm_iron", "투구", "helm", { def: 8 }, 80, "helm", "iron", "#8a9399"));
put(a("chest_hanbok", "무명 철릭", "chest", { def: 4, maxHp: 12 }, 24, "robe", "cotton", "#4a1a20"));
put(a("chest_silk", "비단 철릭", "chest", { def: 7, maxHp: 22 }, 90, "robe", "silk", "#8b1520"));
put(a("chest_leather", "가죽갑", "chest", { def: 9, spd: 6 }, 100, "armor", "leather", "#5a3a22"));
put(a("chest_scale", "미늘갑", "chest", { def: 14, maxHp: 28 }, 180, "armor", "steel", "#8a9399"));
put(a("chest_moon", "적월포", "chest", { def: 12, atk: 6, maxHp: 24 }, 320, "robe", "silk", "#8b1520"));
put(a("legs_cloth", "무명 바지", "legs", { def: 2, spd: 4 }, 16, "pants", "cotton", "#3a2a22"));
put(a("legs_leather", "가죽 각반", "legs", { def: 5, spd: 8 }, 70, "pants", "leather", "#4a3020"));
put(a("boots_straw", "짚신", "boots", { spd: 6 }, 8, "shoes", "straw", "#c2a878"));
put(a("boots_leather", "가죽화", "boots", { def: 3, spd: 10 }, 50, "shoes", "leather", "#3a2418"));
put(a("acc_norigae", "노리개", "accessory", { luck: 6 }, 40, "norigae", "jade", "#5aaa7a"));
put(a("acc_tal", "호신부", "accessory", { def: 4, maxMp: 10 }, 60, "talisman", "paper", "#e8dcc0"));
put(a("acc_tiger", "호랑이 이빨", "accessory", { atk: 6, crit: 0.04 }, 140, "fang", "bone", "#e8dcc0"));
put(a("acc_moon", "적월패", "accessory", { atk: 8, maxMp: 16 }, 280, "amulet", "bloodsteel", "#8b1520"));

put(c("hp_small", "소형 환약", 40, 0, 8, "gourd", "#8b1520"));
put(c("hp_mid", "중형 환약", 90, 0, 22, "gourd", "#c45a40"));
put(c("mp_small", "소형 영단", 0, 35, 10, "gourd", "#3b2d6b"));
put(c("mp_mid", "중형 영단", 0, 80, 24, "gourd", "#5a4a9a"));
put(c("mix", "쌍보환", 50, 40, 30, "gourd", "#c9a46a"));
put(c("antidote", "해독환", 20, 0, 16, "gourd", "#3a6b28"));

put({
  id: "gold_pouch",
  name: "엽전주머니",
  kind: "misc",
  slot: "none",
  stats: {},
  visual: { form: "pouch", material: "leather", tint: "#c9a46a" },
  value: 1,
  stackMax: 99,
  desc: "엽전.",
});
put({
  id: "quest_tiger_fang",
  name: "적월의 이빨",
  kind: "quest",
  slot: "none",
  stats: {},
  visual: { form: "fang", material: "bone", tint: "#8b1520" },
  value: 0,
  stackMax: 1,
  desc: "적월호랑이를 쓰러뜨린 증표.",
});
put({
  id: "quest_abbot_bead",
  name: "폐사의 염주",
  kind: "quest",
  slot: "none",
  stats: {},
  visual: { form: "amulet", material: "wood", tint: "#3a2416" },
  value: 0,
  stackMax: 1,
  desc: "주지의 염주.",
});

export const STARTER_WEAPON: Record<string, string> = {
  musa: "sword_rusty",
  gungsoo: "bow_oak",
  dosa: "tal_paper",
  uiwon: "staff_oak",
  dojeok: "dagger_iron",
  gibyeong: "spear_wood",
};

export const STARTER_CHEST = "chest_hanbok";
export const STARTER_BOOTS = "boots_straw";

export const SHOP_LIST = [
  "hp_small",
  "hp_mid",
  "mp_small",
  "mp_mid",
  "mix",
  "antidote",
  "sword_ring",
  "spear_iron",
  "bow_horn",
  "dagger_shadow",
  "tal_red",
  "staff_jade",
  "chest_silk",
  "chest_leather",
  "helm_iron",
  "boots_leather",
  "acc_norigae",
  "acc_tal",
];

export function itemById(id: string): ItemRecipe | undefined {
  return ITEMS[id];
}
