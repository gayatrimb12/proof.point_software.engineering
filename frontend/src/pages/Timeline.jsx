import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Timeline() {
  const navigate = useNavigate();

  const events = [
    {
      date: "August 3",
      title: "Initial Complaint",
      description: "Sent a message about the apartment issue.",
      evidence: "Message Screenshot.png",
    },
    {
      date: "August 6",
      title: "Property Damage",
      description: "Uploaded a photo showing the damage.",
      evidence: "Damage Photo.jpg",
    },
    {
      date: "August 8",
      title: "Follow-up Request",
      description: "Sent another email requesting help.",
      evidence: null,
    },
  ];

  return (
    <>
      <Navbar />

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold">
              Case Timeline
            </h2>

            <p className="text-muted mb-0">
              Apartment Dispute
            </p>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary">
              + Add Event
            </button>

            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/case/1")}
            >
              Back to Case
            </button>
          </div>
        </div>

        {events.map((event, index) => (
          <div
            key={index}
            className="card shadow-sm p-4 mb-3"
          >
            <div className="row">
              <div className="col-md-2">
                <h5 className="fw-bold text-primary">
                  {event.date}
                </h5>
              </div>

              <div className="col-md-10">
                <h4>{event.title}</h4>

                <p>{event.description}</p>

                {event.evidence ? (
                  <div className="alert alert-success mb-2">
                    <strong>Linked Evidence:</strong>{" "}
                    {event.evidence}
                  </div>
                ) : (
                  <div className="alert alert-danger mb-2">
                    <strong>Missing Evidence</strong>
                    <br />
                    No supporting evidence has been
                    linked to this event.
                  </div>
                )}

                <button className="btn btn-sm btn-outline-secondary me-2">
                  Edit Event
                </button>

                <button className="btn btn-sm btn-outline-primary">
                  Link Evidence
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Timeline;