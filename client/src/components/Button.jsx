// Button — filled (primary) or outline (secondary)
export default function Button({ variant = "primary", type = "button", onClick, children, disabled }) {
  const styles =
    variant === "primary"
      ? "bg-accent text-white"
      : "bg-white text-text border border-primary";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md disabled:opacity-50 ${styles}`}
    >
      {children}
    </button>
  );
}