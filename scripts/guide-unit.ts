import { reviewContent } from "../src/review/verify";
import { ATTACK_DUR, project3, sampleWeaponTip, solveElbow, solveRig } from "../src/art/rig";
import { weaponTipOffset } from "../src/art/forms";
import { biomeWeights, groundTint, propForBiome } from "../src/world/map";
import { createEmptySim, handleCommand, step } from "../src/world/sim";
import { POI } from "../src/content/world";
import { fieldMix, tentSiteAllowed } from "../src/world/placement";

const r = reviewContent();
if (!r.ok) throw new Error(r.notes.join(", "));

const degenerate = solveElbow(
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
  6,
  5,
  1,
);
if (![degenerate.x, degenerate.y, degenerate.z].every(Number.isFinite)) throw new Error("coincident IK NaN");

const p = project3({ x: 1e20, y: -1e20, z: 3 });
if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) throw new Error("huge project");

const tips = [0, 0.2, 0.45, 0.7, 1].map((t) =>
  sampleWeaponTip(0, 0, 0, false, 0, t, "sword"),
);
const span = Math.hypot(tips[4]!.x - tips[0]!.x, tips[4]!.y - tips[0]!.y);
if (span < 8) throw new Error(`attack tip span ${span} too small`);
if (weaponTipOffset("sword").y < 20) throw new Error("sword tip short");
if (ATTACK_DUR !== 0.22) throw new Error("attack dur drift");

const idle = solveRig({ moving: false, walkPhase: 0, attackT: 0, weaponForm: "bow" });
const walkA = solveRig({ moving: true, walkPhase: 0.25, attackT: 0, weaponForm: "bow" });
const walkB = solveRig({ moving: true, walkPhase: 0.75, attackT: 0, weaponForm: "bow" });
if (Math.hypot(walkA.weaponTip.x - walkB.weaponTip.x, walkA.weaponTip.y - walkB.weaponTip.y) < 1.5) {
  throw new Error("walk cycle tip stuck");
}
if (walkA.hip.x * walkB.hip.x >= 0) throw new Error("weight shift missing");
if (Math.hypot(walkA.torso.x - idle.torso.x, walkA.torso.y - idle.torso.y) < 0.4) {
  throw new Error("walk torso stuck");
}

const w = biomeWeights(1, POI.swamp.x, POI.swamp.y);
if (Math.abs(w.reduce((s, b) => s + b.w, 0) - 1) > 0.02) throw new Error("weights");
const g1 = groundTint(7, 40, 40);
const g2 = groundTint(7, 40.3, 40.2);
if (g1 !== g2 && groundTint(7, 2000, 2000) === g1 && groundTint(7, 40, 40) !== g1) throw new Error("tint broken");

const sim = createEmptySim();
handleCommand(sim, { type: "newGame", name: "리그", job: "musa", slot: 0, seed: 2 });
sim.mode = "play";
sim.player.x = POI.village.x + 40;
sim.player.y = POI.village.y;
handleCommand(sim, { type: "aim", x: sim.player.x + 80, y: sim.player.y });
handleCommand(sim, { type: "attack" });
const id1 = sim.player.attackId;
for (let i = 0; i < 40; i++) step(sim, 1 / 120);
sim.skillCd = {};
sim.player.mp = 99;
handleCommand(sim, { type: "attack" });
const id2 = sim.player.attackId;
for (let i = 0; i < 20; i++) step(sim, 1 / 120);
if (id1 === id2) throw new Error("attack id not separated");
if (!sim.trails.some((t) => t.attackId === id1) && !sim.trails.some((t) => t.attackId === id2)) {
  throw new Error("no attack-separated trail samples");
}
const ids = new Set(sim.trails.map((t) => t.attackId));
if (ids.size < 1) throw new Error("trail groups empty");

if (propForBiome("road").some((p) => p.id === "tent")) throw new Error("road field mix still has tents");
if (!fieldMix("hanyang").some((p) => p.art === "pine") || !fieldMix("hanyang").some((p) => p.art === "bamboo")) {
  throw new Error("suburb mix missing pine+bamboo");
}
if (!fieldMix("swamp").some((p) => p.art === "reed") || !fieldMix("swamp").some((p) => p.art === "deadtree")) {
  throw new Error("swamp mix missing reed+deadtree");
}
if (tentSiteAllowed(80, 40)) throw new Error("start plaza allowed a tent");
if (!tentSiteAllowed(2460, 36)) throw new Error("east-gate tent rejected");

console.log("GUIDE-UNIT OK", { span: span.toFixed(2), attacks: [id1, id2], trailIds: [...ids] });
