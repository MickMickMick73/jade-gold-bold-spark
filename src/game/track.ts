import { DIRS, DIRS8, N, S, type Dir8, type GameState } from "./types";
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

export function railPose(tile: Pt, from: Pt | null, to: Pt | null, t: number): { x: number; y: number; heading: number } {
  const { entry, ctrl, exit } = anchors(tile, from, to);
  const p = qBezier(entry, ctrl, exit, t);
  return { x: p.x, y: p.y, heading: qBezierTan(entry, ctrl, exit, t) };
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
export function poseBehind(path: Pt[], pathIdx: number, segT: number, back: number): { x: number; y: number; heading: number } {
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
      return railPose(tile, from, to, t);
    }
    left -= along;
    i -= 1;
    t = 1;
  }
  const tile = path[Math.max(0, i)]!;
  const from = path[Math.max(0, i) - 1] ?? null;
  const to = path[Math.max(0, i) + 1] ?? null;
  return railPose(tile, from, to, Math.max(0, t));
}

export function connectTrack(state: GameState, a: Pt, b: Pt) {
  const ta = tileAt(state, a.x, a.y);
  const tb = tileAt(state, b.x, b.y);
  if (!ta || !tb || !ta.track || !tb.track) return;
  const d = dirBetween(a, b);
  if (!d) return;
  ta.track |= d.bit;
  tb.track |= d.opp;
}

export function connectPath(state: GameState, pts: Pt[]) {
  for (let i = 0; i < pts.length - 1; i++) connectTrack(state, pts[i]!, pts[i + 1]!);
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

/** Which rail pieces to draw for a bitmask: opposite straights first, then curves. */
export function trackPairs(bits: number): [number, number][] {
  const present = DIRS8.filter((d) => bits & d.bit);
  if (!present.length) return [[N, S]];
  if (present.length === 1) return [[present[0]!.bit, present[0]!.opp]];
  if (present.length === 2) return [[present[0]!.bit, present[1]!.bit]];

  const pairs: [number, number][] = [];
  let used = 0;
  for (const d of DIRS8) {
    if (d.bit < d.opp && bits & d.bit && bits & d.opp) {
      pairs.push([d.bit, d.opp]);
      used |= d.bit | d.opp;
    }
  }
  for (const d of present) {
    if (used & d.bit) continue;
    const di = DIRS8.indexOf(d);
    for (const o of present) {
      if (o.bit === d.bit) continue;
      const oi = DIRS8.indexOf(o);
      const dist = Math.min((di - oi + 8) % 8, (oi - di + 8) % 8);
      if (dist > 0 && dist <= 2) pairs.push([d.bit, o.bit]);
    }
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
