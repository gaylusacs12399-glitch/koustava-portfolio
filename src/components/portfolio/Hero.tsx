import { useEffect, useRef, useState } from "react";
import { profile } from "./data";

const LINES = ["Fast.", "Intelligent.", "Built end to end."];

/**
 * Apple keynote-style intro: a sticky 300vh stage. A living aurora orb (conic light, follows the
 * cursor softly) sits behind the title; scrolling scrubs the orb's scale and reveals one word at a time.
 */
export function Hero() {
  const stage = useRef<HTMLElement>(null);
  const orb = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const move = (e: PointerEvent) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; };
    const loop = () => {
      const el = stage.current;
      if (el) {
        const r = el.getBoundingClientRect();
        setP(Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))));
      }
      cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05;
      orb.current?.style.setProperty("--ox", `${cx * 60}px`);
      orb.current?.style.setProperty("--oy", `${cy * 60}px`);
      raf = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);

  const intro = Math.min(1, p / 0.18);
  const scale = 0.7 + p * 1.6;

  return (
    <section ref={stage} id="top" className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* Aurora orb */}
        <div
          ref={orb}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[min(70vw,560px)] w-[min(70vw,560px)]"
          style={{ transform: `translate(calc(-50% + var(--ox,0px)), calc(-50% + var(--oy,0px))) scale(${scale})`, opacity: 1 - p * 0.55 }}
        >
          <div className="aurora absolute inset-0 rounded-full blur-3xl" />
          <div className="aurora absolute inset-[18%] rounded-full opacity-80 blur-2xl [animation-direction:reverse]" />
          <div className="absolute inset-[30%] rounded-full bg-background/40 blur-2xl" />
        </div>

        {/* Title */}
        <div className="relative transition-opacity duration-300" style={{ opacity: 1 - intro, transform: `translateY(${-intro * 40}px) scale(${1 - intro * 0.06})` }}>
          <h1 className="text-6xl font-semibold tracking-[-0.045em] md:text-8xl lg:text-[124px] lg:leading-none">
            {profile.first}.
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-foreground/85 md:text-xl">
            Tell me the idea. I'll make it real.
          </p>
        </div>

        {/* Scroll-scrubbed words */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {LINES.map((w, i) => {
            const start = 0.22 + i * 0.25;
            const local = (p - start) / 0.25;
            const o = local < 0 ? 0 : local < 0.3 ? local / 0.3 : local < 0.75 ? 1 : i === LINES.length - 1 ? 1 : Math.max(0, 1 - (local - 0.75) / 0.25);
            return (
              <h2
                key={w}
                className="absolute text-5xl font-semibold tracking-[-0.04em] md:text-8xl"
                style={{
                  opacity: o,
                  transform: `translateY(${(1 - Math.min(1, Math.max(0, local / 0.3))) * 40}px)`,
                  filter: `blur(${(1 - o) * 10}px)`,
                }}
              >
                {w}
              </h2>
            );
          })}
        </div>

        <div className="eyebrow absolute bottom-10 transition-opacity" style={{ opacity: 1 - intro }}>
          Scroll
        </div>
      </div>
    </section>
  );
}
