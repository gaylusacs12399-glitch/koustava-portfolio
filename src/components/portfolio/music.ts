/**
 * Tiny generative "lo-fi" engine (Web Audio). No audio files — the mix is
 * synthesized live, so it ships zero bytes of media and works offline.
 * A track is a tempo + chord loop dressed with a soft beat and vinyl crackle.
 */

export type Track = { name: string; bpm: number; chords: number[][] };

export const tracks: Track[] = [
  { name: "Lo-fi for shipping", bpm: 76, chords: [[0, 4, 7, 11], [-2, 2, 5, 9], [-4, 0, 3, 7], [-5, -1, 2, 6]] },
  { name: "Midnight focus", bpm: 66, chords: [[-3, 1, 4, 8], [-5, -1, 2, 5], [-7, -3, 0, 4], [-1, 2, 5, 9]] },
  { name: "Rainy Bangalore", bpm: 84, chords: [[0, 3, 7, 10], [2, 5, 9, 12], [-3, 0, 4, 7], [-1, 2, 6, 9]] },
];

const hz = (semi: number) => 110 * Math.pow(2, semi / 12);

export class LoFiEngine {
  readonly name: string;
  private track: Track;
  private ctx: AudioContext | null = null;
  private bus: BiquadFilterNode | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private timer: number | null = null;
  private step = 0;
  private next = 0;
  playing = false;

  constructor(track: Track) {
    this.name = track.name;
    this.track = track;
  }

  async start() {
    if (!this.ctx) this.build();
    const ctx = this.ctx!;
    await ctx.resume();
    this.playing = true;
    this.next = ctx.currentTime + 0.08;
    this.timer = window.setInterval(() => this.pump(), 120);
  }

  stop() {
    this.playing = false;
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.ctx?.suspend();
  }

  dispose() {
    this.stop();
    this.ctx?.close();
  }

  private build() {
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    const bus = ctx.createBiquadFilter();
    bus.type = "lowpass";
    bus.frequency.value = 2800;
    bus.connect(master);
    master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 1.5);

    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    this.ctx = ctx;
    this.master = master;
    this.bus = bus;
    this.noise = noise;
  }

  private pump() {
    const ctx = this.ctx;
    if (!ctx) return;
    const dt = 30 / this.track.bpm; // eighth note
    while (this.next < ctx.currentTime + 0.5) {
      this.tick(this.next, this.step);
      this.step++;
      this.next += dt;
    }
  }

  private tick(t: number, step: number) {
    const ctx = this.ctx!;
    const chord = this.track.chords[Math.floor(step / 16) % this.track.chords.length]!;

    // pad — new chord every 2 bars
    if (step % 16 === 0) {
      const dur = (60 / this.track.bpm) * 8;
      chord.forEach((semi, i) => {
        for (const [type, detune, g] of [["sine", 0, 0.05], ["triangle", 6, 0.028]] as const) {
          const o = ctx.createOscillator();
          o.type = type;
          o.frequency.value = hz(semi);
          o.detune.value = detune;
          const env = ctx.createGain();
          env.gain.setValueAtTime(0, t);
          env.gain.linearRampToValueAtTime(g, t + 0.6);
          env.gain.setValueAtTime(g, t + dur - 0.8);
          env.gain.linearRampToValueAtTime(0, t + dur);
          o.connect(env).connect(this.bus!);
          o.start(t + i * 0.03);
          o.stop(t + dur + 0.1);
        }
      });
    }

    // bass
    if (step % 8 === 0) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = hz(chord[0]!);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.22, t + 0.05);
      env.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
      o.connect(env).connect(this.bus!);
      o.start(t);
      o.stop(t + 1.7);
    }

    // kick
    if (step % 8 === 0) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.5, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(env).connect(this.bus!);
      o.start(t);
      o.stop(t + 0.25);
    }

    // snare-ish brush
    if (step % 16 === 4) this.noiseHit(t, 1800, "bandpass", 0.1, 0.09);

    // hat
    if (step % 2 === 1) this.noiseHit(t, 7000, "highpass", 0.04, 0.03);

    // vinyl crackle
    if (Math.random() < 0.3) this.noiseHit(t + Math.random() * 0.2, 4000, "bandpass", 0.02, 0.015);
  }

  private noiseHit(t: number, freq: number, type: BiquadFilterType, g: number, decay: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise!;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const env = ctx.createGain();
    env.gain.setValueAtTime(g, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + decay);
    src.connect(f).connect(env).connect(this.bus!);
    src.start(t);
    src.stop(t + decay + 0.05);
  }

}
