import { JOBS, BASE_JOBS, skillsForJob, tooltipFor, SKILLS, advJobsOf } from "../content/jobs";
import { SHOP_LIST, itemById } from "../content/items";
import { NPCS, POI, BIOMES } from "../content/world";
import type { BaseJobId, JobId } from "../core/types";
import { TILE } from "../core/coords";
import type { Sim } from "../world/sim";
import { handleCommand, liveStats, nearestNpc, xpNeed } from "../world/sim";
import { slotInfo } from "../persistence/save";
import { iconSvg } from "../art/icons";
import { biomeAt } from "../world/map";
import { reviewContent } from "../review/verify";
import { PAL, snapEnv } from "../art/palette";

export type Panel = "none" | "inv" | "skills" | "map" | "char" | "pause" | "help";

export interface UiState {
  panel: Panel;
  name: string;
  job: BaseJobId;
  slot: number;
}

export function mountUi(root: HTMLElement): void {
  root.innerHTML = `<div id="hud" hidden></div><div id="overlay"></div>`;
}

export function createUiState(): UiState {
  return { panel: "none", name: "나그네", job: "musa", slot: 0 };
}

export function renderUi(root: HTMLElement, sim: Sim, ui: UiState, extra: { fps: number; fpsSim: number; post: boolean; webglLost: boolean }): void {
  const overlay = root.querySelector("#overlay")!;
  const hud = root.querySelector("#hud") as HTMLElement;

  if (sim.mode === "title") {
    hud.hidden = true;
    overlay.innerHTML = titleHtml(ui, sim.saveHint);
    bindTitle(overlay, sim, ui);
    return;
  }

  if (sim.mode === "ending") {
    hud.hidden = true;
    overlay.innerHTML = `<div class="overlay"><div class="card"><h1>적월이 갈라지다</h1>
      <p>원혼대승을 잠재우고 균열을 밟았다. 핏빛 달이 한 조각 떨어진다. 행적은 기록할 수 있다.</p>
      <div class="row"><button data-save>저장</button><button data-title>표지로</button></div>
      <p>${sim.saveHint ?? ""}</p></div></div>`;
    overlay.querySelector("[data-save]")?.addEventListener("click", () => doSave(sim));
    overlay.querySelector("[data-title]")?.addEventListener("click", () => {
      sim.mode = "title";
      sim.paused = false;
    });
    return;
  }

  hud.hidden = false;
  overlay.innerHTML = "";
  hud.innerHTML = hudHtml(sim, extra);
  bindHud(hud, sim);

  if (sim.talk) {
    const n = NPCS.find((x) => x.id === sim.talk!.npcId);
    const d = document.createElement("div");
    d.className = "dialog";
    d.innerHTML = `<div class="who">${n?.name ?? ""}</div><div>${escapeHtml(sim.talk.text)}</div>` +
      (sim.shopOpen ? shopHtml(sim) : "") +
      (sim.talk.choices?.map((c) => `<button data-adv="${c.job}">${c.label}</button>`).join("") ?? "") +
      `<div class="row"><button data-close>닫기</button></div>`;
    hud.appendChild(d);
    d.querySelector("[data-close]")?.addEventListener("click", () => handleCommand(sim, { type: "dismissTalk" }));
    d.querySelectorAll("[data-adv]").forEach((b) =>
      b.addEventListener("click", () => handleCommand(sim, { type: "advanceJob", jobId: (b as HTMLElement).dataset.adv as JobId })),
    );
    d.querySelectorAll("[data-buy]").forEach((b) =>
      b.addEventListener("click", () => handleCommand(sim, { type: "buy", itemId: (b as HTMLElement).dataset.buy! })),
    );
    d.querySelectorAll("[data-sell]").forEach((b) =>
      b.addEventListener("click", () => handleCommand(sim, { type: "sell", instId: (b as HTMLElement).dataset.sell! })),
    );
  }

  if (ui.panel !== "none") {
    const sheet = document.createElement("div");
    sheet.className = "sheet";
    sheet.innerHTML = panelHtml(sim, ui.panel);
    hud.appendChild(sheet);
    bindPanel(sheet, sim, ui);
  }

  if (sim.paused && ui.panel === "none") {
    overlay.innerHTML = `<div class="overlay"><div class="card"><h1>멈춤</h1><p>적월이 잠시 멈췄다.</p>
      <div class="row"><button data-resume>이어하기</button><button data-save>저장</button><button data-title>표지로</button></div>
      <p>${sim.saveHint ?? ""}</p></div></div>`;
    overlay.querySelector("[data-resume]")?.addEventListener("click", () => {
      sim.paused = false;
    });
    overlay.querySelector("[data-save]")?.addEventListener("click", () => doSave(sim));
    overlay.querySelector("[data-title]")?.addEventListener("click", () => {
      sim.mode = "title";
      sim.paused = false;
    });
  }

  if (sim.mode === "dead") {
    overlay.innerHTML = `<div class="overlay"><div class="card"><h1>적월에 잠기다</h1>
      <p>숨이 끊겼다. 거점에서 다시 눈을 뜰 수 있다.</p>
      <div class="row"><button data-rest>거점에서 일어난다</button></div></div></div>`;
    overlay.querySelector("[data-rest]")?.addEventListener("click", () => handleCommand(sim, { type: "rest" }));
  }

}

