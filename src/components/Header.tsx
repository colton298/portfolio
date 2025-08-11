import { NavLink } from "react-router-dom";

export default function Header() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    "nav-link" + (isActive ? " active" : "");

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <div className="brand">
          {/* Use NavLink so it works under a subpath (GitHub Pages) */}
          <NavLink to="/" className="brand-link">Colton Santiago</NavLink>
        </div>

        <nav className="nav">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/projects" className={linkClass}>Projects</NavLink>
          <NavLink to="/resume" className={linkClass}>Resume</NavLink>
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>
          <NavLink to="/login" className={linkClass}>Login</NavLink>
        </nav>
      </div>
    </header>
  );
}
