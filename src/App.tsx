import { useEffect, useRef, useState } from "react";
import { Welcome } from "./components/portfolio/Welcome";
import { Cursor, Backdrop } from "./components/portfolio/Cursor";
import { Hero } from "./components/portfolio/Hero";
import { Story } from "./components/portfolio/Story";
import { Projects } from "./components/portfolio/Projects";
import { Island } from "./components/portfolio/Island";
import { Contact, confetti } from "./components/portfolio/Contact";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export default function App() {
  const [stage, setStage] = useState<"loading" | "welcome" | "site">("loading");
  const clicks = useRef(0);

  useEffect(() => {
    document.title = "Koustava Ramesha — AI Orchestrator";
    let seen = false;
    try { seen = sessionStorage.getItem("kr-seen") === "1" || localStorage.getItem("kr-seen") === "1"; } catch { /* ignore */ }
    setStage(seen ? "site" : "welcome");
  }, []);

  const enter = () => {
    try { localStorage.setItem("kr-seen", "1"); } catch { /* ignore */ }
    setStage("site");
    scrollTo({ top: 0 });
  };

  const surprise = () => { confetti(); document.documentElement.classList.toggle("theme-surprise"); };

  useEffect(() => {
    let i = 0;
    const k = (e: KeyboardEvent) => { i = e.key === KONAMI[i] ? i + 1 : e.key === KONAMI[0] ? 1 : 0; if (i === KONAMI.length) { i = 0; surprise(); } };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);

  const onLogo = () => { clicks.current++; if (clicks.current >= 5) { clicks.current = 0; surprise(); } };

  const replay = () => {
    document.body.animate([{ transform: "scale(1)", opacity: 1 }, { transform: "scale(0.85)", opacity: 0 }], { duration: 700, easing: "cubic-bezier(0.16,1,0.3,1)" }).onfinish = () => setStage("welcome");
  };

  if (stage === "loading") return <div className="fixed inset-0 bg-background" aria-busy="true" />;

  return (
    <>
      <Cursor />
      {stage === "welcome" && <Welcome onEnter={enter} />}
      <main className="relative transition-all duration-1000 ease-spring" style={{ opacity: stage === "site" ? 1 : 0, transform: stage === "site" ? "none" : "scale(0.92)" }}>
        <Backdrop />
        <Island onLogo={onLogo} />
        <Hero />
        <Story />
        <Projects />
        <Contact onReplay={replay} />
      </main>
    </>
  );
}
