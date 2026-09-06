export class AudioBus {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  muted = false;
  started = false;

  async unlock(): Promise<void> {
    if (this.started) return;
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return;
    this.ctx = new C();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.22;
    this.master.connect(this.ctx.destination);
    this.started = true;
    this.drone();
  }

  private osc(type: OscillatorType, freq: number, dur: number, gain = 0.2): void {
    if (!this.ctx || !this.master || this.muted) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    o.connect(g);
    g.connect(this.master!);
    o.start();
    o.stop(this.ctx.currentTime + dur);
  }

  sfx(kind: string): void {
    if (kind === "hit") this.osc("square", 180, 0.08, 0.12);
    else if (kind === "kill") this.osc("sawtooth", 90, 0.2, 0.16);
    else if (kind === "loot") this.osc("triangle", 520, 0.12, 0.1);
    else if (kind === "skill") this.osc("sawtooth", 240, 0.1, 0.14);
    else if (kind === "level") {
      this.osc("triangle", 440, 0.15, 0.12);
      this.osc("triangle", 660, 0.2, 0.1);
    } else if (kind === "ui") this.osc("sine", 320, 0.05, 0.08);
  }

  private drone(): void {
    if (!this.ctx || !this.master) return;
    const pent = [110, 123, 146, 165, 196];
    for (let i = 0; i < 3; i++) {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = "sine";
      o.frequency.value = pent[i]!;
      g.gain.value = 0.03;
      o.connect(g);
      g.connect(this.master!);
      o.start();
    }
  }
}
