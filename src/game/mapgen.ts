import { createNoise2D } from "simplex-noise";
import { makeRng } from "./rng";
import { cityNames, aiCompanyName } from "./names";
import { SIZE_META } from "./scenarios";
import {
  CARGOS,
  COMPANY_COLORS,
  type Cargo,
  type City,
  type Company,
  type GameState,
  type Industry,
  type NewGameOpts,
  type Resource,
  type Terrain,
  type Tile,
  SAVE_VERSION,
} from "./types";

function fbm(noise: (x: number, y: number) => number, x: number, y: number, oct = 5) {
  let v = 0;
  let a = 1;
  let f = 1;
  let s = 0;
  for (let i = 0; i < oct; i++) {
    v += a * noise(x * f, y * f);
    s += a;
    a *= 0.5;
    f *= 2;
  }
  return v / s;
}

function emptyCargo(): Record<Cargo, number> {
  const o = {} as Record<Cargo, number>;
  for (const c of CARGOS) o[c] = 0;
  return o;
}

export function generateWorld(opts: NewGameOpts): GameState {
  const seed = opts.seed ?? (Math.floor(Math.random() * 0xffffffff) || 1);
  const rng = makeRng(seed, 1);
  const nElev = createNoise2D(makeRng(seed, 11).next);
  const nMoist = createNoise2D(makeRng(seed, 22).next);
  const nRes = createNoise2D(makeRng(seed, 33).next);

  const sc = opts.scenario;
  const size = sc?.size ?? opts.size;
  let w: number = SIZE_META[size].w;
  let h: number = SIZE_META[size].h;
  const hint = sc?.mapHint ?? "standard";
  if (hint === "wide") {
    w = Math.max(w, 144);
    h = Math.min(h, 72);
  }

  const tiles: Tile[] = new Array(w * h);
  const island = hint === "islands";

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = x / w;
      const ny = y / h;
      const dx = (nx - 0.5) * 2;
      const dy = (ny - 0.5) * 2;
      let mask = 1 - Math.pow(Math.min(1, Math.hypot(dx, dy) * (island ? 1.05 : size === "large" ? 0.82 : 0.9)), 1.55);
      if (hint === "wide") {
        const edge = Math.min(nx, 1 - nx, ny * 2, (1 - ny) * 2);
        mask = Math.min(1, edge * 3);
      }
      let elev = (fbm(nElev, x * 0.035, y * 0.035) + 1) * 0.5;
      elev = Math.pow(elev, 1.15) * (0.35 + mask * 0.75);
      const moist = (fbm(nMoist, x * 0.04 + 40, y * 0.04) + 1) * 0.5;

      let t: Terrain;
      if (elev < 0.28) t = "ocean";
      else if (elev < 0.32) t = "coast";
      else if (elev > 0.78) t = "mountains";
      else if (elev > 0.62) t = "hills";
      else if (moist < 0.28 && elev > 0.36) t = "desert";
      else if (moist > 0.72 && elev < 0.5) t = "swamp";
      else if (moist > 0.52) t = "forest";
      else t = "plains";

      tiles[y * w + x] = { t, h: elev, track: 0, owner: 0, bridge: false, tunnel: false, road: 0 };
    }
  }

  const riverRng = makeRng(seed, 44);
  const riverCount = size === "large" ? 14 : size === "medium" ? 9 : 6;
  for (let r = 0; r < riverCount; r++) {
    let x = riverRng.int(4, w - 5);
    let y = riverRng.int(4, h - 5);
    let best = -1;
    for (let k = 0; k < 40; k++) {
      const tx = riverRng.int(2, w - 3);
      const ty = riverRng.int(2, h - 3);
      const e = tiles[ty * w + tx]!.h;
      if (e > best) {
        best = e;
        x = tx;
        y = ty;
      }
    }
    for (let step = 0; step < w + h; step++) {
      const t = tiles[y * w + x]!;
      if (t.t === "ocean") break;
      if (t.t !== "mountains") {
        t.t = "river";
      }
      let nx = x;
      let ny = y;
      let nh = t.h + 1;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ] as const) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const e = tiles[yy * w + xx]!.h;
        if (e < nh) {
          nh = e;
          nx = xx;
          ny = yy;
        }
      }
      if (nx === x && ny === y) break;
      x = nx;
      y = ny;
    }
  }

  const seen = new Uint8Array(w * h);
  let bestId = 0;
  let bestSize = 0;
  const idOf = new Int32Array(w * h);
  let landId = 1;
  const isLand = (t: Terrain) => t !== "ocean";
  for (let i = 0; i < w * h; i++) {
    if (seen[i] || !isLand(tiles[i]!.t)) continue;
    const q = [i];
    seen[i] = 1;
    let n = 0;
    const my = landId++;
    while (q.length) {
      const c = q.pop()!;
      idOf[c] = my;
      n++;
      const cx = c % w;
      const cy = (c / w) | 0;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const ni = ny * w + nx;
        if (seen[ni] || !isLand(tiles[ni]!.t)) continue;
        seen[ni] = 1;
        q.push(ni);
      }
    }
    if (n > bestSize) {
      bestSize = n;
      bestId = my;
    }
  }

  const goodCity = (x: number, y: number) => {
    const t = tiles[y * w + x]!;
    if (idOf[y * w + x] !== bestId) return false;
    if (t.t === "ocean" || t.t === "mountains" || t.t === "river") return false;
    return t.t === "plains" || t.t === "coast" || t.t === "forest" || t.t === "hills" || t.t === "desert";
  };

  const cityCountRange = SIZE_META[size].cities;
  const nCities = rng.int(cityCountRange[0], cityCountRange[1]);
  const names = cityNames(opts.region, rng, Math.min(80, nCities + 36));
  const cities: City[] = [];
  const minDist = size === "small" ? 8 : size === "medium" ? 10 : 12;
  let attempts = 0;
  const startYear = opts.year ?? sc?.year ?? 1830;
  while (cities.length < nCities && attempts < 16000) {
    attempts++;
    const x = rng.int(2, w - 3);
    const y = rng.int(2, h - 3);
    if (!goodCity(x, y)) continue;
    if (cities.some((c) => Math.hypot(c.x - x, c.y - y) < minDist)) continue;
    const nearWater = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [2, 0],
      [0, 2],
    ].some(([dx, dy]) => {
      const t = tiles[(y + dy) * w + (x + dx)];
      return t && (t.t === "river" || t.t === "coast" || t.t === "ocean");
    });
    if (!nearWater && rng.chance(0.55) && attempts < 2500) continue;
    const name = names[cities.length] ?? `Town ${cities.length + 1}`;
    const pop = rng.int(4, 22) * 1000;
    const industries: Industry[] = [];
    if (rng.chance(0.35)) industries.push({ kind: "Factory", produces: "goods", consumes: ["steel", "lumber", "coal"] });
    if (rng.chance(0.2)) industries.push({ kind: "Steel mill", produces: "steel", consumes: ["iron", "coal"] });
    const demand = emptyCargo();
    demand.pax = 8 + Math.round(pop / 2000);
    demand.mail = 4 + Math.round(pop / 4000);
    demand.goods = 3 + Math.round(pop / 5000);
    demand.grain = 3;
    demand.coal = 2;
    const supply = emptyCargo();
    supply.pax = demand.pax;
    supply.mail = demand.mail;
    const cls = pop >= 24000 ? "city" : pop >= 9000 ? "town" : "hamlet";
    let portX: number | undefined;
    let portY: number | undefined;
    if (nearWater) {
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        const nt = tiles[(y + dy) * w + (x + dx)];
        if (nt && (nt.t === "ocean" || nt.t === "coast" || nt.t === "river")) {
          portX = x + dx;
          portY = y + dy;
          break;
        }
      }
    }
    const hasPort = nearWater && pop >= 8000;
    cities.push({
      id: cities.length + 1,
      name,
      x,
      y,
      pop,
      industries,
      demand,
      supply,
      served: false,
      foundedYear: startYear - rng.int(8, 70),
      cls,
      coastal: nearWater,
      hasPort,
      hasAirport: false,
      highway: false,
      growth: 0.01,
      delivered: 0,
      portX: hasPort ? portX : undefined,
      portY: hasPort ? portY : undefined,
    });
    tiles[y * w + x]!.t = "plains";
  }

  if ((opts.year ?? sc?.year ?? 1830) >= 1869) {
    /* oil available via desert tiles */
  }
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const t = tiles[y * w + x]!;
      if (t.t === "ocean" || t.t === "river" || t.t === "mountains") continue;
      if (cities.some((c) => Math.abs(c.x - x) + Math.abs(c.y - y) <= 1)) continue;
      const n = nRes(x * 0.09, y * 0.09);
      if (n > 0.62) {
        if (t.t === "hills") t.res = n > 0.78 ? "iron" : "coal";
        else if (t.t === "forest") t.res = "lumber";
        else if (t.t === "desert") t.res = "oil";
        else if (t.t === "plains") t.res = rng.chance(0.5) ? "grain" : "cattle";
      } else if (t.t === "forest" && n > 0.35) t.res = "lumber";
      else if (t.t === "plains" && n < -0.55) t.res = rng.chance(0.5) ? "grain" : "cattle";
      else if (t.t === "hills" && n < -0.5) t.res = rng.chance(0.5) ? "coal" : "iron";
    }
  }

  const year = opts.year ?? sc?.year ?? 1830;
  const playerName = opts.companyName.trim() || "Player Line";
  const used = new Set<string>([playerName]);
  const rivals = sc?.rivals ?? opts.rivals;
  const companies: Company[] = [
    {
      id: 1,
      name: playerName,
      color: COMPANY_COLORS[0],
      cash: sc?.cash ?? optsCash(opts),
      ai: false,
      stockPrice: 10,
      shares: 1000,
      playerShares: 600,
      trackTiles: 0,
      trainsBuilt: 0,
      revenueYtd: 0,
      expenseYtd: 0,
      bonds: [],
      bankrupt: false,
    },
  ];
  for (let i = 0; i < rivals; i++) {
    const name = aiCompanyName(rng, used);
    used.add(name);
    companies.push({
      id: i + 2,
      name,
      color: COMPANY_COLORS[(i + 1) % COMPANY_COLORS.length]!,
      cash: companies[0]!.cash * (0.7 + rng.float(0, 0.3)),
      ai: true,
      stockPrice: 8 + rng.float(0, 4),
      shares: 1000,
      playerShares: 0,
      trackTiles: 0,
      trainsBuilt: 0,
      revenueYtd: 0,
      expenseYtd: 0,
      bonds: [],
      bankrupt: false,
    });
  }

  const emptyStats = emptyCargo();
  return {
    version: SAVE_VERSION,
    seed,
    year,
    month: 0,
    day: 1,
    speed: 1,
    mapW: w,
    mapH: h,
    tiles,
    cities,
    stations: [],
    trains: [],
    crafts: [],
    namePool: names.slice(cities.length),
    companies,
    playerId: 1,
    nextId: 100,
    scenarioId: sc?.id ?? "sandbox",
    scenarioTitle: sc?.title ?? "Sandbox Empire",
    goals: sc?.goals ?? [
      { kind: "networth", target: 1_500_000, label: "Reach $1,500,000 net worth" },
      { kind: "connect", target: Math.min(14, Math.max(6, Math.floor(cities.length * 0.45))), label: `Serve ${Math.min(14, Math.max(6, Math.floor(cities.length * 0.45)))} cities` },
    ],
    timeLimit: sc?.timeLimit,
    events: [
      {
        year,
        month: 0,
        headline: `${playerName} chartered`,
        body: `A new railroad company has been formed with a war chest and a map of ${opts.region}. The age of steam begins.`,
      },
    ],
    difficulty: sc?.difficulty ?? opts.difficulty,
    region: opts.region,
    won: false,
    lost: false,
    loseReason: "",
    playTime: 0,
    stats: { cargoDelivered: emptyStats, citiesConnected: 0, peakCash: companies[0]!.cash },
    introSeen: false,
  };
}

function optsCash(opts: NewGameOpts): number {
  const table = { easy: 750000, normal: 500000, hard: 320000, magnate: 180000 };
  return table[opts.difficulty];
}

void (0 as unknown as Resource);
