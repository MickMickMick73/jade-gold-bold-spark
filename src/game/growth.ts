import { makeRng } from "./rng";
import { extraTownName } from "./names";
import {
  CARGOS,
  DIRS,
  N,
  S,
  emptyCargo,
  type City,
  type CityClass,
  type Craft,
  type GameState,
  type Industry,
} from "./types";
import { pathForRoad, pathOnWater, tileAt } from "./pathfinding";

export interface WorldHooks {
  float: (x: number, y: number, text: string, color?: string) => void;
  news: (headline: string, body: string) => void;
  sfx: (name: "build" | "cash" | "bell" | "break" | "click") => void;
}

function nid(state: GameState) {
  return state.nextId++;
}

export function cityClassFromPop(pop: number): CityClass {
  if (pop >= 90000) return "metropolis";
  if (pop >= 24000) return "city";
  if (pop >= 9000) return "town";
  return "hamlet";
}

/** Absolute demand from population, year, and industries. Safe to call every month. */
export function refreshCityMarkets(city: City, year: number) {
  const pop = city.pop;
  const d = city.demand;
  for (const c of CARGOS) d[c] = 0;
  d.pax = 8 + Math.round(pop / 2200);
  d.mail = 4 + Math.round(pop / 4200);
  d.goods = 3 + Math.round(pop / 4800) + (city.hasPort ? 4 : 0);
  d.grain = 2 + Math.round(pop / 14000);
  d.coal = 2 + Math.round(pop / 16000);
  d.lumber = 1 + Math.round(pop / 18000);
  d.cattle = 2 + Math.round(pop / 20000);
  if (year >= 1859) d.oil = 1 + Math.round(pop / 22000) + (city.hasPort ? 3 : 0);
  if (city.cls === "city" || city.cls === "metropolis") {
    d.steel += 2;
    d.iron += 1;
    d.coal += 2;
  }
  for (const ind of city.industries) {
    for (const c of ind.consumes) d[c] += 5;
  }
}

export function packingHouse(): Industry {
  return { kind: "Packing house", produces: "goods", consumes: ["cattle"] };
}

export function refinery(): Industry {
  return { kind: "Refinery", produces: "goods", consumes: ["oil"] };
}

function isWater(t: string) {
  return t === "ocean" || t === "coast" || t === "river";
}

export function findBerth(state: GameState, x: number, y: number): { x: number; y: number } | null {
  for (let r = 1; r <= 3; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const t = tileAt(state, x + dx, y + dy);
        if (t && isWater(t.t)) return { x: x + dx, y: y + dy };
      }
    }
  }
  return null;
}

export function findAirfield(state: GameState, x: number, y: number): { x: number; y: number } | null {
  let best: { x: number; y: number } | null = null;
  let bestD = 99;
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      if (dx === 0 && dy === 0) continue;
      const tx = x + dx;
      const ty = y + dy;
      const t = tileAt(state, tx, ty);
      if (!t || t.track || t.road) continue;
      if (t.t !== "plains" && t.t !== "desert" && t.t !== "coast") continue;
      if (state.cities.some((c) => c.x === tx && c.y === ty)) continue;
      const d = Math.abs(dx) + Math.abs(dy);
      if (d < bestD) {
        bestD = d;
        best = { x: tx, y: ty };
      }
    }
  }
  return best;
}

function recomputeRoadBits(state: GameState, x: number, y: number) {
  const t = tileAt(state, x, y);
  if (!t || t.road === 0) return;
  let bits = 0;
  for (const d of DIRS) {
    const n = tileAt(state, x + d.dx, y + d.dy);
    if (n && n.road) bits |= d.bit;
  }
  t.road = bits === 0 ? N | S : bits;
}

function paintRoad(state: GameState, x: number, y: number) {
  const t = tileAt(state, x, y);
  if (!t || t.t === "ocean" || t.t === "mountains") return false;
  if (!t.road) t.road = N | S;
  recomputeRoadBits(state, x, y);
  for (const d of DIRS) recomputeRoadBits(state, x + d.dx, y + d.dy);
  return true;
}

