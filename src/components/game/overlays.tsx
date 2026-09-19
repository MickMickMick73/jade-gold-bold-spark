import { useEffect, useState } from "react";
import {
  BookOpen,
  Building2,
  Pause,
  Play,
  FastForward,
  Search,
  Settings,
  TrainFront,
  Trash2,
  Wallet,
  Newspaper,
  Map as MapIcon,
  X,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCash, formatCashFull, MONTHS } from "@/lib/utils";
import { useGameStore, type Screen } from "@/game/store";
import { getEngine } from "@/game/engine";
import { generateWorld } from "@/game/mapgen";
import { SCENARIOS, SIZE_META, DIFFICULTY_META } from "@/game/scenarios";
import { deleteSlot, listSaves, loadSlot, saveSettings, saveSlot, type SaveMeta } from "@/game/save";
import { applySettings, sfx, unlockAudio } from "@/game/audio";
import type { Difficulty, MapSize, Region, Speed, Tool } from "@/game/types";
import { CARGO_LABEL, CARGOS } from "@/game/types";
import { buyTrain, issueBond, repayBond, tradeStock } from "@/game/simulation";
import { locosForYear, locoById } from "@/game/locomotives";
import { netWorth, playerCompany } from "@/game/economy";
import { CinematicOverlay } from "@/components/game/Cinematic";
import { LocoSheet, LocoThumb } from "@/components/game/LocoSheet";
import { introCinematic, scenarioPoster, shouldPlayTitle, titleCinematic } from "@/game/cinematics";

