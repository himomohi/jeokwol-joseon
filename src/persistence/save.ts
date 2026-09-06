import type { SaveBlob } from "../world/sim";

const PREFIX = "jeokwol.slot.";

export function saveSlot(slot: number, blob: SaveBlob): { ok: boolean; reason?: string } {
  try {
    const json = JSON.stringify(blob);
    if (json.length > 4_500_000) return { ok: false, reason: "기록이 너무 크다" };
    localStorage.setItem(PREFIX + slot, json);
    localStorage.setItem("jeokwol.last", String(slot));
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "저장 실패";
    return { ok: false, reason: msg.includes("Quota") ? "저장 공간이 가득 찼다" : "저장에 실패했다" };
  }
}

export function loadSlot(slot: number): { ok: true; blob: SaveBlob } | { ok: false; reason: string } {
  try {
    const raw = localStorage.getItem(PREFIX + slot);
    if (!raw) return { ok: false, reason: "빈 자리" };
    const blob = JSON.parse(raw) as SaveBlob;
    if (blob.v !== 1 || typeof blob.seed !== "number") return { ok: false, reason: "낡은 기록" };
    return { ok: true, blob };
  } catch {
    return { ok: false, reason: "기록을 읽을 수 없다" };
  }
}

export function slotInfo(slot: number): string {
  const r = loadSlot(slot);
  if (!r.ok) return "빈 자리";
  const m = r.blob.meta;
  return `${m.name} · ${m.level}급 · 엽전 ${m.gold}`;
}

export function lastSlot(): number {
  const v = Number(localStorage.getItem("jeokwol.last") ?? "0");
  return Number.isFinite(v) ? v : 0;
}
