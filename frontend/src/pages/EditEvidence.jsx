import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import Navbar from "../components/Navbar";

import {
  getEvidenceById,
  updateEvidence,
} from "../utils/api";

function EditEvidence() {
  const { id, evidenceId } = useParams();
  const navigate = useNavigate();

  const [evidence, setEvidence] = useState(null);

  const [title, setTitle] = useState("");
  const [evidenceType, setEvidenceType] =
    useState("Image");
  const [dateAssigned, setDateAssigned] =
    useState("");
  const [linkedPerson, setLinkedPerson] =
    useState("");
  const [description, setDescription] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvidence = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getEvidenceById(evidenceId);

        setEvidence(data);

        setTitle(data.title || "");
        setEvidenceType(
          data.evidence_type || "Image"
        );

        setDateAssigned(
          data.date_assigned
            ? data.date_assigned.split("T")[0]
            : ""
        );

        setLinkedPerson(
          data.linked_person || ""
        );

        setDescription(
          data.description || ""
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEvidence();
  }, [evidenceId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError(
        "Please enter an evidence title."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateEvidence(evidenceId, {
        title: title.trim(),
        evidence_type: evidenceType,
        date_assigned:
          dateAssigned || null,
        linked_person:
          linkedPerson.trim(),
        description:
          description.trim(),
      });

      navigate(
        `/case/${id}/evidence/${evidenceId}`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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
                Evidence Not Found
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
          <div className="section-label mb-2">
            Evidence Management
          </div>

          <h1 className="page-title mb-2">
            Edit Evidence
          </h1>

          <p className="page-subtitle mb-0">
            Update the evidence information.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="case-card">
          <div className="case-card-top" />

          <form
            className="p-4"
            onSubmit={handleSubmit}
          >
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Evidence Name
              </label>

              <input
                className="form-control"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Evidence Type
              </label>

              <select
                className="form-select"
                value={evidenceType}
                onChange={(event) =>
                  setEvidenceType(
                    event.target.value
                  )
                }
              >
                <option value="Image">
                  Image
                </option>

                <option value="Document">
                  Document
                </option>

                <option value="Screenshot">
                  Screenshot
                </option>

                <option value="Receipt">
                  Receipt
                </option>

                <option value="Video">
                  Video
                </option>

                <option value="Email">
                  Email
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Date of Evidence
              </label>

              <input
                type="date"
                className="form-control"
                value={dateAssigned}
                onChange={(event) =>
                  setDateAssigned(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Person Involved
              </label>

              <input
                type="text"
                className="form-control"
                value={linkedPerson}
                onChange={(event) =>
                  setLinkedPerson(
                    event.target.value
                  )
                }
                placeholder="Example: Landlord"
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">
                Description
              </label>

              <textarea
                className="form-control"
                rows="4"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              <Link
                to={`/case/${id}/evidence/${evidenceId}`}
                className="btn btn-outline-secondary"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default EditEvidence;