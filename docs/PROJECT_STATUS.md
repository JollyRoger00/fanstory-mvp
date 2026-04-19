# Project Status

Current stage in one sentence:

The project is at the first working end-to-end MVP stage: story creation and continuation already work through a single-page frontend and a FastAPI backend with in-memory storage.

## What Already Works

- frontend form for story creation
- backend story creation via `POST /stories`
- first chapter generation through OpenAI on the backend
- aggregate retrieval via `GET /stories/{story_id}`
- continuation via `POST /stories/{story_id}/choose`
- stable `choice_id` usage instead of choice index
- in-memory repository abstraction
- planner -> writer generation split inside the backend
- debug endpoints for OpenAI diagnostics
- basic backend automated tests

## What Is Partially Ready

- domain model is present, but still minimal in some places
- continuation flow exists publicly, but the underlying state model is still lightweight
- prompt modules are extracted, but prompt and orchestration layers are still fairly close
- repository abstraction exists, but only the in-memory implementation is active
- response contract is stable enough for the MVP, but some internal module boundaries are still pragmatic rather than final

## What Is Not Implemented Yet

- persistent storage
- story recovery after backend restart
- authentication and user accounts
- public story pages or sharing flow
- free-text user actions
- richer state tracking for continuity, character status, and timestamps
- production deployment setup and CI pipeline

## Key Backend Modules Already Present

- `backend/app/main.py`
- `backend/app/api/dto/stories.py`
- `backend/app/api/routes/stories.py`
- `backend/app/domain/models.py`
- `backend/app/repositories/base.py`
- `backend/app/repositories/memory.py`
- `backend/app/services/story_service.py`
- `backend/app/services/story_continuation_service.py`
- `backend/app/services/chapter_planner.py`
- `backend/app/services/chapter_writer.py`
- `backend/app/services/llm_client.py`
- `backend/app/services/story_validation.py`
- `backend/app/prompts/`
- `backend/app/dependencies.py`
- `backend/tests/test_stories_api.py`
- `backend/tests/test_story_pipeline.py`

## Weak Spots Of The Current MVP

- all stories are lost on backend restart
- the current `StoryState` is still thin for longer narrative continuity
- `ChoiceResolution` is useful but still minimal
- debug endpoints still live in the main FastAPI app module
- the frontend is intentionally simple and remains a single page with direct API calls
- some docs, naming, and error text are aligned enough for MVP use, but not fully polished

## Technical Debt

- transport DTO boundaries are cleaner now, but API error helpers and route wiring are still intentionally lightweight
- error wording and casing are not fully uniform across all endpoints
- there is no durable persistence implementation behind the repository abstraction yet
- there are backend tests, but no full end-to-end browser tests
- frontend API base URL is still hardcoded for local development
- project handoff hygiene still depends on manual discipline
