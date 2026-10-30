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
      description: "Evidence related to an apartment maintenance issue.",
      evidenceCount: 3,
      updated: "October 15, 2026",
    },
    {
      id: 2,
      title: "Damaged Package",
      category: "Product Issue",
      status: "Active",
      description: "Evidence related to a damaged package delivery.",
      evidenceCount: 2,
      updated: "October 13, 2026",
    },
  ];

  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const savedCases = localStorage.getItem("proofpointCases");

    if (savedCases === null) {
      localStorage.setItem(
        "proofpointCases",
        JSON.stringify(starterCases)
      );

      setCases(starterCases);
    } else {
      setCases(JSON.parse(savedCases));
    }
  }, []);

  const filteredCases = cases.filter((item) => {
  const searchText =
    `${item.title} ${item.category} ${item.status}`.toLowerCase();

  const matchesSearch =
    searchText.includes(search.toLowerCase());

  const matchesStatus =
    statusFilter === "All" ||
    item.status === statusFilter;

  return matchesSearch && matchesStatus;
});

  const activeCases = cases.filter(
    (item) => item.status === "Active"
  ).length;

  const totalEvidence = cases.reduce(
    (total, item) => total + (item.evidenceCount || 0),
    0
  );

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
          <div>
            <div className="section-label mb-2">
              Case Management
            </div>

            <h1 className="page-title mb-2">
              My Cases
            </h1>

            <p className="page-subtitle mb-0">
              Organize your evidence and manage your case timelines.
            </p>
          </div>

          <Link
            to="/create-case"
            className="btn btn-primary"
          >
            + Create New Case
          </Link>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="stat-box h-100">
              <div className="section-label mb-1">
                Total Cases
              </div>

              <div className="fs-2 fw-bold">
                {cases.length}
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-box h-100">
              <div className="section-label mb-1">
                Active Cases
              </div>

              <div className="fs-2 fw-bold">
                {activeCases}
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-box h-100">
              <div className="section-label mb-1">
                Evidence Items
              </div>

              <div className="fs-2 fw-bold">
                {totalEvidence}
              </div>
            </div>
          </div>
        </div>

        <div className="search-panel mb-4">
  <div className="row g-2">
    <div className="col-md-8">
      <input
        type="text"
        className="form-control"
        placeholder="Search cases by title, category, or status..."
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
      />
    </div>

    <div className="col-md-4">
      <select
        className="form-select"
        value={statusFilter}
        onChange={(event) =>
          setStatusFilter(event.target.value)
        }
      >
        <option value="All">
          All Statuses
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

        {cases.length === 0 ? (
          <div className="case-card">
            <div className="p-5 text-center">
              <div className="section-label mb-2">
                No Cases
              </div>

              <h2 className="h4 fw-bold">
                You do not have any cases yet.
              </h2>

              <p className="text-muted mb-4">
                Create your first case to start organizing evidence.
              </p>

              <Link
                to="/create-case"
                className="btn btn-primary"
              >
                Create First Case
              </Link>
            </div>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="case-card">
            <div className="p-4 text-center">
              <h5 className="fw-bold">
                No matching cases
              </h5>

              <p className="text-muted mb-0">
                Try a different search.
              </p>
            </div>
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
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                      <div>
                        <div className="section-label mb-1">
                          {item.category}
                        </div>

                        <h2 className="h4 fw-bold mb-0">
                          {item.title}
                        </h2>
                      </div>

                      <span className="status-pill">
                        {item.status || "Active"}
                      </span>
                    </div>

                    <p className="text-muted">
                      {item.description ||
                        "No description added."}
                    </p>

                    <div className="row g-2 mb-4">
                      <div className="col-6">
                        <div className="stat-box">
                          <div className="small text-muted">
                            Evidence
                          </div>

                          <div className="fw-bold">
                            {item.evidenceCount || 0} items
                          </div>
                        </div>
                      </div>

                      <div className="col-6">
                        <div className="stat-box">
                          <div className="small text-muted">
                            Last Updated
                          </div>

                          <div className="fw-bold">
                            {item.updated || "Not available"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/case/${item.id}`}
                      className="btn btn-outline-primary w-100"
                    >
                      View Case
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