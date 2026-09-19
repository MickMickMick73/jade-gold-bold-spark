import { loadSettings, type Settings } from "./save";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let unlocked = false;
let musicTimer: number | null = null;
let settings: Settings = loadSettings();

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C({ latencyHint: "interactive" });
    master = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    musicBus.connect(master);
    sfxBus.connect(master);
    master.connect(ctx.destination);
    applySettings(settings);
  }
  return ctx;
}

function ramp(g: GainNode, v: number) {
  if (!ctx) return;
  g.gain.setTargetAtTime(v, ctx.currentTime, 0.03);
}

export function applySettings(s: Settings) {
  settings = s;
  if (!master || !musicBus || !sfxBus) return;
  ramp(master, s.master * s.master);
  ramp(musicBus, s.music * s.music);
  ramp(sfxBus, s.sfx * s.sfx);
}

export function unlockAudio() {
  const c = ac();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  unlocked = true;
  startMusic();
}

export function resumeAudio() {
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

function envGain(bus: GainNode, attack: number, dur: number, peak = 0.2) {
  if (!ctx) return null;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  g.connect(bus);
  return g;
}

export function sfx(name: "build" | "cash" | "bell" | "break" | "click" | "whistle") {
  const c = ac();
  if (!c || !sfxBus || !unlocked) return;
  const now = c.currentTime;
  if (name === "click") {
    const o = c.createOscillator();
    o.type = "square";
    o.frequency.value = 720;
    const g = envGain(sfxBus, 0.005, 0.05, 0.06);
    if (!g) return;
    o.connect(g);
    o.start(now);
    o.stop(now + 0.06);
  } else if (name === "build") {
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(180, now);
    o.frequency.exponentialRampToValueAtTime(90, now + 0.08);
    const g = envGain(sfxBus, 0.004, 0.1, 0.1);
    if (!g) return;
    o.connect(g);
    o.start(now);
    o.stop(now + 0.1);
  } else if (name === "cash") {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(880, now);
    o.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
    const g = envGain(sfxBus, 0.01, 0.18, 0.09);
    if (!g) return;
    o.connect(g);
    o.start(now);
    o.stop(now + 0.18);
  } else if (name === "bell") {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = 620;
    const g = envGain(sfxBus, 0.01, 0.5, 0.08);
    if (!g) return;
    o.connect(g);
    o.start(now);
    o.stop(now + 0.5);
  } else if (name === "break") {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(140, now);
    o.frequency.exponentialRampToValueAtTime(40, now + 0.3);
    const g = envGain(sfxBus, 0.01, 0.32, 0.1);
    if (!g) return;
    o.connect(g);
    o.start(now);
    o.stop(now + 0.32);
  } else if (name === "whistle") {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(480, now);
    o.frequency.linearRampToValueAtTime(560, now + 0.25);
    const g = envGain(sfxBus, 0.02, 0.45, 0.07);
    if (!g) return;
    o.connect(g);
    o.start(now);
    o.stop(now + 0.45);
  }
}

function playChord(freqs: number[], dur: number, vol: number) {
  const c = ac();
  if (!c || !musicBus || !unlocked) return;
  const now = c.currentTime;
  for (const f of freqs) {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g);
    g.connect(musicBus);
    o.start(now);
    o.stop(now + dur + 0.02);
  }
}

const THEME = [
  [196, 247, 294],
  [175, 220, 262],
  [196, 233, 311],
  [165, 196, 247],
];

function startMusic() {
  if (musicTimer !== null) return;
  let i = 0;
  const tick = () => {
    if (!unlocked) return;
    playChord(THEME[i % THEME.length]!, 1.8, 0.035);
    i++;
    musicTimer = window.setTimeout(tick, 2000);
  };
  tick();
}

export function stopMusic() {
  if (musicTimer !== null) {
    clearTimeout(musicTimer);
    musicTimer = null;
  }
}

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") resumeAudio();
  });
}
