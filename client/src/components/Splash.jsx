import { useEffect, useRef, useState } from "react";

//bump the version if you want everyone to see the splash again
const KEY = "splashSeen_v1";
//must match the key in ConsentModal, the splash waits until this is set
const CONSENT_KEY = "disclaimerAccepted_v1";
//how long the fade takes when dismissed (ms)
const FADE = 1600;
//quiet pause between the disclaimer closing and the splash starting (ms)
const DELAY = 900;

const serif = { fontFamily: "Georgia, 'Times New Roman', serif" };
const TITLE = "SkinTect".split("");
const CAPTION = ["Know", "your", "skin.", "Catch", "changes", "early."];
const STEPS = [
  { label: "Snap a photo", icon: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></> },
  { label: "Get an estimate", icon: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></> },
  { label: "Track over time", icon: <><path d="M3 17l6-6 4 4 8-9" /><path d="M15 6h6v6" /></> },
];
//floating bits that fill the empty space, worked out from the index so they stay the same every render
const BITS = Array.from({ length: 18 }, (_, i) => ({
  x: ((i * 37 + 11) % 92) + 4,
  y: ((i * 53 + 7) % 88) + 6,
  s: 10 + ((i * 7) % 20),
  d: (i * 263) % 2400,
  t: 5 + (i % 5),
  z: ((i % 4) + 1) * 9,
  kind: i % 3,
}));
const SHAPES = ["rounded-tl-full rounded-br-full bg-accent/50", "rounded-full bg-primary/30", "rounded-full border-2 border-primary/30"];

//has the user already accepted the disclaimer, if storage is blocked the modal can never be remembered so don't wait on it
function consented() {
  try { return !!localStorage.getItem(CONSENT_KEY); } catch { return true; }
}

