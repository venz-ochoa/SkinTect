import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import SplitBar from "../components/Splitbar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//this is for displaying the user's past scans
export default function History() {
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  //stores the id of the scan the user tapped on to show the dropdown
  const [expanded, setExpanded] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [loading, setLoading] = useState(true);
  //the id of the scan waiting for delete confirmation, whether a delete is running, and the small message at the bottom
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");

  //this is where we get the user's history from the backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/scans`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setScans(Array.isArray(d) ? d : { error: true }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  //deletes a scan, lets the exit animation play, then jumps to the neighbouring scan (or closes the window)
  async function deleteScan(scan, next) {
    setDeleting(true);
    let message = "Scan deleted";
    try {
      const r = await fetch(`${API_BASE_URL}/api/scans/${scan.id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error();
      await new Promise((done) => setTimeout(done, 450));
      setScans((s) => s.filter((x) => x.id !== scan.id));
      setExpanded(next ? next.id : null);
    } catch {
      message = "Could not delete this scan";
    }
    setDeleting(false);
    setConfirmId(null);
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  //claude generated UI
  const serif = { fontFamily: "Georgia, 'Times New Roman', serif" };
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
  //short date and time formats used in the gallery and the detail window
  const day = (d) => d.toLocaleDateString([], { dateStyle: "medium" });
  const clock = (d) => d.toLocaleTimeString([], { timeStyle: "short" });
  //the server sends an error object instead of an array when logged out
  const loggedOut = !Array.isArray(scans);
  const list = loggedOut ? [] : scans;

  const benignTotal = list.filter((s) => s.prediction === "benign").length;
  const malignantTotal = list.length - benignTotal;

  //the scan that is open in the detail window, and its neighbours for the newer and older buttons
  const selectedIndex = list.findIndex((s) => s.id === expanded);
  const selected = selectedIndex >= 0 ? list[selectedIndex] : null;
  const newer = selectedIndex > 0 ? list[selectedIndex - 1] : null;
  const older = selectedIndex >= 0 && selectedIndex < list.length - 1 ? list[selectedIndex + 1] : null;

  function openScan(id) {
    setExpanded(id);
    setShowHeatmap(false);
    setConfirmId(null);
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-6">
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
        @keyframes st-away { to { opacity: 0; transform: scale(.88) rotate(-3deg) translateY(24px); filter: blur(6px); } }
        @property --st-n { syntax: "<integer>"; inherits: false; initial-value: 0; }
        @keyframes st-count { from { --st-n: 0; } to { --st-n: var(--to); } }
        .st-rise { animation: st-rise .55s cubic-bezier(.2, .7, .2, 1) backwards; animation-delay: var(--d, 0ms); }
        .st-pop { animation: st-pop .4s cubic-bezier(.2, .9, .3, 1.15) backwards; animation-delay: var(--d, 0ms); }
        .st-fade { animation: st-fade .45s ease-out backwards; animation-delay: var(--d, 0ms); }
        .st-dialog { animation: st-sheet .45s cubic-bezier(.2, .7, .2, 1) backwards; }
        @media (min-width: 640px) { .st-dialog { animation-name: st-pop; } }
        .st-away { animation: st-away .45s cubic-bezier(.5, 0, .75, 0) forwards; }
        .st-float { animation: st-float 4s ease-in-out infinite; }
        .st-grow { transform-origin: left; animation: st-grow .9s cubic-bezier(.2, .7, .2, 1) .3s backwards; }
        .st-ring { animation: st-ring 1.1s cubic-bezier(.2, .7, .2, 1) .25s backwards; }
        .st-alert { animation: st-pop .35s ease-out backwards, st-shake .45s .15s; }
        .st-count { --st-n: var(--to); animation: st-count 1.1s cubic-bezier(.2, .7, .2, 1) .3s backwards; counter-reset: st-n var(--st-n); }
        .st-count::after { content: counter(st-n); }
        main button:not(:disabled):active { transform: scale(.97); }
        @media (prefers-reduced-motion: reduce) { .st-rise, .st-pop, .st-fade, .st-dialog, .st-away, .st-float, .st-grow, .st-ring, .st-alert, .st-count { animation: none; } }
      `}</style>
      {/* title row */}
      <div className="st-rise flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold" style={serif}>Past scans</h1>
          {!loggedOut && list.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              {[
                { text: `${list.length} saved ${list.length === 1 ? "scan" : "scans"}` },
                { text: `${benignTotal} benign`, dot: "bg-benign" },
                { text: `${malignantTotal} malignant`, dot: "bg-malignant" },
              ].map((chip, i) => (
                <span key={chip.text} style={{ "--d": `${150 + i * 70}ms` }} className={`st-rise rounded-full bg-surface px-3 py-1 text-text/70 ${chip.dot ? "flex items-center gap-1.5" : ""}`}>
                  {chip.dot && <span className={`h-2 w-2 rounded-full ${chip.dot}`} aria-hidden="true" />}
                  {chip.text}
                </span>
              ))}
            </div>
          )}
        </div>
        <Button variant="secondary" onClick={() => navigate("/profile")}>Back to Profile</Button>
      </div>

      {loading ? (
        <p className="st-fade text-center text-base text-text/70">Loading your scans...</p>
      ) : loggedOut || list.length === 0 ? (        <div className="st-pop mx-auto w-full max-w-md">
          <Card>
            <div className={`flex flex-col items-center gap-4 text-center [&>button]:w-full ${loggedOut ? "p-4" : "p-6"}`}>
              {loggedOut ? (
                <p className="text-base">You are not logged in.</p>
              ) : (
                <>
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/30 text-primary">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 9a2 2 0 0 1 2-2h1.5l1.2-1.8A1 1 0 0 1 8.5 5h7a1 1 0 0 1 .8.2L17.5 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                      <circle cx="12" cy="13" r="3.5" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-base font-semibold">No scans saved yet.</p>
                    <p className="mt-1 text-[13px] text-text/60">Saved scans will show up here.</p>
                  </div>
                </>
              )}
              <Button variant="primary" onClick={() => navigate(loggedOut ? "/login" : "/")}>
                {loggedOut ? "Log in" : "Scan a lesion"}
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <>
          {/* photo gallery, every card is the same size */}
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {list.map((scan, i) => {
              const isBenign = scan.prediction === "benign";
              const confidence = isBenign ? 1 - scan.malignant_probability : scan.malignant_probability;
              const when = new Date(scan.created_at);

              return (
                <li key={scan.id} className="st-rise" style={{ "--d": `${Math.min(i, 12) * 45}ms` }}>
                  <button
                    type="button"
                    onClick={() => openScan(scan.id)}
                    aria-label={`Open scan from ${when.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`}
                    className={`group flex w-full flex-col overflow-hidden rounded-2xl bg-surface text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-md ${focusRing}`}
                  >
                    <span className="relative block aspect-square w-full overflow-hidden bg-accent/20">
                      <img
                        src={`data:image/jpeg;base64,${scan.photo}`}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span
                        className={`absolute left-3 top-3 h-3 w-3 rounded-full ring-2 ring-bg ${isBenign ? "bg-benign" : "bg-malignant"}`}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="flex flex-col gap-2 p-3">
                      <span className="flex flex-col">
                        <span className="text-base font-semibold">{day(when)}</span>
                        <span className="text-[13px] text-text/60">{clock(when)}</span>
                      </span>
                      <span className="inline-flex w-fit rounded-full bg-bg px-3 py-1">
                        <Badge label={scan.prediction} confidence={confidence} />
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* scan detail window */}
          {selected && (() => {
            const malignant = selected.malignant_probability;
            const benign = 1 - malignant;
            const isBenign = selected.prediction === "benign";
            const when = new Date(selected.created_at);
            const showingHeatmap = showHeatmap && selected.heatmap;

            return (
              <div
                className="st-fade fixed inset-0 z-50 flex items-end justify-center bg-text/50 p-0 sm:items-center sm:p-4"
                onClick={() => setExpanded(null)}
                onKeyDown={(e) => e.key === "Escape" && setExpanded(null)}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Scan details"
                  onClick={(e) => e.stopPropagation()}
                  className={`${deleting ? "st-away" : "st-dialog"} grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-bg shadow-2xl sm:rounded-3xl md:grid-cols-2`}
                >
                  {/* photo or heatmap */}
                  <div className="relative bg-surface">
                    <img
                      key={selected.id + (showingHeatmap ? "h" : "p")}
                      src={showingHeatmap ? selected.heatmap : `data:image/jpeg;base64,${selected.photo}`}
                      alt={showingHeatmap ? "Heatmap overlay of the scanned lesion" : "Scanned lesion"}
                      className="st-fade aspect-square h-full w-full object-cover"
                    />
                    {showingHeatmap && (
                      <span className="absolute left-3 top-3 rounded-full bg-bg/90 px-3 py-1 text-[13px] font-medium text-primary">
                        Heatmap
                      </span>
                    )}
                  </div>

                  {/* details */}
                  <div key={selected.id} className="st-fade flex flex-col gap-5 p-5 md:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold" style={serif}>{day(when)}</h2>
                        <p className="text-[13px] text-text/60">{clock(when)}</p>
                      </div>
                      <button
                        type="button"
                        autoFocus
                        onClick={() => setExpanded(null)}
                        aria-label="Close scan details"
                        className={`rounded-full bg-surface p-2 text-primary transition-colors hover:bg-accent/30 ${focusRing}`}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                          <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </button>
                    </div>

                    <div className={`rounded-xl border-l-4 bg-surface p-4 ${isBenign ? "border-benign" : "border-malignant"}`}>
                      <p className="text-base font-semibold">{isBenign ? "Likely benign" : "Likely malignant"}</p>
                      <p className="mt-1 text-[13px] text-text/70">
                        {isBenign
                          ? "Keep an eye on this spot and see a doctor if it changes."
                          : "Please have this looked at by a dermatologist soon."}
                      </p>
                    </div>

                    <SplitBar benign={benign} malignant={malignant} />

                    {/* actions pinned to the bottom of the window */}
                    <div className="mt-auto flex flex-col gap-3 border-t border-primary/15 pt-5 [&_button]:w-full">
                      {selected.heatmap && (
                        <Button variant="primary" onClick={() => setShowHeatmap(!showHeatmap)}>
                          {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
                        </Button>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="secondary" disabled={!newer} onClick={() => openScan(newer.id)}>Next scan</Button>
                        <Button variant="secondary" disabled={!older} onClick={() => openScan(older.id)}>Previous scan</Button>
                      </div>
                      {confirmId === selected.id ? (
                        <div className="st-alert flex flex-col gap-3 rounded-xl border border-malignant/40 bg-malignant/10 p-4">
                          <div>
                            <p className="text-base font-semibold">Delete this scan?</p>
                            <p className="mt-1 text-[13px] text-text/70">The photo and heatmap will be gone for good.</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Button variant="secondary" disabled={deleting} onClick={() => setConfirmId(null)}>Keep it</Button>
                            <button
                              type="button"
                              disabled={deleting}
                              onClick={() => deleteScan(selected, newer || older)}
                              className={`rounded-full bg-malignant px-4 py-2 text-base font-medium text-bg transition-opacity disabled:opacity-60 ${focusRing}`}
                            >
                              {deleting ? "Deleting..." : "Yes, delete"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmId(selected.id)}
                          className={`group flex items-center justify-center gap-2 rounded-full border border-malignant/40 px-4 py-2 text-base font-medium text-malignant transition-colors hover:bg-malignant hover:text-bg ${focusRing}`}
                        >
                          <svg className="transition-transform duration-200 group-hover:-rotate-12 group-hover:scale-110" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5" />
                          </svg>
                          Delete scan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}

      <p className="st-fade text-center text-[13px] text-text/70" style={{ "--d": "300ms" }}>This is a screening aid, not a medical diagnosis.</p>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center">
          <p role="status" className="st-pop rounded-full bg-text px-5 py-2 text-[13px] font-medium text-bg shadow-lg">{toast}</p>
        </div>
      )}
    </main>
  );
}