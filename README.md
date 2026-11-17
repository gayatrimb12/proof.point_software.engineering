# ProofPoint

Software Engineering Group Project

ProofPoint is a web application for organizing evidence into case timelines.

- **Frontend:** React + Vite (`frontend/`) — `http://localhost:5173`
- **Backend:** Flask + SQLAlchemy + SQLite (`backend/`) — `http://localhost:5000`

---

## Setup & Run

Run backend commands **from the repository root**:

```bash
python -m venv .venv
source .venv/bin/activate            #Fish: source .venv/bin/activate.fish | Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt

python -m backend.seed
flask --app backend.app run --debug