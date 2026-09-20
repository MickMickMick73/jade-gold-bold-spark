import {
  CARGO_LABEL,
  CARGOS,
  FREIGHT_CARGOS,
  isCoachCargo,
  type Cargo,
  type City,
  type GameState,
  type Station,
} from "./types";
import { tileAt } from "./pathfinding";

export function cargoList(rec: Record<Cargo, number>, min = 1): string {
  return CARGOS.filter((c) => (rec[c] || 0) >= min)
    .map((c) => `${CARGO_LABEL[c]} ${rec[c]}`)
    .join("  ·  ");
}

export function cityWantsList(city: City): string {
  const wants = cargoList(city.demand, 1);
  return wants || "no cargo demand";
}

export function cityMakesList(city: City): string {
  if (!city.industries.length) return "market town";
  return city.industries.map((i) => `${i.kind} (${CARGO_LABEL[i.produces]})`).join(", ");
}

export function describeStation(state: GameState, st: Station): string {
  const city = state.cities.find((c) => c.id === st.cityId);
  const waiting = cargoList(st.waiting, 1);
  const routes = state.trains.filter((t) => t.companyId === st.companyId && t.route.includes(st.id)).length;
  const lines = [
    city ? `${st.name}  ·  ${city.name}` : st.name,
    waiting ? `Waiting  ${waiting}` : "Platform empty",
    city ? `Town wants  ${cityWantsList(city)}` : "Rural halt",
    routes ? `${routes} train${routes === 1 ? "" : "s"} call here` : "No trains routed yet",
  ];
  return lines.join("\n");
}

export function popMeter(pop: number, width = 8): string {
  const cap = 90000;
  const filled = Math.max(0, Math.min(width, Math.round((pop / cap) * width)));
  return `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
}

export function describeCity(city: City): string {
  const tags = [
    city.served ? "on the railroad" : "unserved",
    city.hasPort ? "port" : "",
    city.hasAirport ? "airfield" : "",
    city.highway ? "highway" : "",
  ].filter(Boolean);
  const growth = `${city.growth >= 0 ? "+" : ""}${(city.growth * 100).toFixed(1)}% /yr`;
  return [
    `${city.name}  ·  ${city.cls}`,
    `Pop  ${popMeter(city.pop)}  ${city.pop.toLocaleString("en-US")}  ${growth}`,
    `Wants  ${cityWantsList(city)}`,
    `Makes  ${cityMakesList(city)}`,
    `Founded ${city.foundedYear}  ·  ${tags.join(" · ")}`,
  ].join("\n");
}

export function describeTile(state: GameState, x: number, y: number): string {
  const gap = (state.surveyGaps ?? []).some((g) => g.x === x && g.y === y);
  if (gap) {
    const t = tileAt(state, x, y);
    const water = t && (t.t === "ocean" || t.t === "river");
    return water
      ? "Broken trestle  ·  this span never laid\nDrag from shore to shore, or repair the red dashed tiles."
      : "Broken line  ·  this tile was skipped\nLay track again through the gap.";
  }
  const st = state.stations.find((s) => s.x === x && s.y === y);
  if (st) return describeStation(state, st);
  const city = state.cities.find((c) => Math.abs(c.x - x) + Math.abs(c.y - y) <= 1);
  if (city) return describeCity(city);
  const tr = state.trains.find((t) => Math.round(t.x) === x && Math.round(t.y) === y);
  if (tr) {
    const load = tr.cars
      .map((c) => `${isCoachCargo(c.cargo) ? "Coach" : "Wagon"} ${CARGO_LABEL[c.cargo]} ${c.amount}`)
      .join(" · ");
    return `${tr.name}\n${load || "Empty consist"}`;
  }
  const tile = tileAt(state, x, y);
  if (!tile) return "";
  const bits: string[] = [tile.t];
  if (tile.res) bits.push(`${tile.res} field`);
  if (tile.track) bits.push(tile.bridge ? "trestle" : tile.tunnel ? "tunnel" : "track");
  if (tile.road) bits.push("highway");
  if (tile.t === "ocean") bits.push("needs a shore-rooted trestle");
  return bits.join("  ·  ");
}

export function hoverTip(state: GameState, x: number, y: number): string {
  const st = state.stations.find((s) => s.x === x && s.y === y);
  if (st) {
    const waiting = cargoList(st.waiting, 1);
    return waiting ? `${st.name}\n${waiting}` : `${st.name}\nPlatform empty`;
  }
  const city = state.cities.find((c) => Math.abs(c.x - x) + Math.abs(c.y - y) <= 1);
  if (city) {
    return `${city.name}  ·  ${city.cls}\n${popMeter(city.pop)}  ${Math.round(city.pop / 1000)}k  ${city.growth >= 0 ? "+" : ""}${(city.growth * 100).toFixed(1)}%\nWants ${cityWantsList(city)}\n${cityMakesList(city)}`;
  }
  const tile = tileAt(state, x, y);
  if (!tile) return "";
  if ((state.surveyGaps ?? []).some((g) => g.x === x && g.y === y)) return "Broken line — tile never laid";
  if (tile.res) return `${tile.res}  ·  haul to a town that wants it`;
  if (tile.track) return tile.bridge ? "Trestle" : tile.tunnel ? "Tunnel" : "Track";
  return tile.t;
}

/** Freight cargos a city will actually pay for. */
export function payingFreight(city: City): Cargo[] {
  return FREIGHT_CARGOS.filter((c) => (city.demand[c] || 0) > 0);
}
