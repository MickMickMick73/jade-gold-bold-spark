import { DIRS, type GameState, type Tile } from "./types";

export function idx(state: { mapW: number }, x: number, y: number): number {
  return y * state.mapW + x;
}

export function inBounds(state: { mapW: number; mapH: number }, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < state.mapW && y < state.mapH;
}

export function tileAt(state: GameState, x: number, y: number): Tile | null {
  if (!inBounds(state, x, y)) return null;
  return state.tiles[idx(state, x, y)] ?? null;
}

class MinHeap {
  k: number[] = [];
  v: number[] = [];
  n = 0;
  push(key: number, val: number) {
    let i = this.n++;
    this.k[i] = key;
    this.v[i] = val;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.k[p]! <= this.k[i]!) break;
      this.swap(i, p);
      i = p;
    }
  }
  pop(): number | undefined {
    if (this.n === 0) return undefined;
    const out = this.v[0];
    this.n--;
    if (this.n > 0) {
      this.k[0] = this.k[this.n]!;
      this.v[0] = this.v[this.n]!;
      this.down(0);
    }
    return out;
  }
  swap(i: number, j: number) {
    const tk = this.k[i]!;
    const tv = this.v[i]!;
    this.k[i] = this.k[j]!;
    this.v[i] = this.v[j]!;
    this.k[j] = tk;
    this.v[j] = tv;
  }
  down(i: number) {
    for (;;) {
      let s = i;
      const l = i * 2 + 1;
      const r = l + 1;
      if (l < this.n && this.k[l]! < this.k[s]!) s = l;
      if (r < this.n && this.k[r]! < this.k[s]!) s = r;
      if (s === i) break;
      this.swap(i, s);
      i = s;
    }
  }
}

export function terrainBuildCost(t: Tile): number | null {
  if (t.t === "ocean") return null;
  switch (t.t) {
    case "plains":
    case "coast":
      return 2000;
    case "desert":
      return 2500;
    case "forest":
      return 3200;
    case "hills":
      return 5500;
    case "swamp":
      return 7000;
    case "river":
      return 14000;
    case "mountains":
      return 18000;
    default:
      return 3000;
  }
}

export function terrainTravelCost(t: Tile): number {
  if (t.t === "ocean") return 1e9;
  switch (t.t) {
    case "plains":
    case "coast":
      return 1;
    case "desert":
      return 1.2;
    case "forest":
      return 1.6;
    case "hills":
      return 2.4;
    case "swamp":
      return 3;
    case "river":
      return 4;
    case "mountains":
      return 6;
    default:
      return 2;
  }
}

function astar(
  state: GameState,
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  passable: (tile: Tile, x: number, y: number, from: Tile | null) => number | null,
): { x: number; y: number }[] | null {
  if (!inBounds(state, sx, sy) || !inBounds(state, tx, ty)) return null;
  const w = state.mapW;
  const h = state.mapH;
  const size = w * h;
  const start = sy * w + sx;
  const goal = ty * w + tx;
  const g = new Float32Array(size);
  g.fill(Infinity);
  g[start] = 0;
  const came = new Int32Array(size);
  came.fill(-1);
  const heap = new MinHeap();
  const heur = (i: number) => {
    const x = i % w;
    const y = (i / w) | 0;
    return Math.abs(x - tx) + Math.abs(y - ty);
  };
  heap.push(heur(start), start);
  let found = false;
  while (heap.n > 0) {
    const cur = heap.pop()!;
    if (cur === goal) {
      found = true;
      break;
    }
    const cx = cur % w;
    const cy = (cur / w) | 0;
    const ct = state.tiles[cur]!;
    for (const d of DIRS) {
      const nx = cx + d.dx;
      const ny = cy + d.dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const ni = ny * w + nx;
      const nt = state.tiles[ni]!;
      const step = passable(nt, nx, ny, ct);
      if (step === null) continue;
      const ng = g[cur]! + step;
      if (ng < g[ni]!) {
        g[ni] = ng;
        came[ni] = cur;
        heap.push(ng + heur(ni), ni);
      }
    }
  }
  if (!found) return null;
  const path: { x: number; y: number }[] = [];
  let c = goal;
  while (c !== -1) {
    path.push({ x: c % w, y: (c / w) | 0 });
    if (c === start) break;
    c = came[c]!;
  }
  path.reverse();
  return path;
}

export function pathOnTrack(
  state: GameState,
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  companyId: number,
  avoid?: (x: number, y: number) => boolean,
): { x: number; y: number }[] | null {
  return astar(state, sx, sy, tx, ty, (tile, x, y) => {
    if (tile.track === 0) return null;
    if (tile.owner !== companyId && tile.owner !== 0) return null;
    if (avoid && avoid(x, y) && !(x === tx && y === ty) && !(x === sx && y === sy)) return null;
    return 1;
  });
}

export function pathOnWater(
  state: GameState,
  sx: number,
  sy: number,
  tx: number,
  ty: number,
): { x: number; y: number }[] | null {
  return astar(state, sx, sy, tx, ty, (tile) => {
    if (tile.t === "ocean" || tile.t === "coast" || tile.t === "river") return 1;
    return null;
  });
}

export function pathForRoad(
  state: GameState,
  sx: number,
  sy: number,
  tx: number,
  ty: number,
): { x: number; y: number }[] | null {
  return astar(state, sx, sy, tx, ty, (tile) => {
    if (tile.t === "ocean" || tile.t === "mountains") return null;
    return terrainTravelCost(tile);
  });
}

export function pathForSurvey(
  state: GameState,
  sx: number,
  sy: number,
  tx: number,
  ty: number,
): { x: number; y: number }[] | null {
  return astar(state, sx, sy, tx, ty, (tile) => {
    if (tile.t === "ocean") return null;
    return terrainTravelCost(tile);
  });
}

/** 4-connected grid line — never steps x and y together, so rails always share an edge. */
export function line4(x0: number, y0: number, x1: number, y1: number): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [{ x: x0, y: y0 }];
  let x = x0;
  let y = y0;
  const nx = Math.abs(x1 - x0);
  const ny = Math.abs(y1 - y0);
  const sx = x0 === x1 ? 0 : x0 < x1 ? 1 : -1;
  const sy = y0 === y1 ? 0 : y0 < y1 ? 1 : -1;
  let ix = 0;
  let iy = 0;
  while (ix < nx || iy < ny) {
    const xErr = nx === 0 ? Number.POSITIVE_INFINITY : (ix + 0.5) / nx;
    const yErr = ny === 0 ? Number.POSITIVE_INFINITY : (iy + 0.5) / ny;
    if (xErr <= yErr) {
      x += sx;
      ix++;
    } else {
      y += sy;
      iy++;
    }
    out.push({ x, y });
    if (out.length > 800) break;
  }
  return out;
}
