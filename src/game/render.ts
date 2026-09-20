import { locoById } from "./locomotives";
import type { GameState, Tile, Tool } from "./types";
import { CARGO_COLOR, DIRS, E, N, NE, NW, S, SE, SW, W } from "./types";
import { canBridgeOcean, tileAt } from "./pathfinding";
import { bitsFromPath, headingAlongPath, poseBehind, trackPairs } from "./track";
import { carDir, cargoSprite, getSprites, hash2, headingDir } from "./sprites";

export const TW = 48;
export const TH = 24;

export interface Cam {
  x: number;
  y: number;
  zoom: number;
}

export interface RenderExtras {
  hover: { x: number; y: number } | null;
  tool: Tool;
  selectedTrain: number | null;
  selectedStation: number | null;
  floats: { x: number; y: number; text: string; life: number; color: string }[];
  time: number;
  showGrid: boolean;
  ghost: { x: number; y: number }[] | null;
  demo: boolean;
}

export function iso(x: number, y: number, h = 0) {
  return {
    sx: (x - y) * (TW / 2),
    sy: (x + y) * (TH / 2) - h * 18,
  };
}

export function worldToScreen(cam: Cam, x: number, y: number, h: number, cw: number, ch: number) {
  const p = iso(x, y, h);
  return {
    x: (p.sx - cam.x) * cam.zoom + cw / 2,
    y: (p.sy - cam.y) * cam.zoom + ch / 2,
  };
}

export function screenToWorld(cam: Cam, px: number, py: number, cw: number, ch: number) {
  const sx = (px - cw / 2) / cam.zoom + cam.x;
  const sy = (py - ch / 2) / cam.zoom + cam.y;
  const x = sx / (TW / 2) + sy / (TH / 2);
  const y = sy / (TH / 2) - sx / (TW / 2);
  return { x: x / 2, y: y / 2 };
}

function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, fill: string, stroke?: string) {
  ctx.beginPath();
  ctx.moveTo(x, y - TH / 2);
  ctx.lineTo(x + TW / 2, y);
  ctx.lineTo(x, y + TH / 2);
  ctx.lineTo(x - TW / 2, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }
}

function terrainColor(t: Tile, time: number): [string, string] {
  switch (t.t) {
    case "ocean": {
      const w = 0.04 * Math.sin(time * 1.4 + t.h * 20);
      return [shade("#1a3a42", w), "#142f36"];
    }
    case "coast":
      return ["#3d6a62", "#2f564f"];
    case "plains":
      return ["#4e6a3c", "#3f5630"];
    case "forest":
      return ["#2f4a2c", "#243b22"];
    case "hills":
      return ["#5a6340", "#4a5234"];
    case "mountains":
      return ["#6a6e68", "#545850"];
    case "desert":
      return ["#b09a6a", "#8e7c54"];
    case "swamp":
      return ["#3a4a34", "#2c3a28"];
    case "river":
      return ["#2a5a62", "#1e464c"];
    default:
      return ["#4e6a3c", "#3f5630"];
  }
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) * (1 + amt)));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) * (1 + amt)));
  const b = Math.max(0, Math.min(255, (n & 255) * (1 + amt)));
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.fillStyle = "#2a3a20";
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 4 * s, 2 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3d6a38";
  ctx.beginPath();
  ctx.moveTo(x, y - 14 * s);
  ctx.lineTo(x + 7 * s, y + 2 * s);
  ctx.lineTo(x - 7 * s, y + 2 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#4a7c42";
  ctx.beginPath();
  ctx.moveTo(x, y - 11 * s);
  ctx.lineTo(x + 5 * s, y);
  ctx.lineTo(x - 5 * s, y);
  ctx.closePath();
  ctx.fill();
}

