import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormField from "../components/Formfield";
import Button from "../components/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//this is for the user login page
export default function Login({onLogin}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState(null); //null | "loading" | "done" | { error }
    
  //defaults to loading
  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    try {
    //this is where we use the fetch api made in server.js
        const res = await fetch(`${API_BASE_URL}/api/login`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        await onLogin();      
        setStatus("done");
        //when user successfully logs in, it sends them to the home page
        navigate("/");
    } catch (err) {
      setStatus({ error: err.message });
    }
  }

  //claude generated front UI
  //claude generated front UI
  //icons come from the svg folder
  const icon = (name) => new URL(`../images/svg/${name}.svg`, import.meta.url).href;
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-8 text-text md:px-6">
      {/*page animations*/}
      <style>{`
        /*shared motion, every class is switched off for reduced motion*/
        @keyframes st-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes st-pop { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: none; } }
        @keyframes st-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes st-sheet { from { opacity: 0; transform: translateY(56px); } to { opacity: 1; transform: none; } }
        @keyframes st-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes st-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes st-ring { from { stroke-dashoffset: var(--len); } to { stroke-dashoffset: var(--to); } }
        @keyframes st-shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(3px); } }
        @property --st-n { syntax: "<integer>"; inherits: false; initial-value: 0; }
        @keyframes st-count { from { --st-n: 0; } to { --st-n: var(--to); } }
        .st-rise { animation: st-rise .55s cubic-bezier(.2, .7, .2, 1) backwards; animation-delay: var(--d, 0ms); }
        .st-pop { animation: st-pop .4s cubic-bezier(.2, .9, .3, 1.15) backwards; animation-delay: var(--d, 0ms); }
        .st-fade { animation: st-fade .45s ease-out backwards; animation-delay: var(--d, 0ms); }
        .st-dialog { animation: st-sheet .45s cubic-bezier(.2, .7, .2, 1) backwards; }
        @media (min-width: 640px) { .st-dialog { animation-name: st-pop; } }
        .st-float { animation: st-float 4s ease-in-out infinite; }
        .st-grow { transform-origin: left; animation: st-grow .9s cubic-bezier(.2, .7, .2, 1) .3s backwards; }
        .st-ring { animation: st-ring 1.1s cubic-bezier(.2, .7, .2, 1) .25s backwards; }
        .st-alert { animation: st-pop .35s ease-out backwards, st-shake .45s .15s; }
        .st-count { --st-n: var(--to); animation: st-count 1.1s cubic-bezier(.2, .7, .2, 1) .3s backwards; counter-reset: st-n var(--st-n); }
        .st-count::after { content: counter(st-n); }
        main button:not(:disabled):active { transform: scale(.97); }
        @media (prefers-reduced-motion: reduce) { .st-rise, .st-pop, .st-fade, .st-dialog, .st-float, .st-grow, .st-ring, .st-alert, .st-count { animation: none; } }
      `}</style>
      <main className="st-pop w-full max-w-md overflow-hidden rounded-3xl border border-primary/15 shadow-sm">
        {/*banner art*/}
        <img src={icon("profile-banner")} alt="" className="st-fade h-32 w-full object-cover" style={{ "--d": "150ms" }} />

        <div className="flex flex-col gap-6 p-6 md:p-8">
          <div className="st-rise flex flex-col gap-1" style={{ "--d": "120ms" }}>
            <Link to="/" className={`w-fit rounded text-base font-semibold text-primary ${focusRing}`} style={{ fontFamily: "Georgia, serif" }}>
              SkinTect
            </Link>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif" }}>Log in</h1>
            <p className="text-base text-text/75">Welcome back. Log in to see your scans.</p>
          </div>

          {status === "done" ? (
            <p role="status" className="st-pop flex items-center gap-3 rounded-2xl bg-surface p-4">
              <img src={icon("check-circle-teal")} alt="" className="h-6 w-6" />
              Logged in.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="st-rise" style={{ "--d": "200ms" }}><FormField label="Email" type="email" icon={icon("mail")} placeholder="you@example.com" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="st-rise" style={{ "--d": "260ms" }}>
              <FormField
                label="Password"
                type={showPassword ? "text" : "password"}
                icon={icon("lock")}
                placeholder="Your password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                right={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className={`rounded-lg p-1.5 hover:bg-surface ${focusRing}`}
                  >
                    <img key={String(showPassword)} src={icon(showPassword ? "eye-off" : "eye")} alt="" className="st-pop h-5 w-5" />
                  </button>
                }
              />
              </div>

              {status?.error && (
                <p role="alert" className="st-alert flex items-center gap-2 rounded-xl bg-malignant/5 p-3 text-malignant">
                  <img src={icon("alert-red")} alt="" className="h-5 w-5" />
                  {status.error}
                </p>
              )}

              <div className="st-rise [&>button]:w-full" style={{ "--d": "320ms" }}>
                <Button type="submit" variant="primary" disabled={status === "loading"}>
                  <span className="inline-flex items-center justify-center gap-2">
                    {status === "loading" && <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" aria-hidden="true" />}
                    {status === "loading" ? "Logging in..." : "Log in"}
                  </span>
                </Button>
              </div>

              <p className="st-fade text-center" style={{ "--d": "380ms" }}>
                Don't have an account?{" "}
                <Link to="/signup" className={`rounded font-bold text-primary hover:underline ${focusRing}`}>
                  Sign up
                </Link>
              </p>
            </form>
          )}

          <p className="st-fade text-center text-[13px] text-text/70" style={{ "--d": "440ms" }}>This is a screening aid, not a medical diagnosis.</p>
        </div>
      </main>
    </div>
  );
}