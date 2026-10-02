import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//this is for navigation
//instead of creating a single clickable text for the nav bar, we just map it instead
const LINKS = [
  { to: "/", label: "Home" },
  { to: "/signup", label: "Sign up" },     
  { to: "/login", label: "Log in" },
];

export default function NavBar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/me`, { credentials: "include" })
      .then((r) => r.json())
      .then(setUser);
  }, []);

  //navbar is hidden when the page is in login or signup mode
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  const links = user ? [{ to: "/", label: "Home" }, { to: "/profile", label: "Profile" }] : LINKS;

  return (
    <nav className="flex gap-6 p-4 border-b border-surface">
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) => (isActive ? "font-bold text-primary" : "text-text")}>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}