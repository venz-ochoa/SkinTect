import { useRef } from "react";

//wrap any card: <Tilt><Card>...</Card></Tilt>. it leans toward the pointer in 3d and springs back on leave
export default function Tilt({ children, max = 5, className = "", style }) {
  const ref = useRef(null);
  function move(e) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const b = ref.current.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - 0.5;
    const y = (e.clientY - b.top) / b.height - 0.5;
    ref.current.style.transition = "transform .08s linear";
    ref.current.style.transform = `perspective(700px) rotateY(${x * max}deg) rotateX(${-y * max}deg) scale(1.01)`;
  }
  function leave() {
    ref.current.style.transition = "transform .6s cubic-bezier(.34,1.7,.5,1)";
    ref.current.style.transform = "";
  }
  return <div ref={ref} onPointerMove={move} onPointerLeave={leave} style={style} className={`will-change-transform ${className}`}>{children}</div>;
}