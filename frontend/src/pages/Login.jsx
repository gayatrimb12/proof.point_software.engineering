import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow p-4 proof-card w-100">
        <div className="text-center mb-4">
          <h1 className="fw-bold">ProofPoint</h1>
          <p className="text-muted">
            Organize your evidence. Build a clear timeline.
          </p>
        </div>

        <h3 className="text-center mb-4">Log In</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="text-end mb-3">
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none"
            >
              Forgot password?
            </button>
          </div>

          <button className="btn btn-primary w-100" type="submit">
            Log In
          </button>
        </form>

        <p className="text-center mt-4 mb-0">
          Don't have an account?{" "}
          <Link to="/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;