function drawPeak(ctx: CanvasRenderingContext2D, x: number, y: number, h: number) {
  const peak = 10 + h * 22;
  ctx.beginPath();
  ctx.moveTo(x - 16, y + 4);
  ctx.lineTo(x, y - peak);
  ctx.lineTo(x + 16, y + 4);
  ctx.closePath();
  ctx.fillStyle = "#6e726c";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y - peak);
  ctx.lineTo(x + 16, y + 4);
  ctx.lineTo(x + 6, y + 4);
  ctx.closePath();
  ctx.fillStyle = "#5a5e58";
  ctx.fill();
  if (h > 0.82) {
    ctx.fillStyle = "#d8d4cc";
    ctx.beginPath();
    ctx.moveTo(x, y - peak);
    ctx.lineTo(x + 5, y - peak + 8);
    ctx.lineTo(x - 5, y - peak + 8);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBuilding(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, d: number, h: number, color: string) {
  ctx.fillStyle = shade(color, -0.15);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y - w * 0.5);
  ctx.lineTo(x + w, y - w * 0.5 - h);
  ctx.lineTo(x, y - h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - d, y - d * 0.5);
  ctx.lineTo(x - d, y - d * 0.5 - h);
  ctx.lineTo(x, y - h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(color, 0.18);
  ctx.beginPath();
  ctx.moveTo(x, y - h);
  ctx.lineTo(x + w, y - w * 0.5 - h);
  ctx.lineTo(x + w - d, y - w * 0.5 - d * 0.5 - h);
  ctx.lineTo(x - d, y - d * 0.5 - h);
  ctx.closePath();
  ctx.fill();
}

/** Screen offset from a tile center to the shared edge/vertex with an 8-neighbor. */
function isoArm(bit: number): [number, number] {
  switch (bit) {
    case N:
      return [TW / 4, -TH / 4];
    case NE:
      return [TW / 2, 0];
    case E:
      return [TW / 4, TH / 4];
    case SE:
      return [0, TH / 2];
    case S:
      return [-TW / 4, TH / 4];
    case SW:
      return [-TW / 2, 0];
    case W:
      return [-TW / 4, -TH / 4];
    case NW:
      return [0, -TH / 2];
    default:
      return [0, 0];
  }
}

type RailCurve = { p0: { x: number; y: number }; p1: { x: number; y: number }; p2: { x: number; y: number } };

function railCurves(x: number, y: number, bits: number, ext = 1.04): RailCurve[] {
  return trackPairs(bits).map(([a, b]) => {
    const A = isoArm(a);
    const B = isoArm(b);
    if (a === b) {
      return {
        p0: { x, y },
        p1: { x: x + A[0] * 0.55 * ext, y: y + A[1] * 0.55 * ext },
        p2: { x: x + A[0] * ext, y: y + A[1] * ext },
      };
    }
    return {
      p0: { x: x + A[0] * ext, y: y + A[1] * ext },
      p1: { x, y },
      p2: { x: x + B[0] * ext, y: y + B[1] * ext },
    };
  });
}

function sampleCurve(c: RailCurve, t: number) {
  const u = 1 - t;
  return {
    x: u * u * c.p0.x + 2 * u * t * c.p1.x + t * t * c.p2.x,
    y: u * u * c.p0.y + 2 * u * t * c.p1.y + t * t * c.p2.y,
  };
}

function curveTan(c: RailCurve, t: number) {
  return {
    x: 2 * (1 - t) * (c.p1.x - c.p0.x) + 2 * t * (c.p2.x - c.p1.x),
    y: 2 * (1 - t) * (c.p1.y - c.p0.y) + 2 * t * (c.p2.y - c.p1.y),
  };
}

function drawFoot(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number) {
  ctx.save();
  ctx.fillStyle = "rgba(12,13,11,0.32)";
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawAnchored(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  flipX = false,
) {
  if (flipX) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h, w, h);
    ctx.restore();
    return;
  }
  ctx.drawImage(img, x - w / 2, y - h, w, h);
}

function drawTexturedDiamond(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  tileX: number,
  tileY: number,
  time: number,
  watery: boolean,
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, -TH / 2);
  ctx.lineTo(TW / 2, 0);
  ctx.lineTo(0, TH / 2);
  ctx.lineTo(-TW / 2, 0);
  ctx.closePath();
  ctx.clip();
  const sw = 110;
  const max = Math.max(1, img.width - sw);
  let ox = Math.abs(hash2(tileX, tileY)) % max;
  let oy = Math.abs(hash2(tileY, tileX + 3)) % max;
  if (watery) {
    ox = (ox + ((time * 18) | 0)) % max;
    oy = (oy + ((time * 9) | 0)) % max;
  }
  ctx.drawImage(img, ox, oy, sw, sw, -TW / 2 - 2, -TH / 2 - 2, TW + 4, TH + 4);
  ctx.restore();
}

