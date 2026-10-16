import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function CreateCase() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Active");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const storedCases =
      JSON.parse(
        localStorage.getItem("proofpointCases")
      ) || [];

    const newCase = {
      id: Date.now(),
      title,
      category,
      status,
      description,
      evidenceCount: 0,
      updated: new Date().toLocaleDateString(
        "en-US",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
        }
      ),
    };

    const updatedCases = [
      ...storedCases,
      newCase,
    ];

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
        <div
          className="card shadow-sm border-0 p-4 p-md-5 mx-auto"
          style={{ maxWidth: "820px" }}
        >
          <div className="section-label mb-2">
            Case Management
          </div>

          <h1 className="page-title mb-2">
            Create New Case
          </h1>

          <p className="page-subtitle mb-4">
            Add the basic information for the issue you want to track.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Case Name
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Example: Apartment Water Damage"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                required
              />
            </div>

            <div className="row">
              <div className="col-md-7 mb-3">
                <label className="form-label fw-semibold">
                  Category
                </label>

                <select
                  className="form-select"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Select category...
                  </option>

                  <option>Housing</option>
                  <option>Product Issue</option>
                  <option>Property Damage</option>
                  <option>Online Harassment</option>
                  <option>Refund Dispute</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="col-md-5 mb-3">
                <label className="form-label fw-semibold">
                  Status
                </label>

                <select
                  className="form-select"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                >
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Closed</option>
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
                placeholder="Describe what happened and what this case is about..."
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                required
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light px-4"
                onClick={() =>
                  navigate("/dashboard")
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary px-4"
              >
                Create Case
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default CreateCase;