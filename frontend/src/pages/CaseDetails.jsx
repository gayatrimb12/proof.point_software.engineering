import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import Navbar from "../components/Navbar";

import {
  deleteCase,
  getCaseById,
  getCaseEvidence,
  getCaseTimeline,
  updateCase,
} from "../utils/api";

function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] =
    useState("All Types");
  const [sortOrder, setSortOrder] =
    useState("Newest First");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] =
    useState("");

  const loadCaseData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        caseResponse,
        evidenceResponse,
        timelineResponse,
      ] = await Promise.all([
        getCaseById(id),
        getCaseEvidence(id),
        getCaseTimeline(id),
      ]);

      const loadedCase =
        caseResponse.case || caseResponse;

      const loadedEvidence =
        evidenceResponse.evidence ||
        evidenceResponse.items ||
        (Array.isArray(evidenceResponse)
          ? evidenceResponse
          : []);

      const loadedTimeline =
        timelineResponse.timeline_events ||
        timelineResponse.events ||
        (Array.isArray(timelineResponse)
          ? timelineResponse
          : []);

      setCaseData(loadedCase);
      setEvidenceItems(loadedEvidence);
      setTimelineEvents(loadedTimeline);

      setEditTitle(loadedCase.title || "");
      setEditCategory(loadedCase.category || "");
      setEditDescription(
        loadedCase.description || ""
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaseData();
  }, [id]);

  const handleSave = async (event) => {
    event.preventDefault();

    if (!editTitle.trim() || !editCategory.trim()) {
      setError(
        "Please enter a case title and category."
      );
      return;
    }

    try {
      setError("");

      await updateCase(id, {
        title: editTitle.trim(),
        category: editCategory,
        description: editDescription.trim(),
      });

      await loadCaseData();

      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this case? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCase(id);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const normalizedEvidence = evidenceItems.map(
    (item) => ({
      ...item,
      name: item.title || item.name || "Untitled Evidence",
      type:
        item.evidence_type ||
        item.type ||
        "Other",
      date:
        item.date_assigned ||
        item.date ||
        item.created_at,
    })
  );

  const filteredEvidence = normalizedEvidence
    .filter((item) => {
      const matchesSearch =
        item.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesType =
        selectedType === "All Types" ||
        item.type === selectedType;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const first = new Date(a.date || 0);
      const second = new Date(b.date || 0);

      return sortOrder === "Newest First"
        ? second - first
        : first - second;
    });

  const missingEvidenceEvents =
    timelineEvents.filter((event) => {
      const evidenceIds =
        event.evidence_ids || [];

      return evidenceIds.length === 0;
    });

  const supportedEvents =
    timelineEvents.length -
    missingEvidenceEvents.length;

  const completeness =
    timelineEvents.length === 0
      ? 0
      : Math.round(
          (supportedEvents /
            timelineEvents.length) *
            100
        );

  const formatDate = (date) => {
    if (!date) {
      return "No date";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
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
            Loading case...
          </p>
        </main>
      </>
    );
  }

  if (!caseData) {
    return (
      <>
        <Navbar />

        <main className="page-shell">
          <div className="case-card">
            <div className="p-5 text-center">
              <h2 className="fw-bold">
                Case not found
              </h2>

              {error && (
                <p className="text-danger">
                  {error}
                </p>
              )}

              <Link
                to="/dashboard"
                className="btn btn-primary"
              >
                Return to Dashboard
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
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {isEditing ? (
          <div className="case-card mb-4">
            <div className="case-card-top" />

            <div className="p-4">
              <div className="section-label mb-2">
                Edit Case
              </div>

              <h2 className="h4 fw-bold mb-4">
                Update Case Information
              </h2>

              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Case Title
                  </label>

                  <input
                    className="form-control"
                    value={editTitle}
                    onChange={(event) =>
                      setEditTitle(
                        event.target.value
                      )
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
                    value={editCategory}
                    onChange={(event) =>
                      setEditCategory(
                        event.target.value
                      )
                    }
                  >
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
                    rows="4"
                    value={editDescription}
                    onChange={(event) =>
                      setEditDescription(
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Save Changes
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setIsEditing(false)
                    }
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 mb-4">
              <div>
                <div className="section-label mb-2">
                  Case Overview
                </div>

                <h1 className="page-title mb-1">
                  {caseData.title}
                </h1>

                <p className="page-subtitle mb-0">
                  {caseData.category}
                </p>
              </div>

              <button
                className="btn btn-outline-secondary"
                onClick={() =>
                  setIsEditing(true)
                }
              >
                Edit Case
              </button>
            </div>

            <div className="case-card mb-4">
              <div className="case-card-top" />

              <div className="p-4">
                <div className="section-label mb-2">
                  Description
                </div>

                <p className="mb-0">
                  {caseData.description ||
                    "No description has been added yet."}
                </p>
              </div>
            </div>
          </>
        )}

        <div className="d-flex flex-wrap gap-2 mb-4">
          <Link
            to={`/case/${id}/upload`}
            className="btn btn-primary"
          >
            + Upload Evidence
          </Link>

          <Link
            to={`/case/${id}/timeline`}
            className="btn btn-outline-primary"
          >
            View Timeline
          </Link>

          <Link
            to={`/case/${id}/share`}
            className="btn btn-outline-primary"
          >
            Share Case
          </Link>

          <button
            className="btn btn-outline-danger ms-md-auto"
            onClick={handleDelete}
          >
            Delete Case
          </button>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="stat-box h-100">
              <div className="section-label">
                Evidence Items
              </div>

              <div className="fs-3 fw-bold">
                {evidenceItems.length}
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="stat-box h-100">
              <div className="section-label">
                Timeline Events
              </div>

              <div className="fs-3 fw-bold">
                {timelineEvents.length}
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="stat-box h-100">
              <div className="section-label">
                Missing Evidence
              </div>

              <div
                className={`fs-3 fw-bold ${
                  missingEvidenceEvents.length > 0
                    ? "text-danger"
                    : "text-success"
                }`}
              >
                {missingEvidenceEvents.length}
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="stat-box h-100">
              <div className="section-label">
                Case Completeness
              </div>

              <div className="fs-3 fw-bold">
                {completeness}%
              </div>
            </div>
          </div>
        </div>

        <div className="case-card mb-4">
          <div className="p-4">
            <div className="d-flex justify-content-between mb-2">
              <strong>Case Health</strong>

              <span>{completeness}% complete</span>
            </div>

            <div
              className="progress"
              style={{ height: "10px" }}
            >
              <div
                className="progress-bar"
                style={{
                  width: `${completeness}%`,
                }}
              />
            </div>

            <small className="text-muted d-block mt-2">
              {missingEvidenceEvents.length === 0
                ? "Every timeline event has supporting evidence."
                : `${missingEvidenceEvents.length} timeline event${
                    missingEvidenceEvents.length === 1
                      ? ""
                      : "s"
                  } still need supporting evidence.`}
            </small>
          </div>
        </div>

        <div className="mb-3">
          <div className="section-label">
            Evidence
          </div>

          <h2 className="h4 fw-bold mb-0">
            Case Evidence
          </h2>
        </div>

        <div className="search-panel mb-4">
          <div className="row g-2">
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Search evidence..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={selectedType}
                onChange={(event) =>
                  setSelectedType(
                    event.target.value
                  )
                }
              >
                <option>All Types</option>
                <option>Image</option>
                <option>Document</option>
                <option>Photo</option>
                <option>Screenshot</option>
                <option>Receipt</option>
              </select>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(
                    event.target.value
                  )
                }
              >
                <option>Newest First</option>
                <option>Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {filteredEvidence.length === 0 ? (
          <div className="case-card">
            <div className="p-5 text-center">
              <h5 className="fw-bold">
                No evidence found
              </h5>

              <p className="text-muted mb-3">
                Upload evidence to start building this case.
              </p>

              <Link
                to={`/case/${id}/upload`}
                className="btn btn-primary"
              >
                Upload Evidence
              </Link>
            </div>
          </div>
        ) : (
          filteredEvidence.map((item) => (
            <div
              className="case-card mb-3"
              key={item.id}
            >
              <div className="p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                  <div>
                    <div className="section-label mb-1">
                      {item.type} •{" "}
                      {formatDate(item.date)}
                    </div>

                    <h5 className="fw-bold">
                      {item.name}
                    </h5>

                    <p className="text-muted mb-0">
                      {item.description ||
                        "No description added."}
                    </p>
                  </div>

                  <div>
                    <Link
                      to={`/case/${id}/evidence/${item.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        <div className="case-card mt-4">
          <div className="p-4">
            <div className="section-label mb-3">
              Timeline Preview
            </div>

            {timelineEvents.length === 0 ? (
              <p className="text-muted mb-0">
                No timeline events yet.
              </p>
            ) : (
              timelineEvents
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.event_date) -
                    new Date(b.event_date)
                )
                .slice(0, 4)
                .map((event) => {
                  const hasEvidence =
                    (event.evidence_ids || [])
                      .length > 0;

                  return (
                    <div
                      key={event.id}
                      className={`border-start border-3 ps-3 mb-3 ${
                        hasEvidence
                          ? "border-primary"
                          : "border-danger"
                      }`}
                    >
                      <strong>
                        {formatDate(
                          event.event_date
                        )}{" "}
                        — {event.title}
                      </strong>

                      <div
                        className={
                          hasEvidence
                            ? "text-muted"
                            : "text-danger"
                        }
                      >
                        {hasEvidence
                          ? `${
                              event.evidence_ids
                                .length
                            } supporting evidence item${
                              event.evidence_ids
                                .length === 1
                                ? ""
                                : "s"
                            }`
                          : "Missing supporting evidence"}
                      </div>
                    </div>
                  );
                })
            )}

            <Link
              to={`/case/${id}/timeline`}
              className="btn btn-sm btn-outline-primary mt-2"
            >
              View Full Timeline
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

export default CaseDetails;