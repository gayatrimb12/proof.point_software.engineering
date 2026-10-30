import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getEvidence } from "../utils/evidenceStorage";

function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Evidence added by the evidence management feature.
  // Use the current case ID instead of hardcoding case 1.
  const evidenceItems = getEvidence().filter(
    (item) => String(item.caseId) === String(id)
  );

  const [caseData, setCaseData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    const savedCases =
      JSON.parse(localStorage.getItem("proofpointCases")) || [];

    const selectedCase = savedCases.find(
      (item) => String(item.id) === String(id)
    );

    if (selectedCase) {
      setCaseData(selectedCase);
      setEditTitle(selectedCase.title || "");
      setEditCategory(selectedCase.category || "");
      setEditStatus(selectedCase.status || "Active");
      setEditDescription(selectedCase.description || "");
    }
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditTitle(caseData.title || "");
    setEditCategory(caseData.category || "");
    setEditStatus(caseData.status || "Active");
    setEditDescription(caseData.description || "");
    setIsEditing(false);
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!editTitle.trim() || !editCategory.trim()) {
      alert("Please enter a case title and category.");
      return;
    }

    const savedCases =
      JSON.parse(localStorage.getItem("proofpointCases")) || [];

    const updatedCase = {
      ...caseData,
      title: editTitle,
      category: editCategory,
      status: editStatus,
      description: editDescription,
      updated: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };

    const updatedCases = savedCases.map((item) =>
      String(item.id) === String(id) ? updatedCase : item
    );

    localStorage.setItem(
      "proofpointCases",
      JSON.stringify(updatedCases)
    );

    setCaseData(updatedCase);
    setIsEditing(false);

    alert("Case updated successfully.");
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this case? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    const savedCases =
      JSON.parse(localStorage.getItem("proofpointCases")) || [];

    const remainingCases = savedCases.filter(
      (item) => String(item.id) !== String(id)
    );

    localStorage.setItem(
      "proofpointCases",
      JSON.stringify(remainingCases)
    );

    navigate("/dashboard");
  };

  if (!caseData) {
    return (
      <>
        <Navbar />

        <main className="page-shell">
          <div className="case-card">
            <div className="p-4 text-center">
              <h2 className="fw-bold">Case not found</h2>

              <p className="text-muted">
                This case may have been deleted or does not exist.
              </p>

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
                    type="text"
                    className="form-control"
                    value={editTitle}
                    onChange={(event) =>
                      setEditTitle(event.target.value)
                    }
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Category
                    </label>

                    <select
                      className="form-select"
                      value={editCategory}
                      onChange={(event) =>
                        setEditCategory(event.target.value)
                      }
                    >
                      <option value="">
                        Select Category
                      </option>

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

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Status
                    </label>

                    <select
                      className="form-select"
                      value={editStatus}
                      onChange={(event) =>
                        setEditStatus(event.target.value)
                      }
                    >
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

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Description
                  </label>

                  <textarea
                    className="form-control"
                    rows="4"
                    value={editDescription}
                    onChange={(event) =>
                      setEditDescription(event.target.value)
                    }
                    placeholder="Enter case description"
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
                    onClick={handleCancel}
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

                <div className="d-flex align-items-center gap-3">
                  <h1 className="page-title mb-0">
                    {caseData.title}
                  </h1>

                  <span className="status-pill">
                    {caseData.status || "Active"}
                  </span>
                </div>

                <p className="page-subtitle mt-2 mb-0">
                  {caseData.category}
                </p>
              </div>

              <button
                className="btn btn-outline-secondary"
                onClick={handleEdit}
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

        {/* Evidence added through the upload/evidence storage feature */}
        {evidenceItems.map((item) => (
          <div
            className="case-card mb-3"
            key={item.id}
          >
            <div className="p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                <div>
                  <div className="section-label mb-1">
                    {item.type} • {item.date}
                  </div>

                  <h5 className="fw-bold">
                    {item.name}
                  </h5>

                  <p className="text-muted mb-0">
                    {item.description}
                  </p>
                </div>

                <div className="d-flex gap-2 align-items-start">
                  <Link
                    to={`/case/${item.caseId}/evidence/${item.id}`}
                    className="btn btn-sm btn-outline-primary"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Existing sample evidence */}
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
              <strong>
                August 3 — Initial Complaint
              </strong>

              <div className="text-muted">
                Message Screenshot.png
              </div>
            </div>

            <div className="border-start border-3 border-primary ps-3 mb-3">
              <strong>
                August 6 — Property Damage
              </strong>

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