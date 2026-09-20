import type { GameState, Incident, IncidentKind, Train, Wrecker, Yard } from "./types";
import { pathOnTrack, tileAt } from "./pathfinding";
import { advanceRail, railLen } from "./track";
import { costMul } from "./economy";
import { locoById } from "./locomotives";
import { makeRng } from "./rng";

type YardHooks = {
  float: (x: number, y: number, text: string, color?: string) => void;
  news: (headline: string, body: string) => void;
  sfx: (name: "build" | "cash" | "bell" | "break" | "click") => void;
  incidentOpened: (id: number) => void;
};

function nextId(state: GameState) {
  return state.nextId++;
}

function debit(state: GameState, companyId: number, amount: number): boolean {
  const c = state.companies.find((x) => x.id === companyId);
  if (!c || c.bankrupt || c.cash < amount) return false;
  c.cash -= amount;
  c.expenseYtd += amount;
  return true;
}

export const INCIDENT_META: Record<
  IncidentKind,
  { label: string; blurb: string; bleed: number; waitDays: number; workDays: number; dispatch: number }
> = {
  hotbox: {
    label: "Hotbox",
    blurb: "A journal bearing is running hot. The consist is dead on the line.",
    bleed: 48,
    waitDays: 48,
    workDays: 8,
    dispatch: 4200,
  },
  derail: {
    label: "Derailment",
    blurb: "Wheels off the iron. The tile is blocked until a wrecker lifts her.",
    bleed: 140,
    waitDays: 90,
    workDays: 16,
    dispatch: 16000,
  },
  landslide: {
    label: "Landslide",
    blurb: "The cut gave way. Rock and timber on the rails — nothing gets through.",
    bleed: 95,
    waitDays: 70,
    workDays: 14,
    dispatch: 11000,
  },
  signal: {
    label: "Signal failure",
    blurb: "The tower is dark. Traffic stacks until a crew resets the board.",
    bleed: 36,
    waitDays: 28,
    workDays: 5,
    dispatch: 2400,
  },
};

export function migrateYard(state: GameState) {
  if (!state.incidents) state.incidents = [];
  if (!state.yards) state.yards = [];
  if (!state.wreckers) state.wreckers = [];
  for (const tr of state.trains) {
    if (typeof tr.wear !== "number") tr.wear = Math.min(70, 10 + tr.age * 7);
  }
}

export function tileBlocked(state: GameState, x: number, y: number, exceptTrainId = 0): boolean {
  return state.incidents.some((i) => i.x === x && i.y === y && i.trainId !== exceptTrainId);
}

export function avoidBlocked(state: GameState, exceptTrainId = 0) {
  return (x: number, y: number) => tileBlocked(state, x, y, exceptTrainId);
}

export function playerYard(state: GameState): Yard | undefined {
  return state.yards.find((y) => y.companyId === state.playerId);
}

export function ensureYard(state: GameState, stationId: number, x: number, y: number, companyId: number) {
  if (state.yards.some((y) => y.companyId === companyId)) return;
  state.yards.push({
    companyId,
    stationId,
    x,
    y,
    crews: 2,
    crewsBusy: 0,
  });
}

export function openIncident(
  state: GameState,
  kind: IncidentKind,
  x: number,
  y: number,
  companyId: number,
  train: Train | null,
  hooks: YardHooks,
): Incident {
  const meta = INCIDENT_META[kind];
  const mul = costMul(state.difficulty);
  const inc: Incident = {
    id: nextId(state),
    kind,
    companyId,
    x,
    y,
    trainId: train?.id ?? 0,
    bleedPerDay: Math.round(meta.bleed * mul),
    waitLeft: meta.waitDays,
    workLeft: meta.workDays,
    wreckerId: 0,
    status: "open",
  };
  state.incidents.push(inc);
  if (train) {
    train.status = "broken";
    train.brokenFor = meta.waitDays;
  }
  const where = train ? train.name : `the cut at ${x},${y}`;
  hooks.news(`${meta.label} — ${where}`, meta.blurb);
  hooks.sfx("break");
  hooks.float(x, y, meta.label, "#c45c4a");
  if (companyId === state.playerId) hooks.incidentOpened(inc.id);
  return inc;
}

export function dispatchWrecker(state: GameState, incidentId: number, hooks: YardHooks): string | null {
  const inc = state.incidents.find((i) => i.id === incidentId);
  if (!inc || inc.status !== "open") return "Already being worked.";
  const yard = state.yards.find((y) => y.companyId === inc.companyId);
  if (!yard) return "No yard. Your first station is the roundhouse.";
  if (yard.crewsBusy >= yard.crews) return "Every crew is already out.";
  if (state.wreckers.some((w) => w.companyId === inc.companyId)) return "The wrecker is already on the road.";
  const meta = INCIDENT_META[inc.kind];
  const cost = Math.round(meta.dispatch * costMul(state.difficulty));
  if (!debit(state, inc.companyId, cost)) return `Need ${cost.toLocaleString("en-US")} in cash to dispatch.`;
  const path =
    pathOnTrack(state, yard.x, yard.y, inc.x, inc.y, inc.companyId, avoidBlocked(state, inc.trainId)) ??
    pathOnTrack(state, yard.x, yard.y, inc.x, inc.y, inc.companyId);
  if (!path || path.length < 2) {
    const co = state.companies.find((c) => c.id === inc.companyId);
    if (co) {
      co.cash += cost;
      co.expenseYtd = Math.max(0, co.expenseYtd - cost);
    }
    return "No rail from the yard to the wreck.";
  }
  return spawnWrecker(state, inc, yard, path, hooks);
}

