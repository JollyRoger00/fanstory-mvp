# FanStory MVP Architecture

## Goal

FanStory MVP should evolve as a **modular monolith**:

- one deployable frontend application
- one deployable backend application
- clear module boundaries inside the backend
- no distributed services on this stage
- storage can remain in-memory first, then move behind repository interfaces

This document fixes the target architecture for the next steps. It does **not** require an immediate large refactor.

## Main Architectural Principle

**Source of truth = `StoryState`, not chapter text.**

This means:

- chapter text is a rendered artifact
- available choices are derived from current state and the latest chapter result
- the canonical progress of the story lives in structured state
- future continuation must use `StoryState` and `ChoiceResolution`, not parse old prose back into state

If prose and state disagree, state wins.

## System Boundaries

### Frontend

Responsibilities:

- collect `StoryConfig` from the user
- display current chapter, available choices, history and errors
- send `choice_id` back to backend
- remain stateless with respect to core story logic

Non-responsibilities:

- no OpenAI calls
- no story state mutation logic
- no business rules for choice resolution

### Backend API

Responsibilities:

- validate requests and responses
- expose API contract
- orchestrate use cases
- map domain errors to HTTP status codes
- keep debug endpoints isolated from user-facing API v1

Non-responsibilities:

- no direct prompt construction in route handlers
- no persistence logic embedded in endpoint code
- no LLM provider-specific details in API handlers

### Story Engine

Responsibilities:

- own story generation flow
- operate on `StoryConfig`, `StoryBible`, `StoryState`, `Chapter`, `Choice`, `ChoiceResolution`
- plan and write chapters
- validate generated choices and state transitions
- produce updated aggregate data for persistence

Non-responsibilities:

- no HTTP concerns
- no provider SDK concerns
- no storage implementation details

### LLM Adapter

Responsibilities:

- isolate OpenAI SDK usage
- load model settings from environment
- send prompts and structured-output requests
- normalize provider errors
- keep provider-specific request/response formatting out of the engine

Non-responsibilities:

- no domain decisions
- no chapter numbering rules
- no persistence

### Persistence Layer

Responsibilities:

- store and load `StoryAggregate`
- expose repository interfaces
- hide storage implementation details
- allow the project to start in-memory and later switch to DB without changing engine logic

Non-responsibilities:

- no prompt logic
- no HTTP logic
- no LLM logic

## Core Domain Entities

### StoryConfig

Stable user-defined configuration for story creation.

Fields:

- `story_id`
- `universe`
- `protagonist`
- `theme`
- `genre`
- `tone`
- `created_at`

### StoryBible

Structured guide for continuity and tone.

Contains:

- world assumptions
- key characters and roles
- tone rules
- narrative constraints
- continuity facts that should remain stable across chapters

### StoryState

Canonical current state of the story.

Contains:

- `chapter_number`
- current location or scene context
- active goals
- unresolved tensions
- known facts
- character status
- short state summary
- available narrative threads

This is the main source of truth for continuation.

### Chapter

One rendered chapter of the story.

Contains:

- `chapter_id`
- `chapter_number`
- `title`
- `text`
- `state_summary_after_chapter`
- generated choices for the next step

### Choice

One selectable action available to the user after a chapter.

Contains:

- `choice_id`
- `label`
- optional `intent` or semantic tag
- chapter association

`choice_id` is the identity. Display order is not identity.

### ChoiceResolution

Record of how a selected choice changed the story.

Contains:

- `choice_id`
- `chapter_number`
- selected timestamp
- pre-state summary
- post-state summary
- optional notes about applied state delta

### StoryAggregate

Aggregate root for one story session.

Contains:

- `config: StoryConfig`
- `bible: StoryBible`
- `state: StoryState`
- `chapters: list[Chapter]`
- `available_choices: list[Choice]`
- `choice_history: list[ChoiceResolution]`

All write operations should load and save this aggregate as one coherent story unit.

## Target Backend Module Layout

The target backend folder structure should move toward:

```text
backend/app/
  api/
    routes/
    dto/
    errors/
  domain/
    entities/
    value_objects/
    aggregates/
    policies/
  prompts/
    planner/
    writer/
    bible/
  repositories/
    interfaces/
    memory/
    persistence_models/
  services/
    story_engine/
    llm_adapter/
    application/
```

Minimal meaning of each folder:

- `api` — FastAPI endpoints, request/response DTOs, HTTP error mapping
- `domain` — canonical story entities and rules
- `prompts` — prompt templates and output specs
- `repositories` — repository interfaces and storage implementations
- `services` — orchestration logic, engine flow, LLM adapter

## Current-to-Target Responsibility Map

Current state in code:

- `backend/app/main.py` mixes API, orchestration, environment loading and in-memory persistence
- `backend/app/services/story_engine.py` mixes prompt building and one-step generation
- `backend/app/services/llm_client.py` is already the right seed for the future LLM adapter
- `backend/app/schemas.py` mixes transport schema and emerging domain shape

Target direction:

- keep API contracts in `api/dto`
- move story concepts into `domain`
- move prompt text into `prompts`
- move storage behind repositories
- keep OpenAI-specific code behind the LLM adapter only

## Choice Identity Rule

**Use `choice_id`, not `choice_index`.**

Why:

- display order can change
- future UI may sort or filter choices
- stored user decisions must remain stable across retries and re-renders
- `choice_index` is fragile for persistence and debugging

Implication:

- API requests for next action should accept `choice_id`
- `ChoiceResolution` should reference `choice_id`
- chapter rendering may still show numbered options, but numbering is presentation only

## Incremental Migration Strategy

The project should move in small safe steps:

1. Freeze target contracts in docs.
2. Introduce domain entities and aggregate shapes without deleting working endpoints.
3. Add repository interfaces while keeping in-memory implementation.
4. Split current one-step generation into planner and writer.
5. Introduce `/stories/{story_id}/choose` on top of state-driven flow.
6. Only then consider DB persistence.

No large refactor should happen before these boundaries are documented and accepted.
