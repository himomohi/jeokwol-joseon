export type JobId =
  | "musa"
  | "gungsoo"
  | "gungsa"
  | "dosa"
  | "uiwon"
  | "dojeok"
  | "gibyeong"
  | "seungbyeong"
  | "geomgaek"
  | "changbyeong"
  | "singung"
  | "hwasal"
  | "singijeonsu"
  | "baekbal"
  | "sulsa"
  | "bujeoksa"
  | "cheonmunsa"
  | "bujuksulsa"
  | "myeongui"
  | "dokgong"
  | "chimuisa"
  | "yaksa"
  | "jagaek"
  | "dogul"
  | "heugui"
  | "dokgaek"
  | "gichang"
  | "magung"
  | "geumgangseung"
  | "yeomhwaseung";

export type BaseJobId = "musa" | "gungsoo" | "gungsa" | "dosa" | "uiwon" | "dojeok" | "gibyeong" | "seungbyeong";

export type EquipSlot = "weapon" | "helm" | "chest" | "legs" | "boots" | "accessory";

export type WeaponType = "sword" | "spear" | "bow" | "dagger" | "talisman" | "staff";

export type AiRole = "meleeChase" | "flank" | "charge" | "rangedKite" | "groundSlam" | "patrol";

export type Grade = "ha" | "jung" | "sang";

export type BiomeId =
  | "hanyang"
  | "mountain"
  | "bamboo"
  | "riverside"
  | "swamp"
  | "snow"
  | "haunted"
  | "road"
  | "village"
  | "hanseong_alley"
  | "jirisan_forest"
  | "ghost_palace"
  | "west_coast_mudflat"
  | "northern_frontier"
  | "jeju_lava_field"
  | "shaman_marsh"
  | "thunder_ridge";

export type SkillKind =
  | "slash"
  | "dash"
  | "cone"
  | "circle"
  | "projectile"
  | "groundAoe"
  | "ground"
  | "buff"
  | "chain"
  | "heal"
  | "dot";

export interface Stats {
  atk: number;
  def: number;
  maxHp: number;
  maxMp: number;
  spd: number;
  crit: number;
  haste: number;
  luck: number;
}

export interface ItemVisual {
  form: string;
  material: string;
  tint: string;
}

export interface ItemRecipe {
  id: string;
  name: string;
  kind: "weapon" | "armor" | "consumable" | "quest" | "misc";
  slot: EquipSlot | "consumable" | "none";
  weaponType?: WeaponType;
  stats: Partial<Stats>;
  visual: ItemVisual;
  value: number;
  stackMax: number;
  heal?: number;
  mp?: number;
  desc: string;
  reqJob?: JobId[];
  reqLevel?: number;
}

export type JointId =
  | "hip"
  | "torso"
  | "head"
  | "hat"
  | "armL"
  | "armR"
  | "handL"
  | "handR"
  | "legL"
  | "legR"
  | "weapon"
  | "offhand"
  | "tail"
  | "extra";

export interface JointPose {
  x: number;
  y: number;
  rot: number;
  scale?: number;
}

export interface CharacterPose {
  id: string;
  duration: number;
  joints: Partial<Record<JointId, JointPose>>;
}

export interface PropDefinition {
  id: string;
  name: string;
  biomes: BiomeId[];
  w: number;
  h: number;
  radius: number;
  solid: boolean;
  roof: boolean;
  layer: "ground" | "prop" | "roof";
  art: string;
}

export type Command =
  | { type: "newGame"; name: string; job: BaseJobId; slot: number; seed?: number }
  | { type: "load"; slot: number }
  | { type: "save"; slot: number }
  | { type: "move"; ax: number; ay: number }
  | { type: "aim"; x: number; y: number }
  | { type: "attack" }
  | { type: "useSkill"; slot: number }
  | { type: "pickupNearest" }
  | { type: "equip"; instId: string }
  | { type: "unequip"; slot: EquipSlot }
  | { type: "useItem"; instId: string }
  | { type: "dropItem"; instId: string }
  | { type: "talk"; npcId: string }
  | { type: "buy"; itemId: string }
  | { type: "sell"; instId: string }
  | { type: "advanceJob"; jobId: JobId }
  | { type: "assignSkill"; barSlot: number; skillId: string }
  | { type: "rest" }
  | { type: "togglePause" }
  | { type: "setPost"; on: boolean }
  | { type: "dismissTalk" };

export type SimEvent =
  | { type: "boot" }
  | { type: "damaged"; id: string; amount: number; src: string; crit: boolean; x: number; y: number }
  | { type: "killed"; id: string; defId: string; x: number; y: number; xp: number }
  | { type: "lootDropped"; items: { itemId: string; qty: number }[]; x: number; y: number }
  | { type: "pickedUp"; itemId: string; qty: number }
  | { type: "equipped"; itemId: string; slot: EquipSlot }
  | { type: "xpGained"; amount: number }
  | { type: "leveledUp"; level: number }
  | { type: "jobAdvanced"; job: JobId }
  | { type: "saved"; slot: number; ok: boolean; reason?: string }
  | { type: "loaded"; slot: number; ok: boolean; reason?: string }
  | { type: "talk"; npcId: string; text: string }
  | { type: "message"; text: string; kind: "info" | "warn" | "loot" | "skill" }
  | { type: "skillUsed"; skillId: string }
  | { type: "webglLost" }
  | { type: "webglRestored" }
  | { type: "ending" };

export interface ItemInstance {
  instId: string;
  itemId: string;
  qty: number;
}

export interface Buff {
  id: string;
  name: string;
  until: number;
  stats: Partial<Stats>;
  dot?: number;
  tag?: string;
}