function spawnWrecker(
  state: GameState,
  inc: Incident,
  yard: Yard,
  path: { x: number; y: number }[],
  hooks: YardHooks,
): null {
  const wr: Wrecker = {
    id: nextId(state),
    companyId: inc.companyId,
    x: path[0]!.x,
    y: path[0]!.y,
    heading: 0,
    path,
    pathIdx: 0,
    segT: 0,
    incidentId: inc.id,
    status: "to_scene",
  };
  state.wreckers.push(wr);
  inc.wreckerId = wr.id;
  inc.status = "enroute";
  yard.crewsBusy += 1;
  hooks.sfx("bell");
  hooks.float(wr.x, wr.y, "Wrecker out", "#c4a574");
  return null;
}

export function rerouteAround(state: GameState, incidentId: number, hooks: YardHooks): string {
  const inc = state.incidents.find((i) => i.id === incidentId);
  if (!inc) return "No wreck to work.";
  const avoid = avoidBlocked(state, 0);
  let n = 0;
  for (const tr of state.trains) {
    if (tr.companyId !== inc.companyId) continue;
    if (tr.id === inc.trainId) continue;
    if (tr.status === "broken") continue;
    const hits = tr.path.some((p) => p.x === inc.x && p.y === inc.y);
    if (!hits && tr.status !== "waiting") continue;
    const from = state.stations.find((s) => s.id === tr.route[tr.routeIdx]);
    const to = state.stations.find((s) => s.id === tr.route[(tr.routeIdx + 1) % tr.route.length]);
    if (!from || !to) continue;
    const path = pathOnTrack(state, tr.x, tr.y, to.x, to.y, tr.companyId, avoid);
    if (!path || path.length < 2) continue;
    tr.path = path;
    tr.pathIdx = 0;
    tr.segT = 0;
    tr.status = "running";
    n += 1;
  }
  if (n === 0) {
    hooks.float(inc.x, inc.y, "No way around", "#c45c4a");
    return "No alternate iron. Trains will wait.";
  }
  hooks.sfx("click");
  return `Rerouted ${n} consist${n === 1 ? "" : "s"}.`;
}

function clearIncident(state: GameState, inc: Incident, hooks: YardHooks) {
  const train = inc.trainId ? state.trains.find((t) => t.id === inc.trainId) : undefined;
  if (train) {
    train.status = "running";
    train.brokenFor = 0;
    train.wear = Math.max(4, train.wear - 12);
  }
  hooks.float(inc.x, inc.y, "Line clear", "#7d9a72");
  hooks.sfx("bell");
  state.incidents = state.incidents.filter((i) => i.id !== inc.id);
}

function sendWreckerHome(state: GameState, wr: Wrecker, yard: Yard) {
  const path = pathOnTrack(state, wr.x, wr.y, yard.x, yard.y, wr.companyId, avoidBlocked(state, 0));
  wr.path = path && path.length >= 2 ? path : [{ x: wr.x, y: wr.y }, { x: yard.x, y: yard.y }];
  wr.pathIdx = 0;
  wr.segT = 0;
  wr.status = "returning";
  wr.incidentId = 0;
}

