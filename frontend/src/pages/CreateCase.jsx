import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function CreateCase() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Active");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter a case title.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    setError("");

    const savedCases =
      JSON.parse(localStorage.getItem("proofpointCases")) || [];

    const newCase = {
      id: Date.now(),
      title: title.trim(),
      category,
      status,
      description: description.trim(),
      evidenceCount: 0,
      updated: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };

    const updatedCases = [...savedCases, newCase];

    localStorage.setItem(
      "proofpointCases",
      JSON.stringify(updatedCases)
    );

    navigate("/dashboard");
  };

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <div className="mb-4">
          <div className="section-label mb-2">
            Case Management
          </div>

          <h1 className="page-title mb-2">
            Create New Case
          </h1>

          <p className="page-subtitle">
            Add the basic information for your case.
            Evidence and timeline events can be added later.
          </p>
        </div>

        <div className="proof-card mx-auto">
          <div className="case-card-top" />

          <div className="p-4 p-md-5">
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Case Title
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Example: Apartment Dispute"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Category
                  </label>

                  <select
                    className="form-select"
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                  >
                    <option value="">
                      Select Category
                    </option>

                    <option value="Housing">
                      Housing
                    </option>

                    <option value="Product Issue">
                      Product Issue
                    </option>

                    <option value="Employment">
                      Employment
                    </option>

                    <option value="Insurance">
                      Insurance
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Status
                  </label>

                  <select
                    className="form-select"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value)
                    }
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Closed">
                      Closed
                    </option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Description
                </label>

                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Briefly describe what this case is about..."
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />
              </div>

              <div className="d-flex flex-column flex-sm-row gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Case
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    navigate("/dashboard")
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

export default CreateCase;