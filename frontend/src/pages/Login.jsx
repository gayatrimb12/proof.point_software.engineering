import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/login",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Login failed."
        );
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="case-card">
            <div className="case-card-top" />

            <div className="p-4">
              <div className="section-label mb-2">
                ProofPoint
              </div>

              <h1 className="page-title mb-2">
                Welcome Back
              </h1>

              <p className="page-subtitle mb-4">
                Log in to manage your cases and evidence.
              </p>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Email
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="alice@proofpoint.dev"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Password
                  </label>

                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading
                    ? "Logging in..."
                    : "Login"}
                </button>
              </form>

              <div className="text-center mt-4">
                <span className="text-muted">
                  Don't have an account?{" "}
                </span>

                <Link to="/register">
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;