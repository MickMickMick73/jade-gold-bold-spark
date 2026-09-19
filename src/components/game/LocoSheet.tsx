import { Button } from "@/components/ui/button";
import { cn, formatCash, formatCashFull } from "@/lib/utils";
import { useGameStore } from "@/game/store";
import { getEngine } from "@/game/engine";
import { locoById, locoPortrait } from "@/game/locomotives";
import { locoIntroCinematic } from "@/game/cinematics";
import { CARGO_LABEL } from "@/game/types";
import { X } from "lucide-react";

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md bg-elevated px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted">{k}</div>
      <div className="font-display text-base text-fg tabular">{v}</div>
    </div>
  );
}

export function LocoSheet() {
  const focus = useGameStore((s) => s.locoFocus);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const setDraft = useGameStore((s) => s.setDraft);
  const setCinematic = useGameStore((s) => s.setCinematic);
  const engine = getEngine();
  if (!focus) return null;
  const loco = locoById(focus.locoId);
  const train = focus.trainId != null ? engine?.state?.trains.find((t) => t.id === focus.trainId) : undefined;

  const close = () => engine?.closeLocoSheet();

  const watch = () => {
    setCinematic(locoIntroCinematic(loco.id));
    setOverlay("cinematic");
  };

  const buy = () => {
    setDraft({ locoId: loco.id, cars: ["pax", "mail"], route: [] });
    useGameStore.getState().setLocoFocus(null);
    setOverlay("trainbuy");
  };

  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0 bg-bg/80" aria-label="Close" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-panel"
      >
        <div className="relative">
          <img src={locoPortrait(loco.id)} alt={loco.name} className="h-48 w-full object-cover sm:h-64" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface to-transparent p-4 pt-12">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
              {loco.kind === "diesel" ? "Diesel" : "Steam"} · {loco.year}
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{loco.name}</h2>
          </div>
          <button
            type="button"
            className="absolute right-2 top-2 size-11 rounded-md bg-bg/70 text-muted hover:text-fg"
            onClick={close}
            aria-label="Close"
          >
            <X className="mx-auto size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-4 text-sm leading-relaxed text-muted">{loco.blurb}</p>
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat k="Top speed" v={`${loco.speed} mph`} />
            <Stat k="Power" v={`${loco.power} / 8`} />
            <Stat k="Reliability" v={`${Math.round(loco.reliability * 100)}%`} />
            <Stat k="Capacity" v={`${loco.capacity} cars`} />
            <Stat k="Price" v={formatCash(loco.cost)} />
            <Stat k="Yearly upkeep" v={formatCash(loco.maint)} />
          </div>
          {train ? (
            <div className="mb-4 rounded-md border border-border bg-elevated px-3 py-3">
              <div className="text-[10px] uppercase tracking-wider text-muted">On the line</div>
              <div className="mt-1 font-display text-lg text-fg">{train.name}</div>
              <div className="mt-1 text-xs text-muted">
                {train.status} · profit {formatCashFull(train.profit)} · {train.age} yr
              </div>
              <div className="mt-2 text-xs text-muted">
                {train.cars.map((c) => `${CARGO_LABEL[c.cargo]} ${c.amount}`).join(" · ") || "Empty consist"}
              </div>
            </div>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" variant="secondary" onClick={watch}>
              Watch on the road
            </Button>
            {focus.fromIntro || !train ? (
              <Button className="flex-1" onClick={buy}>
                Buy this class
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LocoThumb({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  return (
    <img
      src={locoPortrait(id)}
      alt=""
      className={cn("object-cover", className)}
    />
  );
}