function titleHtml(ui: UiState, hint?: string): string {
  const jobs = BASE_JOBS.map((id) => `<button data-job="${id}" class="${ui.job === id ? "" : "ghost"}">${JOBS[id].name}</button>`).join("");
  const slots = [0, 1, 2].map((s) => `<button data-slot="${s}" class="${ui.slot === s ? "" : "ghost"}">${s + 1} · ${slotInfo(s)}</button>`).join("");
  const r = reviewContent();
  return `<div class="overlay"><div class="card">
    <h1>적월조선</h1>
    <h2>핏빛 달이 조선을 덮던 해</h2>
    <p>무명촌에서 동녘 벼밭으로 나선다. 돌담 고갯길을 넘어 산적두목을 베고 한성 외곽에 이른다. 한성에서 길을 묻고, 스무 급에 교관의 자리를 밟아 전직하라. 늪의 독, 설산의 한기, 폐사의 원혼이 길을 막는다. 세계는 리셋되지 않는다.</p>
    <div class="row"><input id="nm" value="${ui.name}" maxlength="8" placeholder="이름"/></div>
    <div class="row">${jobs}</div>
    <p>${JOBS[ui.job].desc}</p>
    <div class="row">${slots}</div>
    <div class="row"><button data-new>새 행적</button><button data-load>불러오기</button></div>
    <p style="font-size:12px">WASD 이동 · 마우스 조준 · 클릭/J 공격 · 1–8 초식 · E 대화 · F 줍기 · I 행낭 · K 초식 · M 지도 · Esc 멈춤 · P 후처리</p>
    <p style="font-size:11px;color:var(--muted)">직 ${r.jobs} · 전직 ${r.adv} · 전직당 최소 초식 ${r.skillsPerAdvMin} · 초식 ${r.skills} · 적 ${r.enemies} · 보스 ${r.bosses} · 물산 ${r.items}${r.ok ? "" : " · " + r.notes.join(", ")}</p>
    ${hint ? `<p>${hint}</p>` : ""}
  </div></div>`;
}

function bindTitle(el: Element, sim: Sim, ui: UiState): void {
  el.querySelector("#nm")?.addEventListener("input", (e) => {
    ui.name = (e.target as HTMLInputElement).value;
  });
  el.querySelectorAll("[data-job]").forEach((b) =>
    b.addEventListener("click", () => {
      ui.job = (b as HTMLElement).dataset.job as BaseJobId;
    }),
  );
  el.querySelectorAll("[data-slot]").forEach((b) =>
    b.addEventListener("click", () => {
      ui.slot = Number((b as HTMLElement).dataset.slot);
    }),
  );
  el.querySelector("[data-new]")?.addEventListener("click", () => {
    handleCommand(sim, { type: "newGame", name: ui.name, job: ui.job, slot: ui.slot });
  });
  el.querySelector("[data-load]")?.addEventListener("click", () => {
    handleCommand(sim, { type: "load", slot: ui.slot });
  });
}