function Panel({
  title,
  children,
  onClose,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  wide?: boolean;
}) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0 bg-bg/70" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative flex max-h-[88dvh] w-full flex-col overflow-hidden border border-border bg-surface shadow-panel",
          wide ? "max-w-3xl rounded-xl" : "max-w-lg rounded-lg",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-xl font-semibold tracking-tight text-fg">{title}</h2>
          {onClose ? (
            <button type="button" className="size-11 text-muted hover:text-fg" onClick={onClose} aria-label="Close">
              <X className="mx-auto size-5" />
            </button>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function MainMenu() {
  const setScreen = useGameStore((s) => s.setScreen);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const setCinematic = useGameStore((s) => s.setCinematic);
  useEffect(() => {
    if (!shouldPlayTitle()) return;
    setCinematic(titleCinematic());
    setOverlay("cinematic");
  }, [setCinematic, setOverlay]);
  return (
    <div className="pointer-events-auto absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-bg via-bg/80 to-transparent p-6 sm:justify-center sm:p-12">
      <div className="max-w-md">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-muted">Railroad empire</p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-fg sm:text-6xl">Iron Baron</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
          Lay iron, buy locomotives, and bankrupt the competition. A 19th-century railroad on a living map.
        </p>
        <div className="mt-8 flex flex-col gap-2">
          <Button
            size="lg"
            onClick={() => {
              unlockAudio();
              sfx("click");
              setScreen("new");
            }}
          >
            New empire
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => {
              sfx("click");
              setScreen("scenarios");
            }}
          >
            Scenarios
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setScreen("load")}>
              Load
            </Button>
            <Button variant="secondary" onClick={() => setScreen("howto")}>
              How to play
            </Button>
          </div>
          <Button variant="ghost" onClick={() => setScreen("settings")}>
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NewGameMenu({ scenarioId }: { scenarioId?: string }) {
  const setScreen = useGameStore((s) => s.setScreen);
  const sc = SCENARIOS.find((s) => s.id === scenarioId);
  const [name, setName] = useState(sc ? "Charter Line" : "Pioneer Line");
  const [size, setSize] = useState<MapSize>(sc?.size ?? "medium");
  const [diff, setDiff] = useState<Difficulty>(sc?.difficulty ?? "normal");
  const [region, setRegion] = useState<Region>(sc?.region ?? "columbia");
  const [rivals, setRivals] = useState(sc?.rivals ?? 2);
  const [seed, setSeed] = useState(() => String(Math.floor(Math.random() * 999999) + 1));

  const start = () => {
    unlockAudio();
    sfx("bell");
    const engine = getEngine();
    if (!engine) return;
    const state = generateWorld({
      companyName: name,
      size,
      difficulty: diff,
      region,
      rivals: sc?.rivals ?? rivals,
      seed: Number(seed) || 1,
      year: sc?.year,
      scenario: sc,
    });
    state.speed = 0;
    engine.startPlay(state);
    useGameStore.getState().setCinematic(introCinematic(sc?.id ?? "sandbox"));
    useGameStore.getState().setOverlay("cinematic");
  };

  return (
    <Panel title={sc ? sc.title : "New empire"} onClose={() => setScreen("menu")} wide>
      {sc ? <p className="mb-4 text-sm text-muted">{sc.blurb}</p> : null}
      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">Company</label>
      <input
        className="mb-4 h-11 w-full rounded-md border border-border bg-inset px-3 text-sm text-fg"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={28}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Map">
          <RowSelect
            value={size}
            onChange={(v) => setSize(v as MapSize)}
            options={Object.entries(SIZE_META).map(([k, v]) => ({ id: k, label: v.label }))}
          />
        </Field>
        <Field label="Difficulty">
          <RowSelect
            value={diff}
            onChange={(v) => setDiff(v as Difficulty)}
            options={Object.entries(DIFFICULTY_META).map(([k, v]) => ({ id: k, label: v.label }))}
          />
        </Field>
        <Field label="Region">
          <RowSelect
            value={region}
            onChange={(v) => setRegion(v as Region)}
            options={[
              { id: "columbia", label: "Columbia" },
              { id: "frontier", label: "Frontier" },
              { id: "albion", label: "Albion" },
              { id: "continent", label: "Continent" },
              { id: "outback", label: "Outback" },
            ]}
          />
        </Field>
        <Field label="Rivals">
          <RowSelect
            value={String(rivals)}
            onChange={(v) => setRivals(Number(v))}
            options={[
              { id: "0", label: "None" },
              { id: "1", label: "One" },
              { id: "2", label: "Two" },
              { id: "3", label: "Three" },
            ]}
          />
        </Field>
      </div>
      <label className="mb-1 mt-4 block text-xs font-medium uppercase tracking-wider text-muted">Map seed</label>
      <div className="flex gap-2">
        <input
          className="h-11 flex-1 rounded-md border border-border bg-inset px-3 font-mono text-sm text-fg"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
        />
        <Button variant="secondary" onClick={() => setSeed(String(Math.floor(Math.random() * 999999) + 1))}>
          Shuffle
        </Button>
      </div>
      <Button className="mt-6 w-full" size="lg" onClick={start}>
        Charter the company
      </Button>
    </Panel>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">{label}</div>
      {children}
    </div>
  );
}

function RowSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "h-9 rounded-sm px-3 text-xs font-medium",
            value === o.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ScenarioMenu() {
  const setScreen = useGameStore((s) => s.setScreen);
  const [pick, setPick] = useState<string | null>(null);
  if (pick) return <NewGameMenu scenarioId={pick} />;
  return (
    <Panel title="Scenarios" onClose={() => setScreen("menu")} wide>
      <div className="grid gap-2 sm:grid-cols-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setPick(s.id)}
            className="overflow-hidden rounded-md border border-border bg-elevated text-left hover:border-border-strong"
          >
            <img src={scenarioPoster(s.id)} alt="" className="h-28 w-full object-cover" />
            <div className="p-4">
            <div className="font-display text-base font-semibold text-fg">{s.title}</div>
            <div className="mt-1 text-xs text-muted">
              {s.year} · {s.region} · {DIFFICULTY_META[s.difficulty].label}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.blurb}</p>
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}

export function LoadMenu() {
  const setScreen = useGameStore((s) => s.setScreen);
  const [saves, setSaves] = useState<(SaveMeta | null)[]>([]);
  useEffect(() => setSaves(listSaves()), []);
  const load = (i: number) => {
    const st = loadSlot(i);
    const engine = getEngine();
    if (st && engine) {
      unlockAudio();
      engine.startPlay(st);
    }
  };
  return (
    <Panel title="Load game" onClose={() => setScreen("menu")}>
      <div className="flex flex-col gap-2">
        {saves.map((s, i) =>
          s ? (
            <div key={i} className="flex items-center gap-3 rounded-md border border-border bg-elevated p-3">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => load(i)}>
                <div className="truncate text-sm font-medium text-fg">{s.company}</div>
                <div className="text-xs text-muted">
                  {s.title} · {MONTHS[s.month]} {s.year} · {formatCash(s.cash)}
                </div>
              </button>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Delete save"
                onClick={() => {
                  deleteSlot(i);
                  setSaves(listSaves());
                }}
              >
                <Trash2 />
              </Button>
            </div>
          ) : (
            <div key={i} className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-subtle">
              Empty slot {i + 1}
            </div>
          ),
        )}
      </div>
    </Panel>
  );
}

export function HowTo() {
  const setScreen = useGameStore((s) => s.setScreen);
  const screen = useGameStore((s) => s.screen);
  const close = () => (screen === "playing" ? useGameStore.getState().setOverlay(null) : setScreen("menu"));
  return (
    <Panel title="How to play" onClose={close} wide>
      <div className="space-y-4 text-sm leading-relaxed text-muted">
        <p className="text-fg">You are a railroad charter. Turn dirt into dividends.</p>
        <ol className="list-decimal space-y-2 pl-4">
          <li>Drag to lay track between towns. Hills, rivers and mountains cost more (bridges and tunnels).</li>
          <li>Build a station on your track next to a city so cargo will wait on the platform.</li>
          <li>Buy a locomotive, hang cars, and click two or more stations for a route.</li>
          <li>Unpause time. Cities grow if you serve them, starve if you don't. New towns appear. Ports, highways and airfields arrive with the decades.</li>
          <li>Issue bonds if you are short. Buy rival stock in the ledger. Watch the newspaper.</li>
        </ol>
        <p>
          <span className="text-fg">WASD / arrows</span> pan · <span className="text-fg">wheel</span> zoom ·{" "}
          <span className="text-fg">1–6</span> tools · <span className="text-fg">Space</span> pause ·{" "}
          <span className="text-fg">L</span> ledger · <span className="text-fg">R</span> roster
        </p>
        <p>
          Each new locomotive arrives with a film of it on the road, then a spec sheet. Click a train on the map or in the roster to see the same.
        </p>
        <p>
          Highways (1915+) and airfields (1928+) steal passengers. Rail a port city and you skim the sea trade. Build your own strip with the Air tool once the twenties arrive.
        </p>
        <p>Rivals lay their own iron. Beat the charter goals before the money runs out.</p>
      </div>
    </Panel>
  );
}

export function SettingsPanel() {
  const settings = useGameStore((s) => s.settings);
  const setSettings = useGameStore((s) => s.setSettings);
  const setScreen = useGameStore((s) => s.setScreen);
  const screen = useGameStore((s) => s.screen);
  const close = () => (screen === "playing" ? useGameStore.getState().setOverlay(null) : setScreen("menu"));
  const update = (p: Partial<typeof settings>) => {
    const next = { ...settings, ...p };
    setSettings(next);
    saveSettings(next);
    applySettings(next);
  };
  return (
    <Panel title="Settings" onClose={close}>
      <Slider label="Master" value={settings.master} onChange={(v) => update({ master: v })} />
      <Slider label="Music" value={settings.music} onChange={(v) => update({ music: v })} />
      <Slider label="Effects" value={settings.sfx} onChange={(v) => update({ sfx: v })} />
      <label className="mt-4 flex h-11 items-center gap-3 text-sm">
        <input type="checkbox" checked={settings.showGrid} onChange={(e) => update({ showGrid: e.target.checked })} />
        Show tile grid
      </label>
    </Panel>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="mb-3 block">
      <div className="mb-1 flex justify-between text-xs uppercase tracking-wider text-muted">
        <span>{label}</span>
        <span className="tabular">{Math.round(value * 100)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </label>
  );
}

const TOOLS: { id: Tool; label: string; icon: typeof Search; key: string }[] = [
  { id: "inspect", label: "Survey", icon: Search, key: "1" },
  { id: "track", label: "Track", icon: MapIcon, key: "2" },
  { id: "station", label: "Station", icon: Building2, key: "3" },
  { id: "train", label: "Train", icon: TrainFront, key: "4" },
  { id: "bulldoze", label: "Wreck", icon: Trash2, key: "5" },
  { id: "airport", label: "Air", icon: Plane, key: "6" },
];

export function HUD() {
  const hud = useGameStore((s) => s.hud);
  const tool = useGameStore((s) => s.tool);
  const setTool = useGameStore((s) => s.setTool);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const inspect = useGameStore((s) => s.inspectText);
  const toast = useGameStore((s) => s.toast);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => useGameStore.getState().setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);
  if (!hud) return null;
  const engine = getEngine();
  const speeds: Speed[] = [0, 1, 2, 4, 8];
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:flex-row sm:items-start sm:justify-between">
        <div className="pointer-events-auto max-w-full rounded-md border border-border bg-surface/95 px-3 py-2">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted">Cash</div>
              <div className={cn("font-display text-lg tabular", hud.cashRaw < 0 ? "text-loss" : "text-fg")}>{hud.cash}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted">Net worth</div>
              <div className="font-display text-lg tabular text-fg">{hud.worth}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted">Date</div>
              <div className="text-sm tabular text-fg">{hud.date}</div>
            </div>
          </div>
          <div className="mt-1 truncate text-xs text-muted">
            {hud.company} · {hud.scenario}
          </div>
        </div>
        <div className="pointer-events-auto flex flex-wrap items-center gap-1">
          {speeds.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={hud.speed === s ? "default" : "secondary"}
              aria-label={s === 0 ? "Pause" : `${s}x speed`}
              onClick={() => engine?.setSpeed(s)}
            >
              {s === 0 ? <Pause /> : s >= 4 ? <FastForward /> : <Play />}
              {s === 0 ? "Pause" : `${s}x`}
            </Button>
          ))}
          <Button size="icon-sm" variant="secondary" aria-label="Ledger" onClick={() => setOverlay("ledger")}>
            <Wallet />
          </Button>
          <Button size="icon-sm" variant="secondary" aria-label="Newspaper" onClick={() => setOverlay("news")}>
            <Newspaper />
          </Button>
          <Button size="icon-sm" variant="secondary" aria-label="Pause menu" onClick={() => setOverlay("pause")}>
            <Settings />
          </Button>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 inset-x-0 z-10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          {hud.goals.length ? (
            <div className="pointer-events-none rounded-md border border-border bg-surface/90 px-3 py-2 text-xs text-muted">
              {hud.goals.map((g) => (
                <div key={g.label} className="flex justify-between gap-3">
                  <span className={g.done ? "text-profit" : ""}>{g.label}</span>
                  <span className="tabular text-fg">
                    {g.current >= 1000 ? formatCash(g.current) : g.current}/
                    {g.target >= 1000 ? formatCash(g.target) : g.target}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
          {inspect ? (
            <div className="whitespace-pre-line rounded-md border border-border bg-surface/95 px-3 py-2 text-xs text-fg">
              {inspect}
            </div>
          ) : null}
          <div className="pointer-events-auto flex justify-center gap-1 rounded-lg border border-border bg-surface/95 p-1">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    sfx("click");
                    setTool(t.id);
                    if (t.id === "train") setOverlay("trainbuy");
                  }}
                  className={cn(
                    "flex min-w-11 flex-1 flex-col items-center gap-0.5 rounded-md px-2 py-2 text-[10px] uppercase tracking-wide",
                    tool === t.id ? "bg-primary text-primary-fg" : "text-muted hover:text-fg",
                  )}
                >
                  <Icon className="size-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {toast ? (
        <div className="pointer-events-none absolute left-1/2 top-24 z-20 -translate-x-1/2 rounded-md border border-border bg-elevated px-4 py-2 text-sm text-fg">
          {toast}
        </div>
      ) : null}
    </>
  );
}

