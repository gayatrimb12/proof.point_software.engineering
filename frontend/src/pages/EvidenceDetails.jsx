
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getEvidenceById } from "../utils/evidenceStorage";
function EvidenceDetails() {
  const { id, evidenceId } = useParams();
  const evidence = getEvidenceById(id, evidenceId);

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <div className="mb-4">
          <Link
            to={`/case/${id}`}
            className="btn btn-outline-secondary"
          >
            Back to Case
          </Link>
        </div>

        <div className="case-card">
          <div className="p-4">
            <h1 className="page-title mb-3">
              Evidence Details
            </h1>

            <div className="section-label mb-3">
              Evidence ID: {evidenceId}
            </div>

            <div className="mb-3">
              <strong>Evidence Name:</strong> {evidence?.name || "Not available"}
            </div>

            <div className="mb-3">
              <strong>Evidence Type:</strong> {evidence?.type || "Not available"}
            </div>

            <div className="mb-3">
              <strong>Date of Evidence:</strong> {evidence?.date || "Not available"}
            </div>

            <div className="mb-3">
              <strong>Description:</strong> {evidence?.description || "Not available"}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default EvidenceDetails;
