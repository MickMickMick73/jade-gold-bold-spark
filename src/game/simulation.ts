import { makeRng } from "./rng";
import { trainName } from "./names";
import { locosForYear, locoById, tilesPerYear, type LocoDef } from "./locomotives";
import { moveCrafts, tickWorld, findAirfield } from "./growth";
import {
  CARGOS,
  DIRS,
  N,
  S,
  type Cargo,
  type FloatingText,
  type GameState,
  type Speed,
  type Station,
  type Tile,
  type Train,
} from "./types";
import { idx, inBounds, pathForSurvey, pathOnTrack, tileAt, line4 } from "./pathfinding";
import {
  buildCostFor,
  cargoRate,
  costMul,
  daysInMonth,
  netWorth,
  playerCompany,
  revMul,
  stationCost,
} from "./economy";

export interface SimHooks {
  float: (x: number, y: number, text: string, color?: string) => void;
  news: (headline: string, body: string) => void;
  sfx: (name: "build" | "cash" | "bell" | "break" | "click") => void;
}

const noop: SimHooks = {
  float: () => {},
  news: () => {},
  sfx: () => {},
};

export function nextId(state: GameState): number {
  return state.nextId++;
}

export function setSpeed(state: GameState, s: Speed) {
  state.speed = s;
}

export function charge(state: GameState, companyId: number, amount: number, asExpense = true): boolean {
  const c = state.companies.find((x) => x.id === companyId);
  if (!c || c.bankrupt) return false;
  if (c.cash < amount) return false;
  c.cash -= amount;
  if (asExpense) c.expenseYtd += amount;
  return true;
}

export function pay(state: GameState, companyId: number, amount: number, hooks: SimHooks, x?: number, y?: number) {
  const c = state.companies.find((x) => x.id === companyId);
  if (!c || c.bankrupt) return;
  const v = Math.round(amount * (c.ai ? 0.9 : revMul(state.difficulty)));
  c.cash += v;
  c.revenueYtd += v;
  if (companyId === state.playerId) {
    state.stats.peakCash = Math.max(state.stats.peakCash, c.cash);
    if (x !== undefined && y !== undefined && v > 0) {
      hooks.float(x, y, `+$${v.toLocaleString("en-US")}`, "#7d9a72");
      hooks.sfx("cash");
    }
  }
}

function recomputeTrackBits(state: GameState, x: number, y: number) {
  const t = tileAt(state, x, y);
  if (!t || t.track === 0) return;
  let bits = 0;
  for (const d of DIRS) {
    const n = tileAt(state, x + d.dx, y + d.dy);
    if (!n || n.track === 0) continue;
    if (n.owner && t.owner && n.owner !== t.owner) continue;
    bits |= d.bit;
  }
  t.track = bits === 0 ? N | S : bits;
}

export function refreshConnections(state: GameState, x: number, y: number) {
  recomputeTrackBits(state, x, y);
  for (const d of DIRS) recomputeTrackBits(state, x + d.dx, y + d.dy);
}

export function recomputeAllTracks(state: GameState) {
  for (let y = 0; y < state.mapH; y++) {
    for (let x = 0; x < state.mapW; x++) {
      if (state.tiles[y * state.mapW + x]!.track) recomputeTrackBits(state, x, y);
    }
  }
}

export function placeTrack(
  state: GameState,
  x: number,
  y: number,
  companyId: number,
  hooks: SimHooks = noop,
): boolean {
  if (!inBounds(state, x, y)) return false;
  const t = state.tiles[idx(state, x, y)]!;
  if (t.track && t.owner && t.owner !== companyId) return false;
  if (t.track && t.owner === companyId) {
    refreshConnections(state, x, y);
    return true;
  }
  const cost = buildCostFor(state, t);
  if (cost === null) return false;
  if (!charge(state, companyId, cost)) return false;
  t.track = N | S;
  t.owner = companyId;
  t.bridge = t.t === "river" || t.t === "coast";
  t.tunnel = t.t === "mountains";
  refreshConnections(state, x, y);
  const c = state.companies.find((x) => x.id === companyId);
  if (c) c.trackTiles += 1;
  if (companyId === state.playerId) hooks.sfx("build");
  return true;
}