function hudHtml(sim: Sim, extra: { fps: number; fpsSim: number; post: boolean; webglLost: boolean }): string {
  const st = liveStats(sim);
  const hp = Math.max(0, sim.player.hp);
  const job = JOBS[sim.meta.job];
  const npc = nearestNpc(sim);
  const slots = sim.meta.bar
    .map((id, i) => {
      const s = id ? SKILLS[id] : null;
      const cd = id ? Math.max(0, (sim.skillCd[id] ?? 0) - sim.time) : 0;
      return `<div class="slot"><kbd>${i + 1}</kbd><span>${s ? s.name.slice(0, 3) : "—"}</span>${cd > 0 ? `<div class="cd">${cd.toFixed(1)}</div>` : ""}</div>`;
    })
    .join("");
  return `<div class="hud-top">
    <div class="bars">
      <div class="name-row"><b>${escapeHtml(sim.meta.name)}</b> <span>${job.name}</span> <span>${sim.meta.level}급</span> <span>엽전 ${sim.meta.gold}</span></div>
      <div class="bar hp"><span style="width:${(hp / st.maxHp) * 100}%"></span><em>${Math.ceil(hp)}/${Math.ceil(st.maxHp)}</em></div>
      <div class="bar mp"><span style="width:${(sim.player.mp / st.maxMp) * 100}%"></span><em>${Math.ceil(sim.player.mp)}/${Math.ceil(st.maxMp)}</em></div>
      <div class="bar xp"><span style="width:${(sim.meta.xp / xpNeed(sim.meta.level)) * 100}%"></span><em>공 ${st.atk.toFixed(0)} 방 ${st.def.toFixed(0)}</em></div>
    </div>
    <canvas class="minimap" id="mini" width="128" height="128"></canvas>
  </div>
  ${extra.webglLost ? `<div class="narrow-warn">화면 후처리가 끊겼다. 캔버스로 그린다.</div>` : ""}
  <div class="skillbar">${slots}</div>
  <div class="hint">${npc ? `[E] ${npc.name}에게 말을 건넨다` : "동녘 벼밭으로 나가 싸우고, 한성에서 교관을 찾는다. I 행낭 K 초식 M 지도 Esc 멈춤"} · ${BIOMES[biomeAt(sim.seed, sim.player.x, sim.player.y)].name}${sim.meta.level >= 20 ? " · 전직 급수" : ""}${extra.post ? "" : " · 후처리 끔"} · ${extra.fps.toFixed(0)}fps</div>
  <div class="messages">${sim.messages.slice(-5).map((m) => `<div>${escapeHtml(m.text)}</div>`).join("")}</div>`;
}

function shopHtml(sim: Sim): string {
  return `<div class="grid" style="margin-top:8px">${SHOP_LIST.map((id) => {
    const it = itemById(id)!;
    return `<button data-buy="${id}">${it.name} · ${it.value}엽전</button>`;
  }).join("")}</div>
  <div class="grid">${sim.meta.inventory.map((i) => `<button data-sell="${i.instId}">${itemById(i.itemId)?.name} 팔기</button>`).join("")}</div>`;
}

function panelHtml(sim: Sim, panel: Panel): string {
  if (panel === "inv") {
    return `<h2>행낭</h2><div class="grid">${sim.meta.inventory
      .map((i) => {
        const it = itemById(i.itemId);
        const eq = Object.values(sim.meta.equip).includes(i.instId);
        return `<div class="item ${eq ? "on" : ""}" data-inst="${i.instId}">
          <div>${iconSvg(i.itemId)}</div>
          <b>${it?.name ?? i.itemId}</b> ×${i.qty}${eq ? " · 착용" : ""}
          <div class="sub">${it?.desc ?? ""}</div>
        </div>`;
      })
      .join("")}</div>
      <p>클릭: 착용/사용 · 우클릭: 버리기</p>`;
  }
  if (panel === "skills") {
    const list = skillsForJob(sim.meta.job);
    return `<h2>초식</h2><div class="grid">${list
      .map((s, idx) => `<div class="item" data-skill="${s.id}"><b>${s.name}</b><div class="sub">${escapeHtml(tooltipFor(s))}</div><div>단축 ${idx < 8 ? idx + 1 : "-"}</div></div>`)
      .join("")}</div>
      <p>클릭하면 단축키 칸에 넣는다. 숫자는 위에서부터 채워진다.</p>`;
  }
  if (panel === "char") {
    const st = liveStats(sim);
    const adv = advJobsOf(JOBS[sim.meta.job].base);
    return `<h2>몸가짐</h2>
      <p>${sim.meta.name} · ${JOBS[sim.meta.job].name} · ${sim.meta.level}급</p>
      <p>공 ${st.atk.toFixed(1)} · 방 ${st.def.toFixed(1)} · 체 ${st.maxHp.toFixed(0)} · 마 ${st.maxMp.toFixed(0)} · 속 ${st.spd.toFixed(0)} · 치명 ${(st.crit * 100).toFixed(0)}% · 행운 ${st.luck.toFixed(0)}</p>
      <p>전직: ${adv.map((j) => `${j.name} (${j.reqLevel}급${j.reqFlag && !sim.meta.flags[j.reqFlag] ? ", 교관 표식" : j.reqFlag ? ", 표식 있음" : ""})`).join(" · ")}</p>
      <p>표식: ${Object.keys(sim.meta.flags).filter((k) => sim.meta.flags[k]).join(", ") || "없음"}</p>`;
  }
  if (panel === "map") {
    return `<h2>행적도</h2><canvas class="map-canvas" id="bigmap" width="640" height="400"></canvas><p>무명촌에서 한성으로 이어진 한 줄기 길. 밝힌 땅만 보인다.</p>`;
  }
  if (panel === "help") {
    return `<h2>조작</h2><p>WASD/방향키 이동 · 마우스 조준 · 좌클릭 또는 J 기본 공격 · 1–8 초식 · E 대화 · F 줍기 · R 거점 휴식 · I 행낭 · K 초식 · M 지도 · C 몸 · Esc 멈춤 · P 후처리 끄기</p>
    <p>저장은 멈춤 메뉴 또는 거점 휴식 시 시도한다. 로컬 세 자리.</p>`;
  }
  return `<h2>멈춤</h2>`;
}

