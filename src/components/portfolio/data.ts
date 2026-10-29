export const profile = {
  name: "Koustava Ramesha",
  first: "Koustava",
  last: "Ramesha",
  role: "AI Orchestrator",
  location: "Bangalore, India",
  email: "koustava.r@gmail.com",
  phone: "+91 80502 69703",
  phoneHref: "tel:+918050269703",
  photo: "https://images.fillout.com/orgid-909456/flowpublicid-qs5xz8c19b/widgetid-default/j8iy4iqgzzNWUL3zgTknqJ/pasted-image-1793309274383-chalutz4.png",
  bio: "I orchestrate AI to ship real software — directing LLMs, agents and automation across entire codebases, from architecture to production. I work at the macro level: the job gets done, end to end, not line by line.",
  links: {
    github: "https://github.com/KoustavaRamesha",
    linkedin: "https://www.linkedin.com/in/koustava-ramesha-b86214280/",
  },
};

export const skillGroups = [
  { name: "Orchestration", items: ["LLM Pipelines", "Agents", "Gemini", "Prompt Design", "Automation"] },
  { name: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
  { name: "Backend", items: ["Node.js", "Express", "REST", "WebRTC", "JWT / OAuth"] },
  { name: "Vision & Data", items: ["YOLO", "ByteTrack", "OpenCV", "OCR", "MongoDB", "Supabase"] },
  { name: "Production", items: ["Docker", "Vercel", "CI / CD", "System Design"] },
];

export const timeline = [
  { year: "Start", title: "Fell for the web", text: "Python, JavaScript and a lot of curiosity about how things talk to each other." },
  { year: "Dec 2024", title: "Aether begins", text: "Started building a decentralized, end-to-end encrypted P2P chat on WebRTC." },
  { year: "2025", title: "Industrial Safety AI", text: "Multi-camera YOLO + ByteTrack surveillance desktop app with automated alerts." },
  { year: "2025", title: "Top 10 · Hack-to-Hire", text: "National hackathon (TRIKAYA × BeetleX) — top 10 among 4,000+ teams." },
  { year: "Now", title: "Orchestrating with AI", text: "Freelance — shipping STR Mix Digital on Next.js 15 + React 19, directing Gemini to do the heavy lifting." },
];

export type Project = {
  id: string;
  name: string;
  tagline: string;
  tech: string[];
  hue: string; // css gradient
  stats: { k: string; v: string }[];
  points: string[];
};

export const projects: Project[] = [
  {
    id: "strmix",
    name: "STR Mix Digital",
    tagline: "A production admin platform, powered by Gemini.",
    tech: ["Next.js 15", "React 19", "TypeScript", "Firebase", "Supabase", "Genkit"],
    hue: "linear-gradient(135deg, oklch(0.55 0.2 250), oklch(0.5 0.22 290))",
    stats: [{ k: "monthly visits", v: "1,000+" }, { k: "less admin work", v: "65%" }, { k: "Lighthouse", v: "95+" }],
    points: [
      "Secure admin portal for blog, portfolio and review moderation — response times cut by 40%.",
      "Real-time sync across Firebase Auth, Firestore and Supabase with 99.9% uptime.",
      "Gemini-powered content generation and review summarization.",
      "App Router + SSR tuning boosted page loads by 35%.",
    ],
  },
  {
    id: "safety",
    name: "Safety AI Surveillance",
    tagline: "Every camera, watching for hazards. Live.",
    tech: ["Python", "PySide6", "YOLO", "ByteTrack", "OpenCV", "SQLite"],
    hue: "linear-gradient(135deg, oklch(0.6 0.2 35), oklch(0.5 0.22 10))",
    stats: [{ k: "detections", v: "Helmet · Fire · Smoke" }, { k: "model loads", v: "1×" }, { k: "alerts", v: "SMS" }],
    points: [
      "Multi-camera (USB/IP) desktop app running live YOLO detection.",
      "Shared InferenceManager thread with per-camera workers and exponential-backoff reconnects.",
      "Custom DetectionStabilizer: EMA smoothing, confidence hysteresis, box clamping.",
      "AlertManager with evidence screenshots, dedup cooldowns and severity grading.",
    ],
  },
  {
    id: "aether",
    name: "Aether",
    tagline: "Private chat, peer to peer. Nothing in between.",
    tech: ["React", "TypeScript", "Node.js", "WebRTC", "AES-256"],
    hue: "linear-gradient(135deg, oklch(0.6 0.15 180), oklch(0.5 0.18 230))",
    stats: [{ k: "handshake", v: "<1s" }, { k: "latency", v: "<50ms" }, { k: "channels", v: "100+" }],
    points: [
      "End-to-end encrypted P2P messaging with zero data leakage.",
      "Node.js signaling server handling 100+ concurrent channels.",
      "AES-256 encryption with wallet signature verification.",
      "Optimized ICE/STUN/TURN — init cut from 2.3s to under 1s.",
    ],
  },
];