export function placeTrackLine(
  state: GameState,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  companyId: number,
  hooks: SimHooks = noop,
): number {
  let n = 0;
  for (const p of line4(x0, y0, x1, y1)) {
    if (placeTrack(state, p.x, p.y, companyId, hooks)) n++;
  }
  return n;
}

export function bulldoze(state: GameState, x: number, y: number, companyId: number, hooks: SimHooks = noop): boolean {
  const t = tileAt(state, x, y);
  if (!t || t.owner !== companyId) return false;
  const st = state.stations.find((s) => s.x === x && s.y === y && s.companyId === companyId);
  if (st) {
    if (state.trains.some((tr) => tr.route.includes(st.id))) return false;
    state.stations = state.stations.filter((s) => s.id !== st.id);
  }
  if (t.track) {
    const refund = Math.round((buildCostFor(state, t) ?? 0) * 0.25);
    t.track = 0;
    t.owner = 0;
    t.bridge = false;
    t.tunnel = false;
    for (const d of DIRS) {
      recomputeTrackBits(state, x + d.dx, y + d.dy);
    }
    const c = state.companies.find((x) => x.id === companyId);
    if (c) {
      c.trackTiles = Math.max(0, c.trackTiles - 1);
      c.cash += refund;
    }
    hooks.sfx("build");
    return true;
  }
  return false;
}

export function placeStation(
  state: GameState,
  x: number,
  y: number,
  companyId: number,
  hooks: SimHooks = noop,
): Station | null {
  const t = tileAt(state, x, y);
  if (!t || t.track === 0 || t.owner !== companyId) return null;
  if (state.stations.some((s) => s.x === x && s.y === y)) return null;
  const cost = stationCost(1, state.difficulty);
  if (!charge(state, companyId, cost)) return null;
  let city = state.cities.find((c) => Math.abs(c.x - x) + Math.abs(c.y - y) <= 2);
  if (!city) {
    // Rural halt still ok.
  } else {
    city.served = true;
  }
  const waiting = {} as Station["waiting"];
  for (const c of CARGOS) waiting[c] = 0;
  const st: Station = {
    id: nextId(state),
    x,
    y,
    cityId: city?.id ?? 0,
    companyId,
    waiting,
    name: city ? `${city.name} Station` : `Halt ${x},${y}`,
    level: 1,
  };
  state.stations.push(st);
  refreshConnected(state);
  if (companyId === state.playerId) {
    hooks.sfx("bell");
    hooks.float(x, y, st.name, "#e8e4d8");
  }
  return st;
}

export function refreshConnected(state: GameState) {
  for (const c of state.cities) c.served = false;
  for (const s of state.stations) {
    if (s.cityId) {
      const city = state.cities.find((c) => c.id === s.cityId);
      if (city) city.served = true;
    }
  }
  const playerStations = new Set(
    state.stations.filter((s) => s.companyId === state.playerId && s.cityId).map((s) => s.cityId),
  );
  state.stats.citiesConnected = playerStations.size;
}

export function buyTrain(
  state: GameState,
  companyId: number,
  locoId: string,
  cargos: Cargo[],
  route: number[],
  hooks: SimHooks = noop,
): Train | null {
  const loco = locoById(locoId);
  if (loco.year > state.year) return null;
  const cars: Train["cars"] = cargos.slice(0, loco.capacity).map((c) => ({ cargo: c, amount: 0 }));
  if (cars.length === 0) return null;
  if (route.length < 2) return null;
  const a = state.stations.find((s) => s.id === route[0]);
  const b = state.stations.find((s) => s.id === route[1]);
  if (!a || !b) return null;
  const path = pathOnTrack(state, a.x, a.y, b.x, b.y, companyId);
  if (!path || path.length < 2) return null;
  if (!charge(state, companyId, loco.cost + cars.length * 2500)) return null;
  const used = new Set(state.trains.map((t) => t.name));
  const rng = makeRng(state.seed + state.nextId, 9);
  const tr: Train = {
    id: nextId(state),
    name: trainName(rng, used),
    locoId,
    cars,
    route,
    routeIdx: 0,
    path,
    pathIdx: 0,
    segT: 0,
    x: a.x,
    y: a.y,
    heading: 0,
    companyId,
    status: "running",
    brokenFor: 0,
    profit: 0,
    lastPayout: 0,
    age: 0,
  };
  state.trains.push(tr);
  const co = state.companies.find((c) => c.id === companyId);
  if (co) co.trainsBuilt += 1;
  if (companyId === state.playerId) hooks.sfx("bell");
  return tr;
}

