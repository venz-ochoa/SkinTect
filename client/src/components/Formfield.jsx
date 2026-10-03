import { useId } from "react";

// FormField — a labeled text input (for Login / Profile later)
//icon, placeholder, autoComplete, required and right are all optional, so old usage still works
//right is anything you want inside the end of the input, like a show password button
export default function FormField({ label, type = "text", value, onChange, icon, placeholder, autoComplete, required, right }) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1 text-text">
      <label htmlFor={id} className="font-medium">{label}</label>
      <div className="relative">
        {icon && <img src={icon} alt="" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`w-full rounded-xl border border-accent bg-bg py-3 placeholder:text-text/40 hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 ${icon ? "pl-10" : "pl-3"} ${right ? "pr-12" : "pr-3"}`}
        />
        {right && <div className="absolute right-2 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
    </div>
  );
}