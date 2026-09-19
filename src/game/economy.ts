import { DIFFICULTY_META } from "./scenarios";
import type { Cargo, Difficulty, GameState, Tile } from "./types";
import { terrainBuildCost } from "./pathfinding";

export function revMul(d: Difficulty): number {
  return DIFFICULTY_META[d].rev;
}
export function costMul(d: Difficulty): number {
  return DIFFICULTY_META[d].cost;
}

export function netWorth(state: GameState, companyId: number): number {
  const c = state.companies.find((x) => x.id === companyId);
  if (!c) return 0;
  const track = c.trackTiles * 1200;
  const trains = state.trains.filter((t) => t.companyId === companyId).length * 25000;
  const stations = state.stations.filter((s) => s.companyId === companyId).length * 15000;
  const stock = c.playerShares * c.stockPrice;
  const bonds = c.bonds.reduce((s, b) => s + b.amount, 0);
  if (c.ai) return c.cash + track + trains + stations - bonds;
  return c.cash + track + trains + stations + stock - bonds;
}

export function playerCompany(state: GameState) {
  return state.companies.find((c) => c.id === state.playerId)!;
}

export function buildCostFor(state: GameState, tile: Tile): number | null {
  const base = terrainBuildCost(tile);
  if (base === null) return null;
  let c = base;
  if (tile.t === "river") c = 14000;
  if (tile.t === "mountains") c = 18000;
  return Math.round(c * costMul(state.difficulty));
}

export function stationCost(level: 1 | 2 | 3, d: Difficulty): number {
  const table = { 1: 22000, 2: 55000, 3: 110000 };
  return Math.round(table[level] * costMul(d));
}

export function cargoRate(cargo: Cargo, dist: number, year: number): number {
  const base: Record<Cargo, number> = {
    pax: 28,
    mail: 36,
    coal: 14,
    iron: 16,
    steel: 24,
    grain: 12,
    cattle: 18,
    lumber: 13,
    goods: 26,
    oil: 30,
  };
  const inflation = 1 + Math.max(0, year - 1830) * 0.004;
  const d = Math.max(2, dist);
  return base[cargo] * d * inflation;
}

export function daysInMonth(month: number): number {
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month] ?? 30;
}
