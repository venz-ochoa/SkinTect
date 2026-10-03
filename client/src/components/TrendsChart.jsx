import { useState } from "react";

const RANGES = [8, 12, 26];
const serif = { fontFamily: "Georgia, 'Times New Roman', serif" };
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

//weeks come from the server as "YYYY-MM-DD" (the Monday of that week), read them as local dates
function weekDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}
const fmt = (str) => weekDate(str).toLocaleDateString([], { month: "short", day: "numeric" });

//each bar is one week: the height is how many scans, the colors are the benign / malignant split
export default function TrendsChart({ data, range, onRange, loading, failed }) {
  const [active, setActive] = useState(null);

  const totalScans = data.reduce((n, w) => n + w.benign + w.malignant, 0);
  const maxWeek = Math.max(1, ...data.map((w) => w.benign + w.malignant));
  //round the top of the chart up to a tidy whole number, with about 4 grid lines
  const step = Math.ceil(maxWeek / 4);
  const top = step * Math.ceil(maxWeek / step);
  const ticks = [];
  for (let t = 0; t <= top; t += step) ticks.push(t);
  //only label some of the weeks so the labels don't overlap
  const every = Math.ceil(data.length / 6);

  const hovered = active !== null ? data[active] : null;
  const summary = hovered
    ? `Week of ${fmt(hovered.week)}: ${hovered.benign + hovered.malignant} ${hovered.benign + hovered.malignant === 1 ? "scan" : "scans"} (${hovered.benign} benign, ${hovered.malignant} malignant)`
    : `${totalScans} ${totalScans === 1 ? "scan" : "scans"} in the last ${range} weeks`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/*fixed size so the hover text can never wrap or push the chart around (that caused the flicker)*/}
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold" style={serif}>Scans over time</h3>
          <p aria-live="polite" className="min-h-[2.5rem] text-[13px] text-text/70">{failed ? "" : summary}</p>
        </div>

        <div role="radiogroup" aria-label="Time range" className="flex shrink-0 gap-1 rounded-xl bg-surface p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={range === r}
              onClick={() => onRange(r)}
              className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                range === r ? "bg-primary text-white shadow-sm" : "text-text/70 hover:bg-accent/15"
              } ${focusRing}`}
            >
              {r} wks
            </button>
          ))}
        </div>
      </div>

      {failed ? (
        <p role="alert" className="rounded-xl border border-malignant/30 bg-malignant/5 p-3 text-[13px] text-malignant">
          Couldn't load your trends. Try refreshing the page.
        </p>
      ) : loading ? (
        <p className="py-10 text-center text-[13px] text-text/60">Loading...</p>
      ) : totalScans === 0 ? (
        <p className="py-10 text-center text-[13px] text-text/60">No scans in the last {range} weeks.</p>
      ) : (
        <>
          <div className="flex gap-2">
            {/* y axis numbers */}
            <div className="relative h-40 w-6 shrink-0 text-[11px] text-text/60" aria-hidden="true">
              {ticks.map((t) => (
                <span key={t} className="absolute right-0 translate-y-1/2" style={{ bottom: `${(t / top) * 100}%` }}>{t}</span>
              ))}
            </div>

            <div className="relative h-40 min-w-0 flex-1">
              {/* grid lines */}
              {ticks.map((t) => (
                <div key={t} aria-hidden="true" className="absolute inset-x-0 border-t border-text/10" style={{ bottom: `${(t / top) * 100}%` }} />
              ))}

              {/* bars */}
              <div className="absolute inset-0 flex items-end gap-1">
                {data.map((w, i) => (
                  <button
                    key={w.week}
                    type="button"
                    aria-label={`Week of ${fmt(w.week)}: ${w.benign} benign, ${w.malignant} malignant`}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    onClick={() => setActive(active === i ? null : i)}
                    className={`flex h-full min-w-0 flex-1 flex-col justify-end rounded-sm transition-opacity ${focusRing}`}
                    style={{ opacity: active === null || active === i ? 1 : 0.5 }}
                  >
                    <div className="w-full max-w-[32px] self-center bg-malignant" style={{ height: `${(w.malignant / top) * 100}%` }} />
                    <div className="w-full max-w-[32px] self-center bg-benign" style={{ height: `${(w.benign / top) * 100}%` }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* x axis dates */}
          <div className="flex gap-2" aria-hidden="true">
            <div className="w-6 shrink-0" />
            <div className="flex min-w-0 flex-1 gap-1">
              {data.map((w, i) => (
                <span key={w.week} className="flex min-w-0 flex-1 justify-center whitespace-nowrap text-[11px] text-text/60">
                  {i % every === 0 ? fmt(w.week) : ""}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[13px] text-text/70">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-benign" aria-hidden="true" />Benign</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-malignant" aria-hidden="true" />Malignant</span>
            <span className="text-text/50">Each bar is one week</span>
          </div>
        </>
      )}
    </div>
  );
}