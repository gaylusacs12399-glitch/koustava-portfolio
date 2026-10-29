import { useEffect, useRef, useState } from "react";
import { profile } from "./data";
import { tracks, LoFiEngine } from "./music";

type Mode = "music" | "timer" | "contact";

/** Dynamic Island nav widget. Collapsed pill → expands with contextual widgets. */
export function Island({ onLogo }: { onLogo: () => void }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("music");
  const [playing, setPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [secs, setSecs] = useState(0);
  const [running, setRunning] = useState(false);
  const eng = useRef<LoFiEngine | null>(null);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => () => eng.current?.dispose(), []);

  const togglePlay = () => {
    if (playing) {
      eng.current?.stop();
      setPlaying(false);
      return;
    }
    const track = tracks[trackIdx]!;
    if (eng.current?.name !== track.name) {
      eng.current?.dispose();
      eng.current = new LoFiEngine(track);
    }
    eng.current.start();
    setPlaying(true);
  };

  const switchTrack = (dir: number) => {
    const i = (trackIdx + dir + tracks.length) % tracks.length;
    setTrackIdx(i);
    if (playing) {
      eng.current?.dispose();
      eng.current = new LoFiEngine(tracks[i]!);
      eng.current.start();
    }
  };

  return (
    <div className="fixed left-1/2 top-4 z-[90] -translate-x-1/2" onPointerEnter={(e) => { if (e.pointerType === "mouse") setOpen(true); }} onPointerLeave={(e) => { if (e.pointerType === "mouse") setOpen(false); }}>
      <div
        className="island-motion overflow-hidden rounded-[28px]"
        style={{ transition: "width 1000ms cubic-bezier(0.45,0,0.2,1), height 1000ms cubic-bezier(0.45,0,0.2,1)", width: open ? "min(380px, 92vw)" : 210, height: open ? 176 : 40, boxShadow: "var(--shadow-soft)", background: "oklch(0.08 0 0)", color: "oklch(0.97 0 0)" }}
      >
        {!open ? (
          <div className="island-motion flex h-10 items-center justify-between px-4 text-sm animate-in fade-in duration-500">
            <button onClick={onLogo} aria-label="Logo" className="font-semibold tracking-tight">KR</button>
            <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-xs opacity-80" aria-expanded={false} aria-label="Open dynamic island">
              {playing ? <Bars /> : <span className="h-2 w-2 rounded-full bg-foreground/70" />} {running ? fmt(secs) : "Open"}
            </button>
          </div>
        ) : (
          <div className="island-motion flex h-full min-w-[300px] flex-col p-4 animate-in fade-in duration-500 delay-150 fill-mode-both">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex gap-1">
                {(["music", "timer", "contact"] as Mode[]).map((m) => (
                  <button key={m} onClick={() => setMode(m)} className={`rounded-full px-3 py-1 text-xs capitalize transition ${mode === m ? "bg-[oklch(1_0_0/0.15)]" : "opacity-60"}`}>{m}</button>
                ))}
              </div>
              <button onClick={() => setOpen(false)} aria-label="Collapse" className="text-lg opacity-70">×</button>
            </div>
            <div key={mode} className="island-motion flex flex-1 items-center animate-in fade-in zoom-in-95 duration-500">
              {mode === "music" && (
                <div className="flex w-full items-center gap-3">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary/80 text-2xl ${playing ? "animate-wobble" : ""}`}>♪</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{tracks[trackIdx]!.name}</p>
                    <p className="text-xs opacity-60">Koustava's coding mix · {trackIdx + 1} of {tracks.length}</p>
                  </div>
                  <button onClick={() => switchTrack(-1)} aria-label="Previous track" className="flex h-9 w-9 items-center justify-center rounded-full bg-[oklch(1_0_0/0.12)] text-sm">‹</button>
                  <button onClick={() => switchTrack(1)} aria-label="Next track" className="flex h-9 w-9 items-center justify-center rounded-full bg-[oklch(1_0_0/0.12)] text-sm">›</button>
                  <button onClick={togglePlay} className="flex h-11 w-11 items-center justify-center rounded-full bg-[oklch(1_0_0/0.15)]" aria-label={playing ? "Pause" : "Play"}>{playing ? <Bars /> : "▶"}</button>
                </div>
              )}
              {mode === "timer" && (
                <div className="flex w-full items-center justify-between">
                  <p className="text-5xl font-semibold tabular-nums tracking-tight">{fmt(secs)}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setRunning(!running)} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{running ? "Pause" : "Start"}</button>
                    <button onClick={() => { setRunning(false); setSecs(0); }} className="rounded-full bg-[oklch(1_0_0/0.15)] px-4 py-2 text-sm">Reset</button>
                  </div>
                </div>
              )}
              {mode === "contact" && (
                <div className="w-full"><p className="text-xs opacity-60">Say hi</p><a href={`mailto:${profile.email}`} className="text-xl font-semibold">{profile.email}</a><p className="mt-1 text-xs opacity-60">{profile.location}</p></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
function Bars() {
  return <span className="flex h-3 items-end gap-[2px]" aria-hidden>{[0, 1, 2, 3].map((i) => <span key={i} className="w-[3px] rounded bg-foreground/70" style={{ height: "100%", animation: `cue ${0.6 + i * 0.15}s ease-in-out infinite alternate` }} />)}</span>;
}
