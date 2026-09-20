import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/game/store";
import { getNet, makeRoomCode } from "@/game/net";
import { getEngine } from "@/game/engine";
import { generateWorld } from "@/game/mapgen";
import { SIZE_META, DIFFICULTY_META } from "@/game/scenarios";
import type { Difficulty, MapSize, NewGameOpts, Region } from "@/game/types";
import { unlockAudio, sfx } from "@/game/audio";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Lobby() {
  const net = useGameStore((s) => s.net);
  const setScreen = useGameStore((s) => s.setScreen);
  const [name, setName] = useState("Pioneer Line");
  const [codeIn, setCodeIn] = useState("");
  const [size, setSize] = useState<MapSize>("medium");
  const [diff, setDiff] = useState<Difficulty>("normal");
  const [region, setRegion] = useState<Region>("columbia");
  const [rivals, setRivals] = useState(1);

  const leave = () => {
    getNet().close();
    setScreen("menu");
  };

  const host = () => {
    unlockAudio();
    sfx("click");
    getNet().host(name.trim() || "Pioneer Line", makeRoomCode());
  };

  const join = () => {
    unlockAudio();
    sfx("click");
    const code = codeIn.trim().toUpperCase();
    if (code.length < 4) {
      useGameStore.getState().setToast("Need a four-letter charter code.");
      return;
    }
    getNet().join(name.trim() || "Pioneer Line", code);
  };

  const start = () => {
    const n = getNet();
    if (n.role !== "host") return;
    sfx("bell");
    const connected = n.peers.filter((p) => p.connectionState === "connected").slice(0, 3);
    const seats = [{ peerId: n.selfId, companyId: 1, name: n.name }];
    let id = 2;
    for (const p of connected) {
      seats.push({ peerId: p.id, companyId: id, name: n.names[p.id] || p.name || `Line ${id}` });
      id += 1;
    }
    const opts: NewGameOpts = {
      companyName: n.name,
      size,
      difficulty: diff,
      region,
      rivals,
      humans: seats.map((s) => ({ name: s.name, peerId: s.peerId })),
    };
    const state = generateWorld(opts);
    state.speed = 1;
    n.sendStart(state.seed, opts, seats);
    getEngine()?.startPlay(state);
  };

  return (
    <div className="pointer-events-auto absolute inset-0 z-10 flex items-end justify-center p-4 sm:items-center">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-panel">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Charter a table</h2>
          <button type="button" className="size-11 text-muted hover:text-fg" onClick={leave} aria-label="Close">
            <X className="mx-auto size-5" />
          </button>
        </div>
        <div className="max-h-[80dvh] overflow-y-auto px-5 py-4">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">Your company</label>
          <input
            className="mb-4 h-11 w-full rounded-md border border-border bg-inset px-3 text-sm text-fg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={28}
            disabled={net.role !== "solo"}
          />

          {net.role === "solo" ? (
            <>
              <Button className="mb-3 w-full" size="lg" onClick={host}>
                Host a charter
              </Button>
              <div className="mb-2 text-xs uppercase tracking-wider text-muted">Or sit at a friend's table</div>
              <div className="flex gap-2">
                <input
                  className="h-11 flex-1 rounded-md border border-border bg-inset px-3 font-mono text-sm uppercase text-fg"
                  value={codeIn}
                  onChange={(e) => setCodeIn(e.target.value.toUpperCase())}
                  maxLength={8}
                  placeholder="CODE"
                />
                <Button variant="secondary" onClick={join}>
                  Join
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 rounded-md border border-border bg-elevated px-4 py-3">
                <div className="text-[10px] uppercase tracking-wider text-muted">Charter code</div>
                <div className="font-display text-3xl tracking-[0.2em] text-fg">{net.code}</div>
                <p className="mt-1 text-xs text-muted">
                  {net.role === "host" ? "Read this to the other barons." : "Waiting for the host to lay the map."}
                </p>
              </div>
              <div className="mb-4">
                <div className="mb-1 text-xs uppercase tracking-wider text-muted">At the table</div>
                <div className="rounded-md border border-border px-3 py-2 text-sm text-fg">{net.names[net.selfId] || name} · you</div>
                {net.peers.map((p) => (
                  <div key={p.id} className="mt-1 flex justify-between rounded-md border border-border px-3 py-2 text-sm">
                    <span className="text-fg">{p.name || "Baron"}</span>
                    <span className={cn("text-xs", p.state === "connected" ? "text-profit" : "text-muted")}>
                      {p.state === "connected" ? (p.rttMs != null ? `${p.rttMs}ms` : "live") : p.state === "failed" ? "can't reach" : p.state}
                    </span>
                  </div>
                ))}
              </div>
              {net.role === "host" ? (
                <>
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    {(["small", "medium", "large"] as MapSize[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={cn("h-9 rounded-sm text-xs", size === s ? "bg-primary text-primary-fg" : "bg-elevated text-muted")}
                        onClick={() => setSize(s)}
                      >
                        {SIZE_META[s].label}
                      </button>
                    ))}
                  </div>
                  <div className="mb-4 flex flex-wrap gap-1">
                    {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        className={cn("h-9 rounded-sm px-3 text-xs", diff === d ? "bg-primary text-primary-fg" : "bg-elevated text-muted")}
                        onClick={() => setDiff(d)}
                      >
                        {DIFFICULTY_META[d].label}
                      </button>
                    ))}
                  </div>
                  <div className="mb-4 flex flex-wrap gap-1">
                    {(["columbia", "frontier", "albion", "outback"] as Region[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={cn("h-9 rounded-sm px-3 text-xs capitalize", region === r ? "bg-primary text-primary-fg" : "bg-elevated text-muted")}
                        onClick={() => setRegion(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="mb-4 flex flex-wrap gap-1">
                    {[0, 1, 2].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={cn("h-9 rounded-sm px-3 text-xs", rivals === n ? "bg-primary text-primary-fg" : "bg-elevated text-muted")}
                        onClick={() => setRivals(n)}
                      >
                        {n === 0 ? "No AI" : `${n} AI`}
                      </button>
                    ))}
                  </div>
                  <Button className="w-full" size="lg" onClick={start}>
                    Lay the map
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted">Keep this open. The charter starts on their word.</p>
              )}
              <Button className="mt-3 w-full" variant="ghost" onClick={leave}>
                Leave the table
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
