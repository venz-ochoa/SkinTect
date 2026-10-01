import { NavLink } from "react-router-dom";

//this is for navigation
//instead of creating a single clickable text for the nav bar, we just map it instead
const LINKS = [
  { to: "/", label: "Home" },
  { to: "/signup", label: "Sign up" },     
  { to: "/login", label: "Log in" },
];

export default function NavBar() {
  return (
    <nav className="flex gap-6 p-4 border-b border-surface">
      {LINKS.map(({ to, label }) => (
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