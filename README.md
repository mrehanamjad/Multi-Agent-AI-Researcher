# AgenticResearch — Multi-Agent AI Researcher

**AgenticResearch** is a full-stack, multi-agent research assistant. Give it a topic, and a LangGraph-powered agent pipeline validates the topic, asks clarifying questions when needed, plans a search strategy, searches the web, synthesizes a structured report, and critiques its own output — streaming every step to the browser in real time.

🔗 **Live app:** [agenticresearch.vercel.app](https://agenticresearch.vercel.app/)

---

## How it works

Each research request runs through a **LangGraph** state machine  with six nodes:

1. **Validate Topic** — an LLM call checks the topic is a meaningful, safe, research-worthy subject and lightly cleans it up.
2. **Clarification** — if the topic is too broad, the agent generates 3–4 clarifying questions and pauses the workflow, waiting for the user to answer before continuing.
3. **Analyze Query** — breaks the (clarified) topic into a research plan and exactly 3 focused sub-questions.
4. **Web Search** — runs each sub-question through the Tavily search API (up to 20 unique URLs total), deduplicating results into structured sources.
5. **Synthesize** — an LLM writes a structured Markdown report (Executive Summary, Background, Key Findings, Analysis, Future Outlook, Conclusion, References) grounded only in the retrieved sources.
6. **Critic** — a second LLM pass scores the report (0–10), and lists strengths, weaknesses, and suggestions.

The workflow is **stateless and resumable**: at every step, progress is persisted to Postgres, and a conditional entry-point router can re-enter the graph at the correct node from saved state — so a paused (clarification-needed) or interrupted (client-disconnected) session can be resumed exactly where it left off. Progress is streamed to the client via **Server-Sent Events (SSE)**.

---

## Tech stack

### Backend 
- **FastAPI** — async REST API + SSE streaming
- **LangGraph** + **LangChain** — multi-agent orchestration
- **OpenRouter** (via `langchain-openai`'s `ChatOpenAI` client) — LLM provider, default model `openai/gpt-4o-mini`
- **Tavily** — web search
- **PostgreSQL** + **SQLAlchemy (async)** + **Alembic** — persistence & migrations
- **Clerk** — JWT-based authentication (with a dev-mode auth bypass)
- **ReportLab** — server-side Markdown → PDF report generation
- **slowapi** — rate limiting

### Frontend 
- **React 19** + **TypeScript** + **Vite**
- **TanStack Router** + **TanStack Query**
- **Clerk React** — auth UI and session management
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives)
- **react-markdown** + **remark-gfm** — report rendering
- **Framer Motion** — animations
- **Recharts** — data visualization
- Deployed on **Vercel**

---

## Key features

- **Multi-agent pipeline** with self-critique — the agent grades its own report before returning it.
- **Interactive clarification** — the agent can pause mid-run to ask the user for more direction (audience, depth, time range, etc.) instead of guessing.
- **Real-time progress streaming** over SSE, including per-node status and granular "thinking step" logs (e.g. which queries are being searched, how many sources were found).
- **Resumable / crash-safe sessions** — every node's output is checkpointed to Postgres, so disconnects are recorded and sessions can continue from where they stopped.
- **Research history** — past reports are listed per user, viewable, and deletable.
- **PDF export** — download any completed report as a formatted PDF.
- **Authentication** — Clerk-based auth on both frontend and backend, with a local dev bypass mode.

---

## Getting started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL database
- API keys: [OpenRouter](https://openrouter.ai/), [Tavily](https://tavily.com/), [Clerk](https://clerk.com/)

### Backend setup

```bash
cd server
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `server/` with:

```env
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
TAVILY_API_KEY=your_tavily_key
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_ISSUER=your_clerk_issuer_url
CLERK_JWKS_URL=your_clerk_jwks_url
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:5173
AUTH_BYPASS=true        # optional: skip Clerk auth locally
```

Run database migrations, then start the server:

```bash
alembic upgrade head
python main.py
```

The API will be available at `http://localhost:8000` (docs at `/docs`).

### Frontend setup

```bash
cd client
npm install
```

Create a `.env` file in `client/` (see `.env.example`) with:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_ISSUER=your_clerk_issuer_url
CLERK_SECRET_KEY=your_clerk_secret_key
VITE_API_BASE=http://localhost:8000
```

Then run:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API overview

| Endpoint | Method | Description |
|---|---|---|
| `/research` | `POST` | Start a new research session (streams SSE) |
| `/research/{report_id}/clarifications` | `POST` | Submit clarification answers to resume a paused session (streams SSE) |
| `/research/{report_id}/status` | `GET` | Check session status / pending clarification questions |
| `/history` | `GET` | List the current user's past research reports |
| `/history/{report_id}` | `GET` | Get full details of a specific report |
| `/history/{report_id}/pdf` | `GET` | Download a report as PDF |
| `/history/{report_id}` | `DELETE` | Delete a report |
| `/health` | `GET` | Health check / agent readiness |

All endpoints (except `/health`) require a valid Clerk-issued bearer token.

