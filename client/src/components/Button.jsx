// Button — filled (primary) or outline (secondary)
export default function Button({ variant = "primary", type = "button", onClick, children, disabled }) {
  //colors come from the theme variables so they switch with dark mode, bg-white and text-white on a light fill did not
  const styles =
    variant === "primary"
      ? "bg-primary text-white"
      : "bg-bg text-text border border-primary";

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