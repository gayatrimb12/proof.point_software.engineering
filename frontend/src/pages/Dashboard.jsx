import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";

import { getCases } from "../utils/api";

function Dashboard() {
  const [cases, setCases] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadCases = async () => {
      try {
        setLoading(true);

        setError("");

        const data =
          await getCases();

        setCases(
          data.cases || []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  const filteredCases =
    cases.filter((item) => {
      const searchText =
        `${item.title || ""} ${item.category || ""}`.toLowerCase();

      const matchesSearch =
        searchText.includes(
          search.toLowerCase()
        );

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  const activeCases =
    cases.filter(
      (item) =>
        !item.status ||
        item.status === "Active"
    ).length;

  const totalEvidence =
    cases.reduce(
      (total, item) =>
        total +
        (item.evidence_count || 0),
      0
    );

  const totalTimelineEvents =
    cases.reduce(
      (total, item) =>
        total +
        (item.timeline_event_count || 0),
      0
    );

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  return (
    <>
      <Navbar />

      <main className="page-shell">

        {/* HERO */}

        <div className="dashboard-hero mb-5">
          <div className="dashboard-hero-content">
            <div>
              <div className="hero-badge mb-3">
                ProofPoint Workspace
              </div>

              <h1 className="dashboard-title">
                Your cases,
                organized.
              </h1>

              <p className="dashboard-description">
                Keep evidence,
                timelines, and
                important case
                details together in
                one organized
                workspace.
              </p>
            </div>

            <Link
              to="/create-case"
              className="btn btn-light dashboard-create-btn"
            >
              + Create New Case
            </Link>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}

        {/* STATS */}

        <div className="row g-3 mb-5">
          <div className="col-md-4">
            <div className="stat-box">
              <div className="section-label mb-1">
                Total Cases
              </div>

              <div className="fs-2">
                {cases.length}
              </div>

              <div className="text-muted small">
                Cases in your workspace
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-box">
              <div className="section-label mb-1">
                Evidence Items
              </div>

              <div className="fs-2">
                {totalEvidence}
              </div>

              <div className="text-muted small">
                Supporting records
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-box">
              <div className="section-label mb-1">
                Timeline Events
              </div>

              <div className="fs-2">
                {totalTimelineEvents}
              </div>

              <div className="text-muted small">
                Events documented
              </div>
            </div>
          </div>
        </div>

        {/* CASES HEADER */}

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-3">
          <div>
            <div className="section-label mb-1">
              Case Management
            </div>

            <h2 className="h3 fw-bold mb-1">
              My Cases
            </h2>

            <p className="text-muted mb-0">
              Search and manage your
              case records.
            </p>
          </div>
        </div>

        {/* SEARCH */}

        <div className="search-panel mb-4">
          <div className="row g-2">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Search by case title or category..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All Cases
                </option>

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
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="case-card">
            <div className="p-5 text-center">
              <div
                className="spinner-border text-primary mb-3"
                role="status"
              />

              <p className="text-muted mb-0">
                Loading your cases...
              </p>
            </div>
          </div>
        ) : cases.length === 0 ? (
          /* NO CASES */

          <div className="case-card">
            <div className="empty-state">
              <div className="section-label mb-2">
                No Cases
              </div>

              <h3 className="fw-bold">
                Create your first case
              </h3>

              <p>
                Start organizing
                evidence and timeline
                events in one place.
              </p>

              <Link
                to="/create-case"
                className="btn btn-primary"
              >
                + Create Case
              </Link>
            </div>
          </div>
        ) : filteredCases.length === 0 ? (
          /* NO SEARCH RESULTS */

          <div className="case-card">
            <div className="empty-state">
              <h4 className="fw-bold">
                No matching cases
              </h4>

              <p className="mb-0">
                Try a different
                search.
              </p>
            </div>
          </div>
        ) : (
          /* CASE CARDS */

          <div className="row g-4">
            {filteredCases.map(
              (item) => (
                <div
                  className="col-lg-6"
                  key={item.id}
                >
                  <div className="case-card h-100">
                    <div className="case-card-top" />

                    <div className="p-4">
                      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                        <div>
                          <div className="section-label mb-2">
                            {item.category ||
                              "Case"}
                          </div>

                          <h3 className="h4 fw-bold mb-0">
                            {item.title}
                          </h3>
                        </div>

                        <span className="status-pill">
                          {item.status ||
                            "Active"}
                        </span>
                      </div>

                      <p className="text-muted mb-4">
                        {item.description ||
                          "No description added."}
                      </p>

                      <div className="row g-2 mb-4">
                        <div className="col-4">
                          <div className="stat-box">
                            <div className="section-label">
                              Evidence
                            </div>

                            <div className="fw-bold mt-1">
                              {item.evidence_count ||
                                0}
                            </div>
                          </div>
                        </div>

                        <div className="col-4">
                          <div className="stat-box">
                            <div className="section-label">
                              Timeline
                            </div>

                            <div className="fw-bold mt-1">
                              {item.timeline_event_count ||
                                0}
                            </div>
                          </div>
                        </div>

                        <div className="col-4">
                          <div className="stat-box">
                            <div className="section-label">
                              Updated
                            </div>

                            <div className="small fw-semibold mt-1">
                              {formatDate(
                                item.updated_at
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Link
                        to={`/case/${item.id}`}
                        className="btn btn-outline-primary w-100"
                      >
                        View Case →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </main>
    </>
  );
}

export default Dashboard;