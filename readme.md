# 🔎 AI Research Agent

## Problem It Solves

Researching a topic online is slow and manual. You search many queries, open dozens of pages, read long articles, compare what different sources say, and then write up the findings with citations. Search results also only show short snippets, and different sources often contradict each other without it being obvious.

**AI Research Agent automates this whole process.** Ask one question and the system:

- Plans several focused searches instead of relying on a single query
- Collects live sources from Google and Google News and removes duplicates
- Reads the full page content, not just snippets
- Finds the most relevant evidence using semantic search (RAG)
- Extracts claims and checks where sources agree or conflict
- Produces a cited report while showing live progress

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | NestJS, TypeScript |
| Database | MongoDB (Mongoose) |
| Queue / Cache | Redis, BullMQ |
| Real-time | Server-Sent Events (SSE), Redis Pub/Sub |
| Search API | SerpApi (Google and Google News) |
| LLM | Llama |
| Vector Database | Pinecone |
| Scraping | Axios + custom HTML text extraction |

## Architecture

```mermaid
flowchart TD
    A["React Frontend<br/>user submits research question"] --> B["NestJS API<br/>ResearchController + ResearchService"]
    B --> C[("MongoDB<br/>research session created")]
    B --> D["BullMQ Queue (Redis)<br/>ResearchQueueService adds job"]
    D --> E["Worker<br/>ResearchProcessorService"]
    E --> F["Orchestrator<br/>ResearchOrchestratorService"]

    F --> G["Planner Agent<br/>LLM creates search tasks"]
    G --> H["Researcher Agent<br/>SerpApi: Google + Google News"]
    H --> I["Sources Service<br/>collect + deduplicate sources"]
    I --> J["Extractor Service<br/>fetch page content, author, publishedAt"]
    J --> K["Chunking Service<br/>1000 chars, 150 overlap"]
    K --> L[("Pinecone<br/>vector index")]
    L --> M["RAG Retrieval<br/>top 15 evidence chunks"]
    M --> N["Analyzer Agent<br/>extract claims"]
    N --> O["Comparison Agent<br/>agreements and conflicts"]
    O --> P["Reporter Agent<br/>final report + metrics"]

    I --> C
    J --> C
    P --> C

    F -.->|publishes stage events| Q["Redis Pub/Sub<br/>ResearchEventsService"]
    Q --> R["NestJS SSE endpoint<br/>research:events channel"]
    R --> S["useResearchStream hook<br/>timeline + agent cards"]
    S --> A

    G -.->|failure| X["Orchestrator catch<br/>setFailed + research.failed event"]
    H -.->|failure| X
    J -.->|skip bad source| I
    L -.->|failure| X
    N -.->|failure| X
    P -.->|failure| X
    X --> C
    X --> Q
```

## Screenshots

### Home
![Home](screenshots/home.png)

### Research History
![History](screenshots/history.png)

### Report Developing
![Report Developing](screenshots/reportDeveloping.png)

### Final Report
![Report](screenshots/report.png)

### Research Coverage
![Research Coverage](screenshots/researchCoverage.png)