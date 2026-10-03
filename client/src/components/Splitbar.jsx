//splitbar, one bar for benign vs malignant with an optional legend
//benign and malignant can be probabilities or counts, the bar works out the shares itself
export default function SplitBar({ benign, malignant, track = "bg-surface", legend = false, label }) {
  const total = benign + malignant || 1;
  const sides = [
    { name: "Benign", n: benign, bg: "bg-benign", text: "text-benign" },
    { name: "Malignant", n: malignant, bg: "bg-malignant", text: "text-malignant" },
  ];
  const pct = (n) => ((n / total) * 100).toFixed(1);

  return (
    <div>
      <div
        role="img"
        aria-label={label || `Benign ${pct(benign)} percent, malignant ${pct(malignant)} percent`}
        className={`flex h-3 w-full gap-0.5 overflow-hidden rounded-full ${track}`}
      >
        {sides.map((s) => s.n > 0 && <div key={s.name} className={`h-full ${s.bg} transition-all duration-500 st-grow`} style={{ width: `${(s.n / total) * 100}%` }} />)}
      </div>

      {legend && (
        <div className="mt-3 flex items-center justify-between text-base">
          {sides.map((s) => (
            <span key={s.name} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${s.bg}`} aria-hidden="true" />
              {s.name}
              <span className={`font-semibold ${s.text}`}>{pct(s.n)}%</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}