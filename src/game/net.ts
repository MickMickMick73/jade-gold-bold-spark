import { P2PRoom, type PeerInfo } from "@/lib/multiplayer";
import type { Cargo, GameState, NewGameOpts, Speed } from "./types";
import { useGameStore } from "./store";

export type NetRole = "solo" | "host" | "client";

export type NetCmd =
  | { op: "track"; x0: number; y0: number; x1: number; y1: number }
  | { op: "bulldoze"; x0: number; y0: number; x1: number; y1: number }
  | { op: "station"; x: number; y: number }
  | { op: "airport"; x: number; y: number }
  | { op: "train"; locoId: string; cars: Cargo[]; route: number[] }
  | { op: "dispatch"; incidentId: number }
  | { op: "reroute"; incidentId: number }
  | { op: "speed"; speed: Speed };

export interface Seat {
  peerId: string;
  companyId: number;
  name: string;
}

export type NetMsg =
  | { t: "hello"; name: string }
  | { t: "lobby"; hostId: string; names: Record<string, string> }
  | { t: "start"; seed: number; opts: NewGameOpts; seats: Seat[] }
  | { t: "cmd"; companyId: number; cmd: NetCmd }
  | { t: "snap"; payload: Record<string, unknown> }
  | { t: "toast"; text: string };

export interface NetBind {
  onStart: (msg: Extract<NetMsg, { t: "start" }>) => void;
  onCmd: (companyId: number, cmd: NetCmd) => void;
  onSnap: (payload: Record<string, unknown>) => void;
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeRoomCode(): string {
  let s = "";
  for (let i = 0; i < 4; i++) s += CODE_CHARS[(Math.random() * CODE_CHARS.length) | 0];
  return s;
}

function newSelfId() {
  return `p-${Math.random().toString(36).slice(2, 10)}`;
}

function roomId(code: string) {
  return `ib-${code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}`;
}

export class NetSession {
  role: NetRole = "solo";
  selfId = "";
  hostId = "";
  code = "";
  name = "";
  p2p: P2PRoom | null = null;
  peers: PeerInfo[] = [];
  names: Record<string, string> = {};
  bind: NetBind | null = null;
  started = false;
  lastSnapAt = 0;

  setBind(b: NetBind | null) {
    this.bind = b;
  }

  pushUi() {
    useGameStore.getState().setNet({
      role: this.role,
      code: this.code,
      selfId: this.selfId,
      hostId: this.hostId,
      started: this.started,
      names: { ...this.names },
      peers: this.peers.map((p) => ({
        id: p.id,
        name: this.names[p.id] ?? p.name,
        state: p.connectionState,
        rttMs: p.rttMs,
      })),
    });
  }

  private attach(code: string, name: string, role: NetRole) {
    this.close();
    this.role = role;
    this.code = code.toUpperCase();
    this.name = name.slice(0, 28);
    this.selfId = newSelfId();
    this.hostId = role === "host" ? this.selfId : "";
    this.names = { [this.selfId]: this.name };
    this.started = false;
    const p2p = new P2PRoom({
      room: roomId(this.code),
      selfId: this.selfId,
      name: this.name,
      onPeersChanged: (peers) => {
        if (this.role === "solo" || !this.p2p) return;
        this.peers = peers;
        for (const p of peers) this.names[p.id] = p.name || this.names[p.id] || p.id;
        this.names[this.selfId] = this.name;
        if (this.role === "host") this.broadcastLobby();
        this.pushUi();
      },
      onMessage: (_from, data) => this.onMsg(data),
      onConnected: () => {
        if (this.role === "client") {
          this.p2p?.send({ t: "hello", name: this.name } satisfies NetMsg);
        }
        this.pushUi();
      },
    });
    this.p2p = p2p;
    void p2p.join();
    this.pushUi();
  }

  host(name: string, code?: string) {
    this.attach(code ?? makeRoomCode(), name, "host");
  }

  join(name: string, code: string) {
    this.attach(code, name, "client");
  }

  close() {
    this.role = "solo";
    const p = this.p2p;
    this.p2p = null;
    p?.close();
    this.started = false;
    this.peers = [];
    this.names = {};
    this.selfId = "";
    this.hostId = "";
    this.code = "";
    this.pushUi();
  }

