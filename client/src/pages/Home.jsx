import { useState } from "react";
import Button from "../components/Button";
import Badge from "../components/Badge";
import SplitBar from "../components/Splitbar";
import { Link } from "react-router-dom";
import Tilt from "../components/Tilt";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Home() {
  //state variables for the file, preview, result, and loading state
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  //aeshetic purposes...
  const [loading, setLoading] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [bodyLocation, setBodyLocation] = useState(""); // tracks the selected body part

  //shrinks big phone photos to a max of 1600px and converts them to JPEG before upload
  function shrinkImage(file, maxSide = 1600) {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            const name = file.name.replace(/\.\w+$/, "") + ".jpg";
            resolve(blob ? new File([blob], name, { type: "image/jpeg" }) : file);
          },
          "image/jpeg",
          0.85,
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  }

  //this function runs when the user selcts a take a photo or upload. only allows for one photo to be selected at a time
  async function pickFile(e) {
  const picked = e.target.files[0];
  //if didnt pick anything, return nothing
  if (!picked) return;
  const small = await shrinkImage(picked);
  //set file = what the user chose,
  setFile(small);
  setPreview(URL.createObjectURL(small));
  //and set result = stores the json sent by the model from Google Cloud
  setResult(null);
  setSaveStatus(null); //resets the save button for new photos
  setBodyLocation(""); // esets the body location dropdown
}

  //this function runs when the user taps on the analyze button
  //sends the image to the server, waits for json result, then sets the result state to the json result
  async function analyze() {
    //processing
    setLoading(true);
    //result not yet returned, so set result to null
    setResult(null);
    try {
      //this is for the actual process
      //create a new form data object to send the image to the server
      const body = new FormData();
      //append the image to the form data object
      body.append("image", file);
      //send the form data to the server, wait for the response, and parse it as json
      const res = await fetch(`${API_BASE_URL}/api/predict`, { method: "POST", body });      //turn it into json, throw an error if response is invalid or theres an error
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      //set the result state to the json data returned by the server
      setResult(data);
      //just general error handling, catches stuff
    } catch (err) {
      setResult({ error: err.message });
    }
    //everything is done no need to load it
    setLoading(false);
  }

  //this is for sending the scan data to the backend
  async function handleSaveScan() {
    setSaveStatus("saving");

    const body = new FormData();
    body.append("photo", file);
    body.append("heatmap", result.heatmap || "");
    body.append("prediction", result.prediction);
    body.append("malignant_probability", result.probabilities.malignant);
    
    if (bodyLocation) body.append("body_location", bodyLocation);

    try {
      const res = await fetch(`${API_BASE_URL}/api/scans`, {
        method: "POST",
        credentials: "include",
        body,
      });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || "Failed to save");
    }      
    setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("error");
      setSaveMessage(error.message);
    }
  }

  //icons come from the svg folder, loaded here so nothing above the marker changes
  const icon = (name) => new URL(`../images/svg/${name}.svg`, import.meta.url).href;
  //every icon below is one short tag, the size is a tailwind class
  const ic = (name, cls = "h-5 w-5") => <img src={icon(name)} alt="" className={cls} />;

  const serif = { fontFamily: "Georgia, 'Times New Roman', serif" };
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
  //turns the sage icon files white so they show on filled buttons
  const whiteIcon = "h-5 w-5 brightness-0 invert";

  const hasResult = result && !result.error;
  const isBenign = hasResult && result.prediction === "benign";
  const tone = isBenign ? "text-benign" : "text-malignant";
  const confidence = hasResult ? result.probabilities[result.prediction] : 0;
  const benignPct = hasResult ? result.probabilities.benign : 0;
  const malignantPct = hasResult ? result.probabilities.malignant : 0;
  const showingHeatmap = showHeatmap && result?.heatmap;

  //confidence ring math: r = 44, so the circumference is about 276.46
  const ringLength = 2 * Math.PI * 44;

  //clears everything so the user can scan another lesion
  function startOver() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setSaveStatus(null);
    setShowHeatmap(false);
    setBodyLocation("");
  }

  //formats the file size for the little file chip
  function prettySize(bytes) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  //body part groups for the location chips
  const bodyParts = [
    ["Head & torso", ["head", "neck", "chest", "abdomen", "pelvis", "upper_back", "lower_back", "buttocks"]],
    ["Arms & hands", ["left_upper_arm", "right_upper_arm", "left_forearm", "right_forearm", "left_hand", "right_hand"]],
    ["Legs & feet", ["left_thigh", "right_thigh", "left_lower_leg", "right_lower_leg", "left_foot", "right_foot"]],
    ["Anywhere else", ["other"]],
  ];

  const tips = [
    { icon: "clock", title: "Use daylight", text: "Soft natural light shows true color." },
    { icon: "scan", title: "Center the spot", text: "Fill the frame with the lesion." },
    { icon: "check-circle", title: "Keep it sharp", text: "Hold still so the photo is in focus." },
  ];

  return (
    <div className="min-h-screen text-text">
      {/*scan line animation only plays while analyzing and is off for reduced motion*/}
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
        @keyframes skintect-sweep { 0% { top: 0%; } 50% { top: calc(100% - 3px); } 100% { top: 0%; } }
        .skintect-sweep { animation: skintect-sweep 2.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .skintect-sweep { animation: none; top: 50%; } }
      `}</style>

      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-6">
        {/* Title row: Check a lesion (left) + Submit (right) */}
        <div className="st-rise flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface ring-1 ring-primary/15">
              {ic("scan", "h-7 w-7")}
            </span>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold" style={serif}>Check a lesion</h1>
              <p className="text-base text-text/75">Upload a clear, well-lit photo of the area you'd like checked.</p>
            </div>
          </div>
          <div className="shrink-0 max-sm:w-full [&>button]:max-sm:w-full">
            <Button variant="primary" onClick={analyze} disabled={!file || loading}>
              <span className="inline-flex items-center justify-center gap-2">
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" aria-hidden="true" />
                ) : (
                  ic("scan", whiteIcon)
                )}
                {loading ? "Analyzing..." : "Submit"}
              </span>
            </Button>
          </div>
        </div>

        {/* Upload / take photo / image result */}
        <section aria-label="Photo upload" className="st-rise flex flex-col gap-3" style={{ "--d": "80ms" }}>
          <label
            htmlFor="lesion-file"
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => (e.currentTarget.dataset.drag = "true")}
            onDragLeave={(e) => delete e.currentTarget.dataset.drag}
            onDrop={(e) => {
              e.preventDefault();
              delete e.currentTarget.dataset.drag;
              pickFile({ target: { files: e.dataTransfer.files } });
            }}
            className={`group relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-accent bg-surface text-center transition-all hover:border-primary hover:bg-accent/15 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 data-[drag=true]:scale-[1.02] data-[drag=true]:border-primary data-[drag=true]:bg-accent/25 ${
              preview ? "p-3" : "min-h-[300px] p-6"
            }`}
          >
            <input id="lesion-file" type="file" accept="image/*" onChange={pickFile} className="sr-only" />

            {preview ? (
              <div className="flex w-full flex-col items-center gap-3">
                <div key={preview} className="st-pop relative w-full overflow-hidden rounded-2xl bg-bg">
                  <img
                    key={showingHeatmap ? "heatmap" : "photo"}
                    src={showingHeatmap ? result.heatmap : preview}
                    alt={showingHeatmap ? "Heatmap overlay of the selected lesion" : "Selected lesion"}
                    className={`max-h-[420px] w-full object-contain transition-opacity st-fade ${loading ? "opacity-70" : ""}`}
                  />
                  {showingHeatmap && (
                    <span className="absolute left-3 top-3 rounded-full bg-bg/90 px-3 py-1 text-[13px] font-medium text-primary">
                      Heatmap
                    </span>
                  )}
                  {/*scanning line while the model works*/}
                  {loading && (
                    <>
                      <div className="pointer-events-none absolute inset-0 bg-primary/10" aria-hidden="true" />
                      <div
                        className="skintect-sweep pointer-events-none absolute left-0 h-[3px] w-full bg-accent shadow-[0_0_16px_4px] shadow-accent"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </div>
                <div className="flex w-full flex-wrap items-center justify-between gap-2 px-1">
                  <span className="flex min-w-0 items-center gap-2 text-[13px] text-text/70">
                    {ic("check-circle", "h-4 w-4 shrink-0")}
                    <span className="truncate">{file?.name}</span>
                    {file && <span className="shrink-0 text-text/50">{prettySize(file.size)}</span>}
                  </span>
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-primary underline-offset-4 group-hover:underline">
                    {ic("camera", "h-4 w-4")}
                    Choose a different photo
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="st-float">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/30 ring-8 ring-accent/10 transition-transform group-hover:scale-105 group-data-[drag=true]:scale-110">
                    {ic("camera", "h-10 w-10")}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-base font-semibold">Upload or take a photo</span>
                  <span className="text-[13px] text-text/65">Drag and drop, or click to choose an image</span>
                </div>
                <span className="rounded-full bg-bg px-4 py-2 text-[13px] font-medium text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-white">
                  Browse photos
                </span>
              </div>
            )}
          </label>

          {/*photo tips only before a photo is picked*/}
          {!preview && (
            <ul className="grid gap-3 sm:grid-cols-3">
              {tips.map((tip, i) => (
                <li key={tip.title} style={{ "--d": `${160 + i * 70}ms` }} className="st-rise"><Tilt className="flex h-full items-start gap-3 rounded-2xl bg-surface p-4">
                  {ic(tip.icon, "mt-0.5 h-5 w-5 shrink-0")}
                  <div className="flex flex-col">
                    <span className="text-base font-semibold">{tip.title}</span>
                    <span className="text-[13px] text-text/65">{tip.text}</span>
                  </div>
                </Tilt></li>
              ))}
            </ul>
          )}
        </section>

        {/* Error state */}
        {result?.error && (
          <div role="alert" className="st-alert flex items-start gap-3 rounded-2xl border border-malignant/30 bg-malignant/5 p-4">
            {ic("alert-red", "mt-0.5 h-6 w-6 shrink-0")}
            <div className="flex-1">
              <p className="text-base font-semibold text-malignant">Something went wrong</p>
              <p className="mt-1 text-[13px] text-malignant">{result.error}</p>
              <p className="mt-2 text-[13px] text-text/70">Check your connection and press Submit to try again.</p>
            </div>
          </div>
        )}

        {/* Results panel */}
        {hasResult && (
          <section aria-label="Scan result" className="st-pop flex flex-col gap-6 rounded-3xl border border-primary/10 bg-surface p-5 md:p-6">
            {/* Panel header: title + badge */}
            <div className="st-rise flex flex-wrap items-center justify-between gap-3" style={{ "--d": "100ms" }}>
              <h2 className="text-2xl font-bold" style={serif}>Scan results</h2>
              <span className="rounded-full bg-bg px-3 py-1 ring-1 ring-primary/10">
                <Badge label={result.prediction} confidence={confidence} />
              </span>
            </div>

            {/* Plain-language verdict */}
            <div className={`st-rise flex flex-col items-center gap-5 rounded-2xl border-l-4 bg-bg p-5 sm:flex-row ${isBenign ? "border-benign" : "border-malignant"}`} style={{ "--d": "180ms" }}>
              <div className="relative h-28 w-28 shrink-0">
                <svg viewBox="0 0 100 100" className={`h-full w-full -rotate-90 ${tone}`} aria-hidden="true">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={ringLength}
                    strokeDashoffset={ringLength * (1 - confidence)}
                    className="st-ring transition-all duration-700"
                    style={{ "--len": ringLength, "--to": ringLength * (1 - confidence) }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-bold ${tone}`} style={serif}>
                    <span className="sr-only">{(confidence * 100).toFixed(0)}%</span>
                    <span aria-hidden="true"><span className="st-count" style={{ "--to": Math.round(confidence * 100) }} />%</span>
                  </span>
                  <span className="text-[13px] text-text/60">confident</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2 text-center sm:text-left">
                <p className="flex items-center justify-center gap-2 text-base font-semibold sm:justify-start">
                  {ic(isBenign ? "check-circle-teal" : "alert-red", "h-6 w-6")}
                  {isBenign ? "Likely benign" : "Likely malignant"}
                </p>
                <p className="text-base text-text/80">
                  {isBenign
                    ? "Keep an eye on this spot and see a doctor if it changes."
                    : "Please have this looked at by a dermatologist soon."}
                </p>
              </div>
            </div>

            {/* Single split bar + legend */}
            <div className="st-rise" style={{ "--d": "260ms" }}>
              <p className="mb-3 flex items-center gap-2 text-base font-semibold">
                {ic("pulse")}
                How the model split it
              </p>
              <SplitBar benign={benignPct} malignant={malignantPct} track="bg-bg" legend />
            </div>

            {/* Actions */}
            <div className="st-rise flex flex-col gap-4 border-t border-primary/15 pt-5" style={{ "--d": "340ms" }}>
              {result?.heatmap && (
                <div className="flex flex-col gap-2">
                  {/*photo and heatmap switch*/}
                  <div role="group" aria-label="Image view" className="relative grid grid-cols-2 gap-1 rounded-xl bg-bg p-1">
                    <span
                      aria-hidden="true"
                      className={`absolute inset-y-1 left-1 w-[calc(50%-0.375rem)] rounded-lg bg-primary shadow-sm transition-transform duration-300 ease-out ${showHeatmap ? "translate-x-[calc(100%+0.25rem)]" : ""}`}
                    />
                    {["Photo", "Heatmap"].map((label) => {
                      const on = (label === "Heatmap") === !!showHeatmap;
                      return (
                        <button
                          key={label}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setShowHeatmap(label === "Heatmap")}
                          className={`relative z-10 rounded-lg px-3 py-2 text-base transition-colors duration-300 ${focusRing} ${on ? "font-semibold text-white" : "text-primary"}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[13px] text-text/60">
                    {showHeatmap
                      ? "The heatmap is showing on your photo above."
                      : "The heatmap highlights the areas the model focused on."}
                  </p>
                </div>
              )}

              {!saveStatus && (
                <div className="flex flex-col gap-3">
                  <p className="text-[13px] font-semibold text-text/80">
                    Where is this lesion located? (Optional)
                    {bodyLocation && <span className="ml-2 font-normal capitalize text-primary">{bodyLocation.replace(/_/g, " ")}</span>}
                  </p>
                  {/*tap a chip to pick, tap it again to clear. values match the old dropdown*/}
                  {bodyParts.map(([group, parts]) => (
                    <div key={group} className="flex flex-col gap-1.5">
                      <span className="text-[12px] uppercase tracking-wide text-text/50">{group}</span>
                      <div className="flex flex-wrap gap-2">
                        {parts.map((part) => {
                          const on = bodyLocation === part;
                          return (
                            <button
                              key={part}
                              type="button"
                              aria-pressed={on}
                              onClick={() => setBodyLocation(on ? "" : part)}
                              className={`rounded-full px-3 py-1.5 text-[13px] capitalize ring-1 transition-colors ${focusRing} ${on ? "bg-primary font-semibold text-white ring-primary" : "bg-bg text-text/80 ring-primary/20 hover:bg-accent/20"}`}
                            >
                              {part.replace(/_/g, " ")}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2 [&>button]:w-full">
                {saveStatus === "saved" ? (
                  <p role="status" className="st-pop flex items-center justify-center gap-2 rounded-lg bg-bg px-4 py-3 text-base font-bold text-primary">
                    {ic("check-circle-teal")}
                    Scan saved successfully!
                  </p>
                ) : (
                  <Button variant="primary" onClick={handleSaveScan} disabled={saveStatus === "saving"}>
                    <span className="inline-flex items-center justify-center gap-2">
                      {ic("check", whiteIcon)}
                      {saveStatus === "saving" ? "Saving..." : "Save Scan"}
                    </span>
                  </Button>
                )}
                <Button variant="secondary" onClick={startOver}>
                  <span className="inline-flex items-center justify-center gap-2">
                    {ic("close")}
                    Start over
                  </span>
                </Button>
              </div>

              {saveStatus === "saved" && (
                <Link to="/history" className={`mx-auto flex w-fit items-center gap-2 rounded text-[13px] font-medium text-primary underline-offset-4 hover:underline ${focusRing}`}>
                  {ic("history", "h-4 w-4")}
                  View it in your scan history
                </Link>
              )}

              {saveStatus === "error" && (
                <p role="alert" className="flex items-center justify-center gap-2 text-center text-[13px] text-malignant">
                  {ic("alert-red", "h-4 w-4")}
                  Failed to save scan. Make sure you're logged in and try again.
                </p>
              )}
            </div>
          </section>
        )}

        <p className="st-fade text-center text-[13px] text-text/70" style={{ "--d": "300ms" }}>This is a screening aid, not a medical diagnosis.</p>
      </main>
    </div>
  );
}