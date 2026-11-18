import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import {
  deleteEvidence,
  getEvidenceById,
} from "../utils/api";

function EvidenceDetails() {
  const { id, evidenceId } = useParams();
  const navigate = useNavigate();

  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvidence = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getEvidenceById(evidenceId);

        setEvidence(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEvidence();
  }, [evidenceId]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this evidence?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEvidence(evidenceId);
      navigate(`/case/${id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="page-shell text-center">
          <div
            className="spinner-border text-primary"
            role="status"
          />

          <p className="text-muted mt-3">
            Loading evidence...
          </p>
        </main>
      </>
    );
  }

  if (!evidence) {
    return (
      <>
        <Navbar />

        <main className="page-shell">
          <div className="case-card">
            <div className="p-4 text-center">
              <h2 className="fw-bold">
                Evidence not found
              </h2>

              {error && (
                <p className="text-danger">
                  {error}
                </p>
              )}

              <Link
                to={`/case/${id}`}
                className="btn btn-primary"
              >
                Back to Case
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <div className="mb-4">
          <Link
            to={`/case/${id}`}
            className="btn btn-outline-secondary"
          >
            ← Back to Case
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="case-card">
          <div className="case-card-top" />

          <div className="p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
              <div>
                <div className="section-label mb-2">
                  Evidence Details
                </div>

                <h1 className="page-title mb-1">
                  {evidence.title}
                </h1>

                <p className="page-subtitle mb-0">
                  {evidence.evidence_type || "Other"}
                </p>
              </div>

              <div className="d-flex gap-2">
                <Link
                  to={`/case/${id}/evidence/${evidenceId}/edit`}
                  className="btn btn-outline-secondary"
                >
                  Edit Evidence
                </Link>

                <button
                  className="btn btn-outline-danger"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="stat-box h-100">
                  <div className="section-label">
                    Evidence Type
                  </div>

                  <div className="fw-semibold">
                    {evidence.evidence_type ||
                      "Not available"}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="stat-box h-100">
                  <div className="section-label">
                    Date
                  </div>

                  <div className="fw-semibold">
                    {formatDate(
                      evidence.date_assigned
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="stat-box h-100">
                  <div className="section-label">
                    Person Involved
                  </div>

                  <div className="fw-semibold">
                    {evidence.linked_person ||
                      "Not available"}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="stat-box h-100">
                  <div className="section-label">
                    File
                  </div>

                  <div className="fw-semibold">
                    {evidence.original_filename ||
                      "No file attached"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="section-label mb-2">
                Description
              </div>

              <p className="mb-0">
                {evidence.description ||
                  "No description added."}
              </p>
            </div>

            {(evidence.event_ids || []).length >
              0 && (
              <div className="mt-4">
                <div className="section-label mb-2">
                  Linked Timeline Events
                </div>

                <p className="mb-0">
                  Linked to{" "}
                  {evidence.event_ids.length}{" "}
                  timeline event
                  {evidence.event_ids.length === 1
                    ? ""
                    : "s"}
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default EvidenceDetails;