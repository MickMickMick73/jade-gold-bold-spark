import { Button } from "@/components/ui/button";
import { cn, formatCash } from "@/lib/utils";
import { useGameStore } from "@/game/store";
import { getEngine } from "@/game/engine";
import { INCIDENT_META, playerYard } from "@/game/yard";
import { X, Wrench } from "lucide-react";
import { useState } from "react";

export function CrisisPanel() {
  const setOverlay = useGameStore((s) => s.setOverlay);
  const hud = useGameStore((s) => s.hud);
  const engine = getEngine();
  const state = engine?.state;
  const [note, setNote] = useState<string | null>(null);
  if (!state || !engine) return null;
  const list = state.incidents.filter((i) => i.companyId === state.playerId);
  const yard = playerYard(state);
  const close = () => setOverlay(null);

  const act = (id: number, kind: "wrecker" | "reroute" | "wait") => {
    if (kind === "wrecker") {
      engine.netAct({ op: "dispatch", incidentId: id });
      setNote("Wrecker ordered.");
    } else if (kind === "reroute") {
      engine.netAct({ op: "reroute", incidentId: id });
      setNote("Looking for a way around.");
    } else {
      setNote("Time keeps bleeding until she clears — or a wrecker arrives.");
    }
  };

  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0 bg-bg/50" aria-label="Close" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-panel"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-fg">On the line</h2>
            <p className="text-xs text-muted">{yard ? `${hud?.yardCrews} at the roundhouse` : "Build a station — that is your yard."}</p>
          </div>
          <button type="button" className="size-11 text-muted hover:text-fg" onClick={close} aria-label="Close">
            <X className="mx-auto size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {list.length === 0 ? (
            <p className="text-sm text-muted">All iron is clear. Wear still accumulates — shop trains at the yard.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {list.map((inc) => {
                const meta = INCIDENT_META[inc.kind];
                const train = inc.trainId ? state.trains.find((t) => t.id === inc.trainId) : null;
                return (
                  <div key={inc.id} className="rounded-md border border-border bg-elevated p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="font-display text-lg text-fg">{meta.label}</div>
                      <div className="text-xs tabular text-loss">−{formatCash(inc.bleedPerDay)}/day</div>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{meta.blurb}</p>
                    <p className="mt-1 text-xs text-muted">
                      {train ? train.name : "Track"} · {inc.status === "open" ? "waiting on you" : inc.status === "enroute" ? "wrecker rolling" : "crews on site"} · {Math.max(0, Math.round(inc.waitLeft))}d if you wait
                    </p>
                    {inc.status === "open" ? (
                      <div className="mt-3 flex flex-col gap-1.5 sm:flex-row">
                        <Button className="flex-1" onClick={() => act(inc.id, "wrecker")}>
                          <Wrench className="size-4" /> Dispatch wrecker {formatCash(meta.dispatch)}
                        </Button>
                        <Button className="flex-1" variant="secondary" onClick={() => act(inc.id, "reroute")}>
                          Reroute traffic
                        </Button>
                        <Button className="flex-1" variant="ghost" onClick={() => act(inc.id, "wait")}>
                          Wait it out
                        </Button>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-muted">
                        {inc.status === "working"
                          ? `${Math.max(0, Math.round(inc.workLeft))} days of work left.`
                          : "The wrecker is on the way. Other trains still stack unless you reroute."}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {note ? <p className={cn("mt-3 text-sm", note.startsWith("No") || note.startsWith("Need") || note.startsWith("Every") || note.startsWith("The wrecker is already") || note.startsWith("Already") ? "text-loss" : "text-fg")}>{note}</p> : null}
        </div>
      </div>
    </div>
  );
}
