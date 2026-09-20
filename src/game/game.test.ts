import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CARGOS, emptyCargo, isCoachCargo, type GameState, type Tile } from "./types.ts";
import { canBridgeOcean, fillWaterDiagonals, lineRail, tileAt } from "./pathfinding.ts";
import { headingDir } from "./sprites.ts";
import { refreshCityMarkets, packingHouse, refinery, cityClassFromPop } from "./growth.ts";
import { placeTrackPath, tryBuyTrain } from "./simulation.ts";
import { describeStation, cargoList, popMeter } from "./inspect.ts";

function tile(t: Tile["t"]): Tile {
  return { t, h: 0.4, track: 0, owner: 0, bridge: false, tunnel: false, road: 0 };
}

function miniState(w = 12, h = 12, fill: Tile["t"] = "plains"): GameState {
  const tiles: Tile[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) tiles.push(tile(fill));
  return {
    version: 3,
    seed: 1,
    year: 1860,
    month: 0,
    day: 1,
    speed: 1,
    mapW: w,
    mapH: h,
    tiles,
    cities: [],
    stations: [],
    trains: [],
    crafts: [],
    incidents: [],
    yards: [],
    wreckers: [],
    namePool: [],
    companies: [
      {
        id: 1,
        name: "Test Line",
        color: "#aaa",
        cash: 5_000_000,
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
    ],
    playerId: 1,
    nextId: 1,
    scenarioId: "sandbox",
    scenarioTitle: "Test",
    goals: [],
    events: [],
    difficulty: "easy",
    region: "columbia",
    won: false,
    lost: false,
    loseReason: "",
    playTime: 0,
    stats: { cargoDelivered: emptyCargo(), citiesConnected: 0, peakCash: 5_000_000 },
    introSeen: true,
    surveyGaps: [],
  };
}

describe("headingDir", () => {
  it("maps grid east/south/west/north onto the iso sheet", () => {
    assert.equal(headingDir(0), 1);
    assert.equal(headingDir(Math.PI / 2), 0);
    assert.equal(headingDir(Math.PI), 3);
    assert.equal(headingDir(-Math.PI / 2), 2);
  });
});

describe("water trestles", () => {
  it("lays both tiles of a 2-deep ocean crossing on a straight line", () => {
    const s = miniState();
    for (let x = 0; x < s.mapW; x++) {
      s.tiles[5 * s.mapW + x]!.t = "ocean";
      s.tiles[6 * s.mapW + x]!.t = "ocean";
    }
    const n = placeTrackPath(s, lineRail(5, 3, 5, 8), 1);
    assert.ok(n >= 6);
    assert.ok(tileAt(s, 5, 5)!.track, "first ocean");
    assert.ok(tileAt(s, 5, 6)!.track, "second ocean");
    assert.equal((s.surveyGaps ?? []).length, 0);
  });

  it("fills a diagonal skip so a slightly off-axis stroke still spans the strait", () => {
    const s = miniState();
    for (let x = 0; x < s.mapW; x++) {
      s.tiles[5 * s.mapW + x]!.t = "ocean";
      s.tiles[6 * s.mapW + x]!.t = "ocean";
    }
    // (4,3) to (6,8) is not 3:1 axis-aligned, so line8 will diagonal.
    const raw = lineRail(4, 3, 6, 8);
    const filled = fillWaterDiagonals(s, raw);
    assert.ok(filled.length >= raw.length);
    placeTrackPath(s, raw, 1);
    const oceans = [5, 6].filter((y) =>
      [4, 5, 6].some((x) => tileAt(s, x, y)?.t === "ocean" && tileAt(s, x, y)!.track),
    );
    assert.equal(oceans.length, 2, "both water rows received a trestle");
  });

  it("refuses a trestle that does not touch shore", () => {
    const s = miniState(8, 8, "ocean");
    assert.equal(canBridgeOcean(s, 3, 3), false);
  });

  it("allows a pending whole-span stroke from shore", () => {
    const s = miniState();
    for (let x = 0; x < s.mapW; x++) {
      s.tiles[5 * s.mapW + x]!.t = "ocean";
      s.tiles[6 * s.mapW + x]!.t = "ocean";
    }
    const pts = lineRail(5, 3, 5, 8);
    const pending = new Set(pts.map((p) => `${p.x},${p.y}`));
    assert.equal(canBridgeOcean(s, 5, 5, pending), true);
    assert.equal(canBridgeOcean(s, 5, 6, pending), true);
  });

  it("records a visible gap when cash cannot cover the second trestle", () => {
    const s = miniState();
    s.companies[0]!.cash = 26000; // first ocean 24k, second cannot pay
    for (let x = 0; x < s.mapW; x++) {
      s.tiles[5 * s.mapW + x]!.t = "ocean";
      s.tiles[6 * s.mapW + x]!.t = "ocean";
    }
    // land tiles are cheap; drain most cash by only having enough for one trestle + a bit of land
    s.companies[0]!.cash = 30000;
    placeTrackPath(s, lineRail(5, 4, 5, 7), 1);
    assert.ok((s.surveyGaps ?? []).length >= 1);
  });
});

describe("markets", () => {
  it("seeds cattle and oil demand on a living city", () => {
    const city = {
      id: 1,
      name: "Test",
      x: 0,
      y: 0,
      pop: 18000,
      industries: [packingHouse(), refinery()],
      demand: emptyCargo(),
      supply: emptyCargo(),
      served: false,
      foundedYear: 1840,
      cls: cityClassFromPop(18000),
      coastal: false,
      hasPort: false,
      hasAirport: false,
      highway: false,
      growth: 0.02,
      delivered: 0,
    };
    refreshCityMarkets(city, 1865);
    assert.ok(city.demand.cattle > 0);
    assert.ok(city.demand.oil > 0);
    assert.ok(city.demand.grain > 0);
    assert.ok(city.demand.coal > 0);
    assert.ok(city.demand.goods > 0);
  });

  it("formats waiting cargo", () => {
    const rec = emptyCargo();
    rec.coal = 4;
    rec.pax = 2;
    assert.match(cargoList(rec), /Passengers 2/);
    assert.match(cargoList(rec), /Coal 4/);
    assert.equal(popMeter(45000).includes("█"), true);
  });

  it("lists station waiting cargo", () => {
    const s = miniState();
    s.stations.push({
      id: 1,
      x: 3,
      y: 3,
      cityId: 0,
      companyId: 1,
      waiting: { ...emptyCargo(), coal: 6, pax: 3 },
      name: "Mill Halt",
      level: 1,
    });
    const text = describeStation(s, s.stations[0]!);
    assert.match(text, /Coal 6/);
    assert.match(text, /Passengers 3/);
  });
});

describe("consist", () => {
  it("treats pax/mail as coaches and the rest as freight", () => {
    assert.equal(isCoachCargo("pax"), true);
    assert.equal(isCoachCargo("mail"), true);
    assert.equal(isCoachCargo("coal"), false);
    assert.equal(isCoachCargo("cattle"), false);
    assert.equal(isCoachCargo("oil"), false);
    for (const c of CARGOS) assert.equal(typeof isCoachCargo(c), "boolean");
  });

  it("explains a broken line when stations are not linked", () => {
    const s = miniState();
    s.stations.push(
      { id: 1, x: 2, y: 2, cityId: 0, companyId: 1, waiting: emptyCargo(), name: "A", level: 1 },
      { id: 2, x: 8, y: 8, cityId: 0, companyId: 1, waiting: emptyCargo(), name: "B", level: 1 },
    );
    s.surveyGaps = [{ x: 5, y: 5 }];
    const r = tryBuyTrain(s, 1, "pioneer", ["pax"], [1, 2]);
    assert.equal(r.train, null);
    assert.match(r.error ?? "", /broken|gap/i);
  });
});