function stationOf(state: GameState, id: number) {
  return state.stations.find((s) => s.id === id);
}

function rebuildPath(state: GameState, tr: Train): boolean {
  const from = stationOf(state, tr.route[tr.routeIdx]!);
  const to = stationOf(state, tr.route[(tr.routeIdx + 1) % tr.route.length]!);
  if (!from || !to) return false;
  const path = pathOnTrack(state, from.x, from.y, to.x, to.y, tr.companyId);
  if (!path || path.length < 2) {
    tr.status = "waiting";
    tr.path = [];
    return false;
  }
  tr.path = path;
  tr.pathIdx = 0;
  tr.segT = 0;
  tr.status = "running";
  tr.x = path[0]!.x;
  tr.y = path[0]!.y;
  return true;
}

function distTiles(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function nearbySupply(state: GameState, st: Station): Record<Cargo, number> {
  const add = {} as Record<Cargo, number>;
  for (const c of CARGOS) add[c] = 0;
  const city = state.cities.find((c) => c.id === st.cityId);
  if (city) {
    add.pax += Math.min(12, city.supply.pax);
    add.mail += Math.min(8, city.supply.mail);
    for (const ind of city.industries) {
      if (ind.produces) add[ind.produces] += 6;
    }
  }
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const t = tileAt(state, st.x + dx, st.y + dy);
      if (!t?.res) continue;
      const cargo = t.res as Cargo;
      add[cargo] += 4;
    }
  }
  return add;
}

function cityWants(state: GameState, st: Station, cargo: Cargo): boolean {
  const city = state.cities.find((c) => c.id === st.cityId);
  if (!city) {
    // rural: mills consume
    return false;
  }
  if (city.demand[cargo] > 0) return true;
  for (const ind of city.industries) {
    if (ind.consumes.includes(cargo)) return true;
  }
  return cargo === "pax" || cargo === "mail";
}

function handleArrival(state: GameState, tr: Train, st: Station, hooks: SimHooks) {
  const dest = st;
  let payout = 0;
  const from = stationOf(state, tr.route[tr.routeIdx]!);
  const dist = from ? Math.max(3, distTiles(from, dest)) : 8;
  for (const car of tr.cars) {
    if (car.amount <= 0) continue;
    if (cityWants(state, dest, car.cargo)) {
      const rate = cargoRate(car.cargo, dist, state.year);
      payout += rate * car.amount;
      state.stats.cargoDelivered[car.cargo] += car.amount;
      car.amount = 0;
    }
  }
  if (payout > 0) {
    tr.profit += payout;
    tr.lastPayout = payout;
    pay(state, tr.companyId, payout, hooks, st.x, st.y);
    const city = state.cities.find((c) => c.id === dest.cityId);
    if (city) {
      city.pop += Math.round(payout / 800);
      city.delivered += payout;
    }
    if (city?.hasPort) {
      const bonus = Math.round(payout * 0.12);
      if (bonus > 0) pay(state, tr.companyId, bonus, hooks, st.x, st.y);
    }
  }

  const nextStops = tr.route.map((id) => stationOf(state, id)).filter(Boolean) as Station[];
  const supply = nearbySupply(state, dest);
  for (const car of tr.cars) {
    if (car.amount > 0) continue;
    const laterWants = nextStops.some((s) => s.id !== dest.id && cityWants(state, s, car.cargo));
    if (!laterWants) continue;
    const take = Math.min(8, supply[car.cargo] || 0, dest.waiting[car.cargo] || 99);
    if (take <= 0 && (supply[car.cargo] || 0) <= 0) continue;
    const got = Math.max(take, Math.min(6, supply[car.cargo] || 0));
    car.amount = got;
    dest.waiting[car.cargo] = Math.max(0, (dest.waiting[car.cargo] || 0) - got);
  }

  tr.routeIdx = (tr.routeIdx + 1) % tr.route.length;
  rebuildPath(state, tr);
}

function gradeFactor(state: GameState, x: number, y: number): number {
  const t = tileAt(state, x, y);
  if (!t) return 0.6;
  if (t.tunnel) return 0.55;
  if (t.t === "hills") return 0.7;
  if (t.t === "mountains") return 0.5;
  if (t.bridge) return 0.85;
  return 1;
}

