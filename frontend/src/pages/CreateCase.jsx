import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createCase } from "../utils/api";

function CreateCase() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter a case title.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await createCase({
        title: title.trim(),
        category,
        description: description.trim(),
      });

      const createdCase =
        result.case || result;

      if (createdCase?.id) {
        navigate(`/case/${createdCase.id}`);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Category
                </label>

                <select
                  className="form-select"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  required
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
                  disabled={loading}
                >
                  {loading
                    ? "Creating..."
                    : "Create Case"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    navigate("/dashboard")
                  }
                  disabled={loading}
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