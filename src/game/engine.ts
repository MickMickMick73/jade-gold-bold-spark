import type { GameState, Speed, Tool } from "./types";
import { CARGO_LABEL } from "./types";
import { generateWorld } from "./mapgen";
import { bulldoze, buyTrain, daysPerSecond, placePlayerAirport, placeStation, placeTrackLine, recomputeAllTracks, simulate, type SimHooks } from "./simulation";
import { pathForSurvey, tileAt, line4 } from "./pathfinding";
import { renderMinimap, renderWorld, screenToWorld, iso, type Cam } from "./render";
import { sfx as playSfx, unlockAudio } from "./audio";
import { snapHud, useGameStore } from "./store";
import { saveSlot } from "./save";
import { locoById } from "./locomotives";
import { formatCashFull } from "@/lib/utils";
import { endingCinematic } from "./cinematics";
import { loadSprites } from "./sprites";

const PAN = 420;

let singleton: Engine | null = null;
export function getEngine() {
  return singleton;
}

export class Engine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  mini: HTMLCanvasElement | null = null;
  miniCtx: CanvasRenderingContext2D | null = null;
  state: GameState | null = null;
  cam: Cam = { x: 0, y: 0, zoom: 1 };
  keys = new Set<string>();
  injected = new Set<string>();
  hover: { x: number; y: number } | null = null;
  paintFrom: { x: number; y: number } | null = null;
  ghost: { x: number; y: number }[] | null = null;
  floats: { x: number; y: number; text: string; life: number; color: string }[] = [];
  running = false;
  raf = 0;
  last = 0;
  acc = 0;
  time = 0;
  mode: "demo" | "play" = "demo";
  pointers = new Map<number, { x: number; y: number }>();
  pinch0 = 0;
  dragCam: { x: number; y: number; cx: number; cy: number } | null = null;
  autosaveAt = 0;
  hudClock = 0;
  endingReel = false;
  onResize: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d context");
    this.ctx = ctx;
    this.onResize = () => this.resize();
    window.addEventListener("resize", this.onResize);
    this.bind();
    this.resize();
    this.startDemo();
    this.loop = this.loop.bind(this);
    this.running = true;
    this.raf = requestAnimationFrame(this.loop);
    this.installProbe();
    singleton = this;
    void loadSprites();
  }

  setSpeed(s: Speed) {
    if (this.state) this.state.speed = s;
  }

  attachMinimap(c: HTMLCanvasElement | null) {
    this.mini = c;
    this.miniCtx = c?.getContext("2d") ?? null;
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    this.unbind();
    if (singleton === this) singleton = null;
    if (typeof window !== "undefined") delete window.__controlsTest;
    if (typeof window !== "undefined") delete window.__ironBaron;
  }

  resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.floor(r.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(r.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  startDemo() {
    this.mode = "demo";
    this.state = generateWorld({
      companyName: "Demo Line",
      size: "small",
      difficulty: "easy",
      region: "columbia",
      rivals: 1,
      seed: 1848,
      year: 1860,
    });
    this.centerOnMap();
    this.cam.zoom = 0.55;
    const cities = this.state.cities;
    if (cities.length >= 2) {
      const a = cities[0]!;
      const b = cities[1]!;
      const id = this.state.playerId;
      const path = pathForSurvey(this.state, a.x, a.y, b.x, b.y);
      if (path) {
        for (const p of path) placeTrackLine(this.state, p.x, p.y, p.x, p.y, id);
      } else {
        placeTrackLine(this.state, a.x, a.y, b.x, b.y, id);
      }
      placeStation(this.state, a.x, a.y, id);
      placeStation(this.state, b.x, b.y, id);
      const sa = this.state.stations[0];
      const sb = this.state.stations[1];
      if (sa && sb) buyTrain(this.state, id, "atlantic", ["pax", "mail", "goods"], [sa.id, sb.id]);
    }
  }

  startPlay(state: GameState) {
    this.mode = "play";
    this.state = state;
    this.floats = [];
    this.endingReel = false;
    this.centerOnMap();
    this.cam.zoom = state.mapW >= 160 ? 0.42 : state.mapW >= 120 ? 0.5 : 0.62;
    useGameStore.getState().setHud(snapHud(state));
    useGameStore.getState().setScreen("playing");
    useGameStore.getState().setTool("track");
  }

  centerOnMap() {
    if (!this.state) return;
    const cx = this.state.mapW / 2;
    const cy = this.state.mapH / 2;
    const p = iso(cx, cy, 0);
    this.cam.x = p.sx;
    this.cam.y = p.sy;
    this.cam.zoom = 1;
  }

  centerOn(x: number, y: number) {
    const p = iso(x, y, 0);
    this.cam.x = p.sx;
    this.cam.y = p.sy;
  }

  hooks(): SimHooks {
    return {
      float: (x, y, text, color) => {
        this.floats.push({ x, y, text, life: 1, color: color ?? "#e8e4d8" });
      },
      news: (headline, body) => {
        if (!this.state) return;
        this.state.events.push({
          year: this.state.year,
          month: this.state.month,
          headline,
          body,
        });
        if (this.state.events.length > 40) this.state.events.shift();
        useGameStore.getState().setToast(headline);
      },
      sfx: (n) => playSfx(n),
    };
  }

  tileFromEvent(e: { clientX: number; clientY: number }) {
    const r = this.canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const w = r.width;
    const h = r.height;
    const g = screenToWorld(this.cam, px, py, w, h);
    return { x: Math.round(g.x), y: Math.round(g.y), px, py };
  }

  bind() {
    const c = this.canvas;
    c.addEventListener("pointerdown", this.onDown);
    c.addEventListener("pointermove", this.onMove);
    c.addEventListener("pointerup", this.onUp);
    c.addEventListener("pointercancel", this.onUp);
    c.addEventListener("wheel", this.onWheel, { passive: false });
    c.addEventListener("contextmenu", this.onMenu);
    window.addEventListener("keydown", this.onKey);
    window.addEventListener("keyup", this.onUpKey);
    window.addEventListener("blur", this.clearKeys);
    document.addEventListener("visibilitychange", this.onVis);
  }
  unbind() {
    const c = this.canvas;
    c.removeEventListener("pointerdown", this.onDown);
    c.removeEventListener("pointermove", this.onMove);
    c.removeEventListener("pointerup", this.onUp);
    c.removeEventListener("pointercancel", this.onUp);
    c.removeEventListener("wheel", this.onWheel);
    c.removeEventListener("contextmenu", this.onMenu);
    window.removeEventListener("keydown", this.onKey);
    window.removeEventListener("keyup", this.onUpKey);
    window.removeEventListener("blur", this.clearKeys);
    document.removeEventListener("visibilitychange", this.onVis);
  }

  playingUi() {
    const s = useGameStore.getState();
    return s.screen === "playing" && !s.overlay;
  }

  onDown = (e: PointerEvent) => {
    unlockAudio();
    this.canvas.setPointerCapture(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 2) {
      const pts = [...this.pointers.values()];
      this.pinch0 = Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y);
      this.paintFrom = null;
      this.dragCam = null;
      return;
    }
    if (e.button === 1 || e.button === 2 || !this.playingUi()) {
      this.dragCam = { x: e.clientX, y: e.clientY, cx: this.cam.x, cy: this.cam.y };
      return;
    }
    const tool = useGameStore.getState().tool;
    const t = this.tileFromEvent(e);
    if (tool === "track" || tool === "bulldoze") {
      this.paintFrom = { x: t.x, y: t.y };
      this.applyPaint(t.x, t.y, t.x, t.y);
    } else if (tool === "station") {
      this.tryStation(t.x, t.y);
    } else if (tool === "airport") {
      this.tryAirport(t.x, t.y);
    } else if (tool === "train") {
      this.pickStationForRoute(t.x, t.y);
    } else {
      this.inspect(t.x, t.y);
    }
  };

  onMove = (e: PointerEvent) => {
    if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 2 && this.pinch0) {
      const pts = [...this.pointers.values()];
      const d = Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y);
      const f = d / this.pinch0;
      this.cam.zoom = Math.max(0.28, Math.min(2.4, this.cam.zoom * f));
      this.pinch0 = d;
      return;
    }
    if (this.dragCam) {
      const dx = (e.clientX - this.dragCam.x) / this.cam.zoom;
      const dy = (e.clientY - this.dragCam.y) / this.cam.zoom;
      this.cam.x = this.dragCam.cx - dx;
      this.cam.y = this.dragCam.cy - dy;
      return;
    }
    const t = this.tileFromEvent(e);
    this.hover = { x: t.x, y: t.y };
    if (this.paintFrom && this.playingUi()) {
      this.ghost = line4(this.paintFrom.x, this.paintFrom.y, t.x, t.y);
    }
  };

  onUp = (e: PointerEvent) => {
    this.pointers.delete(e.pointerId);
    if (this.paintFrom && this.playingUi()) {
      const t = this.tileFromEvent(e);
      this.applyPaint(this.paintFrom.x, this.paintFrom.y, t.x, t.y);
    }
    this.paintFrom = null;
    this.ghost = null;
    this.dragCam = null;
    this.pinch0 = 0;
  };

  onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const f = e.deltaY > 0 ? 0.92 : 1.08;
    this.cam.zoom = Math.max(0.28, Math.min(2.4, this.cam.zoom * f));
  };

  onMenu = (e: Event) => e.preventDefault();

  onKey = (e: KeyboardEvent) => {
    if (e.repeat && (e.code === "Space" || e.code.startsWith("Digit"))) return;
    this.keys.add(e.code);
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
    if (!this.playingUi() && useGameStore.getState().screen !== "playing") return;
    const st = useGameStore.getState();
    if (st.overlay === "cinematic") return;
    if (e.code === "Escape") {
      if (st.overlay) st.setOverlay(null);
      else st.setOverlay("pause");
      return;
    }
    if (st.overlay) return;
    if (e.code === "Space") {
      if (!this.state) return;
      this.state.speed = this.state.speed === 0 ? 1 : 0;
    }
    if (e.code === "Digit1") st.setTool("inspect");
    if (e.code === "Digit2") st.setTool("track");
    if (e.code === "Digit3") st.setTool("station");
    if (e.code === "Digit4") st.setTool("train");
    if (e.code === "Digit5") st.setTool("bulldoze");
    if (e.code === "Digit6") st.setTool("airport");
    if (e.code === "KeyL") st.setOverlay("ledger");
    if (e.code === "KeyR") st.setOverlay("roster");
    if (e.code === "KeyN") st.setOverlay("news");
    if (e.code === "Equal" || e.code === "NumpadAdd") this.bumpSpeed(1);
    if (e.code === "Minus" || e.code === "NumpadSubtract") this.bumpSpeed(-1);
  };
  onUpKey = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };
  clearKeys = () => {
    this.keys.clear();
    this.injected.clear();
  };
  onVis = () => {
    if (document.visibilityState === "hidden") {
      this.clearKeys();
      if (this.mode === "play" && this.state) saveSlot(0, this.state);
    }
  };

  bumpSpeed(dir: number) {
    if (!this.state) return;
    const order: Speed[] = [0, 1, 2, 4, 8];
    const i = order.indexOf(this.state.speed);
    this.state.speed = order[Math.max(0, Math.min(order.length - 1, i + dir))]!;
  }

  applyPaint(x0: number, y0: number, x1: number, y1: number) {
    if (!this.state || this.mode !== "play") return;
    const tool = useGameStore.getState().tool;
    const id = this.state.playerId;
    if (tool === "track") placeTrackLine(this.state, x0, y0, x1, y1, id, this.hooks());
    else if (tool === "bulldoze") {
      for (const p of line4(x0, y0, x1, y1)) bulldoze(this.state, p.x, p.y, id, this.hooks());
    }
  }

  tryStation(x: number, y: number) {
    if (!this.state || this.mode !== "play") return;
    const st = placeStation(this.state, x, y, this.state.playerId, this.hooks());
    if (!st) useGameStore.getState().setToast("Need owned track, clear ground, and cash.");
    else useGameStore.getState().setSelected("station", st.id);
  }

  tryAirport(x: number, y: number) {
    if (!this.state || this.mode !== "play") return;
    const ok = placePlayerAirport(this.state, x, y, this.hooks());
    if (!ok) useGameStore.getState().setToast("Need $90,000, a nearby city, and the year 1927+.");
  }

  pickStationForRoute(x: number, y: number) {
    if (!this.state) return;
    const st = this.state.stations.find((s) => s.x === x && s.y === y && s.companyId === this.state!.playerId);
    if (!st) {
      useGameStore.getState().setToast("Click your stations to set a route.");
      useGameStore.getState().setOverlay("trainbuy");
      return;
    }
    const d = useGameStore.getState().trainDraft;
    if (d.route.includes(st.id)) return;
    useGameStore.getState().setDraft({ route: [...d.route, st.id] });
    useGameStore.getState().setToast(`Added ${st.name} to route`);
    useGameStore.getState().setOverlay("trainbuy");
  }

  inspect(x: number, y: number) {
    if (!this.state) return;
    const tr = this.state.trains.find((t) => Math.round(t.x) === x && Math.round(t.y) === y);
    if (tr) {
      useGameStore.getState().setSelected("train", tr.id);
      const loco = locoById(tr.locoId);
      const load = tr.cars.map((c) => `${CARGO_LABEL[c.cargo]} ${c.amount}`).join(" · ");
      useGameStore.getState().setInspect(`${tr.name}  ·  ${loco.name}\n${load}\nProfit ${formatCashFull(tr.profit)}`);
      return;
    }
    const st = this.state.stations.find((s) => s.x === x && s.y === y);
    if (st) {
      useGameStore.getState().setSelected("station", st.id);
      useGameStore.getState().setInspect(`${st.name}\nWaiting cargo on the platform.`);
      return;
    }
    const city = this.state.cities.find((c) => Math.abs(c.x - x) + Math.abs(c.y - y) <= 1);
    if (city) {
      useGameStore.getState().setSelected("city", city.id);
      const tags = [
        city.served ? "rail" : "unserved",
        city.hasPort ? "port" : "",
        city.hasAirport ? "air" : "",
        city.highway ? "highway" : "",
      ].filter(Boolean);
      useGameStore.getState().setInspect(
        `${city.name}  ·  ${city.cls}\nPop ${city.pop.toLocaleString("en-US")}  ·  ${city.growth >= 0 ? "+" : ""}${(city.growth * 100).toFixed(1)}% /yr\nFounded ${city.foundedYear}  ·  ${tags.join(" · ")}\n${city.industries.map((i) => i.kind).join(", ") || "Market town"}`,
      );
      this.centerOn(city.x, city.y);
      return;
    }
    const tile = tileAt(this.state, x, y);
    if (tile) {
      useGameStore.getState().setSelected("clear");
      const res = tile.res ? `  ·  ${tile.res}` : "";
      useGameStore.getState().setInspect(`${tile.t}${res}${tile.track ? "  ·  track" : ""}${tile.road ? "  ·  highway" : ""}`);
    }
  }

  held(code: string) {
    return this.keys.has(code) || this.injected.has(code);
  }

  loop = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(0.1, (now - (this.last || now)) / 1000);
    this.last = now;
    this.time += dt;
    this.step(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  step(dt: number) {
    const pan = (PAN * dt) / this.cam.zoom;
    let mx = 0;
    let my = 0;
    if (this.held("KeyW") || this.held("ArrowUp")) my -= 1;
    if (this.held("KeyS") || this.held("ArrowDown")) my += 1;
    if (this.held("KeyA") || this.held("ArrowLeft")) mx -= 1;
    if (this.held("KeyD") || this.held("ArrowRight")) mx += 1;
    if (mx || my) {
      const m = Math.hypot(mx, my) || 1;
      this.cam.x += (mx / m) * pan;
      this.cam.y += (my / m) * pan;
    }
    for (const f of this.floats) f.life -= dt * 0.7;
    this.floats = this.floats.filter((f) => f.life > 0);

    if (this.mode === "play" && this.state && this.playingUi()) {
      this.state.playTime += dt;
      const dps = daysPerSecond(this.state.speed);
      this.acc += dt;
      const step = 1 / 30;
      while (this.acc >= step) {
        this.acc -= step;
        if (dps > 0) simulate(this.state, dps * step, this.hooks());
      }
      this.hudClock += dt;
      if (this.hudClock > 0.2) {
        this.hudClock = 0;
        useGameStore.getState().setHud(snapHud(this.state));
        if (this.state.won || this.state.lost) {
          if (!this.endingReel) {
            this.endingReel = true;
            const store = useGameStore.getState();
            store.setCinematic(endingCinematic(this.state.won, this.state.scenarioTitle));
            store.setOverlay("cinematic");
          }
        }
      }
      this.autosaveAt += dt;
      if (this.autosaveAt > 20) {
        this.autosaveAt = 0;
        saveSlot(0, this.state);
      }
    } else if (this.mode === "demo" && this.state) {
      simulate(this.state, 10 * dt, this.hooks());
    }
  }

  draw() {
    if (!this.state) return;
    const st = useGameStore.getState();
    const cssW = this.canvas.getBoundingClientRect().width;
    const cssH = this.canvas.getBoundingClientRect().height;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    recomputeAllTracks(this.state);
    renderWorld(
      this.ctx,
      this.state,
      this.cam,
      {
        hover: this.mode === "play" ? this.hover : null,
        tool: st.tool,
        selectedTrain: st.selectedTrain,
        selectedStation: st.selectedStation,
        floats: this.floats,
        time: this.time,
        showGrid: st.settings.showGrid,
        ghost: this.ghost,
        demo: this.mode === "demo",
      },
      cssW,
      cssH,
    );
    if (this.mini && this.miniCtx && this.mode === "play") {
      renderMinimap(this.miniCtx, this.state, this.cam, cssW, cssH);
    }
  }

  installProbe() {
    window.__controlsTest = {
      getYaw: () => this.cam.x,
      getSpeed: () => this.cam.zoom,
      setKeys: (codes: string[]) => {
        this.injected = new Set(codes);
      },
    };
    window.__ironBaron = {
      getState: () => this.state,
      getMode: () => this.mode,
      setTool: (t: Tool) => useGameStore.getState().setTool(t),
      pan: () => ({ x: this.cam.x, y: this.cam.y, z: this.cam.zoom }),
      centerOn: (x: number, y: number) => this.centerOn(x, y),
      setZoom: (z: number) => {
        this.cam.zoom = Math.max(0.28, Math.min(2.4, z));
      },
    };
  }
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setKeys?: (codes: string[]) => void;
    };
    __ironBaron?: {
      getState: () => GameState | null;
      getMode: () => string;
      setTool: (t: Tool) => void;
      pan: () => { x: number; y: number; z: number };
      centerOn: (x: number, y: number) => void;
      setZoom: (z: number) => void;
    };
  }
}