function drawTrack(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bits: number,
  color: string,
  opts?: { bridge?: boolean; tunnel?: boolean },
) {
  const curves = railCurves(x, y, bits);
  const pairs = trackPairs(bits);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const strokeAll = (width: number, style: string, dy = 0) => {
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    for (const c of curves) {
      ctx.beginPath();
      ctx.moveTo(c.p0.x, c.p0.y + dy);
      ctx.quadraticCurveTo(c.p1.x, c.p1.y + dy, c.p2.x, c.p2.y + dy);
      ctx.stroke();
    }
  };

  if (opts?.bridge) {
    strokeAll(8.5, "#3a2c20", 3);
    ctx.strokeStyle = "#2a2218";
    ctx.lineWidth = 1.6;
    for (const c of curves) {
      for (let i = 0; i <= 5; i++) {
        const p = sampleCurve(c, i / 5);
        ctx.beginPath();
        ctx.moveTo(p.x - 1.2, p.y + 2);
        ctx.lineTo(p.x + 0.6, p.y + 13);
        ctx.stroke();
      }
    }
    strokeAll(2.2, "#c4b49a", -3.2);
  }

  strokeAll(5.4, opts?.tunnel ? "#2a2824" : "#3a342c");

  ctx.strokeStyle = "#5c4c3a";
  ctx.lineWidth = 1.35;
  for (const c of curves) {
    for (const t of [0.18, 0.36, 0.54, 0.72, 0.9]) {
      const p = sampleCurve(c, t);
      const tan = curveTan(c, t);
      const len = Math.hypot(tan.x, tan.y) || 1;
      const px = (-tan.y / len) * 3.1;
      const py = (tan.x / len) * 3.1;
      ctx.beginPath();
      ctx.moveTo(p.x + px, p.y + py);
      ctx.lineTo(p.x - px, p.y - py);
      ctx.stroke();
    }
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.35;
  for (const c of curves) {
    const tan = curveTan(c, 0.5);
    const len = Math.hypot(tan.x, tan.y) || 1;
    const ox = (-tan.y / len) * 1.65;
    const oy = (tan.x / len) * 1.65;
    ctx.beginPath();
    ctx.moveTo(c.p0.x + ox, c.p0.y + oy);
    ctx.quadraticCurveTo(c.p1.x + ox, c.p1.y + oy, c.p2.x + ox, c.p2.y + oy);
    ctx.moveTo(c.p0.x - ox, c.p0.y - oy);
    ctx.quadraticCurveTo(c.p1.x - ox, c.p1.y - oy, c.p2.x - ox, c.p2.y - oy);
    ctx.stroke();
  }

  if (pairs.length === 2) {
    ctx.fillStyle = "#3a342c";
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.05;
    ctx.stroke();
  }

  ctx.restore();
}

function drawRoad(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bits: number,
  paved: boolean,
) {
  const arms: [number, number][] = [];
  for (const d of DIRS) {
    if (bits & d.bit) arms.push(isoArm(d.bit));
  }
  if (!arms.length) arms.push(isoArm(N), isoArm(S));
  const ext = 1.06;
  const spans: [number, number, number, number][] = [];
  if (bits === (N | S) || bits === (E | W)) {
    const a = isoArm(bits & (N | E));
    const b = isoArm(bits & (S | W));
    spans.push([x + a[0] * ext, y + a[1] * ext, x + b[0] * ext, y + b[1] * ext]);
  } else {
    for (const a of arms) spans.push([x, y, x + a[0] * ext, y + a[1] * ext]);
  }
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = paved ? "#4a4c48" : "#7a6a52";
  ctx.lineWidth = paved ? 3.2 : 2.4;
  for (const s of spans) {
    ctx.beginPath();
    ctx.moveTo(s[0], s[1]);
    ctx.lineTo(s[2], s[3]);
    ctx.stroke();
  }
  if (paved) {
    ctx.strokeStyle = "rgba(200,190,160,0.35)";
    ctx.lineWidth = 0.6;
    for (const s of spans) {
      ctx.beginPath();
      ctx.moveTo(s[0], s[1]);
      ctx.lineTo(s[2], s[3]);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawTrainSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  heading: number,
  color: string,
  steam: boolean,
  time: number,
  cars: number,
) {
  ctx.save();
  ctx.translate(x, y);
  const ang = heading;
  const fx = Math.cos(ang);
  const fy = Math.sin(ang);
  // isometric-ish squash
  for (let i = cars; i >= 0; i--) {
    const bx = -fx * i * 11;
    const by = -fy * i * 6;
    ctx.fillStyle = i === 0 ? color : shade(color, -0.2);
    ctx.beginPath();
    ctx.roundRect(bx - 7, by - 5, 14, 9, 2);
    ctx.fill();
    ctx.fillStyle = "#1a1c18";
    ctx.fillRect(bx - 6, by + 3, 12, 2);
    if (i === 0) {
      ctx.fillStyle = "#2a2c28";
      ctx.fillRect(bx + 2, by - 10, 4, 6);
      ctx.fillStyle = shade(color, 0.2);
      ctx.fillRect(bx - 6, by - 8, 7, 6);
      if (steam) {
        const p = (time * 3 + i) % 1;
        ctx.globalAlpha = 0.35 * (1 - p);
        ctx.fillStyle = "#d8d4cc";
        ctx.beginPath();
        ctx.arc(bx + 4, by - 12 - p * 10, 3 + p * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }
  ctx.restore();
}

export function renderWorld(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cam: Cam,
  extras: RenderExtras,
  viewW: number,
  viewH: number,
) {
  const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cw = viewW;
  const ch = viewH;

  const g = ctx.createLinearGradient(0, 0, 0, ch);
  g.addColorStop(0, "#141812");
  g.addColorStop(1, "#0c0d0b");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cw, ch);

  const z = cam.zoom;
  const corners = [
    screenToWorld(cam, 0, 0, cw, ch),
    screenToWorld(cam, cw, 0, cw, ch),
    screenToWorld(cam, 0, ch, cw, ch),
    screenToWorld(cam, cw, ch, cw, ch),
  ];
  const minX = Math.max(0, Math.floor(Math.min(...corners.map((c) => c.x)) - 2));
  const maxX = Math.min(state.mapW - 1, Math.ceil(Math.max(...corners.map((c) => c.x)) + 2));
  const minY = Math.max(0, Math.floor(Math.min(...corners.map((c) => c.y)) - 2));
  const maxY = Math.min(state.mapH - 1, Math.ceil(Math.max(...corners.map((c) => c.y)) + 2));

  const order: { x: number; y: number }[] = [];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) order.push({ x, y });
  }
  order.sort((a, b) => a.x + a.y - (b.x + b.y));

  const spr = getSprites();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.save();
  for (const { x, y } of order) {
    const tile = state.tiles[y * state.mapW + x]!;
    const hOff = tile.t === "mountains" ? 0.35 : tile.t === "hills" ? 0.15 : 0;
    const p = worldToScreen(cam, x, y, hOff, cw, ch);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(z, z);
    const [top, side] = terrainColor(tile, extras.time);
    const tex = spr?.terrain[tile.t];
    if (tex) {
      ctx.fillStyle = side;
      ctx.beginPath();
      ctx.moveTo(-TW / 2, 0);
      ctx.lineTo(0, TH / 2);
      ctx.lineTo(TW / 2, 0);
      ctx.lineTo(TW / 2, 5);
      ctx.lineTo(0, TH / 2 + 5);
      ctx.lineTo(-TW / 2, 5);
      ctx.closePath();
      ctx.fill();
      drawTexturedDiamond(ctx, tex, x, y, extras.time, tile.t === "ocean" || tile.t === "river");
      if (extras.showGrid) diamond(ctx, 0, 0, "transparent", "rgba(232,228,216,0.12)");
    } else {
      diamond(ctx, 0, 0, top, extras.showGrid ? "rgba(232,228,216,0.08)" : undefined);
      ctx.fillStyle = side;
      ctx.beginPath();
      ctx.moveTo(-TW / 2, 0);
      ctx.lineTo(0, TH / 2);
      ctx.lineTo(TW / 2, 0);
      ctx.lineTo(TW / 2, 4);
      ctx.lineTo(0, TH / 2 + 4);
      ctx.lineTo(-TW / 2, 4);
      ctx.closePath();
      ctx.fill();
    }

    if (tile.track) {
      diamond(ctx, 0, 0, "rgba(58,52,44,0.38)");
    }

    if (tile.t === "forest" && !tile.track) {
      if (spr) {
        const n = 1 + (hash2(x, y) % 2);
        for (let i = 0; i < n; i++) {
          const img = spr.trees[hash2(x + i * 3, y) % spr.trees.length]!;
          const ox = ((hash2(x + 9, y + i) % 15) - 7) * 0.7;
          const oy = ((hash2(x, y + 4 + i) % 9) - 3) * 0.45;
          drawFoot(ctx, ox, oy + 6, 6, 2.5);
          drawAnchored(ctx, img, ox, oy + 6, 18 + (hash2(x, i) % 6), 26 + (hash2(y, i) % 6));
        }
      } else {
        drawTree(ctx, -6, -2, 0.7);
        drawTree(ctx, 6, 0, 0.85);
        drawTree(ctx, 0, -6, 0.6);
      }
    } else if (tile.t === "mountains") {
      if (spr && (tile.h > 0.55 || (x + y) % 2 === 0)) {
        drawFoot(ctx, 0, 6, 9, 3.5);
        drawAnchored(ctx, spr.mountain, 0, 8, 26, 36);
      } else if (!spr) {
        drawPeak(ctx, 0, 2, tile.h);
      }
    } else if (tile.t === "hills" && spr && hash2(x, y) % 5 === 0 && !tile.track) {
      drawAnchored(ctx, spr.mountain, 2, 6, 16, 20);
    } else if (tile.t === "ocean" || tile.t === "river") {
      ctx.strokeStyle = "rgba(180,210,210,0.18)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-10, Math.sin(extras.time * 2 + x) * 1.5);
      ctx.lineTo(10, Math.sin(extras.time * 2 + x + 1) * 1.5);
      ctx.stroke();
    }

    if (tile.res && !tile.track) {
      const cimg = spr ? cargoSprite(spr, tile.res) : undefined;
      if (cimg) {
        drawAnchored(ctx, cimg, 6, 4, 14, 14);
      } else {
        ctx.fillStyle = CARGO_COLOR[tile.res] ?? "#888";
        ctx.beginPath();
        ctx.arc(4, 2, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(12,13,11,0.5)";
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Roads under rails.
  const paved = state.year >= 1930;
  for (const { x, y } of order) {
    const tile = state.tiles[y * state.mapW + x]!;
    if (!tile.road) continue;
    const hOff = tile.t === "mountains" ? 0.35 : tile.t === "hills" ? 0.15 : 0;
    const p = worldToScreen(cam, x, y, hOff, cw, ch);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(z, z);
    drawRoad(ctx, 0, 0, tile.road, paved);
    ctx.restore();
  }

  // Tracks on a second pass so neighbor terrain never clips the rails.
  for (const { x, y } of order) {
    const tile = state.tiles[y * state.mapW + x]!;
    if (!tile.track) continue;
    const hOff = tile.t === "mountains" ? 0.35 : tile.t === "hills" ? 0.15 : tile.bridge ? 0.28 : 0;
    const p = worldToScreen(cam, x, y, hOff, cw, ch);
    const co = state.companies.find((c) => c.id === tile.owner);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(z, z);
    drawTrack(ctx, 0, 0, tile.track, co?.color ?? "#9aa4ae", {
      bridge: tile.bridge,
      tunnel: tile.tunnel,
    });
    ctx.restore();
  }

  // Ghost track
  if (extras.ghost && extras.ghost.length) {
    ctx.save();
    ctx.globalAlpha = 0.72;
    const pending = new Set(extras.ghost.map((g) => `${g.x},${g.y}`));
    extras.ghost.forEach((g, i) => {
      const bits = bitsFromPath(extras.ghost!, i);
      const gt = tileAt(state, g.x, g.y);
      const overWater = !!gt && (gt.t === "ocean" || gt.t === "river" || gt.t === "coast");
      const fail = !!gt && gt.t === "ocean" && !gt.track && !canBridgeOcean(state, g.x, g.y, pending);
      const p = worldToScreen(cam, g.x, g.y, overWater ? 0.28 : 0, cw, ch);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(z, z);
      diamond(ctx, 0, 0, fail ? "rgba(180,90,76,0.4)" : "rgba(201,205,198,0.28)");
      drawTrack(ctx, 0, 0, bits, fail ? "#b45a4c" : "#d8d4cc", { bridge: overWater });
      ctx.restore();
    });
    ctx.restore();
  }

  // Broken spans the last stroke could not lay
  for (const g of state.surveyGaps ?? []) {
    if (tileAt(state, g.x, g.y)?.track) continue;
    const t = tileAt(state, g.x, g.y);
    const p = worldToScreen(cam, g.x, g.y, t && (t.t === "ocean" || t.t === "river") ? 0.28 : 0, cw, ch);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(z, z);
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "#b45a4c";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, -TH / 2);
    ctx.lineTo(TW / 2, 0);
    ctx.lineTo(0, TH / 2);
    ctx.lineTo(-TW / 2, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#b45a4c";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", 0, -1);
    ctx.restore();
  }

  // Hover
  if (extras.hover && inMap(state, extras.hover.x, extras.hover.y)) {
    const t = tileAt(state, extras.hover.x, extras.hover.y);
    const p = worldToScreen(cam, extras.hover.x, extras.hover.y, 0, cw, ch);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(z, z);
    diamond(ctx, 0, 0, "rgba(232,228,216,0.16)", "rgba(232,228,216,0.7)");
    ctx.restore();
    void t;
  }

  // Cities
  for (const city of state.cities) {
    const p = worldToScreen(cam, city.x, city.y, 0.1, cw, ch);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(z, z);
    const mill = city.industries.some((i) => /factory|steel|mill/i.test(i.kind));
    const sc =
      city.cls === "metropolis" ? 1.4 : city.cls === "city" ? 1.18 : city.cls === "town" ? 1 : 0.78;
    if (spr) {
      drawFoot(ctx, 0, 8, 12 * sc, 5 * sc);
      drawAnchored(ctx, mill ? spr.factory : spr.town, 0, 8, (mill ? 32 : 34) * sc, (mill ? 36 : 30) * sc);
      if (city.cls === "metropolis") {
        drawAnchored(ctx, spr.town, -14, 10, 22, 20);
        drawAnchored(ctx, spr.factory, 14, 12, 20, 24);
      } else if (city.cls === "city") {
        drawAnchored(ctx, spr.town, 12, 10, 18, 16);
      }
    } else {
      drawBuilding(ctx, 0, 4, 10, 8, 12, city.served ? "#8a8070" : "#6a6054");
      drawBuilding(ctx, -10, 6, 7, 6, 8, "#7a7064");
      drawBuilding(ctx, 8, 8, 6, 5, 7, "#5a5248");
    }
    ctx.restore();
  }

  // Ports
  for (const city of state.cities) {
    if (!city.hasPort || city.portX === undefined || city.portY === undefined) continue;
    const p = worldToScreen(cam, city.portX, city.portY, 0, cw, ch);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(z, z);
    if (spr?.port) {
      drawAnchored(ctx, spr.port, 0, 8, 28, 22);
    } else {
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(-10, -2, 20, 6);
      ctx.fillStyle = "#8a6a4a";
      ctx.fillRect(-6, -10, 10, 8);
    }
    ctx.restore();
  }

  // Airfields
  for (const city of state.cities) {
    if (!city.hasAirport || city.airX === undefined) continue;
    const p = worldToScreen(cam, city.airX, city.airY!, 0, cw, ch);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(z, z);
    if (spr?.airport) {
      drawAnchored(ctx, spr.airport, 0, 6, 36, 24);
    } else {
      ctx.fillStyle = "#6a6458";
      ctx.fillRect(-14, -3, 28, 6);
      ctx.fillStyle = "#c4b8a0";
      ctx.fillRect(-6, -10, 10, 7);
    }
    ctx.restore();
  }

  // Stations
  for (const st of state.stations) {
    const p = worldToScreen(cam, st.x, st.y, 0, cw, ch);
    const co = state.companies.find((c) => c.id === st.companyId);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(z, z);
    if (spr) {
      drawFoot(ctx, 0, 6, 11, 4);
      drawAnchored(ctx, spr.station, 0, 6, 30, 22);
      ctx.fillStyle = co?.color ?? "#ccc";
      ctx.fillRect(-6, 7, 12, 3);
    } else {
      ctx.fillStyle = co?.color ?? "#ccc";
      ctx.fillRect(-8, -6, 16, 8);
      ctx.fillStyle = "#1a1c18";
      ctx.fillRect(-10, 2, 20, 3);
    }
    if (extras.selectedStation === st.id) {
      ctx.strokeStyle = "#e8e4d8";
      ctx.strokeRect(-16, -28, 32, 36);
    }
    ctx.restore();
  }

  // Trains
  for (const tr of state.trains) {
    const tile = tileAt(state, Math.round(tr.x), Math.round(tr.y));
    const lift = tile?.bridge ? 0.28 : 0;
    const p = worldToScreen(cam, tr.x, tr.y, lift, cw, ch);
    const co = state.companies.find((c) => c.id === tr.companyId);
    const loco = locoById(tr.locoId);
    if (spr) {
      for (let i = tr.cars.length; i >= 0; i--) {
        const pose =
          i === 0 || tr.path.length < 2
            ? { x: tr.x, y: tr.y, heading: tr.heading, idx: tr.pathIdx }
            : poseBehind(tr.path, tr.pathIdx, tr.segT, i * 0.42);
        const bp = worldToScreen(cam, pose.x, pose.y, lift, cw, ch);
        const face =
          tr.path.length >= 2 ? headingAlongPath(tr.path, pose.idx ?? tr.pathIdx) : pose.heading;
        const dir = headingDir(face);
        const car = tr.cars[i - 1];
        const isPax = !car || car.cargo === "pax" || car.cargo === "mail";
        const sheet = i === 0 ? (loco.kind === "diesel" ? null : spr.loco) : isPax ? spr.coach : spr.freight;
        ctx.save();
        if (i === 0 && loco.kind === "diesel") {
          ctx.translate(bp.x, bp.y);
          if (dir === 2 || dir === 3) ctx.scale(-1, 1);
          drawAnchored(ctx, spr.diesel, 0, 5 * z, 30 * z, 20 * z);
        } else if (sheet) {
          const img = sheet[dir]!;
          const ar = img.naturalWidth / Math.max(1, img.naturalHeight);
          const w = (i === 0 ? 28 : 24) * z;
          const h = w / ar;
          drawAnchored(ctx, img, bp.x, bp.y + 5 * z, w, h);
        }
        ctx.restore();
        if (i === 0 && loco.kind === "steam" && tr.status === "running") {
          const puff = (extras.time * 3) % 1;
          ctx.globalAlpha = 0.35 * (1 - puff);
          ctx.fillStyle = "#d8d4cc";
          ctx.beginPath();
          ctx.arc(bp.x + 4 * z, bp.y - 14 * z - puff * 10 * z, (3 + puff * 3) * z, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
      ctx.fillStyle = co?.color ?? "#ccc";
      ctx.fillRect(p.x - 5 * z, p.y + 8 * z, 10 * z, 2 * z);
    } else {
      drawTrainSprite(
        ctx,
        p.x,
        p.y,
        isoHeading(tr.heading),
        co?.color ?? "#aaa",
        loco.kind === "steam" && tr.status === "running",
        extras.time,
        tr.cars.length,
      );
    }
    if (extras.selectedTrain === tr.id) {
      ctx.strokeStyle = "#e8e4d8";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 16 * z, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (tr.status === "broken") {
      ctx.strokeStyle = "#c45c4a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14 * z, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  }

  for (const inc of state.incidents ?? []) {
    const p = worldToScreen(cam, inc.x, inc.y, 0, cw, ch);
    const pulse = 0.55 + 0.45 * Math.sin(extras.time * 5);
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.25 * pulse;
    ctx.fillStyle = inc.kind === "landslide" ? "#6a5a42" : "#c45c4a";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 16 * z);
    ctx.lineTo(p.x + 22 * z, p.y);
    ctx.lineTo(p.x, p.y + 10 * z);
    ctx.lineTo(p.x - 22 * z, p.y);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#1a1c18";
    ctx.font = `${Math.max(9, 10 * z)}px sans-serif`;
    ctx.textAlign = "center";
    const tag = inc.kind === "hotbox" ? "HOT" : inc.kind === "derail" ? "OFF" : inc.kind === "landslide" ? "CUT" : "SIG";
    ctx.fillText(tag, p.x, p.y + 3);
    ctx.restore();
  }

  for (const wr of state.wreckers ?? []) {
    const p = worldToScreen(cam, wr.x, wr.y, 0, cw, ch);
    const dir = headingDir(wr.heading);
    if (spr?.diesel) {
      ctx.save();
      ctx.translate(p.x, p.y);
      if (dir === 2 || dir === 3) ctx.scale(-1, 1);
      drawAnchored(ctx, spr.diesel, 0, 5 * z, 26 * z, 18 * z);
      ctx.restore();
    }
    ctx.fillStyle = "#c4a574";
    ctx.fillRect(p.x - 6 * z, p.y + 8 * z, 12 * z, 3 * z);
    ctx.fillStyle = "#1a1c18";
    ctx.font = `${Math.max(8, 9 * z)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("WKR", p.x, p.y - 12 * z);
  }

  // Ships & planes
  for (const cr of state.crafts) {
    const p = worldToScreen(cam, cr.x, cr.y, cr.kind === "plane" ? 0.55 : 0, cw, ch);
    const dir = headingDir(cr.heading);
    const sheet = cr.kind === "ship" ? spr?.ships : spr?.planes;
    const img = sheet && sheet.length ? sheet[dir] ?? sheet[0] : null;
    if (img) {
      const rolling = carDir(cr.heading);
      const ar = img.naturalWidth / Math.max(1, img.naturalHeight);
      const w = (cr.kind === "plane" ? 22 : 26) * z;
      drawAnchored(ctx, img, p.x, p.y + 4 * z, w, w / ar, rolling.flipX);
    } else {
      ctx.fillStyle = cr.kind === "plane" ? "#c4c8cc" : "#2a2c30";
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 7 * z, 3 * z, isoHeading(cr.heading), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // City labels
  ctx.font = `${Math.max(10, 11 * Math.min(z, 1.4))}px Figtree, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  for (const city of state.cities) {
    const p = worldToScreen(cam, city.x, city.y, 0.2, cw, ch);
    ctx.fillStyle = "rgba(12,13,11,0.65)";
    const label = z > 0.7 ? `${city.name}  ${Math.max(1, Math.round(city.pop / 1000))}k` : city.name;
    const w = ctx.measureText(label).width;
    ctx.fillRect(p.x - w / 2 - 4, p.y - 44 * z - 16, w + 8, 20);
    ctx.fillStyle = city.served ? "#e8e4d8" : "#c9cdc6";
    ctx.fillText(label, p.x, p.y - 44 * z - 2);
    const barW = Math.max(22, Math.min(48, w));
    const frac = Math.max(0.06, Math.min(1, city.pop / 90000));
    ctx.fillStyle = "rgba(12,13,11,0.55)";
    ctx.fillRect(p.x - barW / 2, p.y - 44 * z + 2, barW, 3);
    ctx.fillStyle = city.served ? "#7d9a72" : "#c4a574";
    ctx.fillRect(p.x - barW / 2, p.y - 44 * z + 2, barW * frac, 3);
  }

  // Floats
  ctx.font = `600 ${12 * z}px Figtree, sans-serif`;
  ctx.textAlign = "center";
  for (const f of extras.floats) {
    const p = worldToScreen(cam, f.x, f.y, 0, cw, ch);
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, p.x, p.y - (1 - f.life) * 24);
    ctx.globalAlpha = 1;
  }

  const vg = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.35, cw / 2, ch / 2, Math.max(cw, ch) * 0.72);
  vg.addColorStop(0, "rgba(12,13,11,0)");
  vg.addColorStop(1, "rgba(12,13,11,0.28)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, cw, ch);

  ctx.restore();
}

function isoHeading(gridHeading: number) {
  // map grid atan2(dy,dx) into screen movement
  const fx = Math.cos(gridHeading);
  const fy = Math.sin(gridHeading);
  const sx = (fx - fy) * (TW / 2);
  const sy = (fx + fy) * (TH / 2);
  return Math.atan2(sy, sx);
}

function inMap(state: GameState, x: number, y: number) {
  return x >= 0 && y >= 0 && x < state.mapW && y < state.mapH;
}

export function renderMinimap(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cam: Cam,
  viewW: number,
  viewH: number,
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.fillStyle = "#10120f";
  ctx.fillRect(0, 0, w, h);
  const sx = w / state.mapW;
  const sy = h / state.mapH;
  for (let y = 0; y < state.mapH; y++) {
    for (let x = 0; x < state.mapW; x++) {
      const t = state.tiles[y * state.mapW + x]!;
      let c = "#1a3a42";
      if (t.t === "plains") c = "#4e6a3c";
      else if (t.t === "forest") c = "#2f4a2c";
      else if (t.t === "hills") c = "#5a6340";
      else if (t.t === "mountains") c = "#6a6e68";
      else if (t.t === "desert") c = "#b09a6a";
      else if (t.t === "swamp") c = "#3a4a34";
      else if (t.t === "river" || t.t === "coast") c = "#2a5a62";
      if (t.road && !t.track) c = "#6a5a44";
      if (t.track) {
        const co = state.companies.find((k) => k.id === t.owner);
        c = co?.color ?? "#ccc";
      }
      ctx.fillStyle = c;
      ctx.fillRect(x * sx, y * sy, sx + 0.5, sy + 0.5);
    }
  }
  ctx.fillStyle = "#e8e4d8";
  for (const city of state.cities) {
    const s = city.cls === "metropolis" ? 4 : city.cls === "city" ? 3 : 2;
    ctx.fillRect(city.x * sx - 1, city.y * sy - 1, s, s);
  }
  ctx.fillStyle = "#8ab4c4";
  for (const cr of state.crafts) {
    ctx.fillRect(cr.x * sx, cr.y * sy, 2, 2);
  }
  for (const tr of state.trains) {
    const co = state.companies.find((c) => c.id === tr.companyId);
    ctx.fillStyle = co?.color ?? "#fff";
    ctx.fillRect(tr.x * sx, tr.y * sy, 2, 2);
  }
  const center = screenToWorld(cam, viewW / 2, viewH / 2, viewW, viewH);
  const vw = (viewW / cam.zoom / TW) * 1.2;
  const vh = (viewH / cam.zoom / TH) * 1.2;
  ctx.strokeStyle = "rgba(232,228,216,0.8)";
  ctx.strokeRect((center.x - vw / 2) * sx, (center.y - vh / 2) * sy, vw * sx, vh * sy);
}
