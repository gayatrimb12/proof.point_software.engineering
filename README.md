# ProofPoint

ProofPoint is a web application for organizing evidence into structured cases and chronological timelines.

The goal of ProofPoint is to help users keep screenshots, documents, photos, receipts, messages, and other supporting records in one place so they can clearly understand what happened, when it happened, who was involved, and what evidence supports each event.

## Key Features

- Create and manage cases
- Upload and organize evidence
- Add evidence details such as type, date, description, and related person
- Build chronological case timelines
- Link evidence to timeline events
- Search and filter evidence
- Detect possible duplicate evidence uploads
- Track timeline events that are missing supporting evidence
- View case completeness
- Edit and delete evidence
- Edit and delete timeline events
- Share cases with collaborators
- User authentication and role-based case permissions

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Bootstrap
- CSS

### Backend

- Flask
- SQLAlchemy
- SQLite
- Flask-Migrate
- Flask-CORS

### Testing and Development

- Git
- GitHub
- Vitest
- Pytest

## Project Structure

```text
proof.point_software.engineering/
│
├── backend/
│   ├── routes/
│   │   ├── auth.py
│   │   ├── cases.py
│   │   ├── evidence.py
│   │   └── timeline.py
│   │
│   ├── tests/
│   ├── app.py
│   ├── config.py
│   ├── models.py
│   ├── permissions.py
│   ├── requirements.txt
│   └── seed.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── tests/
│   │   ├── utils/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   └── package.json
│
└── README.md
```

## Setup

Clone the repository:

```bash
git clone https://github.com/gayatrimb12/proof.point_software.engineering.git
cd proof.point_software.engineering
```

## Backend Setup

Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r backend/requirements.txt
```

Seed the database:

```bash
python3 -m backend.seed
```

To completely reset and reseed the database:

```bash
python3 -m backend.seed --reset
```

Start the Flask backend:

```bash
python3 -m backend.app
```

The backend will run at:

```text
http://127.0.0.1:5000
```

The API health check is available at:

```text
http://127.0.0.1:5000/api/health
```

## Frontend Setup

Open another terminal and move into the frontend folder:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev -- --host 127.0.0.1
```

The frontend will run at:

```text
http://127.0.0.1:5173
```

## Demo Accounts

The seeded database includes demo users for local testing.

| User | Email | Password |
|---|---|---|
| Alice | alice@proofpoint.dev | password123 |
| Bob | bob@proofpoint.dev | password123 |
| Admin | admin@proofpoint.dev | password123 |

## Main Workflow

A typical ProofPoint workflow is:

1. Log in to the application
2. Create a case
3. Upload evidence
4. Add evidence information
5. Create timeline events
6. Link evidence to timeline events
7. Review missing supporting evidence
8. View case completeness
9. Edit or update case information as needed

## Case Completeness

ProofPoint tracks whether timeline events have supporting evidence.

The case completeness percentage is based on how many timeline events have at least one linked evidence item.

For example:

```text
3 supported events out of 4 total events = 75% complete
```

Events without linked evidence are shown as missing supporting evidence.

## Duplicate Evidence Detection

Uploaded files are hashed by the backend.

If a file with the same content has already been uploaded to the same case, ProofPoint can identify it as a possible duplicate.

## Authentication and Permissions

ProofPoint uses session-based authentication.

Cases support different membership roles so access can be controlled between owners, editors, and viewers.

Users only have access to cases they are authorized to view or modify.

## Testing

Backend tests can be run from the repository root using:

```bash
pytest
```

Frontend tests can be run from the `frontend` folder using:

```bash
npm test
```

## Team Project

ProofPoint was developed as a Software Engineering group project.

The application combines frontend development, backend API development, authentication, database design, evidence management, timeline management, testing, and collaborative GitHub development.

## Future Improvements

Possible future improvements include:

- Additional case-sharing controls
- More detailed audit history
- File previews
- More advanced search and filtering
- Notifications
- Additional case analytics
- Cloud file storage
- Exportable case reports
- Improved accessibility and mobile support
