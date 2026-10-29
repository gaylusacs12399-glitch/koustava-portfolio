import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { profile, skillGroups, timeline, projects } from "./data";

const CHAPTERS = ["About", "Toolkit", "Journey", "Work"];

/**
 * Horizontal "chapter gallery". Section is CHAPTERS.length * 100vh tall; a sticky
 * inner track slides sideways with scroll progress. Panels brighten and settle as
 * they reach center; a left rail shows the chapter index. Falls back to vertical
 * stacking on narrow screens or reduced motion.
 */
export function Story() {
  const wrap = useRef<HTMLElement>(null);
  const [p, setP] = useState(0); // 0..1
  const [wide, setWide] = useState(true);

  useEffect(() => {
    const mq = matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");
    const set = () => setWide(mq.matches);
    set(); mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  useEffect(() => {
    if (!wide) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = wrap.current; if (!el) return;
        const r = el.getBoundingClientRect();
        const total = el.offsetHeight - innerHeight;
        setP(Math.max(0, Math.min(1, -r.top / total)));
      });
    };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    return () => { removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [wide]);

  const goTo = (i: number) => {
    const el = wrap.current!; const total = el.offsetHeight - innerHeight;
    scrollTo({ top: el.offsetTop + (total * i) / (CHAPTERS.length - 1), behavior: "smooth" });
  };

  // keyboard arrows jump between chapters while the stage is pinned
  useEffect(() => {
    if (!wide) return;
    const inView = () => { const r = wrap.current!.getBoundingClientRect(); return r.top <= 1 && r.bottom >= innerHeight - 1; };
    const key = (e: KeyboardEvent) => {
      if (!inView()) return;
      const cur = Math.round(p * (CHAPTERS.length - 1));
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(Math.min(CHAPTERS.length - 1, cur + 1)); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(Math.max(0, cur - 1)); }
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [wide, p]);

  const n = CHAPTERS.length;
  const active = Math.round(p * (n - 1));

  if (!wide) {
    return (
      <section id="story" className="space-y-32 px-6 py-24">
        <Chapter n={0}><About progress={1} /></Chapter>
        <Chapter n={1}><Skills visible /></Chapter>
        <Chapter n={2}><Journey progress={1} /></Chapter>
        <Chapter n={3}><WorkTeaser /></Chapter>
      </section>
    );
  }

  return (
    <section id="story" ref={wrap} style={{ height: `${n * 100}vh` }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* left rail — chapter index */}
        <div className="absolute left-10 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-7 xl:flex" aria-label="Chapters">
          {CHAPTERS.map((c, i) => (
            <button key={c} onClick={() => goTo(i)} className="group flex items-center gap-3 text-left">
              <span className={`h-px transition-all duration-700 ease-spring ${i === active ? "w-10 bg-foreground" : "w-4 bg-foreground/25 group-hover:bg-foreground/50"}`} />
              <span className={`eyebrow transition-colors duration-500 ${i === active ? "text-foreground" : "text-muted-foreground/50 group-hover:text-muted-foreground"}`}>
                0{i + 1} · {c}
              </span>
            </button>
          ))}
        </div>

        {/* track */}
        <div className="flex h-full will-change-transform" style={{ width: `${n * 100}vw`, transform: `translateX(${-p * (n - 1) * 100}vw)` }}>
          <Panel i={0} t={focus(p, 0, n)}><About progress={Math.min(1, p * (n - 1) * 1.7)} /></Panel>
          <Panel i={1} t={focus(p, 1, n)}><Skills visible={p * (n - 1) > 0.55} /></Panel>
          <Panel i={2} t={focus(p, 2, n)}><Journey progress={Math.max(0, Math.min(1, p * (n - 1) - 1))} /></Panel>
          <Panel i={3} t={focus(p, 3, n)} center><WorkTeaser /></Panel>
        </div>

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 xl:hidden" aria-label="Chapters">
          {CHAPTERS.map((c, i) => (
            <button key={c} onClick={() => goTo(i)} aria-label={c} className={`h-1.5 rounded-full transition-all duration-500 ease-spring ${i === active ? "w-8 bg-foreground" : "w-1.5 bg-foreground/30"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** 1 when chapter i is centered, easing toward 0 as the track moves past it. */
const focus = (p: number, i: number, n: number) => Math.max(0, Math.min(1, 1 - Math.abs(p * (n - 1) - i) * 1.4));

function Panel({ i, t, center, children }: { i: number; t: number; center?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex h-full w-screen shrink-0 items-center justify-center py-[7vh] pr-[7vw] ${center ? "pl-[7vw]" : "pl-[9vw] xl:pl-[20vw]"}`}>
      <div
        className="relative w-full will-change-transform"
        style={{ opacity: 0.3 + 0.7 * t, transform: `scale(${0.94 + 0.06 * t})` }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -top-[9vw] left-0 -z-10 select-none text-[26vw] font-bold leading-none tracking-tighter text-foreground/[0.04]"
        >
          0{i + 1}
        </span>
        {children}
      </div>
    </div>
  );
}

function Chapter({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span aria-hidden className="pointer-events-none absolute -top-16 left-0 -z-10 select-none text-[34vw] font-bold leading-none tracking-tighter text-foreground/[0.05] md:text-[16rem]">
        0{n + 1}
      </span>
      {children}
    </div>
  );
}

function About({ progress }: { progress: number }) {
  const words = profile.bio.split(" ");
  return (
    <div className="max-w-4xl">
      <p className="eyebrow mb-6">Chapter 01 — About me</p>
      <p className="text-3xl font-semibold leading-[1.2] tracking-tight md:text-5xl">
        {words.map((w, i) => {
          const t = Math.max(0, Math.min(1, progress * words.length * 1.1 - i));
          return <span key={i} className="transition-opacity duration-300" style={{ opacity: 0.15 + 0.85 * t }}>{w} </span>;
        })}
      </p>
      <p className="mt-8 text-lg text-muted-foreground" style={{ opacity: progress > 0.7 ? 1 : 0, transition: "opacity 700ms var(--ease-spring)" }}>
        {profile.role} · {profile.location}
      </p>
    </div>
  );
}

function Skills({ visible }: { visible: boolean }) {
  return (
    <div className="w-full max-w-5xl">
      <p className="eyebrow mb-6">Chapter 02 — Toolkit</p>
      <h2 className="title mb-12">What I orchestrate.</h2>
      <div>
        {skillGroups.map((g, i) => (
          <div
            key={g.name}
            className="grid gap-4 border-t border-hairline py-6 last:border-b md:grid-cols-[180px_1fr] md:items-baseline"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(40px)", transition: `all 800ms var(--ease-spring) ${i * 90}ms` }}
          >
            <p className="eyebrow">{g.name}</p>
            <div className="flex flex-wrap gap-2">
              {g.items.map((s) => <span key={s} className="rounded-full border border-hairline bg-secondary/60 px-3.5 py-1.5 text-sm">{s}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Journey({ progress }: { progress: number }) {
  return (
    <div className="w-full max-w-6xl">
      <p className="eyebrow mb-6">Chapter 03 — Journey</p>
      <h2 className="title mb-16">How I got here.</h2>
      <div className="relative">
        <div className="absolute left-0 top-[11px] hidden h-[2px] w-full bg-hairline md:block" aria-hidden>
          <div className="h-full origin-left bg-foreground transition-transform duration-300" style={{ transform: `scaleX(${progress})` }} />
        </div>
        <ol className="grid gap-10 md:grid-cols-5 md:gap-6">
          {timeline.map((m, i) => {
            const on = progress >= (i + 0.5) / timeline.length;
            return (
              <li key={i} className="relative transition-all duration-700 ease-spring" style={{ transform: on ? "scale(1)" : "scale(0.92)", opacity: on ? 1 : 0.35 }}>
                <span className={`mb-6 block h-6 w-6 rounded-full border-4 border-background transition-colors duration-500 ${on ? "bg-foreground" : "bg-secondary"}`} />
                <p className="eyebrow mb-2">{m.year}</p>
                <p className="mb-2 text-xl font-semibold tracking-tight">{m.title}</p>
                <p className="text-sm text-muted-foreground">{m.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function WorkTeaser() {
  return (
    <div className="max-w-4xl text-center">
      <p className="eyebrow mb-6">Chapter 04 — Work</p>
      <h2 className="headline">Things I've shipped.</h2>
      <p className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground">{projects.length} projects. Real users, real cameras, real-time messages. Keep scrolling.</p>
      <a href="#work" className="mt-10 inline-block rounded-full border border-hairline bg-secondary/60 px-8 py-3.5 text-sm font-semibold transition-transform duration-500 ease-spring hover:scale-105">
        See the work ↓
      </a>
    </div>
  );
}
