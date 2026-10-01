// FormField — a labeled text input (for Login / Profile later)
export default function FormField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-text">
      {label}
      <input
        value={value}
        onChange={onChange}
        className="px-3 py-2 rounded-md border border-accent"
      />
    </label>
  );
}