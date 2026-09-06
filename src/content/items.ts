import type { ItemRecipe, JobId, WeaponType } from "../core/types";
import { PAL } from "../art/palette";

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
const spearJobs: JobId[] = ["musa", "changbyeong", "gibyeong", "gichang", "seungbyeong", "geumgangseung"];
const bowJobs: JobId[] = ["gungsoo", "gungsa", "singung", "hwasal", "baekbal", "singijeonsu", "gibyeong", "magung", "yeomhwaseung"];
const daggerJobs: JobId[] = ["dojeok", "jagaek", "dogul", "heugui", "dokgaek"];
const talJobs: JobId[] = ["dosa", "bujeoksa", "sulsa", "cheonmunsa", "bujuksulsa"];
const staffJobs: JobId[] = ["dosa", "sulsa", "uiwon", "myeongui", "dokgong", "chimuisa", "yaksa", "cheonmunsa"];

export const ITEMS: Record<string, ItemRecipe> = {};

function put(it: ItemRecipe): void {
  ITEMS[it.id] = it;
}

put(w("sword_rusty", "녹슨 환도", "sword", 6, 12, "sword", "iron", PAL.earth_dark, { reqJob: swordJobs }));
put(w("sword_ring", "환도", "sword", 11, 40, "sword", "iron", PAL.ui_steel, { reqJob: swordJobs, reqLevel: 3 }));
put(w("sword_moon", "월광환도", "sword", 18, 160, "sword", "steel", PAL.bone_light, { reqJob: ["geomgaek"], reqLevel: 8, stats: { crit: 0.05 } }));
put(w("sword_blood", "적월환도", "sword", 24, 420, "sword", "bloodsteel", PAL.blood_main, { reqJob: ["geomgaek"], reqLevel: 12, stats: { crit: 0.08 } }));
put(w("spear_wood", "목창", "spear", 7, 14, "spear", "wood", PAL.earth_dark, { reqJob: spearJobs }));
put(w("spear_iron", "철창", "spear", 13, 50, "spear", "iron", PAL.ui_steel, { reqJob: spearJobs, reqLevel: 3 }));
put(w("spear_sky", "청룡창", "spear", 20, 180, "spear", "steel", PAL.env_cool, { reqJob: ["changbyeong", "gichang"], reqLevel: 8 }));
put(w("spear_blood", "혈룡창", "spear", 25, 400, "spear", "bloodsteel", PAL.blood_main, { reqJob: ["changbyeong", "gichang"], reqLevel: 12 }));
put(w("bow_oak", "각궁", "bow", 7, 16, "bow", "wood", PAL.earth_dark, { reqJob: bowJobs }));
put(w("bow_horn", "각궁·뿔", "bow", 13, 55, "bow", "horn", PAL.earth_mid, { reqJob: bowJobs, reqLevel: 3 }));
put(w("bow_hawk", "매의 각궁", "bow", 19, 190, "bow", "horn", PAL.metal_dark, { reqJob: ["singung", "magung"], reqLevel: 8, stats: { crit: 0.06 } }));
put(w("bow_fire", "화우궁", "bow", 22, 380, "bow", "lacquer", PAL.blood_mid, { reqJob: ["hwasal", "magung"], reqLevel: 8 }));
put(w("dagger_iron", "단도", "dagger", 6, 14, "dagger", "iron", PAL.ui_steel, { reqJob: daggerJobs }));
put(w("dagger_shadow", "암도", "dagger", 12, 60, "dagger", "steel", PAL.shadow_navy, { reqJob: daggerJobs, reqLevel: 3, stats: { crit: 0.06 } }));
put(w("dagger_kill", "자객비수", "dagger", 18, 200, "dagger", "bloodsteel", PAL.blood_deep, { reqJob: ["jagaek"], reqLevel: 8, stats: { crit: 0.1 } }));
put(w("dagger_tomb", "묘혈비수", "dagger", 16, 210, "dagger", "bone", PAL.bone_light, { reqJob: ["dogul"], reqLevel: 8, stats: { luck: 8 } }));
put(w("tal_paper", "부적첩", "talisman", 6, 18, "talisman", "paper", PAL.bone_light, { reqJob: talJobs }));
put(w("tal_red", "적부", "talisman", 12, 70, "talisman", "paper", PAL.blood_main, { reqJob: talJobs, reqLevel: 3 }));
put(w("tal_moon", "월부", "talisman", 18, 220, "talisman", "paper", PAL.blood_mid, { reqJob: ["bujeoksa", "sulsa"], reqLevel: 8, stats: { maxMp: 20 } }));
put(w("staff_oak", "목장", "staff", 5, 16, "staff", "wood", PAL.earth_dark, { reqJob: staffJobs }));
put(w("staff_jade", "옥장", "staff", 11, 80, "staff", "jade", PAL.moss_cool, { reqJob: staffJobs, reqLevel: 3, stats: { maxMp: 15 } }));
put(w("staff_lotus", "연화장", "staff", 15, 230, "staff", "jade", PAL.torch_warm, { reqJob: ["myeongui"], reqLevel: 8, stats: { maxHp: 30 } }));
put(w("staff_venom", "독사장", "staff", 17, 240, "staff", "bone", PAL.moss_cool, { reqJob: ["dokgong"], reqLevel: 8 }));

