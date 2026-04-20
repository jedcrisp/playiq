# PlayIQ

MVP web app for football coaches: capture a defensive look, pick a matchup to attack, and receive rule-based offensive concept recommendations with coaching context.

## Stack

- **Frontend:** React, Vite, Tailwind CSS (`frontend/`)
- **Backend:** FastAPI (`backend/`)
- **Engine:** Python package `recommendation_engine/` (rule packs + matcher)

## Prerequisites

- **Frontend:** Node.js 20+ (or 18 LTS with npm)
- **Backend:** either **Docker** (recommended) or **Python 3.11+**
- **Database:** PostgreSQL 16+ (included in `docker compose`)

## Environment variables

Backend (`api` service / local shell):

- `DATABASE_URL` (required): e.g. `postgresql+psycopg://playiq:playiq@localhost:5432/playiq`
- `JWT_SECRET_KEY` (required for real deployments; dev default exists)
- `ACCESS_TOKEN_EXPIRE_MINUTES` (optional, default `60`)
- `FIREBASE_PROJECT_ID` (required for Google SSO token verification endpoint `/api/auth/google`)
- `AI_PROVIDER` (optional, default `openai`)
- `AI_API_KEY` (required for real model responses; fallback mode works without it)
- `AI_MODEL` (optional, default `gpt-4o-mini`)
- `AI_BASE_URL` (optional, default `https://api.openai.com/v1`)
- `CORS_ALLOW_ORIGINS` (optional): comma-separated browser origins for production, e.g. `https://your-app.vercel.app`
- `CORS_ALLOW_ORIGIN_REGEX` (optional): extra allowed-origin regex OR’d with localhost (e.g. `https://.*\\.vercel\\.app` for all Vercel previews)

Frontend:

- `VITE_API_URL` (optional; leave unset in local dev to use Vite proxy)
- `VITE_FIREBASE_*` keys in `frontend/.env.local` for Google popup sign-in

## Run locally

### 1. Backend API + PostgreSQL

**Option A — Docker (recommended)**

From the repository root:

```bash
docker compose up --build
```

Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

**Option B — Python on your machine**

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql+psycopg://playiq:playiq@localhost:5432/playiq"
export JWT_SECRET_KEY="dev-only-change-me"
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Same app as `uvicorn backend.app.main:app`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` and `/health` to the backend on port 8000.

For `npm run preview` or a static host without a proxy, set `VITE_API_URL` (see `frontend/.env.example`) so the browser calls the API directly; CORS allows localhost on any port.

### Production build (optional)

```bash
cd frontend
npm run build
npm run preview
```

Serve the FastAPI app behind your reverse proxy and point the frontend to the same origin or configure `VITE_API_URL` for cross-origin API calls.

### Deploy API on Railway (Postgres + Docker)

1. **Create a project** in [Railway](https://railway.app/) → **Deploy from GitHub** → choose this repository.

2. **Add PostgreSQL:** **New** → **Database** → **PostgreSQL**. Wait until it is running.

3. **Add the API service:** **New** → **GitHub Repo** → same repo (or **Empty service** → connect repo).  
   - **Settings → Build:** builder **Dockerfile**, root directory **/** (repository root, where `Dockerfile` lives).  
   - The image listens on **`PORT`** (Railway sets this automatically; the Dockerfile uses `${PORT:-8000}`).

4. **Wire `DATABASE_URL` to the API:** open the **API service** → **Variables** → **Add variable** → **Reference** → select the Postgres plugin’s **`DATABASE_URL`**.  
   Railway’s value looks like `postgresql://...`; the app rewrites it to **`postgresql+psycopg://`** for SQLAlchemy.

5. **Set required variables** on the API service (plain text, not references):

   | Variable | Example |
   |----------|---------|
   | `JWT_SECRET_KEY` | Long random string (generate locally with `openssl rand -hex 32`) |
   | `FIREBASE_PROJECT_ID` | Your Firebase project ID (Google sign-in) |

