import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import Navbar from "../components/Navbar";

import {
  getCaseById,
  getCaseTimeline,
  uploadEvidence,
} from "../utils/api";

function UploadEvidence() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);

  const [title, setTitle] = useState("");
  const [evidenceType, setEvidenceType] =
    useState("Image");
  const [dateAssigned, setDateAssigned] =
    useState("");
  const [linkedPerson, setLinkedPerson] =
    useState("");
  const [eventId, setEventId] = useState("");
  const [description, setDescription] =
    useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] =
    useState(true);
  const [error, setError] = useState("");
  const [duplicateWarning, setDuplicateWarning] =
    useState("");

  useEffect(() => {
    const loadPage = async () => {
      try {
        setPageLoading(true);
        setError("");

        const [caseResponse, timelineResponse] =
          await Promise.all([
            getCaseById(id),
            getCaseTimeline(id),
          ]);

        setCaseData(
          caseResponse.case || caseResponse
        );

        setTimelineEvents(
          timelineResponse.timeline_events ||
            timelineResponse.events ||
            (Array.isArray(timelineResponse)
              ? timelineResponse
              : [])
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setPageLoading(false);
      }
    };

    loadPage();
  }, [id]);

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0] || null;

    setFile(selectedFile);
    setDuplicateWarning("");

    if (selectedFile && !title) {
      const filename =
        selectedFile.name.replace(
          /\.[^/.]+$/,
          ""
        );

      setTitle(filename);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError(
        "Please enter an evidence title."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setDuplicateWarning("");

      const formData = new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "evidence_type",
        evidenceType
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "linked_person",
        linkedPerson.trim()
      );

      if (dateAssigned) {
        formData.append(
          "date_assigned",
          dateAssigned
        );
      }

      if (eventId) {
        formData.append(
          "event_ids",
          eventId
        );
      }

      if (file) {
        formData.append(
          "file",
          file
        );
      }

      const result =
        await uploadEvidence(
          id,
          formData
        );

      if (
        result.duplicate_of &&
        result.duplicate_of.length > 0
      ) {
        setDuplicateWarning(
          `Possible duplicate detected. Matching evidence ID: ${result.duplicate_of.join(
            ", "
          )}`
        );

        setLoading(false);
        return;
      }

      navigate(`/case/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <>
        <Navbar />

        <main className="page-shell text-center">
          <div
            className="spinner-border text-primary"
            role="status"
          />

          <p className="text-muted mt-3">
            Loading upload form...
          </p>
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
            Upload Evidence
          </h1>

          <p className="page-subtitle mb-0">
            Case:{" "}
            {caseData?.title ||
              `Case ${id}`}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {duplicateWarning && (
          <div className="alert alert-warning">
            <strong>
              Duplicate warning:
            </strong>{" "}
            {duplicateWarning}

            <div className="mt-2">
              The evidence was still saved, but ProofPoint found another file with the same content.
            </div>

            <button
              className="btn btn-sm btn-outline-dark mt-3"
              onClick={() =>
                navigate(`/case/${id}`)
              }
            >
              Return to Case
            </button>
          </div>
        )}

        <div className="case-card">
          <div className="case-card-top" />

          <div className="p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Evidence File
                </label>

                <input
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                />

                <div className="form-text">
                  Upload an image, document, receipt, screenshot, or other supporting file.
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Evidence Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="Example: Damage Photo"
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
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

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Date
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

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Related Timeline Event
                </label>

                <select
                  className="form-select"
                  value={eventId}
                  onChange={(event) =>
                    setEventId(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Do not link to an event
                  </option>

                  {timelineEvents.map(
                    (event) => (
                      <option
                        value={event.id}
                        key={event.id}
                      >
                        {event.title}
                      </option>
                    )
                  )}
                </select>

                <div className="form-text">
                  Linking evidence to an event helps improve the case completeness score.
                </div>
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
                  placeholder="Describe what this evidence shows and why it is important."
                />
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Uploading..."
                    : "Save Evidence"}
                </button>

                <Link
                  to={`/case/${id}`}
                  className="btn btn-outline-secondary"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

export default UploadEvidence;