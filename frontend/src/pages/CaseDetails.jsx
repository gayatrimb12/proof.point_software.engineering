import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getEvidence } from "../utils/evidenceStorage";

function CaseDetails() {
  const evidenceItems = getEvidence().filter(
    (item) => String(item.caseId) === "1"
  );
  return (
    <>
      <Navbar />

      <main className="page-shell">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 mb-4">
          <div>
            <div className="section-label mb-2">
              Case Overview
            </div>

            <div className="d-flex align-items-center gap-3">
              <h1 className="page-title mb-0">
                Apartment Dispute
              </h1>

              <span className="status-pill">
                Active
              </span>
            </div>

            <p className="page-subtitle mt-2 mb-0">
              Housing
            </p>
          </div>

          <button className="btn btn-outline-secondary">
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
              Evidence related to an apartment maintenance issue.
            </p>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-4">
          <Link
            to="/case/1/upload"
            className="btn btn-primary"
          >
            + Upload Evidence
          </Link>

          <Link
            to="/case/1/timeline"
            className="btn btn-outline-primary"
          >
            View Timeline
          </Link>

          <Link
            to="/case/1/share"
            className="btn btn-outline-primary"
          >
            Share Case
          </Link>

          <button className="btn btn-outline-danger ms-md-auto">
            Delete Case
          </button>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="stat-box">
              <div className="section-label">
                Evidence Items
              </div>

              <div className="fs-3 fw-bold">
                {evidenceItems.length}
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-box">
              <div className="section-label">
                Timeline Events
              </div>

              <div className="fs-3 fw-bold">
                3
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-box">
              <div className="section-label">
                Missing Evidence
              </div>

              <div className="fs-3 fw-bold text-danger">
                1
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <div className="section-label">
              Evidence
            </div>

            <h2 className="h4 fw-bold mb-0">
              Case Evidence
            </h2>
          </div>
        </div>

        <div className="search-panel mb-4">
          <div className="row g-2">
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Search evidence..."
              />
            </div>

            <div className="col-md-3">
              <select className="form-select">
                <option>All Types</option>
                <option>Photo</option>
                <option>Document</option>
                <option>Screenshot</option>
                <option>Receipt</option>
              </select>
            </div>

            <div className="col-md-3">
              <select className="form-select">
                <option>Newest First</option>
                <option>Oldest First</option>
              </select>
            </div>
          </div>
        </div>
        {evidenceItems.map((item) => (
          <div className="case-card mb-3" key={item.id}>
            <div className="p-4">
              <h5 className="fw-bold">{item.name}</h5>

              <p className="text-muted">
                {item.type} • {item.date}
              </p>

              <p>{item.description}</p>

              <Link
                to={`/case/${item.caseId}/evidence/${item.id}`}
                className="btn btn-sm btn-outline-primary"
              >
                View
              </Link>
            </div>
          </div>
        ))}
        <div className="case-card mb-3">
          <div className="p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
              <div>
                <div className="section-label mb-1">
                  Photo • August 6
                </div>

                <h5 className="fw-bold">
                  Photo of Damage.jpg
                </h5>

                <p className="text-muted mb-0">
                  Photo showing damage in the apartment.
                </p>
              </div>

              <div className="d-flex gap-2 align-items-start">
                <Link
                  to="/case/1/evidence/1"
                  className="btn btn-sm btn-outline-primary"
                >
                  View
                </Link>

                <button className="btn btn-sm btn-outline-secondary">
                  Edit
                </button>

                <button className="btn btn-sm btn-outline-danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="case-card mb-4">
          <div className="p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
              <div>
                <div className="section-label mb-1">
                  Document • August 8
                </div>

                <h5 className="fw-bold">
                  Repair Request.pdf
                </h5>

                <p className="text-muted mb-0">
                  Email requesting maintenance assistance.
                </p>
              </div>

              <div className="d-flex gap-2 align-items-start">
                <button className="btn btn-sm btn-outline-primary">
                  View
                </button>

                <button className="btn btn-sm btn-outline-secondary">
                  Edit
                </button>

                <button className="btn btn-sm btn-outline-danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="case-card">
          <div className="p-4">
            <div className="section-label mb-2">
              Timeline Preview
            </div>

            <div className="border-start border-3 border-primary ps-3 mb-3">
              <strong>August 3 — Initial Complaint</strong>
              <div className="text-muted">
                Message Screenshot.png
              </div>
            </div>

            <div className="border-start border-3 border-primary ps-3 mb-3">
              <strong>August 6 — Property Damage</strong>
              <div className="text-muted">
                Damage Photo.jpg
              </div>
            </div>

            <div className="border-start border-3 border-danger ps-3">
              <strong>
                August 8 — Follow-up Request
              </strong>

              <div className="text-danger">
                Missing supporting evidence
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default CaseDetails;