6. **CORS for Vercel:** add either or both:

   - `CORS_ALLOW_ORIGINS` = `https://your-app.vercel.app` (your real Vercel URL, no path)  
   - Optional: `CORS_ALLOW_ORIGIN_REGEX` = `https://.*\.vercel\.app` so preview deployments work too.

7. **Public URL:** API service → **Settings** → **Networking** → **Generate domain**.  
   Use that origin as **`VITE_API_URL`** in Vercel (no trailing slash), then redeploy the frontend.

8. **Verify:** open `https://<your-railway-domain>/health` — you should see `{"status":"ok","service":"playiq"}`.  
   If the app crashes on boot, check deploy logs: missing `DATABASE_URL` reference or wrong service linked to Postgres usually shows `connection refused` to `localhost`.

### Phase 2 features (testing)

With backend + `npm run dev` running:

1. **Generate & save:** Fill the form → **Generate plan** → **Save gameplan** → enter a name → confirm. You should see a green confirmation banner; the plan appears under **Saved gameplans** with a summary line (coverage • defender • style).
2. **Load / delete:** **Load** repopulates the form and restores results; **Delete** removes the entry (stored in `localStorage` only on this browser).
3. **Call sheet:** Use **Recommendations** / **Call sheet** toggle → review the worksheet layout → **Print call sheet** (best after switching to Call sheet so `#print-call-sheet` is mounted).
4. **Loading:** Change an input and generate again—the button shows a spinner; an overlay appears if results already exist.

### Phase 3 features (testing)

1. **Opponents tab:** Create a profile with tendencies; use **Use for gameplan** to push values into the Plan workspace; **Notes** opens analyst notes; **Edit** updates the profile.
2. **Saved gameplans:** **Notes** on a saved row opens scouting/coaching/emphasis fields stored with that gameplan (v2 localStorage key; v1 saves migrate on read).
3. **API output:** Recommendations include stress/leverage/down-distance fields plus a **strategic summary**; call sheet print includes the summary when present.

### Phase 4 features (testing)

Diagrams and install sheets are stored in **`localStorage`** (`playiq_diagrams_v1`) on this browser only.

1. **Diagram builder:** Open **Diagrams** → **New diagram**, or from a recommendation card use **Create diagram**. Place offense/defense markers, add routes (select an offensive player, pick a preset, then **Add route** on the canvas), trace **Motion** / **Run / block** paths and **Finish**. Save — the library list should update.
2. **Linking:** After **Save gameplan**, create a diagram from a card — it pre-fills the linked concept and gameplan id. Use **Attach diagram** on a card to point an existing diagram at that concept/gameplan. Optional opponent links are set inside the editor.
3. **Diagram library:** **Diagrams** tab — search, **Edit**, **Delete**; edits persist after refresh.
4. **Install sheet:** On a recommendation card, **Install sheet** opens a coaching layout with recommendation text, gameplan notes (if the active loaded/saved gameplan matches), and linked diagrams. **Print install sheet** uses the browser print dialog (Save as PDF works via the system print UI). Ensure the install modal is open when printing so `#print-install-sheet` is on the page.
5. **Workflow sanity check:** **Opponents** → apply tendencies → **Plan** → **Generate plan** → **Save gameplan** → pick a concept → **Create diagram** → **Install sheet** → print.

### Phase 5 features (testing)

1. **Authentication flow:** Launch app, create account on **Sign up**, then sign in/out from top-right user menu.
2. **Protected app:** Planner/dashboard is only accessible after auth; refresh keeps session via bearer token in browser storage.
3. **Team onboarding:** After signup, create a team or join an existing team from Team setup; you can continue solo.
4. **Database-backed records:** Gameplans, opponents, diagrams, and notes are now loaded/saved via API + PostgreSQL.
5. **Gameplan sharing:** In **Save gameplan**, choose visibility:
   - `Private` (only owner)
   - `Team` (visible to team members)
   Saved gameplans show the visibility state in the sidebar.