export function PauseMenu() {
  const setOverlay = useGameStore((s) => s.setOverlay);
  const setScreen = useGameStore((s) => s.setScreen);
  const engine = getEngine();
  const save = (slot: number) => {
    if (!engine?.state) return;
    const ok = saveSlot(slot, engine.state);
    useGameStore.getState().setToast(ok ? `Saved to slot ${slot + 1}` : "Save failed");
  };
  return (
    <Panel title="Paused" onClose={() => setOverlay(null)}>
      <div className="flex flex-col gap-2">
        <Button onClick={() => setOverlay(null)}>Resume</Button>
        <Button variant="secondary" onClick={() => save(0)}>
          Quick save
        </Button>
        <Button variant="secondary" onClick={() => save(1)}>
          Save slot 2
        </Button>
        <Button variant="secondary" onClick={() => setOverlay("howto")}>
          <BookOpen className="size-4" /> How to play
        </Button>
        <Button variant="secondary" onClick={() => setOverlay("settings")}>
          Settings
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            engine?.startDemo();
            setScreen("menu");
          }}
        >
          Resign to menu
        </Button>
      </div>
    </Panel>
  );
}

export function Ledger() {
  const setOverlay = useGameStore((s) => s.setOverlay);
  const engine = getEngine();
  const state = engine?.state;
  const [, bump] = useState(0);
  if (!state) return null;
  const p = playerCompany(state);
  return (
    <Panel title="Company ledger" onClose={() => setOverlay(null)} wide>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat k="Cash" v={formatCashFull(p.cash)} />
        <Stat k="Net worth" v={formatCashFull(netWorth(state, p.id))} />
        <Stat k="Track" v={`${p.trackTiles} tiles`} />
        <Stat k="Trains" v={String(state.trains.filter((t) => t.companyId === p.id).length)} />
      </div>
      <h3 className="mb-2 font-display text-base text-fg">Bonds</h3>
      <div className="mb-4 flex flex-col gap-2">
        {p.bonds.length === 0 ? <p className="text-sm text-muted">No paper on the street.</p> : null}
        {p.bonds.map((b, i) => (
          <div key={i} className="flex items-center justify-between rounded-md bg-elevated px-3 py-2 text-sm">
            <span>
              {formatCashFull(b.amount)} @ {Math.round(b.rate * 100)}% · {b.yearIssued}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                repayBond(state, p.id, i);
                bump((n) => n + 1);
              }}
            >
              Repay
            </Button>
          </div>
        ))}
        <Button
          variant="secondary"
          onClick={() => {
            issueBond(state, p.id);
            bump((n) => n + 1);
          }}
        >
          Issue $100,000 bond
        </Button>
      </div>
      <h3 className="mb-2 font-display text-base text-fg">Stock exchange</h3>
      <div className="flex flex-col gap-2">
        {state.companies.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-elevated px-3 py-2">
            <span className="size-2.5 rounded-full" style={{ background: c.color }} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-fg">
                {c.name} {c.bankrupt ? "(bankrupt)" : ""}
              </div>
              <div className="text-xs text-muted tabular">
                ${c.stockPrice.toFixed(2)} · you own {c.playerShares}/{c.shares}
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                tradeStock(state, c.id, 10);
                bump((n) => n + 1);
              }}
            >
              Buy 10
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                tradeStock(state, c.id, -10);
                bump((n) => n + 1);
              }}
            >
              Sell 10
            </Button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md bg-elevated px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted">{k}</div>
      <div className="font-display tabular text-fg">{v}</div>
    </div>
  );
}