//full screen intro, reacts to the pointer, tap anywhere to dismiss, then fades into the page inside it
//usage: <Splash><SignUp /></Splash>
export default function Splash({ children }) {
  //waiting | pause | show | leaving | done, only plays once per browser session
  const [phase, setPhase] = useState(() => {
    try { if (sessionStorage.getItem(KEY)) return "done"; } catch { /* private mode, the splash just plays again */ }
    return consented() ? "show" : "waiting";
  });
  const [pops, setPops] = useState([]);
  const [boing, setBoing] = useState(0);
  const root = useRef(null);
  const uid = useRef(0);

  //while the disclaimer is open, check until it has been accepted
  useEffect(() => {
    if (phase !== "waiting") return;
    const poll = setInterval(() => {
      if (consented()) {
        clearInterval(poll);
        setPhase("pause");
      }
    }, 100);
    return () => clearInterval(poll);
  }, [phase]);

  //the pause after the disclaimer is gone
  useEffect(() => {
    if (phase !== "pause") return;
    const t = setTimeout(() => setPhase("show"), DELAY);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "leaving") return;
    try { sessionStorage.setItem(KEY, "1"); } catch { /* private mode, the splash just plays again */ }
    const t = setTimeout(() => setPhase("done"), FADE);
    return () => clearTimeout(t);
  }, [phase]);

  function dismiss() {
    if (phase === "show") setPhase("leaving");
  }

  //feeds the pointer position to css so the tilt and parallax layers follow it
  function move(e) {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", ((x / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty("--my", ((y / r.height) * 2 - 1).toFixed(3));
  }

  //every tap drops a ripple, a ring of sparks, and dismisses the splash
  function burst(e) {
    const r = root.current.getBoundingClientRect();
    const id = ++uid.current;
    setPops((p) => [...p, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setPops((p) => p.filter((q) => q.id !== id)), 1000);
    dismiss();
  }

  return (
    <>
      {/*the page only mounts once the fade starts so its own entrance animations play as the splash lifts*/}
      {phase === "waiting" || phase === "pause" || phase === "show" ? null : children}

      {(phase === "show" || phase === "leaving") && (
        <div
          ref={root}
          role="status"
          aria-label="SkinTect, loading"
          onPointerMove={move}
          onPointerDown={burst}
          className={`fixed inset-0 z-40 select-none overflow-hidden bg-bg px-6 text-text ${phase === "leaving" ? "st-sp-out pointer-events-none" : ""}`}
          style={{ "--fade": `${FADE}ms`, "--mx": 0, "--my": 0, touchAction: "manipulation" }}
        >
          {/*splash animations, every class is switched off for reduced motion*/}
          <style>{`
            @keyframes st-sp-ring { from { stroke-dashoffset: var(--len); } to { stroke-dashoffset: 0; } }
            @keyframes st-sp-pop { 0% { opacity: 0; transform: scale(.2) rotate(-30deg); } 60% { opacity: 1; transform: scale(1.18) rotate(6deg); } 80% { transform: scale(.94) rotate(-2deg); } 100% { opacity: 1; transform: none; } }
            @keyframes st-sp-drop { 0% { opacity: 0; transform: translateY(-110px) scale(.9, 1.3); } 50% { opacity: 1; transform: translateY(0) scale(1.15, .8); } 68% { transform: translateY(-20px) scale(.95, 1.06); } 84% { transform: translateY(0) scale(1.04, .96); } 100% { opacity: 1; transform: none; } }
            @keyframes st-sp-jump { 0% { transform: none; } 35% { transform: translateY(-22px) scale(1.15, .95); } 60% { transform: translateY(0) scale(1.12, .86); } 80% { transform: translateY(-6px); } 100% { transform: none; } }
            @keyframes st-sp-boing { 0% { transform: none; } 20% { transform: scale(1.25, .78); } 40% { transform: translateY(-26px) scale(.86, 1.2); } 60% { transform: scale(1.12, .9); } 80% { transform: scale(.97, 1.03); } 100% { transform: none; } }
            @keyframes st-sp-boop { 0% { transform: none; } 40% { transform: scale(2); } 70% { transform: scale(.75); } 100% { transform: none; } }
            @keyframes st-sp-beat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.35); } }
            @keyframes st-sp-spin { to { transform: rotate(360deg); } }
            @keyframes st-sp-bob { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-18px) rotate(14deg); } }
            @keyframes st-sp-drift { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(40px, -30px) scale(1.15); } }
            @keyframes st-sp-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            @keyframes st-sp-fade { from { opacity: 0; } to { opacity: 1; } }
            @keyframes st-sp-bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
            @keyframes st-sp-ripple { from { opacity: .9; transform: scale(.2); } to { opacity: 0; transform: scale(2.8); } }
            @keyframes st-sp-spark { from { opacity: 1; transform: rotate(var(--a)) translateY(0) scale(1); } to { opacity: 0; transform: rotate(var(--a)) translateY(-72px) scale(0); } }
            @keyframes st-sp-wiggle { 0%, 100% { transform: none; } 25% { transform: rotate(-18deg) scale(1.2); } 75% { transform: rotate(18deg) scale(1.2); } }
            @keyframes st-sp-out { to { opacity: 0; transform: scale(1.06); filter: blur(10px); } }

            /*layers that slide a little with the pointer, --z is how far*/
            .st-sp-par { transform: translate3d(calc(var(--mx) * var(--z) * 1px), calc(var(--my) * var(--z) * 1px), 0); transition: transform .3s ease-out; }
            .st-sp-tilt { transform: rotateY(calc(var(--mx) * 16deg)) rotateX(calc(var(--my) * -16deg)); transition: transform .3s ease-out; }

            .st-sp-ring { stroke-dasharray: var(--len); animation: st-sp-ring 1.4s cubic-bezier(.2, .7, .2, 1) backwards; animation-delay: var(--d, 0ms); }
            .st-sp-svg { transform-box: fill-box; transform-origin: center; }
            .st-sp-pop { animation: st-sp-pop .9s cubic-bezier(.2, .8, .3, 1) backwards; animation-delay: var(--d, 0ms); }
            .st-sp-drop { animation: st-sp-drop .95s ease-in backwards; animation-delay: var(--d, 0ms); }
            .st-sp-fade { animation: st-sp-fade 1s ease-out backwards; animation-delay: var(--d, 0ms); }
            .st-sp-dot { animation: st-sp-pop .9s cubic-bezier(.2, .8, .3, 1) .9s backwards, st-sp-beat 2s ease-in-out 1.8s infinite; }
            .st-sp-spin { animation: st-sp-spin 14s linear infinite; }
            .st-sp-float { animation: st-sp-float 4s ease-in-out infinite; }
            .st-sp-boing { animation: st-sp-boing .6s ease-out; }
            .st-sp-bob { animation: st-sp-bob 6s ease-in-out infinite; }
            .st-sp-drift { animation: st-sp-drift 10s ease-in-out infinite; }
            .st-sp-bar { transform-origin: left; animation: st-sp-bar 4.6s cubic-bezier(.45, 0, .2, 1) .6s backwards; }
            .st-sp-ripple { animation: st-sp-ripple .9s ease-out forwards; }
            .st-sp-spark { animation: st-sp-spark .8s ease-out forwards; }
            .st-sp-out { animation: st-sp-out var(--fade) ease-in-out forwards; }

            /*hover and press, letters jump, bits boop, chips spring*/
            .st-sp-jump:hover { animation: st-sp-jump .7s ease-out; color: var(--color-primary); }
            .st-sp-boop:hover { animation: st-sp-boop .6s cubic-bezier(.2, .9, .3, 1.4); }
            .st-sp-spring { cursor: pointer; transition: transform .35s cubic-bezier(.34, 1.8, .5, 1), background-color .2s; }
            .st-sp-spring:hover { transform: translateY(-6px) scale(1.08) rotate(-2deg); background-color: color-mix(in srgb, var(--color-accent) 30%, var(--color-surface)); }
            .st-sp-spring:active { transform: scale(.9); }
            .st-sp-spring:hover svg { animation: st-sp-wiggle .5s ease-in-out; }

            @media (prefers-reduced-motion: reduce) {
              .st-sp-ring, .st-sp-pop, .st-sp-drop, .st-sp-fade, .st-sp-dot, .st-sp-spin, .st-sp-float, .st-sp-bob, .st-sp-drift, .st-sp-bar, .st-sp-ripple, .st-sp-spark, .st-sp-jump:hover, .st-sp-boop:hover, .st-sp-spring:hover svg { animation: none; }
              .st-sp-par, .st-sp-tilt, .st-sp-spring:hover { transform: none; }
              .st-sp-out { animation: st-sp-fade var(--fade) reverse forwards; }
            }
          `}</style>

          {/*big soft blobs drifting in the background*/}
          {[["-left-24 -top-24 h-96 w-96 bg-accent/25", 10, 0], ["-bottom-32 -right-24 h-[28rem] w-[28rem] bg-primary/20", -16, 3], ["left-1/2 top-1/3 h-64 w-64 bg-accent/15", 22, 6]].map(([cls, z, d], i) => (
            <div key={i} aria-hidden="true" className="st-sp-par pointer-events-none absolute inset-0" style={{ "--z": z }}>
              <div className={`st-sp-drift absolute rounded-full blur-3xl ${cls}`} style={{ animationDelay: `-${d}s` }} />
            </div>
          ))}

          {/*floating leaves, dots and rings, hover one to boop it*/}
          {BITS.map((b, i) => (
            <div key={i} aria-hidden="true" className="st-sp-par st-sp-fade pointer-events-none absolute" style={{ left: `${b.x}%`, top: `${b.y}%`, "--z": b.z, "--d": `${300 + b.d / 2}ms` }}>
              <div className="st-sp-bob" style={{ animationDuration: `${b.t}s`, animationDelay: `-${b.d}ms` }}>
                <span className={`st-sp-boop pointer-events-auto block ${SHAPES[b.kind]}`} style={{ width: b.s, height: b.s }} />
              </div>
            </div>
          ))}

          {/*tap ripples*/}
          {pops.map((p) => (
            <span key={p.id} aria-hidden="true" className="pointer-events-none absolute" style={{ left: p.x, top: p.y }}>
              <span className="st-sp-ripple absolute -left-10 -top-10 h-20 w-20 rounded-full border-2 border-primary" />
              {Array.from({ length: 8 }, (_, k) => (
                <span key={k} className={`st-sp-spark absolute -left-1 -top-1 h-2 w-2 rounded-full ${k % 2 ? "bg-accent" : "bg-primary"}`} style={{ "--a": `${k * 45}deg` }} />
              ))}
            </span>
          ))}

          <div className="relative z-10 flex min-h-full flex-col items-center justify-center gap-6 py-16 text-center">
            {/*logo, follows the pointer in 3d, tap it to make it bounce*/}
            <div style={{ perspective: "700px" }}>
              <div className="st-sp-tilt">
                <div className="st-sp-pop" style={{ "--d": "100ms" }}>
                  <div className="st-sp-float">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBoing((b) => b + 1);
                      }}
                      aria-label="Bounce the logo"
                      className="block rounded-full text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <span key={boing} className={`block ${boing ? "st-sp-boing" : ""}`}>
                        <svg width="150" height="150" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                          <g className="st-sp-svg st-sp-spin"><circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 5" strokeLinecap="round" opacity=".5" /></g>
                          <circle className="st-sp-ring" cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".35" style={{ "--len": 276.5, "--d": "100ms" }} />
                          <circle className="st-sp-ring" cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".6" style={{ "--len": 201, "--d": "300ms" }} />
                          <circle className="st-sp-ring" cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ "--len": 125.7, "--d": "500ms" }} />
                          <circle className="st-sp-svg st-sp-dot" cx="50" cy="50" r="7" fill="currentColor" />
                          <path className="st-sp-svg st-sp-pop" d="M14 84 C14 62 28 50 48 50 C48 72 34 86 14 84 Z" fill="var(--color-accent)" opacity=".55" style={{ "--d": "1100ms" }} />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/*name, every letter drops in and jumps when you hover it*/}
            <h1 aria-label="SkinTect" className="flex text-5xl font-bold tracking-tight md:text-7xl" style={serif}>
              {TITLE.map((c, i) => (
                <span key={i} aria-hidden="true" className="st-sp-drop inline-block" style={{ "--d": `${700 + i * 80}ms` }}>
                  <span className="st-sp-jump inline-block cursor-default">{c}</span>
                </span>
              ))}
            </h1>

            {/*caption, word by word*/}
            <p className="flex max-w-sm flex-wrap justify-center gap-x-2 text-base text-text/70 md:text-xl">
              {CAPTION.map((w, i) => (
                <span key={i} className="st-sp-pop inline-block" style={{ "--d": `${1400 + i * 100}ms` }}>
                  <span className="st-sp-jump inline-block cursor-default">{w}</span>
                </span>
              ))}
            </p>

            {/*what the app does, chips spring up when hovered and squish when pressed*/}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {STEPS.map((s, i) => (
                <div key={s.label} className="st-sp-pop" style={{ "--d": `${2100 + i * 160}ms` }}>
                  <div className="st-sp-spring flex items-center gap-2 rounded-full border border-primary/20 bg-surface px-4 py-2 text-[13px] font-medium">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary" aria-hidden="true">{s.icon}</svg>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <p className="st-sp-fade text-[13px] text-text/50" style={{ "--d": "2800ms" }}>Tap anywhere to start</p>
          </div>
        </div>
      )}
    </>
  );
}