# FanStory MVP

FanStory MVP is a minimal web service for interactive AI fanfiction.

The project currently runs as:
- `frontend`: Next.js single-page UI
- `backend`: FastAPI API
- `LLM calls`: OpenAI, backend only
- `storage`: in-memory repository

## Current MVP Loop

The current working loop is:

1. Create a story with `universe`, `protagonist`, `theme`, `genre`, and `tone`.
2. Receive the first chapter, current state summary, and 3-4 available choices.
3. Choose one action by `choice_id`.
4. Receive the next chapter and an updated aggregate snapshot.

This loop already works end-to-end in the current prototype.

## Current API

User-facing and development endpoints currently available:

- `GET /health`
- `POST /stories`
- `GET /stories/{story_id}`
- `POST /stories/{story_id}/choose`
- `GET /debug/openai-ping`
- `POST /debug/openai-story-raw`

Notes:
- `POST /stories` creates a new story and returns the initial aggregate.
- `GET /stories/{story_id}` returns the latest aggregate snapshot.
- `POST /stories/{story_id}/choose` applies a `choice_id` and returns the updated aggregate.
- Debug endpoints are for development diagnostics and are not part of the stable user-facing API contract.

## Current Response Shape

The main story endpoints return a `StoryAggregate`-shaped response:

```json
{
  "story_id": "story_123",
  "config": {
    "universe": "Harry Potter",
    "protagonist": "Student near a hidden corridor",
    "theme": "Castle mystery",
    "genre": "Fantasy",
    "tone": "Atmospheric"
  },
  "current_state_summary": "The protagonist has discovered a hidden passage...",
  "chapters": [
    {
      "chapter_id": "story_123_chapter_1",
      "chapter_number": 1,
      "title": "The Hidden Passage",
      "text": "Chapter text..."
    }
  ],
  "available_choices": [
    {
      "choice_id": "ch1_abcd1234",
      "label": "Enter the hidden passage right away"
    }
  ],
  "choice_history": []
}
```

Important rules:
- choices are addressed by `choice_id`, not by index
- `POST /stories/{story_id}/choose` returns the full updated aggregate
- `choice_history` grows over time and `available_choices` is replaced each turn

## Current Storage Behavior

Story storage is still in-memory.

That means:
- stories exist only while the backend process is running
- after a backend restart, all created stories are lost
- there is no database yet

## Running The Project

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

The current page sends API requests to:

```text
http://127.0.0.1:8000
```

### Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

Swagger / OpenAPI docs:

```text
http://127.0.0.1:8000/docs
```

## Backend Environment

The backend loads environment variables from:

```text
backend/.env
```

Example:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.4-mini
```

Notes:
- do not put the API key in the frontend
- OpenAI requests are made only from the backend
- if `OPENAI_API_KEY` is missing, story generation endpoints return `500 internal server error`, while technical details stay in backend logs

## Quick Manual Checks

Health check:

```bash
curl.exe http://127.0.0.1:8000/health
```

Simple OpenAI ping:

```bash
curl.exe http://127.0.0.1:8000/debug/openai-ping
```

Create a story:

```bash
curl.exe -X POST "http://127.0.0.1:8000/stories" ^
  -H "Content-Type: application/json" ^
  -d "{\"universe\":\"Harry Potter\",\"protagonist\":\"Student near a hidden corridor\",\"theme\":\"Castle mystery\",\"genre\":\"Fantasy\",\"tone\":\"Atmospheric\"}"
```

Continue a story:

```bash
curl.exe -X POST "http://127.0.0.1:8000/stories/{story_id}/choose" ^
  -H "Content-Type: application/json" ^
  -d "{\"choice_id\":\"ch1_abcd1234\"}"
```

Raw story debug call:

```bash
curl.exe -X POST "http://127.0.0.1:8000/debug/openai-story-raw" ^
  -H "Content-Type: application/json" ^
  -d "{\"universe\":\"Harry Potter\",\"protagonist\":\"Student near a hidden corridor\",\"theme\":\"Castle mystery\",\"genre\":\"Fantasy\",\"tone\":\"Atmospheric\"}"
```

## What Is Not Implemented Yet

Not implemented yet:
- persistent storage
- story recovery after backend restart
- public story pages or catalog
- authentication and user accounts
- free-text action input
- advanced story-state richness beyond the current MVP shape
- production-grade CI/CD and deployment setup

## Existing Project Docs

Architecture and contracts already documented:
- `docs/ARCHITECTURE.md`
- `docs/ENGINE_SPEC.md`
- `docs/API_CONTRACT.md`
- `docs/PROJECT_STATUS.md`
- `docs/NEXT_STEPS.md`

## Cleanup Checklist

Before handoff or archiving:

- `.env` must not be committed
- `node_modules` must not be archived
- `.next` must not be archived
- `.venv` must not be archived
- `.git` should not be included in handoff archives
