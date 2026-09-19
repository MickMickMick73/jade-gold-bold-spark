import { useEffect, useRef } from "react";
import { Engine } from "@/game/engine";
import { OverlayRouter } from "@/components/game/overlays";
import { useGameStore } from "@/game/store";
import { applySettings } from "@/game/audio";

export function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const screen = useGameStore((s) => s.screen);
  const settings = useGameStore((s) => s.settings);

  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new Engine(canvas);
    engineRef.current = engine;
    engine.attachMinimap(miniRef.current);
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.attachMinimap(miniRef.current);
  }, [screen]);

  return (
    <div className="game-shell">
      <canvas ref={canvasRef} className="game-map h-full w-full" aria-label="Railroad map" />
      {screen === "playing" ? (
        <canvas
          ref={miniRef}
          width={168}
          height={168}
          className="minimap pointer-events-none absolute right-3 top-24 z-10 hidden rounded-md border border-border bg-inset/90 sm:block"
          aria-hidden
        />
      ) : null}
      <OverlayRouter />
    </div>
  );
}
