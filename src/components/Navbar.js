import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="fh-navbar">
      <div className="fh-navbar-inner">
        <Link to="/" className="fh-logo">
          FilmHive
        </Link>
        <nav className="fh-nav-links">
          <NavLink to="/films">Films</NavLink>
          {/* Later: <NavLink to="/login">Login</NavLink> etc. */}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
