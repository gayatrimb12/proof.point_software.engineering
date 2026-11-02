
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getEvidenceById,
  updateEvidence,
} from "../utils/evidenceStorage";

function EditEvidence() {
  const { id, evidenceId } = useParams();
  const navigate = useNavigate();

  const [evidence, setEvidence] = useState(() =>
    getEvidenceById(id, evidenceId)
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setEvidence((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const updated = updateEvidence(id, evidenceId, {
      name: evidence.name,
      type: evidence.type,
      date: evidence.date,
      description: evidence.description,
    });

    if (updated) {
      navigate(`/case/${id}/evidence/${evidenceId}`);
    }
  };

  if (!evidence) {
    return (
      <>
        <Navbar />
        <main className="page-shell">
          <h1>Evidence Not Found</h1>
          <Link to={`/case/${id}`}>Back to Case</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <h1 className="page-title mb-4">Edit Evidence</h1>

        <form className="case-card p-4" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Evidence Name</label>
            <input
              className="form-control"
              name="name"
              value={evidence.name || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Evidence Type</label>
            <select
              className="form-select"
              name="type"
              value={evidence.type || "Photo"}
              onChange={handleChange}
            >
              <option>Photo</option>
              <option>Screenshot</option>
              <option>Document</option>
              <option>Receipt</option>
              <option>Email</option>
              <option>Other</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Date of Evidence</label>
            <input
              type="date"
              className="form-control"
              name="date"
              value={evidence.date || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              name="description"
              rows="4"
              value={evidence.description || ""}
              onChange={handleChange}
            />
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>

            <Link
              to={`/case/${id}/evidence/${evidenceId}`}
              className="btn btn-outline-secondary"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </>
  );
}

export default EditEvidence;