function roadsLink(state: GameState, a: City, b: City): boolean {
  const t = tileAt(state, a.x, a.y);
  if (!t?.road) return false;
  const seen = new Set<number>();
  const stack = [a.y * state.mapW + a.x];
  while (stack.length) {
    const i = stack.pop()!;
    if (seen.has(i)) continue;
    seen.add(i);
    const x = i % state.mapW;
    const y = (i / state.mapW) | 0;
    if (x === b.x && y === b.y) return true;
    if (seen.size > 4000) break;
    for (const d of DIRS) {
      const nx = x + d.dx;
      const ny = y + d.dy;
      const nt = tileAt(state, nx, ny);
      if (nt?.road) stack.push(ny * state.mapW + nx);
    }
  }
  return false;
}

export function growCities(state: GameState) {
  for (const city of state.cities) {
    const age = Math.max(1, state.year - city.foundedYear);
    let g = 0.012 + Math.min(0.02, (state.year - 1830) * 0.00012);
    if (city.served) g *= 1.85 + Math.min(0.6, city.delivered / 200000);
    else g *= age > 50 ? 0.35 : 0.7;
    if (city.hasPort) g *= 1.22;
    if (city.hasAirport) g *= 1.12;
    if (city.highway) g *= city.served ? 1.08 : 1.16;
    const neighbors = state.cities.filter(
      (o) => o.id !== city.id && Math.hypot(o.x - city.x, o.y - city.y) < 16 && o.served,
    ).length;
    if (neighbors >= 2) g *= 1.2;
    if (age > 90 && city.served) g *= 1.1;
    const delta = (city.pop * g) / 12;
    city.pop = Math.max(800, Math.min(1_800_000, Math.round(city.pop + delta)));
    city.growth = g;
    const prev = city.cls;
    city.cls = cityClassFromPop(city.pop);
    refreshCityMarkets(city, state.year);
    if (city.cls !== prev && city.cls === "city") {
      if (!city.industries.some((i) => i.kind === "Factory")) {
        city.industries.push({ kind: "Factory", produces: "goods", consumes: ["steel", "lumber", "coal"] });
      }
      if (!city.industries.some((i) => i.kind === "Packing house") && city.id % 2 === 0) {
        city.industries.push(packingHouse());
      }
      refreshCityMarkets(city, state.year);
    }
    if (city.cls === "metropolis" && !city.industries.some((i) => /steel/i.test(i.kind))) {
      city.industries.push({ kind: "Steel mill", produces: "steel", consumes: ["iron", "coal"] });
      if (state.year >= 1859 && !city.industries.some((i) => i.kind === "Refinery")) {
        city.industries.push(refinery());
      }
      refreshCityMarkets(city, state.year);
    }
  }
}

