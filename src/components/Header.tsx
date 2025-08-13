import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="site-title">
          <a href="/" className="brand-link">Colton Santiago</a>
        </div>

        {/* Desktop Nav */}
        <nav className="site-nav">
          <NavLink to="/" className="nav-link">Home</NavLink>
          <NavLink to="/projects" className="nav-link">Projects</NavLink>
          <NavLink to="/resume" className="nav-link">Resume</NavLink>
          <NavLink to="/contact" className="nav-link">Contact</NavLink>
        </nav>

        {/* Hamburger Button */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`} id="mobile-menu">
        <div className="mobile-menu-content">
          <NavLink to="/" className="mobile-link" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/projects" className="mobile-link" onClick={() => setMenuOpen(false)}>Projects</NavLink>
          <NavLink to="/resume" className="mobile-link" onClick={() => setMenuOpen(false)}>Resume</NavLink>
          <NavLink to="/contact" className="mobile-link" onClick={() => setMenuOpen(false)}>Contact</NavLink>
        </div>
      </div>
    </header>
  );
}