function moveTrains(state: GameState, days: number, hooks: SimHooks) {
  for (const tr of state.trains) {
    const co = state.companies.find((c) => c.id === tr.companyId);
    if (!co || co.bankrupt) continue;
    if (tr.status === "broken") {
      tr.brokenFor -= days;
      if (tr.brokenFor <= 0) {
        tr.status = "running";
        rebuildPath(state, tr);
      }
      continue;
    }
    if (tr.path.length < 2) {
      rebuildPath(state, tr);
      if (tr.path.length < 2) continue;
    }
    const loco = locoById(tr.locoId);
    const tpy = tilesPerYear(loco);
    let tiles = (tpy * days) / 365;
    const rng = makeRng(state.seed + tr.id + ((state.year * 12 + state.month) | 0), 3);
    if (rng.next() < (1 - loco.reliability) * days * 0.002) {
      tr.status = "broken";
      tr.brokenFor = 8 + rng.int(0, 20);
      if (tr.companyId === state.playerId) {
        hooks.news(`${tr.name} disabled`, `A mechanical failure has stopped ${tr.name} on the line. Repairs are underway.`);
        hooks.sfx("break");
      }
      continue;
    }
    while (tiles > 0 && tr.path.length >= 2) {
      const a = tr.path[tr.pathIdx]!;
      const b = tr.path[tr.pathIdx + 1];
      if (!b) {
        const st = state.stations.find((s) => s.x === a.x && s.y === a.y && tr.route.includes(s.id));
        if (st) handleArrival(state, tr, st, hooks);
        else {
          tr.routeIdx = (tr.routeIdx + 1) % tr.route.length;
          rebuildPath(state, tr);
        }
        break;
      }
      const stepNeed = 1 - tr.segT;
      const gf = gradeFactor(state, b.x, b.y);
      const can = tiles * gf;
      if (can >= stepNeed) {
        tiles -= stepNeed / gf;
        tr.segT = 0;
        tr.pathIdx += 1;
        tr.x = b.x;
        tr.y = b.y;
        tr.heading = Math.atan2(b.y - a.y, b.x - a.x);
        const st = state.stations.find((s) => s.x === b.x && s.y === b.y && tr.route.includes(s.id));
        if (st && tr.pathIdx >= tr.path.length - 1) {
          handleArrival(state, tr, st, hooks);
          tiles = 0;
        }
      } else {
        tr.segT += can;
        tiles = 0;
        tr.x = a.x + (b.x - a.x) * tr.segT;
        tr.y = a.y + (b.y - a.y) * tr.segT;
        tr.heading = Math.atan2(b.y - a.y, b.x - a.x);
      }
    }
  }
}

function spawnCargo(state: GameState) {
  for (const st of state.stations) {
    const sup = nearbySupply(state, st);
    for (const c of CARGOS) {
      st.waiting[c] = Math.min(40, (st.waiting[c] || 0) + Math.round((sup[c] || 0) * 0.35));
    }
  }
  for (const city of state.cities) {
    city.supply.pax = Math.min(40, Math.round((6 + city.pop / 2500) * paxMul(city, state)));
    city.supply.mail = Math.min(24, Math.round((3 + city.pop / 4000) * paxMul(city, state)));
    city.demand.pax = city.supply.pax;
    city.demand.mail = city.supply.mail;
    city.demand.goods = 4 + Math.round(city.pop / 5000) + (city.hasPort ? 4 : 0);
    if (city.hasPort) {
      city.supply.goods = Math.min(24, (city.supply.goods || 0) + 5);
      city.supply.oil = Math.min(16, (city.supply.oil || 0) + 2);
    }
  }
}

function paxMul(city: { served: boolean; highway: boolean; hasAirport: boolean }, state: GameState) {
  let m = 1;
  if (city.highway && state.year >= 1920) m *= 0.78;
  if (city.hasAirport && state.year >= 1932) m *= 0.82;
  return m;
}