export function NewsPanel() {
  const setOverlay = useGameStore((s) => s.setOverlay);
  const events = getEngine()?.state?.events ?? [];
  return (
    <Panel title="Gazette" onClose={() => setOverlay(null)}>
      <div className="flex flex-col gap-3">
        {[...events].reverse().map((e, i) => (
          <article key={i} className="border-b border-border pb-3 last:border-0">
            <div className="text-[10px] uppercase tracking-wider text-muted">
              {MONTHS[e.month]} {e.year}
            </div>
            <h3 className="font-display text-base text-fg">{e.headline}</h3>
            <p className="mt-1 text-sm text-muted">{e.body}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

export function TrainBuy() {
  const setOverlay = useGameStore((s) => s.setOverlay);
  const draft = useGameStore((s) => s.trainDraft);
  const setDraft = useGameStore((s) => s.setDraft);
  const engine = getEngine();
  const state = engine?.state;
  const [, bump] = useState(0);
  if (!state || !engine) return null;
  const locos = locosForYear(state.year);
  const loco = locoById(draft.locoId);
  const stations = state.stations.filter((s) => s.companyId === state.playerId);
  const launch = () => {
    const tr = buyTrain(state, state.playerId, draft.locoId, draft.cars, draft.route, engine.hooks());
    if (!tr) useGameStore.getState().setToast("Need two linked stations, a consist, and cash.");
    else {
      useGameStore.getState().setToast(`${tr.name} on the line`);
      setDraft({ route: [] });
      setOverlay(null);
    }
    bump((n) => n + 1);
  };
  return (
    <Panel title="Buy a train" onClose={() => setOverlay(null)} wide>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Locomotive</h3>
      <div className="mb-4 grid max-h-56 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
        {locos.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setDraft({ locoId: l.id, cars: draft.cars.slice(0, l.capacity) })}
            className={cn(
              "flex gap-2 overflow-hidden rounded-md border text-left",
              draft.locoId === l.id ? "border-primary bg-elevated" : "border-border bg-inset",
            )}
          >
            <LocoThumb id={l.id} className="h-16 w-24 shrink-0" />
            <div className="min-w-0 py-2 pr-3">
            <div className="text-sm text-fg">{l.name}</div>
            <div className="text-xs text-muted">
              {formatCash(l.cost)} · {l.speed} mph · {l.capacity} cars
            </div>
            </div>
          </button>
        ))}
      </div>
      <p className="mb-3 text-xs text-muted">{loco.blurb}</p>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Consist</h3>
      <div className="mb-3 flex flex-wrap gap-1">
        {CARGOS.map((c) => (
          <button
            key={c}
            type="button"
            disabled={draft.cars.length >= loco.capacity}
            onClick={() => setDraft({ cars: [...draft.cars, c] })}
            className="h-9 rounded-sm bg-elevated px-3 text-xs text-fg disabled:opacity-40"
          >
            + {CARGO_LABEL[c]}
          </button>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-1">
        {draft.cars.map((c, i) => (
          <button
            key={`${c}-${i}`}
            type="button"
            className="h-8 rounded-sm bg-primary px-2 text-xs text-primary-fg"
            onClick={() => setDraft({ cars: draft.cars.filter((_, j) => j !== i) })}
          >
            {CARGO_LABEL[c]} ×
          </button>
        ))}
      </div>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
        Route — click stations on the map, or pick
      </h3>
      <div className="mb-3 flex flex-wrap gap-1">
        {stations.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              if (draft.route.includes(s.id)) return;
              setDraft({ route: [...draft.route, s.id] });
            }}
            className={cn(
              "h-9 rounded-sm px-3 text-xs",
              draft.route.includes(s.id) ? "bg-primary text-primary-fg" : "bg-elevated text-fg",
            )}
          >
            {s.name}
          </button>
        ))}
        {stations.length < 2 ? <span className="text-xs text-muted">Build two stations first.</span> : null}
      </div>
      {draft.route.length ? (
        <button type="button" className="mb-4 text-xs text-muted" onClick={() => setDraft({ route: [] })}>
          Clear route
        </button>
      ) : null}
      <Button className="w-full" onClick={launch}>
        Launch train
      </Button>
      <RosterMini />
    </Panel>
  );
}

function RosterMini() {
  const state = getEngine()?.state;
  const setOverlay = useGameStore((s) => s.setOverlay);
  const setLocoFocus = useGameStore((s) => s.setLocoFocus);
  if (!state) return null;
  const list = state.trains.filter((t) => t.companyId === state.playerId);
  if (!list.length) return null;
  return (
    <div className="mt-6 border-t border-border pt-4">
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">On the line</h3>
      {list.map((t) => (
        <button
          key={t.id}
          type="button"
          className="mb-1 flex w-full items-center gap-2 rounded-md py-1 text-left hover:bg-elevated"
          onClick={() => {
            setLocoFocus({ locoId: t.locoId, trainId: t.id, fromIntro: false });
            setOverlay("locodetail");
          }}
        >
          <LocoThumb id={t.locoId} className="h-10 w-16 rounded-sm" />
          <span className="min-w-0 flex-1 truncate text-sm text-fg">{t.name}</span>
          <span className="tabular text-xs text-muted">
            {t.status} · {formatCash(t.profit)}
          </span>
        </button>
      ))}
    </div>
  );
}

export function EndScreen() {
  const hud = useGameStore((s) => s.hud);
  const setScreen = useGameStore((s) => s.setScreen);
  const won = hud?.won;
  return (
    <Panel title={won ? "Charter fulfilled" : "The line is lost"}>
      <p className="text-sm leading-relaxed text-muted">
        {won ? "The board toasts a new baron. Iron, steam, and a fat ledger." : hud?.loseReason || "The bondholders have taken the keys."}
      </p>
      {hud ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stat k="Net worth" v={hud.worth} />
          <Stat k="Date" v={hud.date} />
        </div>
      ) : null}
      <Button
        className="mt-6 w-full"
        onClick={() => {
          getEngine()?.startDemo();
          setScreen("menu");
        }}
      >
        Return to menu
      </Button>
    </Panel>
  );
}

export function OverlayRouter() {
  const screen = useGameStore((s) => s.screen);
  const overlay = useGameStore((s) => s.overlay);
  const which: Screen | null = overlay ?? (screen === "playing" ? null : screen);
  return (
    <>
      {screen === "playing" && overlay !== "cinematic" && overlay !== "locodetail" ? <HUD /> : null}
      {which === "menu" ? <MainMenu /> : null}
      {which === "new" ? <NewGameMenu /> : null}
      {which === "scenarios" ? <ScenarioMenu /> : null}
      {which === "load" ? <LoadMenu /> : null}
      {which === "howto" ? <HowTo /> : null}
      {which === "settings" ? <SettingsPanel /> : null}
      {which === "pause" ? <PauseMenu /> : null}
      {which === "ledger" ? <Ledger /> : null}
      {which === "news" ? <NewsPanel /> : null}
      {which === "trainbuy" || which === "roster" ? <TrainBuy /> : null}
      {which === "end" ? <EndScreen /> : null}
      {which === "cinematic" ? <CinematicOverlay /> : null}
      {which === "locodetail" ? <LocoSheet /> : null}
    </>
  );
}
