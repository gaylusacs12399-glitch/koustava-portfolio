import type * as React from "react";
import { useEffect, useRef, useState } from "react";

/**
 * Dot + lerped ring. Elements opt in with data-cursor="View" (pill label),
 * data-cursor="arrow" (sideways section) or data-cursor="zoom".
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.body.classList.add("has-cursor");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, raf = 0;
    const move = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY;
      document.documentElement.style.setProperty("--mx", `${mx}px`);
      document.documentElement.style.setProperty("--my", `${my}px`);
      const el = (e.target as HTMLElement)?.closest?.("[data-cursor], a, button") as HTMLElement | null;
      setLabel(el ? el.dataset["cursor"] ?? "" : null);
    };
    const loop = () => {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      if (dot.current) dot.current.style.transform = `translate(${mx}px, ${my}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { removeEventListener("pointermove", move); cancelAnimationFrame(raf); document.body.classList.remove("has-cursor"); };
  }, []);

  if (!enabled) return null;
  const text = label && label !== "arrow" && label !== "zoom" ? label : "";
  const size = label === null ? 36 : text ? 0 : label === "zoom" ? 80 : label === "arrow" ? 64 : 56;

  return (
    <>
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[200] mix-blend-difference" aria-hidden>
        <div className="-ml-1 -mt-1 h-2 w-2 rounded-full bg-primary transition-opacity" style={{ opacity: text ? 0 : 1 }} />
      </div>
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[199]" aria-hidden>
        <div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-foreground/40 text-sm font-semibold transition-all duration-500 ease-spring"
          style={{
            width: text ? text.length * 9 + 36 : size,
            height: text ? 40 : size,
            background: text ? "hsl(var(--primary))" : label === "zoom" ? "hsl(var(--foreground) / 0.08)" : "transparent",
            color: "hsl(var(--primary-foreground))",
            backdropFilter: label === "zoom" ? "blur(2px) brightness(1.2)" : undefined,
          }}
        >
          {text}
          {label === "arrow" && <span className="text-foreground">⇆</span>}
        </div>
      </div>
    </>
  );
}

/** Cursor-reactive particle field + spotlight. Canvas, rAF, pauses when hidden. */
export function Backdrop() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0;
    const mouse = { x: -999, y: -999 };
    type P = { x: number; y: number; ox: number; oy: number; vx: number; vy: number };
    let pts: P[] = [];
    const resize = () => {
      w = c.width = innerWidth * devicePixelRatio; h = c.height = innerHeight * devicePixelRatio;
      const gap = 46 * devicePixelRatio;
      pts = [];
      for (let x = gap / 2; x < w; x += gap) for (let y = gap / 2; y < h; y += gap) pts.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 });
    };
    const color = () => getComputedStyle(document.documentElement).getPropertyValue("--foreground");
    let fg = color();
    const mo = new MutationObserver(() => (fg = color()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const move = (e: PointerEvent) => { mouse.x = e.clientX * devicePixelRatio; mouse.y = e.clientY * devicePixelRatio; };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = `hsl(${fg.trim()})`;
      const R = 140 * devicePixelRatio;
      for (const p of pts) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < R) { const f = (1 - d / R) * 2.2; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
        p.vx += (p.ox - p.x) * 0.04; p.vy += (p.oy - p.y) * 0.04;
        p.vx *= 0.85; p.vy *= 0.85; p.x += p.vx; p.y += p.vy;
        const disp = Math.min(1, Math.hypot(p.x - p.ox, p.y - p.oy) / 30);
        ctx.globalAlpha = 0.08 + disp * 0.5;
        ctx.beginPath(); ctx.arc(p.x, p.y, (1 + disp * 1.5) * devicePixelRatio, 0, 7); ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    resize(); draw();
    addEventListener("resize", resize); addEventListener("pointermove", move, { passive: true });
    return () => { cancelAnimationFrame(raf); mo.disconnect(); removeEventListener("resize", resize); removeEventListener("pointermove", move); };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <canvas ref={canvas} className="h-full w-full" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(600px circle at var(--mx, 50%) var(--my, 30%), color-mix(in oklab, var(--accent-b) 14%, transparent), transparent 60%)" }} />
    </div>
  );
}

/** Wrap a child to make it pull toward the pointer. */
export function Magnetic({ children, strength = 0.35 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <span
      ref={ref}
      className="inline-block transition-transform duration-500 ease-spring"
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px, ${(e.clientY - r.top - r.height / 2) * strength}px)`;
      }}
      onPointerLeave={() => (ref.current!.style.transform = "")}
    >
      {children}
    </span>
  );
}
