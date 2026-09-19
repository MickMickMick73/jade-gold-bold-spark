import { create } from "zustand";
import type { Cargo, GameState, Speed, Tool } from "./types";
import type { Settings } from "./save";
import { defaultSettings, loadSettings } from "./save";
import type { Cinematic } from "./cinematics";
import { goalProgress } from "./simulation";
import { netWorth, playerCompany } from "./economy";
import { MONTHS, formatCash } from "@/lib/utils";

export type Screen =
  | "menu"
  | "new"
  | "scenarios"
  | "load"
  | "howto"
  | "settings"
  | "playing"
  | "pause"
  | "ledger"
  | "roster"
  | "news"
  | "trainbuy"
  | "end"
  | "cinematic"
  | "locodetail";

export interface HudSnap {
  cash: string;
  cashRaw: number;
  worth: string;
  date: string;
  year: number;
  month: number;
  speed: Speed;
  company: string;
  cities: number;
  trains: number;
  won: boolean;
  lost: boolean;
  loseReason: string;
  scenario: string;
  goals: { label: string; current: number; target: number; done: boolean }[];
  news: { headline: string; body: string; year: number; month: number } | null;
}

export interface LocoFocus {
  locoId: string;
  trainId?: number;
  fromIntro: boolean;
}

export interface TrainDraft {
  locoId: string;
  cars: Cargo[];
  route: number[];
}

interface UIState {
  screen: Screen;
  overlay: Screen | null;
  tool: Tool;
  selectedTrain: number | null;
  selectedStation: number | null;
  selectedCity: number | null;
  hud: HudSnap | null;
  settings: Settings;
  toast: string | null;
  trainDraft: TrainDraft;
  inspectText: string;
  cinematic: Cinematic | null;
  locoFocus: LocoFocus | null;
  setScreen: (s: Screen) => void;
  setOverlay: (s: Screen | null) => void;
  setTool: (t: Tool) => void;
  setSelected: (kind: "train" | "station" | "city" | "clear", id?: number) => void;
  setHud: (h: HudSnap | null) => void;
  setSettings: (s: Partial<Settings>) => void;
  setToast: (t: string | null) => void;
  setDraft: (d: Partial<TrainDraft>) => void;
  setInspect: (t: string) => void;
  setCinematic: (c: Cinematic | null) => void;
  setLocoFocus: (f: LocoFocus | null) => void;
}

export const emptyHud: HudSnap = {
  cash: "$0",
  cashRaw: 0,
  worth: "$0",
  date: "January 1830",
  year: 1830,
  month: 0,
  speed: 1,
  company: "",
  cities: 0,
  trains: 0,
  won: false,
  lost: false,
  loseReason: "",
  scenario: "",
  goals: [],
  news: null,
};

export function snapHud(state: GameState): HudSnap {
  const p = playerCompany(state);
  const last = state.events[state.events.length - 1] ?? null;
  return {
    cash: formatCash(p.cash),
    cashRaw: p.cash,
    worth: formatCash(netWorth(state, p.id)),
    date: `${MONTHS[state.month]} ${state.year}`,
    year: state.year,
    month: state.month,
    speed: state.speed,
    company: p.name,
    cities: state.stats.citiesConnected,
    trains: state.trains.filter((t) => t.companyId === p.id).length,
    won: state.won,
    lost: state.lost,
    loseReason: state.loseReason,
    scenario: state.scenarioTitle,
    goals: goalProgress(state),
    news: last,
  };
}

export const useGameStore = create<UIState>((set) => ({
  screen: "menu",
  overlay: null,
  tool: "inspect",
  selectedTrain: null,
  selectedStation: null,
  selectedCity: null,
  hud: null,
  settings: typeof window === "undefined" ? defaultSettings : loadSettings(),
  toast: null,
  trainDraft: { locoId: "pioneer", cars: ["pax", "mail"], route: [] },
  inspectText: "",
  cinematic: null,
  locoFocus: null,
  setScreen: (screen) => set({ screen, overlay: null }),
  setOverlay: (overlay) => set({ overlay }),
  setTool: (tool) => set({ tool }),
  setSelected: (kind, id) =>
    set(
      kind === "clear"
        ? { selectedTrain: null, selectedStation: null, selectedCity: null }
        : kind === "train"
          ? { selectedTrain: id ?? null, selectedStation: null, selectedCity: null }
          : kind === "station"
            ? { selectedStation: id ?? null, selectedTrain: null, selectedCity: null }
            : { selectedCity: id ?? null, selectedTrain: null, selectedStation: null },
    ),
  setHud: (hud) => set({ hud }),
  setSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s } })),
  setToast: (toast) => set({ toast }),
  setDraft: (d) => set((st) => ({ trainDraft: { ...st.trainDraft, ...d } })),
  setInspect: (inspectText) => set({ inspectText }),
  setCinematic: (cinematic) => set({ cinematic }),
  setLocoFocus: (locoFocus) => set({ locoFocus }),
}));
