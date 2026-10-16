import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Dashboard() {
  const starterCases = [
    {
      id: 1,
      title: "Apartment Dispute",
      category: "Housing",
      status: "Active",
      evidenceCount: 3,
      updated: "October 15, 2026",
    },
    {
      id: 2,
      title: "Damaged Package",
      category: "Product Issue",
      status: "Active",
      evidenceCount: 2,
      updated: "October 13, 2026",
    },
  ];

  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const savedCases = JSON.parse(
      localStorage.getItem("proofpointCases")
    );

    if (savedCases && savedCases.length > 0) {
      setCases(savedCases);
    } else {
      localStorage.setItem(
        "proofpointCases",
        JSON.stringify(starterCases)
      );

      setCases(starterCases);
    }
  }, []);

  const filteredCases = cases.filter((item) =>
    `${item.title} ${item.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <div className="section-label mb-2">
              Case Management
            </div>

            <h1 className="page-title mb-2">
              My Cases
            </h1>

            <p className="page-subtitle mb-0">
              Keep your evidence, events, and case history organized.
            </p>
          </div>

          <Link
            to="/create-case"
            className="btn btn-primary px-4 py-2"
          >
            + Create New Case
          </Link>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="stat-box">
              <div className="section-label">
                Total Cases
              </div>

              <div className="fs-3 fw-bold">
                {cases.length}
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-box">
              <div className="section-label">
                Active Cases
              </div>

              <div className="fs-3 fw-bold">
                {
                  cases.filter(
                    (item) => item.status === "Active"
                  ).length
                }
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-box">
              <div className="section-label">
                Evidence Items
              </div>

              <div className="fs-3 fw-bold">
                {cases.reduce(
                  (sum, item) =>
                    sum + (item.evidenceCount || 0),
                  0
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="search-panel mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by case name or category..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {filteredCases.length === 0 ? (
          <div className="text-center py-5">
            <h4>No cases found</h4>
            <p className="text-muted">
              Try another search or create a new case.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredCases.map((item) => (
              <div
                className="col-lg-6"
                key={item.id}
              >
                <div className="case-card h-100">
                  <div className="case-card-top" />

                  <div className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h3 className="h4 fw-bold mb-1">
                          {item.title}
                        </h3>

                        <p className="text-muted mb-0">
                          {item.category}
                        </p>
                      </div>

                      <span className="status-pill">
                        {item.status}
                      </span>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <div className="stat-box">
                          <div className="section-label">
                            Evidence
                          </div>

                          <strong>
                            {item.evidenceCount || 0} items
                          </strong>
                        </div>
                      </div>

                      <div className="col-6">
                        <div className="stat-box">
                          <div className="section-label">
                            Last Updated
                          </div>

                          <strong className="small">
                            {item.updated}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/case/${item.id}`}
                      className="btn btn-outline-primary w-100"
                    >
                      Open Case
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default Dashboard;