export function foundTowns(state: GameState, hooks: WorldHooks) {
  if (state.cities.length >= 80) return;
  const rng = makeRng(state.seed + state.year * 91, 4);
  const chance = state.mapW >= 160 ? 0.18 : state.mapW >= 120 ? 0.12 : 0.08;
  if (!rng.chance(chance)) return;

  const used = new Set(state.cities.map((c) => c.name));
  const hubs = state.cities.filter((c) => c.cls === "metropolis" || (c.served && c.pop > 40000));
  const satellite = hubs.length > 0 && rng.chance(0.45);
  const hub = satellite ? rng.pick(hubs) : null;

  let x = 0;
  let y = 0;
  let ok = false;
  for (let n = 0; n < 600; n++) {
    if (hub) {
      x = hub.x + rng.int(-10, 10);
      y = hub.y + rng.int(-10, 10);
    } else {
      x = rng.int(3, state.mapW - 4);
      y = rng.int(3, state.mapH - 4);
    }
    const t = tileAt(state, x, y);
    if (!t) continue;
    if (t.t === "ocean" || t.t === "mountains" || t.t === "river") continue;
    const minD = hub ? 5 : state.mapW >= 160 ? 11 : 8;
    if (state.cities.some((c) => Math.hypot(c.x - x, c.y - y) < minD)) continue;
    ok = true;
    break;
  }
  if (!ok) return;

  const name =
    state.namePool.shift() ?? extraTownName(state.region, rng, used);
  const coastal = !!findBerth(state, x, y);
  const pop = hub ? rng.int(4, 9) * 1000 : rng.int(2, 6) * 1000;
  const industries: Industry[] = [];
  if (rng.chance(0.25)) industries.push({ kind: "Mill", produces: "goods", consumes: ["lumber"] });
  if (rng.chance(0.22)) industries.push(packingHouse());
  if (state.year >= 1860 && rng.chance(0.18)) industries.push(refinery());
  const demand = emptyCargo();
  const supply = emptyCargo();
  const city: City = {
    id: nid(state),
    name,
    x,
    y,
    pop,
    industries,
    demand,
    supply,
    served: false,
    foundedYear: state.year,
    cls: cityClassFromPop(pop),
    coastal,
    hasPort: false,
    hasAirport: false,
    highway: false,
    growth: 0.02,
    delivered: 0,
  };
  refreshCityMarkets(city, state.year);
  city.supply.pax = city.demand.pax;
  city.supply.mail = city.demand.mail;
  const t = tileAt(state, x, y);
  if (t && t.t !== "coast") t.t = "plains";
  state.cities.push(city);
  const why = hub ? `a new suburb of ${hub.name}` : coastal ? "a harbor settlement" : "a pioneer town on open land";
  hooks.news(`${name} founded`, `${name} is ${why}. Lay iron if you want the trade.`);
  hooks.float(x, y, name, "#e8e4d8");
}

export function developPorts(state: GameState, hooks: WorldHooks) {
  for (const city of state.cities) {
    if (city.hasPort) continue;
    if (!city.coastal && !findBerth(state, city.x, city.y)) continue;
    city.coastal = true;
    if (city.pop < 7000 && state.year < 1855) continue;
    const berth = findBerth(state, city.x, city.y);
    if (!berth) continue;
    city.hasPort = true;
    city.portX = berth.x;
    city.portY = berth.y;
    hooks.news(`Port of ${city.name}`, `Wharves open at ${city.name}. Sea trade will fatten anyone who rails to the docks.`);
  }
}

export function developAirports(state: GameState, hooks: WorldHooks) {
  if (state.year < 1928) return;
  for (const city of state.cities) {
    if (city.hasAirport) continue;
    if (city.pop < 28000) continue;
    const pad = findAirfield(state, city.x, city.y);
    if (!pad) continue;
    city.hasAirport = true;
    city.airX = pad.x;
    city.airY = pad.y;
    hooks.news(`${city.name} Airfield`, `A grass strip and hangar open outside ${city.name}. The mail is learning to fly.`);
  }
}

export function expandHighways(state: GameState, hooks: WorldHooks) {
  if (state.year < 1915) return;
  const rng = makeRng(state.seed + state.year * 17 + state.month, 8);
  const hubs = state.cities.filter((c) => c.pop >= 12000);
  if (hubs.length < 2) return;
  let painted = 0;
  const budget = state.year >= 1930 ? 14 : 8;
  rng.shuffle(hubs);
  for (let i = 0; i < hubs.length && painted < budget; i++) {
    const a = hubs[i]!;
    let b: City | null = null;
    let best = 1e9;
    for (const o of hubs) {
      if (o.id === a.id) continue;
      const d = Math.hypot(o.x - a.x, o.y - a.y);
      if (d < 6 || d > 36) continue;
      if (roadsLink(state, a, o)) {
        a.highway = true;
        o.highway = true;
        continue;
      }
      if (d < best) {
        best = d;
        b = o;
      }
    }
    if (!b) continue;
    const path = pathForRoad(state, a.x, a.y, b.x, b.y);
    if (!path) continue;
    for (const p of path) {
      if (painted >= budget) break;
      if (paintRoad(state, p.x, p.y)) painted++;
    }
    if (path.length && path.every((p) => tileAt(state, p.x, p.y)?.road)) {
      a.highway = true;
      b.highway = true;
      if (rng.chance(0.35)) {
        hooks.news(
          state.year >= 1930 ? "Concrete highway" : "Motor road",
          `A ${state.year >= 1930 ? "paved highway" : "dirt motor road"} now ties ${a.name} to ${b.name}. Motorcars nibble at the passenger trade.`,
        );
      }
    }
  }
}

