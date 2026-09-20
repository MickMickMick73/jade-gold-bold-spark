import { DIRS, DIRS8, E, N, NE, NW, S, SE, SW, W, type Dir8, type GameState } from "./types";
import { tileAt } from "./pathfinding";

export type Pt = { x: number; y: number };

export function dirFromDelta(dx: number, dy: number): Dir8 | null {
  const sx = Math.sign(dx);
  const sy = Math.sign(dy);
  if (sx === 0 && sy === 0) return null;
  return DIRS8.find((d) => d.dx === sx && d.dy === sy) ?? null;
}

export function dirBetween(a: Pt, b: Pt): Dir8 | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) !== 1) return null;
  return dirFromDelta(dx, dy);
}

export function qBezier(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

export function qBezierTan(p0: Pt, p1: Pt, p2: Pt, t: number): number {
  const dx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
  const dy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
  if (Math.abs(dx) + Math.abs(dy) < 1e-6) return Math.atan2(p2.y - p0.y, p2.x - p0.x);
  return Math.atan2(dy, dx);
}

export function qBezierLen(p0: Pt, p1: Pt, p2: Pt): number {
  let len = 0;
  let prev = p0;
  for (let i = 1; i <= 8; i++) {
    const p = qBezier(p0, p1, p2, i / 8);
    len += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return Math.max(0.35, len);
}

function anchors(tile: Pt, from: Pt | null, to: Pt | null) {
  const c = { x: tile.x, y: tile.y };
  const entry = from ? { x: (tile.x + from.x) / 2, y: (tile.y + from.y) / 2 } : c;
  const exit = to ? { x: (tile.x + to.x) / 2, y: (tile.y + to.y) / 2 } : c;
  return { entry, ctrl: c, exit };
}

/** Face along the grid step, never a degenerate bezier tangent (those read as east). */
export function segmentHeading(from: Pt | null, to: Pt | null, tile: Pt): number {
  if (from && to && (to.x !== from.x || to.y !== from.y)) {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }
  if (to && (to.x !== tile.x || to.y !== tile.y)) {
    return Math.atan2(to.y - tile.y, to.x - tile.x);
  }
  if (from && (tile.x !== from.x || tile.y !== from.y)) {
    return Math.atan2(tile.y - from.y, tile.x - from.x);
  }
  return 0;
}

export function headingAlongPath(path: Pt[], idx: number): number {
  if (!path.length) return 0;
  const i = Math.max(0, Math.min(idx, path.length - 1));
  const cur = path[i]!;
  const next = path[i + 1];
  if (next && (next.x !== cur.x || next.y !== cur.y)) {
    return Math.atan2(next.y - cur.y, next.x - cur.x);
  }
  const prev = path[i - 1];
  if (prev && (prev.x !== cur.x || prev.y !== cur.y)) {
    return Math.atan2(cur.y - prev.y, cur.x - prev.x);
  }
  return 0;
}

export function railPose(tile: Pt, from: Pt | null, to: Pt | null, t: number): { x: number; y: number; heading: number } {
  const { entry, ctrl, exit } = anchors(tile, from, to);
  const p = qBezier(entry, ctrl, exit, t);
  return { x: p.x, y: p.y, heading: segmentHeading(from, to, tile) };
}

export function railLen(tile: Pt, from: Pt | null, to: Pt | null): number {
  const { entry, ctrl, exit } = anchors(tile, from, to);
  return qBezierLen(entry, ctrl, exit);
}

export interface RailMover {
  path: Pt[];
  pathIdx: number;
  segT: number;
  x: number;
  y: number;
  heading: number;
}

/** Walk `distance` tile-units along the curved rail. True if the path is exhausted. */
export function advanceRail(m: RailMover, distance: number): boolean {
  while (distance > 0 && m.path.length) {
    if (m.pathIdx >= m.path.length) {
      const last = m.path[m.path.length - 1]!;
      m.x = last.x;
      m.y = last.y;
      return true;
    }
    const tile = m.path[m.pathIdx]!;
    const from = m.path[m.pathIdx - 1] ?? null;
    const to = m.path[m.pathIdx + 1] ?? null;
    if (!from && !to) {
      m.x = tile.x;
      m.y = tile.y;
      return true;
    }
    const len = railLen(tile, from, to);
    const remain = (1 - m.segT) * len;
    if (distance >= remain - 1e-6) {
      distance -= remain;
      m.segT = 0;
      m.pathIdx += 1;
      if (m.pathIdx >= m.path.length) {
        const pose = railPose(tile, from, to, 1);
        m.x = pose.x;
        m.y = pose.y;
        m.heading = pose.heading;
        return true;
      }
      const nxt = m.path[m.pathIdx]!;
      const pose = railPose(nxt, tile, m.path[m.pathIdx + 1] ?? null, 0);
      m.x = pose.x;
      m.y = pose.y;
      m.heading = pose.heading;
    } else {
      m.segT += distance / len;
      distance = 0;
      const pose = railPose(tile, from, to, m.segT);
      m.x = pose.x;
      m.y = pose.y;
      m.heading = pose.heading;
    }
  }
  return m.pathIdx >= m.path.length;
}

/** Pose `back` tile-units behind a mover, for carriages on the curve. */
export function poseBehind(
  path: Pt[],
  pathIdx: number,
  segT: number,
  back: number,
): { x: number; y: number; heading: number; idx: number } {
  let i = pathIdx;
  let t = segT;
  let left = back;
  while (left > 0 && i >= 0) {
    const tile = path[i]!;
    const from = path[i - 1] ?? null;
    const to = path[i + 1] ?? null;
    const len = railLen(tile, from, to);
    const along = t * len;
    if (along >= left) {
      t = (along - left) / len;
      left = 0;
      const pose = railPose(tile, from, to, t);
      return { ...pose, heading: headingAlongPath(path, i), idx: i };
    }
    left -= along;
    i -= 1;
    t = 1;
  }
  const idx = Math.max(0, i);
  const tile = path[idx]!;
  const from = path[idx - 1] ?? null;
  const to = path[idx + 1] ?? null;
  const pose = railPose(tile, from, to, Math.max(0, t));
  return { ...pose, heading: headingAlongPath(path, idx), idx };
}

function through(bits: number, a: number, b: number) {
  return (bits & a) !== 0 && (bits & b) !== 0;
}

function isCardinalThrough(bits: number) {
  return through(bits, E, W) || through(bits, N, S);
}

export type PathAxis = "ew" | "ns" | "diag";

export function pathAxisOf(pts: Pt[]): PathAxis {
  if (pts.length < 2) return "diag";
  const dx = Math.abs(pts[pts.length - 1]!.x - pts[0]!.x);
  const dy = Math.abs(pts[pts.length - 1]!.y - pts[0]!.y);
  if (dx >= dy * 2) return "ew";
  if (dy >= dx * 2) return "ns";
  return "diag";
}

export function connectTrack(state: GameState, a: Pt, b: Pt, pathAxis: PathAxis = "diag") {
  const ta = tileAt(state, a.x, a.y);
  const tb = tileAt(state, b.x, b.y);
  if (!ta || !tb || !ta.track || !tb.track) return;
  const d = dirBetween(a, b);
  if (!d) return;
  const diag = d.dx !== 0 && d.dy !== 0;
  const nsLink = d.dx === 0;
  const ewLink = d.dy === 0;
  if (diag && (isCardinalThrough(ta.track) || isCardinalThrough(tb.track))) return;
  // A mostly-EW drag must not sprout N/S rungs onto an EW through-line (that is
  // how two sidings fuse into a roundabout). Same for NS drags vs NS throughs.
  if (pathAxis === "ew" && nsLink && (through(ta.track, E, W) || through(tb.track, E, W))) return;
  if (pathAxis === "ns" && ewLink && (through(ta.track, N, S) || through(tb.track, N, S))) return;
  ta.track |= d.bit;
  tb.track |= d.opp;
}

export function connectPath(state: GameState, pts: Pt[]) {
  const axis = pathAxisOf(pts);
  for (let i = 0; i < pts.length - 1; i++) connectTrack(state, pts[i]!, pts[i + 1]!, axis);
}

/** Drop side-links between parallel through-lines so they never become a roundabout.
 *  Isolated crossings (1–2 tiles) stay; a ladder of 3+ is a false join. */
export function sanitizeParallel(state: GameState, around?: Pt[]) {
  const ewAt = (x: number, y: number) => {
    const t = tileAt(state, x, y);
    return !!t && through(t.track, E, W);
  };
  const nsAt = (x: number, y: number) => {
    const t = tileAt(state, x, y);
    return !!t && through(t.track, N, S);
  };

  const stripNS = (x: number, y: number) => {
    const a = tileAt(state, x, y);
    const b = tileAt(state, x, y + 1);
    if (!a || !b) return;
    // Keep a real crossing (both tiles already run N-S as well as E-W).
    if (through(a.track, N, S) && through(b.track, N, S)) return;
    a.track &= ~S;
    b.track &= ~N;
  };
  const stripEW = (x: number, y: number) => {
    const a = tileAt(state, x, y);
    const b = tileAt(state, x + 1, y);
    if (!a || !b) return;
    if (through(a.track, E, W) && through(b.track, E, W)) return;
    a.track &= ~E;
    b.track &= ~W;
  };

  for (let y = 0; y < state.mapH - 1; y++) {
    let x = 0;
    while (x < state.mapW) {
      if (!(ewAt(x, y) && ewAt(x, y + 1))) {
        x++;
        continue;
      }
      const start = x;
      while (x < state.mapW && ewAt(x, y) && ewAt(x, y + 1)) x++;
      if (x - start >= 2) {
        for (let i = start; i < x; i++) stripNS(i, y);
      }
    }
  }
  for (let x = 0; x < state.mapW - 1; x++) {
    let y = 0;
    while (y < state.mapH) {
      if (!(nsAt(x, y) && nsAt(x + 1, y))) {
        y++;
        continue;
      }
      const start = y;
      while (y < state.mapH && nsAt(x, y) && nsAt(x + 1, y)) y++;
      if (y - start >= 2) {
        for (let i = start; i < y; i++) stripEW(x, i);
      }
    }
  }

  const visit: Pt[] = around
    ? around
    : (() => {
        const all: Pt[] = [];
        for (let yy = 0; yy < state.mapH; yy++) {
          for (let xx = 0; xx < state.mapW; xx++) {
            if (state.tiles[yy * state.mapW + xx]!.track) all.push({ x: xx, y: yy });
          }
        }
        return all;
      })();
  for (const p of visit) {
    const t = tileAt(state, p.x, p.y);
    if (!t?.track) continue;
    const ew = through(t.track, E, W);
    const ns = through(t.track, N, S);
    const n = tileAt(state, p.x, p.y - 1);
    const s = tileAt(state, p.x, p.y + 1);
    const e = tileAt(state, p.x + 1, p.y);
    const w = tileAt(state, p.x - 1, p.y);
    const ne = tileAt(state, p.x + 1, p.y - 1);
    const nw = tileAt(state, p.x - 1, p.y - 1);
    const se = tileAt(state, p.x + 1, p.y + 1);
    const sw = tileAt(state, p.x - 1, p.y + 1);
    if (ew && ne && through(ne.track, E, W)) {
      t.track &= ~NE;
      ne.track &= ~SW;
    }
    if (ew && nw && through(nw.track, E, W)) {
      t.track &= ~NW;
      nw.track &= ~SE;
    }
    if (ew && se && through(se.track, E, W)) {
      t.track &= ~SE;
      se.track &= ~NW;
    }
    if (ew && sw && through(sw.track, E, W)) {
      t.track &= ~SW;
      sw.track &= ~NE;
    }
    if (ns && ne && through(ne.track, N, S)) {
      t.track &= ~NE;
      ne.track &= ~SW;
    }
    if (ns && nw && through(nw.track, N, S)) {
      t.track &= ~NW;
      nw.track &= ~SE;
    }
    if (ns && se && through(se.track, N, S)) {
      t.track &= ~SE;
      se.track &= ~NW;
    }
    if (ns && sw && through(sw.track, N, S)) {
      t.track &= ~SW;
      sw.track &= ~NE;
    }
    // A single T-stub between two EW through-lines is a false join; drop it
    // unless the neighbor is actually running N-S (a real crossing).
    if (ew && n && through(n.track, E, W) && !through(n.track, N, S) && !through(t.track, N, S)) {
      t.track &= ~N;
      n.track &= ~S;
    }
    if (ew && s && through(s.track, E, W) && !through(s.track, N, S) && !through(t.track, N, S)) {
      t.track &= ~S;
      s.track &= ~N;
    }
    if (ns && e && through(e.track, N, S) && !through(e.track, E, W) && !through(t.track, E, W)) {
      t.track &= ~E;
      e.track &= ~W;
    }
    if (ns && w && through(w.track, N, S) && !through(w.track, E, W) && !through(t.track, E, W)) {
      t.track &= ~W;
      w.track &= ~E;
    }
  }
}

export function bitsFromPath(pts: Pt[], i: number): number {
  let bits = 0;
  const cur = pts[i]!;
  if (i > 0) {
    const d = dirBetween(cur, pts[i - 1]!);
    if (d) bits |= d.bit;
  }
  if (i < pts.length - 1) {
    const d = dirBetween(cur, pts[i + 1]!);
    if (d) bits |= d.bit;
  }
  return bits || N | S;
}

/** At most two rail pieces per tile — through routes first, then stubs. No 45° fans. */
export function trackPairs(bits: number): [number, number][] {
  const mask = bits & 255;
  const present = DIRS8.filter((d) => mask & d.bit);
  if (!present.length) return [[N, S]];
  if (present.length === 1) return [[present[0]!.bit, present[0]!.opp]];
  if (present.length === 2) return [[present[0]!.bit, present[1]!.bit]];

  const pairs: [number, number][] = [];
  let used = 0;
  for (const d of DIRS8) {
    if (d.bit < d.opp && mask & d.bit && mask & d.opp) {
      pairs.push([d.bit, d.opp]);
      used |= d.bit | d.opp;
    }
  }
  if (pairs.length >= 2) return pairs.slice(0, 2);

  const leftover = present.filter((d) => !(used & d.bit));
  for (const d of leftover) {
    // Stub, not a 90° fillet onto the through-line. Those fillets are what
    // turn two parallel tracks into a string of roundabouts.
    pairs.push([d.bit, d.bit]);
    if (pairs.length >= 2) break;
  }
  return pairs.length ? pairs : [[N, S]];
}

export function cardinalAutoBits(state: GameState, x: number, y: number, owner: number): number {
  let bits = 0;
  const t = tileAt(state, x, y);
  if (!t) return 0;
  for (const d of DIRS) {
    const n = tileAt(state, x + d.dx, y + d.dy);
    if (!n || !n.track) continue;
    if (n.owner && owner && n.owner !== owner) continue;
    bits |= d.bit;
  }
  return bits;
}
