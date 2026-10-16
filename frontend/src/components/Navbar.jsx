import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-dark proof-navbar px-4 py-3">
      <div className="container-fluid">
        <Link
          to="/dashboard"
          className="navbar-brand d-flex align-items-center gap-2"
        >
          <div className="brand-mark">P</div>

          <div>
            <div className="fw-bold fs-4 lh-1">
              ProofPoint
            </div>
            <small className="text-white-50">
              Evidence organized clearly
            </small>
          </div>
        </Link>

        <div className="d-flex gap-2">
          <Link
            className="btn btn-light"
            to="/dashboard"
          >
            Dashboard
          </Link>

          <Link
            className="btn btn-outline-light"
            to="/"
          >
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;