import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { reviewContent } from "../src/review/verify";
import { ATTACK_DUR, project3, sampleWeaponTip, solveElbow, solveRig } from "../src/art/rig";
import { weaponTipOffset } from "../src/art/forms";
import { PNG_HINT_ALPHA } from "../src/art/cache";
import { biomeWeights, groundTint, propForBiome } from "../src/world/map";
import { createEmptySim, handleCommand, step } from "../src/world/sim";
import { POI } from "../src/content/world";
import { fieldMix, tentSiteAllowed } from "../src/world/placement";
import { assertCodegenBodyAlwaysOn, assertSolidHanok } from "../src/review/guide-checks";

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

if (PNG_HINT_ALPHA < 0.28 || PNG_HINT_ALPHA > 0.4) throw new Error("PNG hint alpha replaces codegen");
const actorsSrc = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../src/art/actors.ts"), "utf8");
const pngLaw = assertCodegenBodyAlwaysOn(actorsSrc);
if (pngLaw.length) throw new Error(pngLaw.join(", "));

const rejected = assertCodegenBodyAlwaysOn(`
export function drawEnemy(ctx, actor) {
  const sheet = pngOverlay(art);
  if (sheet) {
    blitPngOverlay(ctx, sheet, 0, false, 52);
  } else {
    const cached = cachedStatic(\`enemy:\${art}\`, 88, 88, (c) => drawEnemyArt(c, art));
    ctx.drawImage(cached, -44, -44, 88, 88);
  }
}
function drawEnemyArt() {}
export function drawPlayer() {
  const sheet = pngOverlay("player_musa");
  if (sheet) { blitPngOverlay(ctx, sheet); return; }
  const rig = rigOf(false, 0, 0, "sword");
}
function drawHorse() {}
`);
if (!rejected.some((n) => n.includes("대체") || n.includes("먼저") || n.includes("건너"))) {
  throw new Error("png-law assert missed the rejected if(sheet) skip");
}

const root = dirname(fileURLToPath(import.meta.url));
const hanokLaw = assertSolidHanok(
  readFileSync(join(root, "../src/art/worldArt.ts"), "utf8"),
  readFileSync(join(root, "../src/rendering/renderer.ts"), "utf8"),
);
if (hanokLaw.length) throw new Error(hanokLaw.join(", "));
const ghostRoofs = assertSolidHanok(
  `export function drawHanok() { paintHanokWalls(); }\nexport function drawHanokRoof() {}`,
  `for (const d of drawables) d.draw();\nfor (const c of chunks) { for (const r of c.roofs) drawRoof(ctx, r.x, r.y, r.w, r.h, r.alpha); }`,
);
if (!ghostRoofs.some((n) => n.includes("기와") || n.includes("떠 있는"))) {
  throw new Error("hanok-law assert missed walls-only + floating roof");
}

console.log("GUIDE-UNIT OK", { span: span.toFixed(2), attacks: [id1, id2], trailIds: [...ids], pngHint: PNG_HINT_ALPHA });