export function tickYard(state: GameState, days: number, hooks: YardHooks) {
  migrateYard(state);

  for (const inc of [...state.incidents]) {
    const co = state.companies.find((c) => c.id === inc.companyId);
    if (!co || co.bankrupt) {
      state.incidents = state.incidents.filter((i) => i.id !== inc.id);
      continue;
    }
    if (inc.wreckerId && inc.status === "open") {
      const wr = state.wreckers.find((w) => w.id === inc.wreckerId);
      if (wr) inc.status = wr.status === "working" ? "working" : "enroute";
    }
    const bleed = inc.bleedPerDay * days;
    co.cash -= bleed;
    co.expenseYtd += bleed;
    inc.waitLeft -= days;
    if (inc.status === "working") {
      inc.workLeft -= days;
      if (inc.workLeft <= 0) {
        const wr = state.wreckers.find((w) => w.id === inc.wreckerId);
        const yard = state.yards.find((y) => y.companyId === inc.companyId);
        clearIncident(state, inc, hooks);
        if (wr && yard) sendWreckerHome(state, wr, yard);
        continue;
      }
    } else if (inc.waitLeft <= 0) {
      const wr = state.wreckers.find((w) => w.id === inc.wreckerId);
      const yard = state.yards.find((y) => y.companyId === inc.companyId);
      clearIncident(state, inc, hooks);
      if (wr && yard) sendWreckerHome(state, wr, yard);
      else if (yard && yard.crewsBusy > 0) yard.crewsBusy = Math.max(0, yard.crewsBusy - 1);
      continue;
    }
    if (co.ai && inc.status === "open" && inc.waitLeft < INCIDENT_META[inc.kind].waitDays - 6) {
      dispatchWrecker(state, inc.id, hooks);
    }
  }

  const wreckerSpeed = 52;
  for (const wr of [...state.wreckers]) {
    if (wr.status === "working") continue;
    if (wr.path.length < 2) {
      if (wr.status === "returning") {
        const yard = state.yards.find((y) => y.companyId === wr.companyId);
        if (yard) {
          wr.x = yard.x;
          wr.y = yard.y;
          yard.crewsBusy = Math.max(0, yard.crewsBusy - 1);
        }
        state.wreckers = state.wreckers.filter((w) => w.id !== wr.id);
      }
      continue;
    }
    let tiles = (wreckerSpeed * days) / 365;
    while (tiles > 0 && wr.path.length >= 2 && wr.pathIdx < wr.path.length) {
      const tile = wr.path[wr.pathIdx]!;
      const from = wr.path[wr.pathIdx - 1] ?? null;
      const to = wr.path[wr.pathIdx + 1] ?? null;
      if (!to && wr.pathIdx >= wr.path.length - 1) {
        arriveWrecker(state, wr, hooks);
        break;
      }
      const remain = (1 - wr.segT) * railLen(tile, from, to);
      const step = Math.min(tiles, remain + 1e-6);
      const ended = advanceRail(wr, step);
      tiles -= step;
      if (ended || wr.pathIdx >= wr.path.length - 1) {
        arriveWrecker(state, wr, hooks);
        tiles = 0;
        break;
      }
    }
  }
}

function arriveWrecker(state: GameState, wr: Wrecker, hooks: YardHooks) {
  if (wr.status === "returning") {
    const yard = state.yards.find((y) => y.companyId === wr.companyId);
    if (yard) {
      wr.x = yard.x;
      wr.y = yard.y;
      yard.crewsBusy = Math.max(0, yard.crewsBusy - 1);
    }
    state.wreckers = state.wreckers.filter((w) => w.id !== wr.id);
    return;
  }
  const inc = state.incidents.find((i) => i.id === wr.incidentId);
  wr.status = "working";
  wr.path = [];
  if (inc) {
    inc.status = "working";
    hooks.float(inc.x, inc.y, "Crews on site", "#c4a574");
  }
}

export function maybeBreakdown(state: GameState, tr: Train, days: number, hooks: YardHooks): boolean {
  if (tr.status === "broken") return true;
  if (state.incidents.some((i) => i.trainId === tr.id)) return true;
  const loco = locoById(tr.locoId);
  const t = tileAt(state, Math.round(tr.x), Math.round(tr.y));
  const terrain = t?.t === "mountains" ? 1.7 : t?.t === "hills" ? 1.35 : t?.bridge ? 1.25 : 1;
  const wearF = 0.35 + (tr.wear / 100) * 1.4;
  const p = (1 - loco.reliability) * wearF * days * 0.0045 * terrain;
  const rng = makeRng(state.seed + tr.id * 17 + ((state.year * 12 + state.month) | 0), 4);
  if (rng.next() >= p) return false;
  let kind: IncidentKind = "hotbox";
  const roll = rng.next();
  if ((t?.t === "hills" || t?.t === "mountains") && roll < 0.45) kind = "derail";
  else if (t?.bridge && roll < 0.35) kind = "derail";
  else if (roll < 0.22) kind = "signal";
  else kind = "hotbox";
  openIncident(state, kind, Math.round(tr.x), Math.round(tr.y), tr.companyId, tr, hooks);
  tr.wear = Math.min(100, tr.wear + 8);
  return true;
}

export function maybeLandslide(state: GameState, hooks: YardHooks) {
  const rng = makeRng(state.seed + state.year * 99 + state.month * 7, 5);
  if (rng.next() > 0.07) return;
  const spots: { x: number; y: number; owner: number }[] = [];
  for (let y = 0; y < state.mapH; y++) {
    for (let x = 0; x < state.mapW; x++) {
      const t = state.tiles[y * state.mapW + x]!;
      if (!t.track || !t.owner) continue;
      if (t.t !== "hills" && t.t !== "mountains") continue;
      if (tileBlocked(state, x, y)) continue;
      spots.push({ x, y, owner: t.owner });
    }
  }
  if (!spots.length) return;
  const s = spots[rng.int(0, spots.length - 1)]!;
  openIncident(state, "landslide", s.x, s.y, s.owner, null, hooks);
}

export function shopAtYard(state: GameState, tr: Train, hooks: YardHooks) {
  const yard = state.yards.find((y) => y.companyId === tr.companyId);
  if (!yard) return;
  if (Math.abs(tr.x - yard.x) + Math.abs(tr.y - yard.y) > 0.6) return;
  if (tr.wear < 6) return;
  const drop = Math.min(tr.wear, 16);
  tr.wear -= drop;
  if (tr.companyId === state.playerId) hooks.float(tr.x, tr.y, "Shopped", "#7d9a72");
}
