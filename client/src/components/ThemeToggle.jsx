import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const KEY = "theme";

//is dark mode on? only if the user turned it on, the default is light
function isDarkNow() {
  return document.documentElement.dataset.theme === "dark";
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

const sun = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const moon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

//compact = small round icon button for a navbar, otherwise it is a full row like the profile action list
export default function ThemeToggle({ compact = false }) {
  const [dark, setDark] = useState(isDarkNow);

  //switches the page right away, remembers it in the browser, and saves it to the account
  //when nobody is logged in the page still switches
  function toggle() {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch { /* private mode, theme just won't be remembered */ }
    setDark(!dark);
    fetch(`${API_BASE_URL}/api/me`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: next }),
    }).catch(() => {});
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-surface text-primary transition-colors hover:bg-accent/20 ${focusRing}`}
      >
        {dark ? sun : moon}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={dark}
      className={`group flex w-full items-center gap-3 rounded-xl bg-bg px-3 py-3 text-left transition-colors hover:bg-accent/15 ${focusRing}`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/30 text-primary">
        {dark ? moon : sun}
      </span>
      <span className="flex-1">
        <span className="block font-semibold">Dark mode</span>
        <span className="block text-[13px] text-text/60">{dark ? "On" : "Off"}</span>
      </span>
      {/* the switch itself */}
      <span aria-hidden="true" className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${dark ? "bg-primary" : "bg-text/20"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${dark ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}