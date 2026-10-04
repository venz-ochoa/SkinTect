import { useEffect, useRef } from "react";

//fills the empty margins on every page: drifting blobs and leaves that follow the pointer,
//mount once in App.jsx
const ITEMS = Array.from({ length: 10 }, (_, i) => ({
  x: (i * 37 + 5) % 96, y: (i * 53 + 9) % 92, s: 14 + ((i * 11) % 38),
  z: 10 + (i % 5) * 9, t: 7 + (i % 6) * 2, kind: i % 3,
}));
const LOOK = ["rounded-tl-full rounded-br-full bg-accent/40", "rounded-full bg-primary/20", "rounded-full border-2 border-primary/30"];

export default function Ambient() {
  const root = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current;
    const move = (e) => {
      el.style.setProperty("--mx", (e.clientX / innerWidth) * 2 - 1);
      el.style.setProperty("--my", (e.clientY / innerHeight) * 2 - 1);
    };
    addEventListener("pointermove", move);
    return () => { removeEventListener("pointermove", move); };
  }, []);

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ "--mx": 0, "--my": 0 }}>
      <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl" style={{ animation: "st-blob 14s ease-in-out infinite" }} />
      <div className="absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl" style={{ animation: "st-blob 18s ease-in-out -6s infinite" }} />
      {ITEMS.map((b, i) => (
        <div key={i} className="absolute transition-transform duration-300 ease-out" style={{ left: `${b.x}%`, top: `${b.y}%`, transform: `translate3d(calc(var(--mx) * ${b.z}px), calc(var(--my) * ${b.z}px), 0)` }}>
          <span className={`block ${LOOK[b.kind]}`} style={{ width: b.s, height: b.s, animation: `st-blob ${b.t}s ease-in-out ${-i}s infinite` }} />
        </div>
      ))}
    </div>
  );
}