  broadcastLobby() {
    const msg: NetMsg = { t: "lobby", hostId: this.selfId, names: this.names };
    this.p2p?.send(msg);
  }

  sendStart(seed: number, opts: NewGameOpts, seats: Seat[]) {
    this.started = true;
    const msg: NetMsg = { t: "start", seed, opts, seats };
    this.p2p?.send(msg);
    this.pushUi();
  }

  sendCmd(companyId: number, cmd: NetCmd) {
    const msg: NetMsg = { t: "cmd", companyId, cmd };
    if (this.role === "client") this.p2p?.send(msg, this.hostId || undefined);
    else this.p2p?.send(msg);
  }

  sendSnap(payload: Record<string, unknown>) {
    const now = performance.now();
    if (now - this.lastSnapAt < 180) return;
    this.lastSnapAt = now;
    this.p2p?.broadcast({ t: "snap", payload } satisfies NetMsg);
  }

  forceSnap(payload: Record<string, unknown>) {
    this.lastSnapAt = performance.now();
    this.p2p?.send({ t: "snap", payload } satisfies NetMsg);
  }

  private onMsg(data: unknown) {
    if (this.role === "solo") return;
    const msg = data as NetMsg;
    if (!msg || typeof msg !== "object" || !("t" in msg)) return;
    if (msg.t === "hello" && this.role === "host") {
      // names filled from peer list; keep a friendly label
      this.pushUi();
    } else if (msg.t === "lobby" && this.role === "client") {
      this.hostId = msg.hostId;
      this.names = { ...msg.names, [this.selfId]: this.name };
      this.pushUi();
    } else if (msg.t === "start" && this.role === "client") {
      this.started = true;
      this.bind?.onStart(msg);
      this.pushUi();
    } else if (msg.t === "cmd" && this.role === "host") {
      this.bind?.onCmd(msg.companyId, msg.cmd);
    } else if (msg.t === "snap" && this.role === "client") {
      this.bind?.onSnap(msg.payload);
    } else if (msg.t === "toast") {
      useGameStore.getState().setToast(msg.text);
    }
  }
}

let session: NetSession | null = null;
export function getNet() {
  if (!session) session = new NetSession();
  return session;
}

export function dumpTrack(state: GameState) {
  const out: number[][] = [];
  for (let y = 0; y < state.mapH; y++) {
    for (let x = 0; x < state.mapW; x++) {
      const t = state.tiles[y * state.mapW + x]!;
      if (!t.track) continue;
      out.push([x, y, t.track, t.owner, t.bridge ? 1 : 0, t.tunnel ? 1 : 0]);
    }
  }
  return out;
}

export function applyTrack(state: GameState, cells: number[][]) {
  for (const t of state.tiles) {
    if (t.track) {
      t.track = 0;
      t.owner = 0;
      t.bridge = false;
      t.tunnel = false;
    }
  }
  for (const c of cells) {
    const [x, y, track, owner, bridge, tunnel] = c;
    const tile = state.tiles[y! * state.mapW + x!];
    if (!tile) continue;
    tile.track = track!;
    tile.owner = owner!;
    tile.bridge = !!bridge;
    tile.tunnel = !!tunnel;
  }
}

export function packSnap(state: GameState) {
  return {
    year: state.year,
    month: state.month,
    day: state.day,
    speed: state.speed,
    nextId: state.nextId,
    companies: state.companies.map((c) => ({
      id: c.id,
      cash: Math.round(c.cash),
      stockPrice: c.stockPrice,
      trackTiles: c.trackTiles,
      trainsBuilt: c.trainsBuilt,
      revenueYtd: Math.round(c.revenueYtd),
      expenseYtd: Math.round(c.expenseYtd),
      bankrupt: c.bankrupt,
    })),
    trains: state.trains,
    stations: state.stations,
    incidents: state.incidents,
    yards: state.yards,
    wreckers: state.wreckers,
    cities: state.cities.map((c) => ({
      id: c.id,
      pop: c.pop,
      cls: c.cls,
      served: c.served,
      growth: c.growth,
      delivered: c.delivered,
      hasPort: c.hasPort,
      hasAirport: c.hasAirport,
      highway: c.highway,
    })),
    track: dumpTrack(state),
    events: state.events.slice(-6),
  };
}
