import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import Navbar from "../components/Navbar";

import {
  createTimelineEvent,
  deleteTimelineEvent,
  getCaseById,
  getCaseEvidence,
  getCaseTimeline,
  updateTimelineEvent,
} from "../utils/api";

function Timeline() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [events, setEvents] = useState([]);
  const [evidenceItems, setEvidenceItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] =
    useState(null);

  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] =
    useState("");
  const [selectedEvidence, setSelectedEvidence] =
    useState([]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        caseResponse,
        timelineResponse,
        evidenceResponse,
      ] = await Promise.all([
        getCaseById(id),
        getCaseTimeline(id),
        getCaseEvidence(id),
      ]);

      setCaseData(
        caseResponse.case || caseResponse
      );

      setEvents(
        timelineResponse.events ||
          timelineResponse.timeline_events ||
          []
      );

      setEvidenceItems(
        evidenceResponse.evidence || []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, [id]);

  const resetForm = () => {
    setTitle("");
    setEventDate("");
    setDescription("");
    setSelectedEvidence([]);
    setEditingEventId(null);
    setShowForm(false);
  };

  const handleEvidenceToggle = (evidenceId) => {
    setSelectedEvidence((current) =>
      current.includes(evidenceId)
        ? current.filter(
            (item) => item !== evidenceId
          )
        : [...current, evidenceId]
    );
  };

  const handleEdit = (event) => {
    setEditingEventId(event.id);
    setTitle(event.title || "");
    setEventDate(
      event.event_date
        ? event.event_date.split("T")[0]
        : ""
    );
    setDescription(event.description || "");
    setSelectedEvidence(
      event.evidence_ids || []
    );
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim() || !eventDate) {
      setError(
        "Please enter an event title and date."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: title.trim(),
        event_date: eventDate,
        description: description.trim(),
        evidence_ids: selectedEvidence,
      };

      if (editingEventId) {
        await updateTimelineEvent(
          id,
          editingEventId,
          payload
        );
      } else {
        await createTimelineEvent(
          id,
          payload
        );
      }

      resetForm();
      await loadTimeline();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this timeline event?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteTimelineEvent(
        id,
        eventId
      );

      await loadTimeline();
    } catch (err) {
      setError(err.message);
    }
  };

  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(a.event_date) -
      new Date(b.event_date)
  );

  const formatDate = (date) => {
    if (!date) {
      return "No date";
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
            Loading timeline...
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
          <div>
            <div className="section-label mb-2">
              Case Timeline
            </div>

            <h1 className="page-title mb-2">
              {caseData?.title || "Timeline"}
            </h1>

            <p className="page-subtitle mb-0">
              Track what happened and connect supporting evidence to each event.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + Add Event
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {showForm && (
          <div className="case-card mb-4">
            <div className="case-card-top" />

            <div className="p-4">
              <div className="section-label mb-2">
                {editingEventId
                  ? "Edit Timeline Event"
                  : "New Timeline Event"}
              </div>

              <h2 className="h4 fw-bold mb-4">
                {editingEventId
                  ? "Update Event"
                  : "Add Event"}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Event Title
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
                    placeholder="Example: Follow-up Request"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Event Date
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    value={eventDate}
                    onChange={(event) =>
                      setEventDate(
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Description
                  </label>

                  <textarea
                    className="form-control"
                    rows="3"
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    placeholder="Describe what happened."
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Supporting Evidence
                  </label>

                  {evidenceItems.length === 0 ? (
                    <div className="alert alert-light border">
                      No evidence has been uploaded for this case yet.
                    </div>
                  ) : (
                    <div className="border rounded p-3">
                      {evidenceItems.map(
                        (item) => (
                          <div
                            className="form-check mb-2"
                            key={item.id}
                          >
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`evidence-${item.id}`}
                              checked={selectedEvidence.includes(
                                item.id
                              )}
                              onChange={() =>
                                handleEvidenceToggle(
                                  item.id
                                )
                              }
                            />

                            <label
                              className="form-check-label"
                              htmlFor={`evidence-${item.id}`}
                            >
                              {item.title}
                              <span className="text-muted ms-2">
                                (
                                {item.evidence_type}
                                )
                              </span>
                            </label>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  <div className="form-text">
                    Events without supporting evidence will appear as missing evidence on the case overview.
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingEventId
                        ? "Save Changes"
                        : "Add Event"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {sortedEvents.length === 0 ? (
          <div className="case-card">
            <div className="p-5 text-center">
              <h4 className="fw-bold">
                No timeline events yet
              </h4>

              <p className="text-muted">
                Add the first event to start building the case timeline.
              </p>

              <button
                className="btn btn-primary"
                onClick={() =>
                  setShowForm(true)
                }
              >
                + Add First Event
              </button>
            </div>
          </div>
        ) : (
          <div className="case-card">
            <div className="p-4">
              {sortedEvents.map(
                (event, index) => {
                  const evidence =
                    event.evidence || [];

                  const hasEvidence =
                    evidence.length > 0 ||
                    (
                      event.evidence_ids || []
                    ).length > 0;

                  return (
                    <div
                      key={event.id}
                      className={`ps-4 position-relative ${
                        index !==
                        sortedEvents.length -
                          1
                          ? "border-start border-2 pb-4"
                          : "border-start border-2"
                      }`}
                    >
                      <div
                        className={`position-absolute rounded-circle ${
                          hasEvidence
                            ? "bg-primary"
                            : "bg-danger"
                        }`}
                        style={{
                          width: "14px",
                          height: "14px",
                          left: "-8px",
                          top: "6px",
                        }}
                      />

                      <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                        <div>
                          <div className="section-label mb-1">
                            {formatDate(
                              event.event_date
                            )}
                          </div>

                          <h3 className="h5 fw-bold">
                            {event.title}
                          </h3>

                          <p className="text-muted">
                            {event.description ||
                              "No description added."}
                          </p>

                          {hasEvidence ? (
                            <div className="mt-2">
                              <div className="small fw-semibold mb-1">
                                Supporting Evidence
                              </div>

                              {evidence.length >
                              0 ? (
                                evidence.map(
                                  (item) => (
                                    <Link
                                      key={
                                        item.id
                                      }
                                      to={`/case/${id}/evidence/${item.id}`}
                                      className="badge text-bg-light border text-decoration-none me-2"
                                    >
                                      {
                                        item.title
                                      }
                                    </Link>
                                  )
                                )
                              ) : (
                                <span className="text-success small">
                                  Evidence linked
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-danger small fw-semibold">
                              Missing supporting evidence
                            </div>
                          )}
                        </div>

                        <div className="d-flex gap-2 align-items-start">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              handleEdit(
                                event
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDelete(
                                event.id
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

        <div className="mt-4">
          <button
            className="btn btn-outline-secondary"
            onClick={() =>
              navigate(`/case/${id}`)
            }
          >
            ← Back to Case
          </button>
        </div>
      </main>
    </>
  );
}

export default Timeline;