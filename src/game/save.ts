import { SAVE_VERSION, type City, type GameState, type Tile } from "./types";
import { cityClassFromPop } from "./growth";

const PREFIX = "iron-baron-v1";
const SETTINGS_KEY = `${PREFIX}-settings`;
const SLOTS = 3;

export interface Settings {
  master: number;
  music: number;
  sfx: number;
  edgePan: boolean;
  showGrid: boolean;
}

export const defaultSettings: Settings = {
  master: 0.7,
  music: 0.35,
  sfx: 0.7,
  edgePan: true,
  showGrid: false,
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export function loadSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    return safeParse(localStorage.getItem(SETTINGS_KEY), defaultSettings);
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* quota */
  }
}

export interface SaveMeta {
  slot: number;
  title: string;
  year: number;
  month: number;
  company: string;
  cash: number;
  savedAt: number;
}

function slotKey(slot: number) {
  return `${PREFIX}-slot-${slot}`;
}
function metaKey(slot: number) {
  return `${PREFIX}-meta-${slot}`;
}

export function listSaves(): (SaveMeta | null)[] {
  if (typeof window === "undefined") return Array.from({ length: SLOTS }, () => null);
  const out: (SaveMeta | null)[] = [];
  for (let i = 0; i < SLOTS; i++) {
    try {
      const raw = localStorage.getItem(metaKey(i));
      out.push(raw ? (JSON.parse(raw) as SaveMeta) : null);
    } catch {
      out.push(null);
    }
  }
  return out;
}

export function saveSlot(slot: number, state: GameState): boolean {
  try {
    const blob = JSON.stringify(state);
    const prev = localStorage.getItem(slotKey(slot));
    if (prev) localStorage.setItem(`${slotKey(slot)}-bak`, prev);
    localStorage.setItem(slotKey(slot), blob);
    const co = state.companies.find((c) => c.id === state.playerId);
    const meta: SaveMeta = {
      slot,
      title: state.scenarioTitle,
      year: state.year,
      month: state.month,
      company: co?.name ?? "Line",
      cash: co?.cash ?? 0,
      savedAt: Date.now(),
    };
    localStorage.setItem(metaKey(slot), JSON.stringify(meta));
    return true;
  } catch {
    return false;
  }
}

function migrateState(data: GameState) {
  data.version = SAVE_VERSION;
  if (!data.crafts) data.crafts = [];
  if (!data.namePool) data.namePool = [];
  for (const t of data.tiles ?? []) {
    const tile = t as Tile;
    if (tile.road === undefined) tile.road = 0;
  }
  for (const c of data.cities ?? []) {
    const city = c as City;
    if (city.foundedYear === undefined) city.foundedYear = (data.year ?? 1830) - 20;
    if (city.cls === undefined) city.cls = cityClassFromPop(city.pop ?? 5000);
    if (city.coastal === undefined) city.coastal = false;
    if (city.hasPort === undefined) city.hasPort = false;
    if (city.hasAirport === undefined) city.hasAirport = false;
    if (city.highway === undefined) city.highway = false;
    if (city.growth === undefined) city.growth = 0.01;
    if (city.delivered === undefined) city.delivered = 0;
  }
}

export function loadSlot(slot: number): GameState | null {
  try {
    const raw = localStorage.getItem(slotKey(slot));
    if (!raw) return null;
    const data = JSON.parse(raw) as GameState;
    if (!data || typeof data !== "object") return null;
    migrateState(data);
    return data;
  } catch {
    return null;
  }
}

export function deleteSlot(slot: number) {
  try {
    localStorage.removeItem(slotKey(slot));
    localStorage.removeItem(metaKey(slot));
  } catch {
    /* */
  }
}

export function exportSave(state: GameState): string {
  return JSON.stringify(state);
}

export function importSave(raw: string): GameState | null {
  try {
    const data = JSON.parse(raw) as GameState;
    if (!data?.tiles || !data.companies) return null;
    return data;
  } catch {
    return null;
  }
}

export function hasSeenHowTo(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`${PREFIX}-howto`) === "1";
}
export function markHowTo() {
  try {
    localStorage.setItem(`${PREFIX}-howto`, "1");
  } catch {
    /* */
  }
}
