import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(
        "http://127.0.0.1:5000/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error("Logout failed:", error);
    }

    navigate("/");
  };

  return (
    <nav className="proof-navbar">
      <div className="navbar-inner">
        <Link
          to="/dashboard"
          className="proof-brand"
        >
          <div className="brand-mark">
            P
          </div>

          <div className="brand-copy">
            <div className="brand-name">
              ProofPoint
            </div>

            <div className="brand-tagline">
              Evidence. Timeline. Clarity.
            </div>
          </div>
        </Link>

        <div className="navbar-actions">
          <Link
            to="/dashboard"
            className="navbar-link"
          >
            Dashboard
          </Link>

          <button
            type="button"
            className="navbar-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;