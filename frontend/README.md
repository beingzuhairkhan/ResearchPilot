# ResearchPilot — AI Research Agent

ResearchPilot is an AI research agent frontend that plans investigations, searches the live web, compares evidence, and generates citation-backed reports. Built for the **SerpApi India Hackathon 2026 — Track 01: AI Agents**.

This is the **frontend only** — it communicates with an existing NestJS backend through REST APIs and SSE.

## Tech Stack

- **React.js** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **React Router** (routing)
- **Axios** (HTTP client)
- **Lucide React** (icons)

## Folder Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── PageContainer.tsx
│   ├── research/
│   │   ├── ResearchInput.tsx
│   │   ├── ResearchModeSelector.tsx
│   │   ├── ResearchProgress.tsx
│   │   ├── ResearchTimeline.tsx
│   │   ├── AgentTimeline.tsx
│   │   ├── ResearchPlan.tsx
│   │   ├── ResearchTaskCard.tsx
│   │   ├── SourceCard.tsx
│   │   ├── SourceList.tsx
│   │   ├── FindingCard.tsx
│   │   ├── ConflictCard.tsx
│   │   ├── ResearchMetrics.tsx
│   │   ├── Citation.tsx
│   │   ├── CitationList.tsx
│   │   ├── CitationModal.tsx
│   │   ├── ReportViewer.tsx
│   │   └── ReportSection.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Progress.tsx
│       ├── Skeleton.tsx
│       ├── EmptyState.tsx
│       ├── ErrorState.tsx
│       ├── Modal.tsx
│       └── Toast.tsx
├── pages/
│   ├── Home.tsx
│   ├── Research.tsx
│   ├── ResearchReport.tsx
│   ├── History.tsx
│   └── Settings.tsx
├── services/
│   ├── api.ts
│   ├── researchApi.ts
│   ├── eventStream.ts
│   └── mockApi.ts
├── hooks/
│   ├── useResearch.ts
│   └── useResearchStream.ts
├── types/
│   └── research.ts
├── router/
│   └── AppRouter.tsx
├── App.tsx
└── main.tsx
```

## Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000/api/v1` |
| `VITE_USE_MOCK_API` | Use mock data instead of real backend | `false` |

## Backend URL Configuration

Set `VITE_API_BASE_URL` in your `.env` file to point to your NestJS backend:

```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

For mock mode (no backend needed):

```
VITE_USE_MOCK_API=true
```

## Running Locally

```bash
npm install
npm run dev
```

## Available Routes

| Route | Description |
|---|---|
| `/` | Home / New Research |
| `/research/:id` | Live research progress |
| `/research/:id/report` | Completed research report |
| `/history` | Research history |
| `/settings` | Frontend settings |

## API Integration

The frontend communicates with the backend through these endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/research` | Start a new research session |
| `GET` | `/research/:id` | Get research session details |
| `GET` | `/research/:id/plan` | Get the AI-generated research plan |
| `GET` | `/research/:id/sources` | Get collected sources |
| `GET` | `/research/:id/report` | Get the final research report |
| `GET` | `/research` | Get research history (paginated) |
| `DELETE` | `/research/:id` | Delete a research session |

All API calls are handled in `src/services/researchApi.ts` using an Axios instance configured in `src/services/api.ts`.

## SSE Integration

Live research progress uses Server-Sent Events (SSE) via `EventSource`:

| Endpoint | Description |
|---|---|
| `GET` | `/research/:id/stream` | Real-time research progress stream |

### SSE Events

The frontend listens for these event types:

- `research.created`
- `research.planning`
- `research.plan_created`
- `research.search_started`
- `research.search_completed`
- `research.sources_collected`
- `research.deduplication_completed`
- `research.processing_started`
- `research.indexing_started`
- `research.rag_completed`
- `research.analysis_started`
- `research.comparison_completed`
- `research.report_started`
- `research.completed`
- `research.failed`

SSE connection is managed in `src/services/eventStream.ts` with automatic reconnection and cleanup on component unmount.

## Production Build

```bash
npm run build
npm run preview
```

## Security

- No API secrets (SerpApi, Pinecone, LLM keys) are stored in the frontend
- Only `VITE_API_BASE_URL` is exposed through frontend environment configuration
- All external links open in new tabs with `rel="noopener noreferrer"`
