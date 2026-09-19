export const CARGOS = [
  "pax",
  "mail",
  "coal",
  "iron",
  "steel",
  "grain",
  "cattle",
  "lumber",
  "goods",
  "oil",
] as const;
export type Cargo = (typeof CARGOS)[number];

export const TERRAINS = [
  "ocean",
  "coast",
  "plains",
  "forest",
  "hills",
  "mountains",
  "desert",
  "swamp",
  "river",
] as const;
export type Terrain = (typeof TERRAINS)[number];

export const RESOURCES = ["coal", "iron", "grain", "cattle", "lumber", "oil"] as const;
export type Resource = (typeof RESOURCES)[number];

export type Tool = "inspect" | "track" | "station" | "train" | "bulldoze" | "airport";
export type Speed = 0 | 1 | 2 | 4 | 8;
export type Difficulty = "easy" | "normal" | "hard" | "magnate";
export type MapSize = "small" | "medium" | "large";
export type Region = "columbia" | "frontier" | "albion" | "continent" | "outback";

export const N = 1;
export const E = 2;
export const S = 4;
export const W = 8;
export const DIRS = [
  { bit: N, dx: 0, dy: -1, opp: S },
  { bit: E, dx: 1, dy: 0, opp: W },
  { bit: S, dx: 0, dy: 1, opp: N },
  { bit: W, dx: -1, dy: 0, opp: E },
] as const;

export interface Tile {
  t: Terrain;
  h: number;
  res?: Resource;
  track: number;
  owner: number;
  bridge: boolean;
  tunnel: boolean;
  road: number;
}

export interface Industry {
  kind: string;
  produces: Cargo;
  consumes: Cargo[];
}

export type CityClass = "hamlet" | "town" | "city" | "metropolis";

export interface City {
  id: number;
  name: string;
  x: number;
  y: number;
  pop: number;
  industries: Industry[];
  demand: Record<Cargo, number>;
  supply: Record<Cargo, number>;
  served: boolean;
  foundedYear: number;
  cls: CityClass;
  coastal: boolean;
  hasPort: boolean;
  hasAirport: boolean;
  highway: boolean;
  growth: number;
  delivered: number;
  portX?: number;
  portY?: number;
  airX?: number;
  airY?: number;
}

export interface Craft {
  id: number;
  kind: "ship" | "plane";
  x: number;
  y: number;
  heading: number;
  fromId: number;
  toId: number;
  path: { x: number; y: number }[];
  pathIdx: number;
  segT: number;
}

export interface Station {
  id: number;
  x: number;
  y: number;
  cityId: number;
  companyId: number;
  waiting: Record<Cargo, number>;
  name: string;
  level: 1 | 2 | 3;
}

export interface TrainCar {
  cargo: Cargo;
  amount: number;
}

export interface Train {
  id: number;
  name: string;
  locoId: string;
  cars: TrainCar[];
  route: number[];
  routeIdx: number;
  path: { x: number; y: number }[];
  pathIdx: number;
  segT: number;
  x: number;
  y: number;
  heading: number;
  companyId: number;
  status: "running" | "waiting" | "broken";
  brokenFor: number;
  profit: number;
  lastPayout: number;
  age: number;
}

export interface Bond {
  amount: number;
  rate: number;
  yearIssued: number;
}

export interface Company {
  id: number;
  name: string;
  color: string;
  cash: number;
  ai: boolean;
  stockPrice: number;
  shares: number;
  playerShares: number;
  trackTiles: number;
  trainsBuilt: number;
  revenueYtd: number;
  expenseYtd: number;
  bonds: Bond[];
  bankrupt: boolean;
}

export interface NewsItem {
  year: number;
  month: number;
  headline: string;
  body: string;
}

export interface Goal {
  kind: "networth" | "connect" | "cargo" | "bankrupt_ai" | "year_worth" | "link_cities";
  target: number;
  cargo?: Cargo;
  cityNames?: string[];
  label: string;
}

export interface ScenarioDef {
  id: string;
  title: string;
  blurb: string;
  region: Region;
  size: MapSize;
  year: number;
  difficulty: Difficulty;
  rivals: number;
  cash: number;
  goals: Goal[];
  timeLimit?: number;
  mapHint?: "standard" | "wide" | "islands" | "dense";
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}

export interface GameState {
  version: number;
  seed: number;
  year: number;
  month: number;
  day: number;
  speed: Speed;
  mapW: number;
  mapH: number;
  tiles: Tile[];
  cities: City[];
  stations: Station[];
  trains: Train[];
  crafts: Craft[];
  namePool: string[];
  companies: Company[];
  playerId: number;
  nextId: number;
  scenarioId: string;
  scenarioTitle: string;
  goals: Goal[];
  timeLimit?: number;
  events: NewsItem[];
  difficulty: Difficulty;
  region: Region;
  won: boolean;
  lost: boolean;
  loseReason: string;
  playTime: number;
  stats: {
    cargoDelivered: Record<Cargo, number>;
    citiesConnected: number;
    peakCash: number;
  };
  introSeen: boolean;
}

export interface NewGameOpts {
  companyName: string;
  size: MapSize;
  difficulty: Difficulty;
  region: Region;
  rivals: number;
  seed?: number;
  year?: number;
  scenario?: ScenarioDef;
}

export const SAVE_VERSION = 2;

export const CARGO_LABEL: Record<Cargo, string> = {
  pax: "Passengers",
  mail: "Mail",
  coal: "Coal",
  iron: "Iron",
  steel: "Steel",
  grain: "Grain",
  cattle: "Livestock",
  lumber: "Lumber",
  goods: "Goods",
  oil: "Oil",
};

export const CARGO_COLOR: Record<Cargo, string> = {
  pax: "#d8d3c4",
  mail: "#c4a574",
  coal: "#2a2a28",
  iron: "#6a5a4a",
  steel: "#8a949c",
  grain: "#c4b46a",
  cattle: "#8a5a42",
  lumber: "#4a6a3a",
  goods: "#6a6a8a",
  oil: "#3a3a32",
};

export const COMPANY_COLORS = ["#9aa4ae", "#8f4d42", "#4a5c40", "#5c6b7a"] as const;
