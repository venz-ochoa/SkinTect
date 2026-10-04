import { useState } from "react";

// Button — filled (primary) or outline (secondary), now with a click ripple. same props as before
export default function Button({ variant = "primary", type = "button", onClick, children, disabled }) {
  const [drops, setDrops] = useState([]);
  const styles = variant === "primary" ? "bg-primary text-white" : "bg-bg text-text border border-primary";

  function press(e) {
    const b = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setDrops((d) => [...d, { id, x: e.clientX - b.left, y: e.clientY - b.top }]);
    setTimeout(() => setDrops((d) => d.filter((q) => q.id !== id)), 600);
    onClick?.(e);
  }

  return (
    <button type={type} onClick={press} disabled={disabled} className={`relative overflow-hidden px-4 py-2 rounded-md disabled:opacity-50 ${styles}`}>
      {children}
      {drops.map((d) => (
        <span key={d.id} aria-hidden="true" className="pointer-events-none absolute h-10 w-10 rounded-full bg-current opacity-15" style={{ left: d.x - 20, top: d.y - 20, animation: "st-ripple .6s ease-out forwards" }} />
      ))}
    </button>
  );
}