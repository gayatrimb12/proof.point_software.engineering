import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { saveEvidence } from "../utils/evidenceStorage";

function UploadEvidence() {
  const navigate = useNavigate();

  const [fileName, setFileName] = useState("");
  const [evidenceName, setEvidenceName] = useState("");
  const [evidenceType, setEvidenceType] = useState("");
  const [evidenceDate, setEvidenceDate] = useState("");
  const [personInvolved, setPersonInvolved] = useState("");
  const [relatedEvent, setRelatedEvent] = useState("");
  const [description, setDescription] = useState("");
  const [duplicate, setDuplicate] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];

    if (file) {
      setFileName(file.name);

      // Temporary duplicate demo until backend is connected
      if (file.name.toLowerCase().includes("damage")) {
        setDuplicate(true);
      } else {
        setDuplicate(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newEvidence = saveEvidence({
      caseId: "1",
      name: evidenceName,
      type: evidenceType || "Photo",
      date: evidenceDate,
      personInvolved,
      relatedEvent,
      description,
      fileName,
  });

  navigate(`/case/1/evidence/${newEvidence.id}`);
};

  return (
    <>
      <Navbar />

      <div className="container py-5">
        <div
          className="card shadow-sm p-4 mx-auto"
          style={{ maxWidth: "800px" }}
        >
          <h2 className="fw-bold">Upload Evidence</h2>

          <p className="text-muted">
            Case: Apartment Dispute
          </p>

          {duplicate && (
            <div className="alert alert-warning">
              <strong>Possible Duplicate Evidence</strong>
              <br />
              A file with a similar name may already exist in this case.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                Choose File
              </label>

              <input
                type="file"
                className="form-control"
                onChange={handleFile}
                required
              />

              {fileName && (
                <small className="text-muted">
                  Selected: {fileName}
                </small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">
                Evidence Name
              </label>

              <input
                type="text"
                className="form-control"
                value={evidenceName}
                onChange={(e) => setEvidenceName(e.target.value)}
                placeholder="Enter evidence name"
                required
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Evidence Type
                </label>

                <select 
                  className="form-select"
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                >
                  <option>Photo</option>
                  <option>Screenshot</option>
                  <option>Document</option>
                  <option>Receipt</option>
                  <option>Email</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Date of Evidence
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={evidenceDate}
                  onChange={(e) => setEvidenceDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">
                Person Involved
              </label>

              <input
                type="text"
                className="form-control"
                value={personInvolved}
                onChange={(e) => setPersonInvolved(e.target.value)}
                placeholder="Example: Landlord"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Related Event
              </label>

              <select 
                className="form-select"
                value={relatedEvent}
                onChange={(e) => setRelatedEvent(e.target.value)}
              >
                <option>No event selected</option>
                <option>Initial Complaint</option>
                <option>Property Damage</option>
                <option>Follow-up Request</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label">
                Evidence Description
              </label>

              <textarea
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                placeholder="Describe what this evidence shows..."
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/case/1")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
              >
                Save Evidence
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default UploadEvidence;