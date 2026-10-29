import type * as React from "react";
import { useEffect, useRef, useState } from "react";

const WORDS = ["hello", "namaste", "hola", "bonjour", "konnichiwa"];

/** Black intro: cursive greetings cycle, then an iPhone-style "slide to enter". */
export function Welcome({ onEnter }: { onEnter: () => void }) {
  const [idx, setIdx] = useState(0);
  const [showSlider, setShowSlider] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (idx >= WORDS.length - 1) {
      const t = setTimeout(() => setShowSlider(true), 1400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setIdx((i) => i + 1), 1500);
    return () => clearTimeout(t);
  }, [idx]);

  const enter = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onEnter, 900);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-all duration-[900ms] ease-spring"
      style={{ opacity: leaving ? 0 : 1, transform: leaving ? "scale(1.6)" : "scale(1)", filter: leaving ? "blur(12px)" : "none" }}
      role="dialog"
      aria-label="Welcome"
    >
      <div className="relative h-40 w-full text-center" aria-live="polite">
        {WORDS.map((w, i) => (
          <span
            key={w}
            className="absolute inset-0 flex items-center justify-center font-script text-7xl md:text-9xl transition-all duration-700 ease-spring"
            style={{
              opacity: i === idx ? 1 : 0,
              transform: i === idx ? "translateY(0)" : i < idx ? "translateY(-30px)" : "translateY(30px)",
              filter: i === idx ? "none" : "blur(8px)",
              clipPath: i === idx ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
              transitionProperty: "opacity, transform, filter, clip-path",
              transitionDuration: i === idx ? "1200ms" : "500ms",
            }}
          >
            {w}
          </span>
        ))}
      </div>

      <div className="mt-16 h-16 transition-all duration-700 ease-spring" style={{ opacity: showSlider ? 1 : 0, transform: showSlider ? "none" : "translateY(20px)" }}>
        {showSlider && <SlideToEnter onDone={enter} />}
      </div>

      <button onClick={enter} className="absolute bottom-8 right-8 eyebrow rounded-full px-4 py-2 transition hover:text-foreground">
        Skip →
      </button>
    </div>
  );
}

function SlideToEnter({ onDone }: { onDone: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [drag, setDrag] = useState(false);
  const start = useRef(0);
  const KNOB = 56;

  const max = () => (track.current ? track.current.offsetWidth - KNOB - 8 : 220);

  const onDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDrag(true);
    start.current = e.clientX - x;
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag) return;
    setX(Math.max(0, Math.min(max(), e.clientX - start.current)));
  };
  const onUp = () => {
    setDrag(false);
    if (x > max() * 0.85) {
      setX(max());
      navigator.vibrate?.(15);
      onDone();
    } else setX(0);
  };

  const p = x / max();
  return (
    <div ref={track} className="glass relative h-16 w-72 rounded-full p-1">
      <span className="shimmer-text pointer-events-none absolute inset-0 flex items-center justify-center pl-10 text-lg font-medium" style={{ opacity: 1 - p * 1.5 }}>
        slide to enter
      </span>
      <button
        aria-label="Slide to enter (press Enter)"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onKeyDown={(e) => e.key === "Enter" && onDone()}
        className="relative flex h-14 w-14 touch-none items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground"
        style={{ transform: `translateX(${x}px)`, transition: drag ? "none" : "transform 600ms var(--ease-spring)" }}
      >
        →
      </button>
    </div>
  );
}
