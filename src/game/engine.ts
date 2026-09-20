import type { GameState, IncidentKind, Speed, Tool } from "./types";
import { CARGO_LABEL } from "./types";
import { generateWorld } from "./mapgen";
import { bulldoze, buyTrain, daysPerSecond, placePlayerAirport, placeStation, placeTrackLine, placeTrackPath, recomputeAllTracks, simulate, type SimHooks } from "./simulation";
import { pathForSurvey, tileAt, lineRail } from "./pathfinding";
import { renderMinimap, renderWorld, screenToWorld, iso, type Cam } from "./render";
import { sfx as playSfx, unlockAudio } from "./audio";
import { snapHud, useGameStore } from "./store";
import { saveSlot } from "./save";
import { locoById } from "./locomotives";
import { formatCashFull } from "@/lib/utils";
import { endingCinematic, locoIntroCinematic } from "./cinematics";
import { headingDir, loadSprites } from "./sprites";
import { headingAlongPath, poseBehind } from "./track";
import { dispatchWrecker, openIncident, rerouteAround } from "./yard";
import { applyTrack, getNet, packSnap, type NetCmd } from "./net";

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
  locoQueue: string[] = [];
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
    this.wireNet();
    void loadSprites();
  }

  setSpeed(s: Speed) {
    this.netAct({ op: "speed", speed: s });
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
        placeTrackPath(this.state, path, id);
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
    recomputeAllTracks(state);
    this.floats = [];
    this.endingReel = false;
    this.locoQueue = [];
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
      locoArrived: (id) => {
        if (this.mode !== "play") return;
        this.queueLocoIntro(id);
      },
      incidentOpened: (id) => {
        if (this.mode !== "play") return;
        const inc = this.state?.incidents.find((i) => i.id === id);
        if (!inc) return;
        this.centerOn(inc.x, inc.y);
        const st = useGameStore.getState();
        if (st.overlay === "cinematic" || st.overlay === "locodetail") return;
        st.setOverlay("crisis");
      },
    };
  }

  queueLocoIntro(id: string) {
    this.locoQueue.push(id);
    this.flushLocoIntro();
  }

  flushLocoIntro() {
    const st = useGameStore.getState();
    if (st.overlay === "cinematic" || st.overlay === "locodetail") return;
    const id = this.locoQueue.shift();
    if (!id) {
      if (this.mode === "play" && this.state && (this.state.won || this.state.lost)) return;
      if (this.mode === "play" && this.state && this.state.speed === 0) this.state.speed = 1;
      return;
    }
    if (this.state) this.state.speed = 0;
    st.setLocoFocus({ locoId: id, fromIntro: true });
    st.setCinematic(locoIntroCinematic(id));
    st.setOverlay("cinematic");
  }

  closeLocoSheet() {
    const st = useGameStore.getState();
    const fromIntro = st.locoFocus?.fromIntro;
    st.setOverlay(null);
    st.setLocoFocus(null);
    if (fromIntro) this.flushLocoIntro();
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

  simulating() {
    const s = useGameStore.getState();
    return s.screen === "playing" && (s.overlay === null || s.overlay === "crisis");
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
      this.ghost = lineRail(this.paintFrom.x, this.paintFrom.y, t.x, t.y);
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
    if (st.overlay === "locodetail") {
      if (e.code === "Escape") this.closeLocoSheet();
      return;
    }
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
    if (e.code === "KeyY") st.setOverlay("crisis");
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
      if (this.mode === "play" && this.state && getNet().role !== "client") saveSlot(0, this.state);
    }
  };

  bumpSpeed(dir: number) {
    if (!this.state) return;
    const order: Speed[] = [0, 1, 2, 4, 8];
    const i = order.indexOf(this.state.speed);
    this.state.speed = order[Math.max(0, Math.min(order.length - 1, i + dir))]!;
    this.netAct({ op: "speed", speed: this.state.speed });
  }

  applyPaint(x0: number, y0: number, x1: number, y1: number) {
    if (!this.state || this.mode !== "play") return;
    const tool = useGameStore.getState().tool;
    if (tool === "track") this.netAct({ op: "track", x0, y0, x1, y1 });
    else if (tool === "bulldoze") this.netAct({ op: "bulldoze", x0, y0, x1, y1 });
  }

  tryStation(x: number, y: number) {
    if (!this.state || this.mode !== "play") return;
    this.netAct({ op: "station", x, y });
  }

  tryAirport(x: number, y: number) {
    if (!this.state || this.mode !== "play") return;
    this.netAct({ op: "airport", x, y });
  }

  wireNet() {
    getNet().setBind({
      onStart: (msg) => this.acceptStart(msg),
      onCmd: (companyId, cmd) => {
        this.applyCmd(companyId, cmd);
        if (this.state && getNet().role === "host") getNet().forceSnap(packSnap(this.state));
      },
      onSnap: (payload) => this.applySnap(payload),
    });
  }

  acceptStart(msg: {
    seed: number;
    opts: import("./types").NewGameOpts;
    seats: { peerId: string; companyId: number; name: string }[];
  }) {
    const humans = msg.seats.map((s) => ({ name: s.name, peerId: s.peerId }));
    const state = generateWorld({ ...msg.opts, seed: msg.seed, humans });
    const mine = msg.seats.find((s) => s.peerId === getNet().selfId);
    if (mine) state.playerId = mine.companyId;
    state.speed = 1;
    this.startPlay(state);
    useGameStore.getState().setOverlay(null);
  }

  netAct(cmd: NetCmd) {
    if (!this.state || this.mode !== "play") return;
    const net = getNet();
    const id = this.state.playerId;
    if (net.role === "client") {
      this.applyCmd(id, cmd);
      net.sendCmd(id, cmd);
      return;
    }
    this.applyCmd(id, cmd);
    if (net.role === "host") net.forceSnap(packSnap(this.state));
  }

  applyCmd(companyId: number, cmd: NetCmd) {
    if (!this.state) return;
    const hooks = this.hooks();
    switch (cmd.op) {
      case "track":
        placeTrackLine(this.state, cmd.x0, cmd.y0, cmd.x1, cmd.y1, companyId, hooks);
        break;
      case "bulldoze":
        for (const p of lineRail(cmd.x0, cmd.y0, cmd.x1, cmd.y1)) bulldoze(this.state, p.x, p.y, companyId, hooks);
        break;
      case "station": {
        const st = placeStation(this.state, cmd.x, cmd.y, companyId, hooks);
        if (!st && companyId === this.state.playerId) {
          useGameStore.getState().setToast("Need owned track, clear ground, and cash.");
        } else if (st && companyId === this.state.playerId) {
          useGameStore.getState().setSelected("station", st.id);
        }
        break;
      }
      case "airport": {
        const ok = placePlayerAirport(this.state, cmd.x, cmd.y, hooks, companyId);
        if (!ok && companyId === this.state.playerId) {
          useGameStore.getState().setToast("Need $90,000, a nearby city, and the year 1927+.");
        }
        break;
      }
      case "train": {
        const tr = buyTrain(this.state, companyId, cmd.locoId, cmd.cars, cmd.route, hooks);
        if (!tr && companyId === this.state.playerId) {
          useGameStore.getState().setToast("Need two linked stations, a consist, and cash.");
        } else if (tr && companyId === this.state.playerId) {
          useGameStore.getState().setToast(`${tr.name} on the line`);
        }
        break;
      }
      case "dispatch": {
        const err = dispatchWrecker(this.state, cmd.incidentId, hooks);
        if (err && companyId === this.state.playerId) useGameStore.getState().setToast(err);
        break;
      }
      case "reroute": {
        const note = rerouteAround(this.state, cmd.incidentId, hooks);
        if (companyId === this.state.playerId) useGameStore.getState().setToast(note);
        break;
      }
      case "speed":
        this.state.speed = cmd.speed;
        break;
    }
  }

  applySnap(payload: Record<string, unknown>) {
    const s = this.state;
    if (!s) return;
    const p = payload as ReturnType<typeof packSnap>;
    if (typeof p.year === "number") s.year = p.year;
    if (typeof p.month === "number") s.month = p.month;
    if (typeof p.day === "number") s.day = p.day;
    if (typeof p.speed === "number") s.speed = p.speed as Speed;
    if (typeof p.nextId === "number") s.nextId = p.nextId;
    if (Array.isArray(p.track)) applyTrack(s, p.track);
    if (p.trains) s.trains = p.trains;
    if (p.stations) s.stations = p.stations;
    if (p.incidents) s.incidents = p.incidents;
    if (p.yards) s.yards = p.yards;
    if (p.wreckers) s.wreckers = p.wreckers;
    if (p.events) s.events = p.events;
    if (p.companies) {
      for (const row of p.companies) {
        const c = s.companies.find((x) => x.id === row.id);
        if (!c) continue;
        c.cash = row.cash;
        c.stockPrice = row.stockPrice;
        c.trackTiles = row.trackTiles;
        c.trainsBuilt = row.trainsBuilt;
        c.revenueYtd = row.revenueYtd;
        c.expenseYtd = row.expenseYtd;
        c.bankrupt = row.bankrupt;
      }
    }
    if (p.cities) {
      for (const row of p.cities) {
        const c = s.cities.find((x) => x.id === row.id);
        if (!c) continue;
        c.pop = row.pop;
        c.cls = row.cls;
        c.served = row.served;
        c.growth = row.growth;
        c.delivered = row.delivered;
        c.hasPort = row.hasPort;
        c.hasAirport = row.hasAirport;
        c.highway = row.highway;
      }
    }
    useGameStore.getState().setHud(snapHud(s));
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
    const inc = this.state.incidents.find((i) => i.x === x && i.y === y && i.companyId === this.state!.playerId);
    if (inc) {
      useGameStore.getState().setOverlay("crisis");
      this.centerOn(inc.x, inc.y);
      return;
    }
    const tr = this.state.trains.find((t) => Math.round(t.x) === x && Math.round(t.y) === y);
    if (tr) {
      useGameStore.getState().setSelected("train", tr.id);
      const loco = locoById(tr.locoId);
      const load = tr.cars.map((c) => `${CARGO_LABEL[c.cargo]} ${c.amount}`).join(" · ");
      useGameStore.getState().setInspect(`${tr.name}  ·  ${loco.name}\n${load}\nProfit ${formatCashFull(tr.profit)}`);
      useGameStore.getState().setLocoFocus({ locoId: tr.locoId, trainId: tr.id, fromIntro: false });
      useGameStore.getState().setOverlay("locodetail");
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

    if (this.mode === "play" && this.state && this.simulating()) {
      const net = getNet();
      if (net.role !== "client") {
        this.state.playTime += dt;
        const dps = daysPerSecond(this.state.speed);
        this.acc += dt;
        const step = 1 / 30;
        while (this.acc >= step) {
          this.acc -= step;
          if (dps > 0) simulate(this.state, dps * step, this.hooks());
        }
        if (net.role === "host") net.sendSnap(packSnap(this.state));
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
        if (getNet().role !== "client") saveSlot(0, this.state);
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
      queueLocoIntro: (id: string) => this.queueLocoIntro(id),
      closeLocoSheet: () => this.closeLocoSheet(),
      paint: (x0: number, y0: number, x1: number, y1: number) => this.applyPaint(x0, y0, x1, y1),
      station: (x: number, y: number) => this.tryStation(x, y),
      buy: (loco: string, cars: string[], route: number[]) =>
        this.netAct({ op: "train", locoId: loco, cars: cars as import("./types").Cargo[], route }),
      newGame: (seed?: number) => {
        const state = generateWorld({
          companyName: "QA Line",
          size: "small",
          difficulty: "easy",
          region: "columbia",
          rivals: 0,
          seed: seed ?? 1848,
          year: 1860,
        });
        this.startPlay(state);
        useGameStore.getState().setOverlay(null);
      },
      trainDebug: () => {
        const tr = this.state?.trains[0];
        if (!tr) return null;
        const face = tr.path.length >= 2 ? headingAlongPath(tr.path, tr.pathIdx) : tr.heading;
        const cars = tr.cars.map((_, i) => {
          const pose = poseBehind(tr.path, tr.pathIdx, tr.segT, (i + 1) * 0.42);
          const h = tr.path.length >= 2 ? headingAlongPath(tr.path, pose.idx) : pose.heading;
          return { idx: pose.idx, heading: h, dir: headingDir(h) };
        });
        return {
          heading: tr.heading,
          face,
          dir: headingDir(face),
          pathIdx: tr.pathIdx,
          x: tr.x,
          y: tr.y,
          cars,
        };
      },
      forceIncident: (kind?: string) => {
        if (!this.state) return null;
        const k = (kind as IncidentKind) || "hotbox";
        const tr = this.state.trains.find((t) => t.companyId === this.state!.playerId && t.status !== "broken");
        if (tr) return openIncident(this.state, k === "landslide" ? "hotbox" : k, Math.round(tr.x), Math.round(tr.y), tr.companyId, tr, this.hooks()).id;
        const yard = this.state.yards.find((y) => y.companyId === this.state!.playerId);
        if (!yard) return null;
        return openIncident(this.state, k, yard.x, yard.y, this.state.playerId, null, this.hooks()).id;
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
      queueLocoIntro: (id: string) => void;
      closeLocoSheet: () => void;
      paint: (x0: number, y0: number, x1: number, y1: number) => void;
      station: (x: number, y: number) => void;
      buy: (loco: string, cars: string[], route: number[]) => void;
      newGame: (seed?: number) => void;
      trainDebug: () => {
        heading: number;
        face: number;
        dir: number;
        pathIdx: number;
        x: number;
        y: number;
        cars: { idx: number; heading: number; dir: number }[];
      } | null;
      forceIncident: (kind?: string) => number | null;
    };
  }
}
