import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function ShareCase() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Viewer");

  const [users, setUsers] = useState([
    {
      email: "owner@example.com",
      role: "Owner",
    },
    {
      email: "collaborator@example.com",
      role: "Editor",
    },
  ]);

  const addUser = (e) => {
    e.preventDefault();

    if (!email) return;

    setUsers([
      ...users,
      {
        email,
        role,
      },
    ]);

    setEmail("");
  };

  const removeUser = (index) => {
    setUsers(
      users.filter((_, i) => i !== index)
    );
  };

  return (
    <>
      <Navbar />

      <div className="container py-5">
        <div
          className="card shadow-sm p-4 mx-auto"
          style={{ maxWidth: "850px" }}
        >
          <div className="d-flex justify-content-between">
            <div>
              <h2 className="fw-bold">
                Share Case
              </h2>

              <p className="text-muted">
                Apartment Dispute
              </p>
            </div>

            <button
              className="btn btn-outline-secondary align-self-start"
              onClick={() => navigate("/case/1")}
            >
              Back to Case
            </button>
          </div>

          <hr />

          <h5 className="fw-bold">
            Add a User
          </h5>

          <form
            onSubmit={addUser}
            className="row g-2 mb-4"
          >
            <div className="col-md-7">
              <input
                type="email"
                className="form-control"
                placeholder="Registered user's email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
              >
                <option>Viewer</option>
                <option>Editor</option>
              </select>
            </div>

            <div className="col-md-2">
              <button
                className="btn btn-primary w-100"
                type="submit"
              >
                Add
              </button>
            </div>
          </form>

          <h5 className="fw-bold">
            People With Access
          </h5>

          {users.map((user, index) => (
            <div
              className="card p-3 mb-2"
              key={index}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{user.email}</strong>

                  <div>
                    <span className="badge bg-secondary mt-1">
                      {user.role}
                    </span>
                  </div>
                </div>

                {user.role !== "Owner" && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() =>
                      removeUser(index)
                    }
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default ShareCase;