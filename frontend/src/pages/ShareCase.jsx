import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

function ShareCase() {
  const { id } = useParams();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Viewer");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [collaborators, setCollaborators] = useState([
    {
      id: 1,
      email: "owner@example.com",
      role: "Owner",
    },
    {
      id: 2,
      email: "collaborator@example.com",
      role: "Editor",
    },
  ]);

  const handleAddCollaborator = (event) => {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter an email address.");
      setSuccess("");
      return;
    }

    if (!cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      setSuccess("");
      return;
    }

    const alreadyExists = collaborators.some(
      (person) =>
        person.email.toLowerCase() === cleanEmail
    );

    if (alreadyExists) {
      setError("This user is already a collaborator.");
      setSuccess("");
      return;
    }

    const newCollaborator = {
      id: Date.now(),
      email: cleanEmail,
      role,
    };

    setCollaborators([
      ...collaborators,
      newCollaborator,
    ]);

    setEmail("");
    setRole("Viewer");
    setError("");
    setSuccess("Collaborator added successfully.");
  };

  const handleRoleChange = (userId, newRole) => {
    const updatedCollaborators =
      collaborators.map((person) =>
        person.id === userId
          ? { ...person, role: newRole }
          : person
      );

    setCollaborators(updatedCollaborators);
    setSuccess("Collaborator role updated.");
    setError("");
  };

  const handleRemove = (userId) => {
    const person = collaborators.find(
      (item) => item.id === userId
    );

    if (!person || person.role === "Owner") {
      return;
    }

    const confirmed = window.confirm(
      `Remove ${person.email} from this case?`
    );

    if (!confirmed) {
      return;
    }

    setCollaborators(
      collaborators.filter(
        (item) => item.id !== userId
      )
    );

    setSuccess("Collaborator removed.");
    setError("");
  };

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <div className="mb-4">
          <div className="section-label mb-2">
            Case Sharing
          </div>

          <h1 className="page-title mb-2">
            Share Case
          </h1>

          <p className="page-subtitle mb-0">
            Add collaborators and control what they can do.
          </p>
        </div>

        <div className="case-card mb-4">
          <div className="case-card-top" />

          <div className="p-4">
            <h2 className="h5 fw-bold mb-3">
              Add Collaborator
            </h2>

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}

            <form onSubmit={handleAddCollaborator}>
              <div className="row g-3">
                <div className="col-md-7">
                  <label className="form-label fw-semibold">
                    Email Address
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Role
                  </label>

                  <select
                    className="form-select"
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value)
                    }
                  >
                    <option value="Viewer">
                      Viewer
                    </option>

                    <option value="Editor">
                      Editor
                    </option>
                  </select>
                </div>

                <div className="col-md-2 d-flex align-items-end">
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="case-card">
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <div className="section-label">
                  Access
                </div>

                <h2 className="h5 fw-bold mb-0">
                  Current Collaborators
                </h2>
              </div>

              <span className="text-muted">
                {collaborators.length} users
              </span>
            </div>

            <div className="d-flex flex-column gap-3">
              {collaborators.map((person) => (
                <div
                  key={person.id}
                  className="border rounded-3 p-3"
                >
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div>
                      <div className="fw-semibold">
                        {person.email}
                      </div>

                      <small className="text-muted">
                        {person.role === "Owner"
                          ? "Case owner"
                          : "Case collaborator"}
                      </small>
                    </div>

                    <div className="d-flex gap-2">
                      {person.role === "Owner" ? (
                        <span className="badge text-bg-dark p-2">
                          Owner
                        </span>
                      ) : (
                        <>
                          <select
                            className="form-select form-select-sm"
                            value={person.role}
                            onChange={(event) =>
                              handleRoleChange(
                                person.id,
                                event.target.value
                              )
                            }
                          >
                            <option value="Viewer">
                              Viewer
                            </option>

                            <option value="Editor">
                              Editor
                            </option>
                          </select>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleRemove(person.id)
                            }
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Link
                to={`/case/${id}`}
                className="btn btn-outline-secondary"
              >
                Back to Case
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default ShareCase;