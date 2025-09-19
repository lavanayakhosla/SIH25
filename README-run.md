# Run instructions (exact)

Prereqs:
- Node 16+
- npm
- Docker & docker-compose (for Postgres + Elasticsearch dev)

1) Start infra (Postgres + Elasticsearch)
   From repo root:
   $ docker-compose up -d
   Wait ~20-30s for ES to start.

2) Backend
   $ cd backend
   $ npm install
   $ npm run ingest    # ingests backend/samples/namaste_sample.csv into ES and writes samples/namaste_codesystem.json
   $ npm start         # starts backend at http://localhost:3000

3) Frontend
   Open a new terminal:
   $ cd frontend
   $ npm install
   $ npm start
   The frontend dev server will open (likely http://localhost:3000 or 3001). Proxy is set to backend.

4) Try it
   - Open frontend UI, search e.g. "Gulma"
   - Translate → Add → Build Bundle → Upload Bundle
   - Or call backend APIs directly:
     GET http://localhost:3000/health
     GET http://localhost:3000/namaste/codesystem
     GET http://localhost:3000/search?q=gulma
     POST http://localhost:3000/$translate (FHIR Parameters)
     POST http://localhost:3000/fhir/Bundle (Bundle JSON)