6. **Diagram/install continuity:** Existing Phase 4 diagram builder and install sheet workflow remains, now persisted through backend CRUD.

### Phase 6 features (testing)

1. **Hybrid recommendation model:** In Plan workspace, generate deterministic recommendations first, then click **Generate AI Summary** under **AI assistance layer**.
2. **AI summary storage:** If a gameplan is selected/saved, generated summary is stored server-side (`ai_summaries` table) and shown as clearly labeled AI content.
3. **Matchup analysis page:** Use **Matchup analysis** tab, submit a tactical question, and review **AI Matchup Analysis** output. Use **Save answer to gameplan notes** to append into coaching notes.
4. **Coaching chat page:** Use **Coaching assistant** tab for contextual chat. Messages are persisted in `chat_sessions` + `chat_messages`.
5. **Fallback mode:** If `AI_API_KEY` is missing/invalid, the backend returns a tactical fallback response while keeping rule-engine recommendations authoritative.

### Phase 7 features (testing)

1. **Scouting data ingestion:** Open **Scouting data** tab.
   - Add a manual row in **Manual entry** and confirm it appears in the table.
   - Use **Download template** and compare with `docs/scouting_csv_template.csv`.
2. **CSV import:** Upload a CSV with required headers. Invalid headers return readable validation errors from `/api/scouting/import`.
3. **Opponent tendencies:** Open **Opponent tendencies**, select an opponent, click **Refresh**.
   - Review sample size, front/coverage/pressure frequency, and coaching insights.
4. **Self-scout analytics:** Open **Self-scout**, refresh, and inspect concept/formation/play-type distributions.
5. **Reports:** Open **Reports**, load opponent or self-scout report, and use **Print report** for PDF/browser export.
6. **Gameplan bridge:** In Plan workspace, generate recommendations after loading an opponent.
   - An **Observed scouting data** summary appears above recommendation cards when scouting sample exists.

### Phase 8 features (testing)

1. **Formation intelligence:** Open **Formation intelligence** tab.
   - Set scope (`All`, `Opponent-facing`, or `Self-scout`), apply filters, and click **Refresh**.
   - Validate cards/charts and derived insights are tied to filtered scouting sample.
2. **Script builder:** Open **Script builder** tab.
   - Create script metadata (name/opponent/gameplan/week).
   - Add entries, edit fields inline, move entries up/down, and delete entries.
   - Reload/select script and confirm sequence persists from database.
3. **Situational planning:** Open **Situational planning** tab.
   - Create plans for situations like 3rd down, red zone, 2-minute, etc.
   - Add preferred calls (with optional linked diagram), edit/delete calls, and reopen saved plans.
4. **Game day workflow sheet:** Open **Game day view** tab.
   - Verify opponent tendency summary + top recommendations + selected script + situation menus.
   - Use **Print game day sheet** to export browser/PDF-friendly output.
5. **Integration checks:**
   - Ensure recommendations generated in Plan workspace can prefill script entries.
   - Ensure situation calls can reference existing diagrams.
   - Ensure newly created scripts/situation plans appear across views after refresh.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness |
| GET | `/api/options` | Dropdown option lists |
| POST | `/api/recommend` | JSON body with all six inputs; returns top 3 concepts |

CORS allows listed localhost origins plus any `http://localhost:<port>` / `http://127.0.0.1:<port>` via regex for local dev.

## Project layout

```
recommendation_engine/     # Rule packs, matching, validation
backend/
  app/
    main.py                # FastAPI app
    schemas.py             # Pydantic models
frontend/
  src/
    App.jsx
    components/            # GameplanForm, RecommendationResults, CallSheetView, SavedGameplansPanel, modals
    config/                # API base URL helper
    constants/             # Form field metadata
    lib/                   # api.js, gameplanStorage.js, diagramStorage.js (localStorage)
    utils/
```