function craftSpeed(kind: Craft["kind"]) {
  return kind === "plane" ? 0.55 : 0.12;
}

function spawnCrafts(state: GameState) {
  const ports = state.cities.filter((c) => c.hasPort && c.portX !== undefined);
  const airs = state.cities.filter((c) => c.hasAirport && c.airX !== undefined);
  const ships = state.crafts.filter((c) => c.kind === "ship").length;
  const planes = state.crafts.filter((c) => c.kind === "plane").length;

  if (ports.length >= 2 && ships < Math.min(10, ports.length)) {
    const a = ports[ships % ports.length]!;
    const b = ports[(ships + 1) % ports.length]!;
    if (a.id !== b.id) {
      const path = pathOnWater(state, a.portX!, a.portY!, b.portX!, b.portY!);
      if (path && path.length > 2) {
        state.crafts.push({
          id: nid(state),
          kind: "ship",
          x: path[0]!.x,
          y: path[0]!.y,
          heading: 0,
          fromId: a.id,
          toId: b.id,
          path,
          pathIdx: 0,
          segT: 0,
        });
      }
    }
  }
  if (state.year >= 1928 && airs.length >= 2 && planes < Math.min(8, airs.length)) {
    const a = airs[planes % airs.length]!;
    const b = airs[(planes + 1) % airs.length]!;
    if (a.id !== b.id) {
      const path = [
        { x: a.airX!, y: a.airY! },
        { x: b.airX!, y: b.airY! },
      ];
      state.crafts.push({
        id: nid(state),
        kind: "plane",
        x: path[0]!.x,
        y: path[0]!.y,
        heading: Math.atan2(b.airY! - a.airY!, b.airX! - a.airX!),
        fromId: a.id,
        toId: b.id,
        path,
        pathIdx: 0,
        segT: 0,
      });
    }
  }
}

export function moveCrafts(state: GameState, days: number) {
  spawnCrafts(state);
  for (const cr of state.crafts) {
    if (cr.path.length < 2) continue;
    let tiles = craftSpeed(cr.kind) * days;
    while (tiles > 0) {
      const a = cr.path[cr.pathIdx]!;
      const b = cr.path[cr.pathIdx + 1];
      if (!b) {
        const tmp = cr.fromId;
        cr.fromId = cr.toId;
        cr.toId = tmp;
        cr.path.reverse();
        cr.pathIdx = 0;
        cr.segT = 0;
        break;
      }
      const need = 1 - cr.segT;
      if (tiles >= need) {
        tiles -= need;
        cr.segT = 0;
        cr.pathIdx += 1;
        cr.x = b.x;
        cr.y = b.y;
        cr.heading = Math.atan2(b.y - a.y, b.x - a.x);
      } else {
        cr.segT += tiles;
        tiles = 0;
        cr.x = a.x + (b.x - a.x) * cr.segT;
        cr.y = a.y + (b.y - a.y) * cr.segT;
        cr.heading = Math.atan2(b.y - a.y, b.x - a.x);
      }
    }
  }
}

export function tickWorld(state: GameState, hooks: WorldHooks) {
  growCities(state);
  developPorts(state, hooks);
  developAirports(state, hooks);
  expandHighways(state, hooks);
  foundTowns(state, hooks);
}