put(a("helm_gat", "흑립", "helm", { def: 3 }, 20, "gat", "horsehair", PAL.shadow_navy));
put(a("helm_jeonrip", "전립", "helm", { def: 4, spd: 4 }, 30, "jeonrip", "felt", PAL.earth_dark));
put(a("helm_songnak", "송낙", "helm", { def: 2, maxMp: 12 }, 28, "songnak", "silk", PAL.env_mid));
put(a("helm_iron", "투구", "helm", { def: 8 }, 80, "helm", "iron", PAL.ui_steel));
put(a("chest_hanbok", "무명 철릭", "chest", { def: 4, maxHp: 12 }, 24, "robe", "cotton", PAL.blood_deep));
put(a("chest_silk", "비단 철릭", "chest", { def: 7, maxHp: 22 }, 90, "robe", "silk", PAL.blood_mid));
put(a("chest_leather", "가죽갑", "chest", { def: 9, spd: 6 }, 100, "armor", "leather", PAL.earth_dark));
put(a("chest_scale", "미늘갑", "chest", { def: 14, maxHp: 28 }, 180, "armor", "steel", PAL.ui_steel));
put(a("chest_moon", "적월포", "chest", { def: 12, atk: 6, maxHp: 24 }, 320, "robe", "silk", PAL.blood_main));
put(a("legs_cloth", "무명 바지", "legs", { def: 2, spd: 4 }, 16, "pants", "cotton", PAL.earth_dark));
put(a("legs_leather", "가죽 각반", "legs", { def: 5, spd: 8 }, 70, "pants", "leather", PAL.earth_dark));
put(a("boots_straw", "짚신", "boots", { spd: 6 }, 8, "shoes", "straw", PAL.earth_mid));
put(a("boots_leather", "가죽화", "boots", { def: 3, spd: 10 }, 50, "shoes", "leather", PAL.earth_dark));
put(a("acc_norigae", "노리개", "accessory", { luck: 6 }, 40, "norigae", "jade", PAL.moss_cool));
put(a("acc_tal", "호신부", "accessory", { def: 4, maxMp: 10 }, 60, "talisman", "paper", PAL.bone_light));
put(a("acc_tiger", "호랑이 이빨", "accessory", { atk: 6, crit: 0.04 }, 140, "fang", "bone", PAL.bone_light));
put(a("acc_moon", "적월패", "accessory", { atk: 8, maxMp: 16 }, 280, "amulet", "bloodsteel", PAL.blood_main));

put(c("hp_small", "소형 환약", 40, 0, 8, "gourd", PAL.blood_mid));
put(c("hp_mid", "중형 환약", 90, 0, 22, "gourd", PAL.blood_main));
put(c("mp_small", "소형 영단", 0, 35, 10, "gourd", PAL.env_cool));
put(c("mp_mid", "중형 영단", 0, 80, 24, "gourd", PAL.env_cool));
put(c("mix", "쌍보환", 50, 40, 30, "gourd", PAL.torch_warm));
put(c("antidote", "해독환", 20, 0, 16, "gourd", PAL.moss_cool));

put({
  id: "gold_pouch",
  name: "엽전주머니",
  kind: "misc",
  slot: "none",
  stats: {},
  visual: { form: "pouch", material: "leather", tint: PAL.torch_warm },
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
  visual: { form: "fang", material: "bone", tint: PAL.blood_main },
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
  visual: { form: "amulet", material: "wood", tint: PAL.earth_dark },
  value: 0,
  stackMax: 1,
  desc: "주지의 염주.",
});

export const STARTER_WEAPON: Record<string, string> = {
  musa: "sword_rusty",
  gungsoo: "bow_oak",
  gungsa: "bow_oak",
  dosa: "tal_paper",
  uiwon: "staff_oak",
  dojeok: "dagger_iron",
  gibyeong: "spear_wood",
  seungbyeong: "spear_wood",
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
