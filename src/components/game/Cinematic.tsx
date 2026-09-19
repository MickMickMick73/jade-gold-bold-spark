import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/game/store";
import { getEngine } from "@/game/engine";
import { unlockAudio } from "@/game/audio";

export function CinematicOverlay() {
  const cin = useGameStore((s) => s.cinematic);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const setCinematic = useGameStore((s) => s.setCinematic);
  const videoRef = useRef<HTMLVideoElement>(null);

  const finish = () => {
    if (!cin) return;
    const next = cin.onDone;
    setCinematic(null);
    if (next === "play") {
      const eng = getEngine();
      if (eng?.state) eng.state.speed = 1;
      setOverlay(null);
    } else if (next === "end") {
      setOverlay("end");
    } else if (next === "locodetail") {
      setOverlay("locodetail");
    } else {
      setOverlay(null);
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !cin) return;
    unlockAudio();
    v.currentTime = 0;
    const trySound = cin.onDone !== "menu";
    v.muted = !trySound;
    const play = v.play();
    if (play && trySound)
      play.catch(() => {
        v.muted = true;
        void v.play();
      });
  }, [cin?.src]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape" || e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!cin) return null;

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 bg-bg">
      <video
        ref={videoRef}
        key={cin.src}
        src={cin.src}
        poster={cin.poster}
        playsInline
        preload="auto"
        onEnded={finish}
        className="h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-bg/40" />
      <div className="absolute inset-x-0 bottom-0 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-8">
        <p className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-4xl">{cin.title}</p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">{cin.body}</p>
        <Button className="mt-4 min-h-11" onClick={finish}>
          {cin.onDone === "play"
            ? "Lay the iron"
            : cin.onDone === "end"
              ? "Continue"
              : cin.onDone === "locodetail"
                ? "See the engine"
                : "Skip"}
        </Button>
      </div>
    </div>
  );
}