function aiThink(state: GameState, hooks: SimHooks) {
  const rng = makeRng(state.seed + state.year * 100 + state.month, 77);
  for (const co of state.companies) {
    if (!co.ai || co.bankrupt) continue;
    if (co.cash < 30000) {
      if (co.bonds.length < 3 && co.cash < 10000) {
        issueBond(state, co.id, 100000);
      }
      continue;
    }
    const myStations = state.stations.filter((s) => s.companyId === co.id);
    const unserved = state.cities.filter(
      (c) => !state.stations.some((s) => s.cityId === c.id && s.companyId === co.id),
    );
    if (myStations.length < 2 && unserved.length >= 2) {
      rng.shuffle(unserved);
      const a = unserved[0]!;
      const b = unserved[1]!;
      const path = pathForSurvey(state, a.x, a.y, b.x, b.y);
      if (path) {
        const budgetTiles = Math.min(path.length, 8);
        for (let i = 0; i < budgetTiles; i++) {
          const p = path[i]!;
          placeTrack(state, p.x, p.y, co.id, hooks);
        }
        const start = path[0]!;
        const end = path[Math.min(path.length - 1, budgetTiles - 1)]!;
        if (!state.stations.some((s) => s.x === start.x && s.y === start.y)) {
          placeStation(state, start.x, start.y, co.id, hooks);
        }
        if (budgetTiles === path.length && !state.stations.some((s) => s.x === end.x && s.y === end.y)) {
          placeStation(state, end.x, end.y, co.id, hooks);
        }
      }
      continue;
    }
    if (myStations.length >= 1 && unserved.length) {
      const from = rng.pick(myStations);
      let best: typeof unserved[0] | null = null;
      let bestD = 1e9;
      for (const c of unserved) {
        const d = Math.abs(c.x - from.x) + Math.abs(c.y - from.y);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      if (best) {
        const path = pathForSurvey(state, from.x, from.y, best.x, best.y);
        if (path) {
          const n = Math.min(6, path.length);
          for (let i = 0; i < n; i++) {
            const p = path[i]!;
            placeTrack(state, p.x, p.y, co.id, hooks);
          }
          const last = path[n - 1]!;
          if (n === path.length) placeStation(state, last.x, last.y, co.id, hooks);
        }
      }
    }
    const sts = state.stations.filter((s) => s.companyId === co.id);
    const myTrains = state.trains.filter((t) => t.companyId === co.id && !state.companies.find((c) => c.id === t.companyId)?.bankrupt);
    if (sts.length >= 2 && myTrains.length < Math.max(1, Math.floor(sts.length / 2))) {
      const locos = locosForYear(state.year);
      const loco = locos[locos.length - 1]!;
      const sa = sts[rng.int(0, sts.length - 1)]!;
      let sb = sts[0]!;
      for (const s of sts) {
        if (s.id !== sa.id && distTiles(s, sa) > distTiles(sb, sa)) sb = s;
      }
      if (sa.id !== sb.id) {
        const cargos: Cargo[] = ["pax", "mail", "goods"];
        if (state.year >= 1850) cargos.push("coal");
        buyTrain(state, co.id, loco.id, cargos.slice(0, loco.capacity), [sa.id, sb.id], hooks);
      }
    }
  }
}

export function issueBond(state: GameState, companyId: number, amount = 100000): boolean {
  const c = state.companies.find((x) => x.id === companyId);
  if (!c || c.bonds.length >= 5) return false;
  const rate = 0.05 + c.bonds.length * 0.01 + (state.difficulty === "magnate" ? 0.02 : 0);
  c.bonds.push({ amount, rate, yearIssued: state.year });
  c.cash += amount;
  return true;
}

export function repayBond(state: GameState, companyId: number, index: number): boolean {
  const c = state.companies.find((x) => x.id === companyId);
  if (!c) return false;
  const b = c.bonds[index];
  if (!b) return false;
  if (!charge(state, companyId, b.amount, false)) return false;
  c.bonds.splice(index, 1);
  return true;
}

export function tradeStock(state: GameState, companyId: number, shares: number): boolean {
  const c = state.companies.find((x) => x.id === companyId);
  const p = playerCompany(state);
  if (!c) return false;
  const cost = Math.round(Math.abs(shares) * c.stockPrice);
  if (shares > 0) {
    if (c.playerShares + shares > c.shares) return false;
    if (!charge(state, p.id, cost, false)) return false;
    c.playerShares += shares;
    c.stockPrice *= 1.01;
    return true;
  }
  if (c.playerShares < -shares) return false;
  c.playerShares += shares;
  p.cash += cost;
  c.stockPrice *= 0.99;
  return true;
}

function monthEnd(state: GameState, hooks: SimHooks) {
  spawnCargo(state);
  aiThink(state, hooks);
  tickWorld(state, hooks);
  for (const c of state.companies) {
    const interest = c.bonds.reduce((s, b) => s + (b.amount * b.rate) / 12, 0);
    if (interest > 0) {
      c.cash -= interest;
      c.expenseYtd += interest;
    }
    const trackMaint = (c.trackTiles * 8 * costMul(state.difficulty)) / 12;
    c.cash -= trackMaint;
    c.expenseYtd += trackMaint;
    const profit = c.revenueYtd / Math.max(1, state.month + 1) - c.expenseYtd / Math.max(1, state.month + 1);
    c.stockPrice = Math.max(2, c.stockPrice * (1 + Math.max(-0.04, Math.min(0.05, profit / 200000))));
    if (c.cash < -80000) {
      c.bankrupt = true;
      hooks.news(`${c.name} bankrupt`, `${c.name} can no longer meet its obligations and has been struck from the exchange.`);
    }
  }
  if (Math.random() < 0.08) randomEvent(state, hooks);
  checkGoals(state, hooks);
}

function yearEnd(state: GameState, hooks: SimHooks) {
  for (const c of state.companies) {
    for (const tr of state.trains.filter((t) => t.companyId === c.id)) {
      const loco = locoById(tr.locoId);
      const m = loco.maint * costMul(state.difficulty);
      c.cash -= m;
      c.expenseYtd += m;
      tr.age += 1;
    }
    const div = Math.max(0, (c.revenueYtd - c.expenseYtd) * 0.08);
    if (div > 0 && c.playerShares > 0) {
      const cut = (div * c.playerShares) / c.shares;
      playerCompany(state).cash += cut;
    }
    c.revenueYtd = 0;
    c.expenseYtd = 0;
  }
  const newly = locosForYear(state.year).filter((l) => l.year === state.year);
  for (const l of newly) {
    hooks.news(`${l.name} introduced`, `${l.blurb} Available for purchase at $${l.cost.toLocaleString("en-US")}.`);
  }
  if (state.year === 1869) {
    hooks.news("Oil discovered", "Black gold seeps from the desert. Oil fields now appear on the map.");
  }
  if (state.year === 1915) {
    hooks.news("The motor age", "Dirt highways begin to stitch the larger towns. Motorcars will steal some passengers.");
  }
  if (state.year === 1928) {
    hooks.news("Wings over the charter", "Airfields open at the biggest cities. Mail and passengers can fly.");
  }
  if (state.timeLimit && state.year >= state.timeLimit && !state.won) {
    checkGoals(state, hooks);
    if (!state.won) {
      const p = playerCompany(state);
      const worth = netWorth(state, p.id);
      const yearGoal = state.goals.find((g) => g.kind === "year_worth");
      if (yearGoal && worth >= yearGoal.target) {
        state.won = true;
        hooks.news("Empire secured", "The ledgers close in your favour.");
      } else if (yearGoal) {
        state.lost = true;
        state.loseReason = "The charter expired before the books were strong enough.";
      }
    }
  }
  checkGoals(state, hooks);
}

function randomEvent(state: GameState, hooks: SimHooks) {
  const rng = makeRng(state.seed + state.year * 13 + state.month, 5);
  const city = rng.pick(state.cities);
  const roll = rng.next();
  if (roll < 0.25) {
    city.pop = Math.round(city.pop * 1.15);
    hooks.news(`${city.name} booms`, `Industry and newcomers swell ${city.name}. Passenger demand is up.`);
  } else if (roll < 0.4) {
    for (const c of state.companies) c.stockPrice *= 0.88;
    hooks.news(`Panic of ${state.year}`, "Share prices tumble across the exchange. The timid sell; the bold buy.");
  } else if (roll < 0.55) {
    for (const c of state.companies) c.stockPrice *= 1.08;
    hooks.news("A gilded season", "Optimism returns to the markets. Railroad shares advance.");
  } else if (roll < 0.7) {
    hooks.news(`Strike at ${city.name}`, "Labour unrest slows shipments this month. Coal and steel wait on sidings.");
  } else if (roll < 0.85 && state.cities.length) {
    city.pop = Math.max(2000, Math.round(city.pop * 0.92));
    hooks.news(`Fever in ${city.name}`, "A hard winter thins the streets. Passenger lists shrink.");
  } else {
    hooks.news("Surveyors' gazette", "New grades have been charted through the hills. Expansion is cheaper this season.");
  }
}

export function checkGoals(state: GameState, hooks: SimHooks = noop) {
  if (state.won || state.lost) return;
  const p = playerCompany(state);
  if (p.bankrupt || p.cash < -50000) {
    state.lost = true;
    state.loseReason = "The company is insolvent. Bondholders have seized the line.";
    return;
  }
  const worth = netWorth(state, p.id);
  let all = true;
  for (const g of state.goals) {
    if (g.kind === "networth" && worth < g.target) all = false;
    if (g.kind === "connect" && state.stats.citiesConnected < g.target) all = false;
    if (g.kind === "cargo" && g.cargo && state.stats.cargoDelivered[g.cargo] < g.target) all = false;
    if (g.kind === "bankrupt_ai") {
      const n = state.companies.filter((c) => c.ai && c.bankrupt).length;
      if (n < g.target) all = false;
    }
    if (g.kind === "year_worth") {
      if (state.timeLimit && state.year < state.timeLimit) all = false;
      else if (worth < g.target) all = false;
    }
    if (g.kind === "link_cities") all = state.stats.citiesConnected >= g.target;
  }
  if (all && state.goals.length) {
    state.won = true;
    hooks.news("Charter fulfilled", "The board toasts a new baron of the iron road.");
  }
}

export function goalProgress(state: GameState): { label: string; current: number; target: number; done: boolean }[] {
  const p = playerCompany(state);
  const worth = netWorth(state, p.id);
  return state.goals.map((g) => {
    let current = 0;
    if (g.kind === "networth" || g.kind === "year_worth") current = worth;
    if (g.kind === "connect" || g.kind === "link_cities") current = state.stats.citiesConnected;
    if (g.kind === "cargo" && g.cargo) current = state.stats.cargoDelivered[g.cargo];
    if (g.kind === "bankrupt_ai") current = state.companies.filter((c) => c.ai && c.bankrupt).length;
    return { label: g.label, current, target: g.target, done: current >= g.target };
  });
}

export function simulate(state: GameState, days: number, hooks: SimHooks = noop) {
  if (state.won || state.lost) return;
  if (days <= 0) return;
  moveTrains(state, days, hooks);
  moveCrafts(state, days);
  state.day += days;
  while (state.day >= daysInMonth(state.month)) {
    state.day -= daysInMonth(state.month);
    state.month += 1;
    monthEnd(state, hooks);
    while (state.month >= 12) {
      state.month -= 12;
      state.year += 1;
      yearEnd(state, hooks);
    }
  }
}

export function daysPerSecond(speed: Speed): number {
  return speed === 0 ? 0 : speed * 7;
}

export function availableLocos(state: GameState): LocoDef[] {
  return locosForYear(state.year);
}

export function placePlayerAirport(state: GameState, x: number, y: number, hooks: SimHooks = noop): boolean {
  if (state.year < 1927) {
    hooks.news("Too soon", "Aeroplanes are still a carnival trick. Wait until the late twenties.");
    return false;
  }
  const t = tileAt(state, x, y);
  if (!t || t.t === "ocean" || t.t === "mountains" || t.t === "river") return false;
  const city = state.cities.find((c) => Math.abs(c.x - x) + Math.abs(c.y - y) <= 4);
  if (!city) {
    hooks.news("No city nearby", "Airfields need a city within a few miles.");
    return false;
  }
  if (city.hasAirport) {
    hooks.news("Already flying", `${city.name} already has an airfield.`);
    return false;
  }
  const pad = findAirfield(state, city.x, city.y);
  const ax = pad?.x ?? x;
  const ay = pad?.y ?? y;
  if (!charge(state, state.playerId, 90000)) {
    hooks.news("Short of cash", "An airfield costs $90,000.");
    return false;
  }
  city.hasAirport = true;
  city.airX = ax;
  city.airY = ay;
  hooks.news(`${city.name} Airfield`, `A strip opens beside ${city.name}. Long-distance mail will leak to the sky.`);
  hooks.sfx("bell");
  hooks.float(ax, ay, "Airfield", "#c9cdc6");
  return true;
}