function bindHud(hud: HTMLElement, sim: Sim): void {
  drawMini(hud.querySelector("#mini") as HTMLCanvasElement | null, sim);
  hud.querySelectorAll("[data-sell]").forEach((b) =>
    b.addEventListener("click", () => handleCommand(sim, { type: "sell", instId: (b as HTMLElement).dataset.sell! })),
  );
}

function bindPanel(sheet: HTMLElement, sim: Sim, ui: UiState): void {
  sheet.querySelectorAll("[data-inst]").forEach((el) => {
    el.addEventListener("click", () => handleCommand(sim, { type: "equip", instId: (el as HTMLElement).dataset.inst! }));
    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      handleCommand(sim, { type: "dropItem", instId: (el as HTMLElement).dataset.inst! });
    });
  });
  sheet.querySelectorAll("[data-skill]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = (el as HTMLElement).dataset.skill!;
      const empty = sim.meta.bar.findIndex((x) => !x);
      const slot = empty >= 0 ? empty : 0;
      handleCommand(sim, { type: "assignSkill", barSlot: slot, skillId: id });
    });
  });
  const big = sheet.querySelector("#bigmap") as HTMLCanvasElement | null;
  if (big) drawBigMap(big, sim);
  void ui;
}

function drawMini(c: HTMLCanvasElement | null, sim: Sim): void {
  if (!c) return;
  const ctx = c.getContext("2d");
  if (!ctx) return;
  const s = 6;
  ctx.fillStyle = PAL.bg_void;
  ctx.fillRect(0, 0, 128, 128);
  const ox = sim.player.x - 64 * s;
  const oy = sim.player.y - 64 * s;
  for (let y = 0; y < 128; y += 4) {
    for (let x = 0; x < 128; x += 4) {
      const wx = ox + x * s;
      const wy = oy + y * s;
      const tx = Math.floor(wx / TILE);
      const ty = Math.floor(wy / TILE);
      if (!sim.fog[`${tx}:${ty}`]) continue;
      ctx.fillStyle = snapEnv(BIOMES[biomeAt(sim.seed, wx, wy)].grass);
      ctx.fillRect(x, y, 4, 4);
    }
  }
  ctx.fillStyle = PAL.bone_light;
  ctx.fillRect(62, 62, 4, 4);
}

function drawBigMap(c: HTMLCanvasElement, sim: Sim): void {
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = PAL.bg_void;
  ctx.fillRect(0, 0, c.width, c.height);
  const scale = 8;
  const ox = sim.player.x - (c.width / 2) * scale;
  const oy = sim.player.y - (c.height / 2) * scale;
  for (let y = 0; y < c.height; y += 3) {
    for (let x = 0; x < c.width; x += 3) {
      const wx = ox + x * scale;
      const wy = oy + y * scale;
      const tx = Math.floor(wx / TILE);
      const ty = Math.floor(wy / TILE);
      if (!sim.fog[`${tx}:${ty}`]) continue;
      ctx.fillStyle = snapEnv(BIOMES[biomeAt(sim.seed, wx, wy)].grass);
      ctx.fillRect(x, y, 3, 3);
    }
  }
  ctx.fillStyle = PAL.bone_light;
  ctx.fillRect(c.width / 2 - 2, c.height / 2 - 2, 4, 4);
  ctx.fillStyle = PAL.torch_warm;
  ctx.font = "12px serif";
  for (const p of Object.values(POI)) {
    const x = (p.x - ox) / scale;
    const y = (p.y - oy) / scale;
    ctx.fillText(p.name, x, y);
  }
}

function doSave(sim: Sim): void {
  handleCommand(sim, { type: "save", slot: sim.slot });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c);
}

export { doSave };
