import { useState } from "react";
import { profile } from "./data";
import { Magnetic } from "./Cursor";

export function Contact({ onReplay }: { onReplay: () => void }) {
  const [toast, setToast] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); } catch { /* ignore */ }
    setToast(true); setTimeout(() => setToast(false), 2200);
  };
  const rows = [
    { name: "Email", value: profile.email, href: `mailto:${profile.email}`, glyph: "✉" },
    { name: "Phone", value: profile.phone, href: profile.phoneHref, glyph: "☎" },
    { name: "GitHub", value: "KoustavaRamesha", href: profile.links.github, glyph: "</>" },
    { name: "LinkedIn", value: "Koustava Ramesha", href: profile.links.linkedin, glyph: "in" },
  ];
  return (
    <section id="contact" className="relative flex min-h-screen flex-col justify-center px-6 py-32">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-16 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-20">
        <div className="relative mx-auto w-full max-w-sm">
          <div aria-hidden className="aurora absolute -inset-4 rounded-[40px] opacity-40 blur-2xl" />
          <img src={profile.photo} alt={profile.name} className="relative aspect-[4/5] w-full rounded-[32px] border border-hairline object-cover object-top" style={{ boxShadow: "var(--shadow-soft)" }} />
          <div className="glass absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-[oklch(0.75_0.18_150)]" /> Open to work · {profile.location}
          </div>
        </div>

        <div className="text-center md:text-left">
          <p className="eyebrow mb-6">Contact</p>
          <h2 className="headline">Let's talk.</h2>
          <p className="mt-6 max-w-md text-lg text-muted-foreground md:mx-0 mx-auto">Have an idea, a role or a project? I usually reply within a day.</p>
          <div className="mt-8">
            <Magnetic>
              <button onClick={copy} data-cursor="Copy" className="rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-transform duration-500 ease-spring hover:scale-105">
                Copy email
              </button>
            </Magnetic>
          </div>
          <div className="mt-10 grid gap-3 text-left sm:grid-cols-2">
            {rows.map((r) => (
              <a key={r.name} href={r.href} target={r.name === "GitHub" || r.name === "LinkedIn" ? "_blank" : undefined} rel="noreferrer" className="glass group flex items-center gap-4 rounded-2xl p-4 transition-transform duration-500 ease-spring hover:-translate-y-1">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-bold group-hover:animate-wobble">{r.glyph}</span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">{r.name}</span>
                  <span className="block truncate text-sm font-semibold">{r.value}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-28 flex flex-col items-center text-center">
        <button onClick={onReplay} className="font-script text-3xl text-muted-foreground transition hover:text-foreground">say hello again ↺</button>
        <p className="mt-8 text-xs text-muted-foreground">© {new Date().getFullYear()} {profile.name} · {profile.location}</p>
      </div>

      <div role="status" aria-live="polite" className="glass fixed bottom-8 left-1/2 z-[120] -translate-x-1/2 rounded-full px-5 py-3 text-sm transition-all duration-500 ease-spring" style={{ opacity: toast ? 1 : 0, transform: `translate(-50%, ${toast ? 0 : 20}px)` }}>
        ✓ Email copied to clipboard
      </div>
    </section>
  );
}

/** Tiny dependency-free confetti burst. */
export function confetti() {
  const c = document.createElement("canvas");
  c.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:300";
  c.width = innerWidth; c.height = innerHeight; document.body.appendChild(c);
  const ctx = c.getContext("2d")!;
  const colors = ["#3b82f6", "#a855f7", "#ec4899", "#f59e0b", "#10b981"];
  const ps = Array.from({ length: 180 }, () => ({ x: innerWidth / 2, y: innerHeight / 2, vx: (Math.random() - 0.5) * 22, vy: Math.random() * -22 - 4, r: Math.random() * 6 + 3, c: colors[(Math.random() * 5) | 0]!, a: Math.random() * 6 }));
  let f = 0;
  const loop = () => {
    ctx.clearRect(0, 0, c.width, c.height);
    for (const p of ps) { p.vy += 0.5; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += 0.2; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6); ctx.restore(); }
    if (++f < 160) requestAnimationFrame(loop); else c.remove();
  };
  loop();
}
