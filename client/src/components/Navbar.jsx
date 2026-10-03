import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";

//this is for navigation
//instead of creating a single clickable text for the nav bar, we just map it instead
const LINKS = [
  { to: "/", label: "Home" },
  { to: "/signup", label: "Sign up" },
  { to: "/login", label: "Log in" },
];

export default function NavBar({ user }) {
  //this is for the UI, checks whether the hamburger menu is open on mobile
  const [open, setOpen] = useState(false);

  //useLocation makes the navbar recheck the route on every page change
  const location = useLocation();

  //navbar is hidden when the page is in login or signup mode
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

    const links = user ? [{ to: "/", label: "Home" }, { to: "/profile", label: "Profile" }] : LINKS;
    const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
  return (
    <header className="st-drop border-b border-text/20 bg-bg">
      {/*nav animations, switched off for reduced motion*/}
      <style>{`
        @keyframes st-drop { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: none; } }
        @keyframes st-menu { from { opacity: 0; transform: translateY(-8px) scale(.98); } to { opacity: 1; transform: none; } }
        @keyframes st-icon { from { opacity: 0; transform: rotate(-90deg) scale(.6); } to { opacity: 1; transform: none; } }
        .st-drop { animation: st-drop .5s cubic-bezier(.2, .7, .2, 1) backwards; }
        .st-menu { animation: st-menu .3s cubic-bezier(.2, .7, .2, 1) backwards; transform-origin: top; }
        .st-icon { animation: st-icon .3s cubic-bezier(.2, .7, .2, 1) backwards; }
        @media (prefers-reduced-motion: reduce) { .st-drop, .st-menu, .st-icon { animation: none; } }
      `}</style>
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-y-2 px-4 py-4 md:px-6">
        <Link
          to="/"
          className={`rounded text-2xl font-bold tracking-tight text-text ${focusRing}`}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          SkinTect
        </Link>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className={`rounded-lg border border-text/40 p-2 text-text md:hidden ${focusRing}`}
        >
          <svg key={String(open)} className="st-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <nav
          id="main-nav"
          aria-label="Main"
          className={`${open ? "flex st-menu" : "hidden"} w-full flex-col gap-1 rounded-xl bg-surface p-1 ring-1 ring-text/15 md:flex md:w-auto md:flex-row`}
        >
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-base transition-colors ${focusRing} ${
                  isActive
                    ? "bg-bg font-semibold text-text shadow-sm ring-1 ring-text/20"
                    : "text-text/80 hover:bg-bg/70 hover:text-text"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}