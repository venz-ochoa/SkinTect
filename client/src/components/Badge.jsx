// Badge — small colored label showing the result and confidence
export default function Badge({ label, confidence }) {
  const color = label === "benign" ? "text-benign" : "text-malignant";
  const pct = Math.round(confidence * 100);

  return (
    <span className={`text-sm font-bold ${color}`}>
      {label} · {pct}%
    </span>
  );
}