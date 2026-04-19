# FanStory API Contract v1

## Scope

This document fixes the target user-facing API contract for story creation and continuation.

Debug endpoints are useful during development, but they are **not** part of API v1.

## Design Rules

- use `choice_id`, never `choice_index`
- response shape represents a `StoryAggregate`
- continuation is state-driven
- every write operation should return the updated aggregate snapshot

## StoryAggregate Response Shape

Target response shape:

```json
{
  "story_id": "story_123",
  "config": {
    "universe": "Harry Potter",
    "protagonist": "Student in a hidden corridor",
    "theme": "Mystery in the castle",
    "genre": "Fantasy",
    "tone": "Atmospheric"
  },
  "current_state_summary": "The protagonist discovered a hidden passage and suspects it is connected to a larger secret.",
  "chapters": [
    {
      "chapter_id": "chapter_1",
      "chapter_number": 1,
      "title": "The Tapestry Moves",
      "text": "Chapter text..."
    }
  ],
  "available_choices": [
    {
      "choice_id": "ch1_enter_passage",
      "label": "Step through the passage immediately"
    },
    {
      "choice_id": "ch1_call_friend",
      "label": "Find a trusted friend first"
    },
    {
      "choice_id": "ch1_walk_away",
      "label": "Pretend nothing happened and return later"
    }
  ],
  "choice_history": []
}
```

## Endpoint: `POST /stories`

Creates a new story and returns the initial aggregate.

### Request

```json
{
  "universe": "Harry Potter",
  "protagonist": "Student in a hidden corridor",
  "theme": "Mystery in the castle",
  "genre": "Fantasy",
  "tone": "Atmospheric"
}
```

### Success Response

Status:

- `201 Created`

Body:

```json
{
  "story_id": "story_123",
  "config": {
    "universe": "Harry Potter",
    "protagonist": "Student in a hidden corridor",
    "theme": "Mystery in the castle",
    "genre": "Fantasy",
    "tone": "Atmospheric"
  },
  "current_state_summary": "The protagonist has discovered a hidden passage and senses that entering it may change everything.",
  "chapters": [
    {
      "chapter_id": "chapter_1",
      "chapter_number": 1,
      "title": "The Tapestry Moves",
      "text": "The corridor was empty until the tapestry trembled..."
    }
  ],
  "available_choices": [
    {
      "choice_id": "ch1_enter_passage",
      "label": "Step through the passage immediately"
    },
    {
      "choice_id": "ch1_find_friend",
      "label": "Find a trusted friend before entering"
    },
    {
      "choice_id": "ch1_hide_secret",
      "label": "Keep the passage secret for now"
    }
  ],
  "choice_history": []
}
```

## Endpoint: `GET /stories/{story_id}`

Returns the current aggregate snapshot for one story.

### Request

Path params:

- `story_id`

Example:

```text
GET /stories/story_123
```

### Success Response

Status:

- `200 OK`

Body:

```json
{
  "story_id": "story_123",
  "config": {
    "universe": "Harry Potter",
    "protagonist": "Student in a hidden corridor",
    "theme": "Mystery in the castle",
    "genre": "Fantasy",
    "tone": "Atmospheric"
  },
  "current_state_summary": "The protagonist is deciding whether to enter the hidden passage alone or seek help first.",
  "chapters": [
    {
      "chapter_id": "chapter_1",
      "chapter_number": 1,
      "title": "The Tapestry Moves",
      "text": "The corridor was empty until the tapestry trembled..."
    }
  ],
  "available_choices": [
    {
      "choice_id": "ch1_enter_passage",
      "label": "Step through the passage immediately"
    },
    {
      "choice_id": "ch1_find_friend",
      "label": "Find a trusted friend before entering"
    },
    {
      "choice_id": "ch1_hide_secret",
      "label": "Keep the passage secret for now"
    }
  ],
  "choice_history": []
}
```

## Endpoint: `POST /stories/{story_id}/choose`

Applies a user choice, generates the next chapter and returns the updated aggregate.

### Request

```json
{
  "choice_id": "ch1_enter_passage"
}
```

### Success Response

Status:

- `200 OK`

Body:

```json
{
  "story_id": "story_123",
  "config": {
    "universe": "Harry Potter",
    "protagonist": "Student in a hidden corridor",
    "theme": "Mystery in the castle",
    "genre": "Fantasy",
    "tone": "Atmospheric"
  },
  "current_state_summary": "The protagonist has entered the hidden passage and now knows that someone was here recently.",
  "chapters": [
    {
      "chapter_id": "chapter_1",
      "chapter_number": 1,
      "title": "The Tapestry Moves",
      "text": "The corridor was empty until the tapestry trembled..."
    },
    {
      "chapter_id": "chapter_2",
      "chapter_number": 2,
      "title": "Dust and Footsteps",
      "text": "The hidden stairway descended into darkness..."
    }
  ],
  "available_choices": [
    {
      "choice_id": "ch2_follow_footsteps",
      "label": "Follow the fresh footprints deeper underground"
    },
    {
      "choice_id": "ch2_take_artifact",
      "label": "Take the strange silver key from the floor"
    },
    {
      "choice_id": "ch2_retreat",
      "label": "Retreat before anyone notices"
    }
  ],
  "choice_history": [
    {
      "choice_id": "ch1_enter_passage",
      "chapter_number": 1,
      "resolution_summary": "The protagonist chose immediate action and entered the passage alone."
    }
  ]
}
```

## Error Codes

### `404 Not Found`

Case:

- story does not exist

Example:

```json
{
  "detail": "story not found"
}
```

### `400 Bad Request`

Case:

- `choice_id` is invalid for current `available_choices`

Example:

```json
{
  "detail": "invalid choice"
}
```

### `409 Conflict`

Case:

- same choice was already resolved
- request tries to reuse an outdated choice set

Example:

```json
{
  "detail": "choice already used"
}
```

### `502 Bad Gateway`

Case:

- LLM generation failed
- provider returned invalid structured output

Example:

```json
{
  "detail": "generation failed"
}
```

### `500 Internal Server Error`

Case:

- backend misconfiguration
- persistence or orchestration failure

Example:

```json
{
  "detail": "internal server error"
}
```

## Notes for Implementation

- API v1 should be stable even if internal module boundaries change
- `available_choices` represent the only valid inputs for `/choose`
- `choice_history` is append-only
- chapter order must be deterministic and explicit via `chapter_number`
- do not infer the next choice by list position on the server side
