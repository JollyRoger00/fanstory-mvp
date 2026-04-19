# FanStory MVP Engine Specification

## Engine Type

FanStory should behave as a **state-driven interactive fiction engine**.

This means:

- each chapter is generated from structured state
- each user choice resolves into a state transition
- chapter text is output, not the canonical source of continuity
- the engine should be able to continue the story without re-parsing old prose

## Core Pipeline

The target pipeline for both story creation and continuation is:

1. **Input normalization**
2. **Bible building**
3. **Initial state creation**
4. **Chapter planning**
5. **Chapter writing**
6. **State update**
7. **Persistence**

## Pipeline Stages

### 1. Input normalization

Input:

- raw user config

Tasks:

- trim and validate fields
- normalize naming
- reject empty or malformed values
- produce canonical `StoryConfig`

### 2. Bible building

Input:

- `StoryConfig`

Tasks:

- derive world rules
- define stable character framing
- lock genre and tone guardrails
- write initial continuity constraints

Output:

- `StoryBible`

### 3. Initial state creation

Input:

- `StoryConfig`
- `StoryBible`

Tasks:

- create initial `StoryState`
- set chapter counter to 1
- establish opening situation
- define initial unresolved tension

Output:

- initial `StoryState`

### 4. Chapter planning

Input:

- `StoryConfig`
- `StoryBible`
- current `StoryState`
- short history summary
- last chapter if it exists
- selected choice if this is a continuation step

Tasks:

- choose narrative goal for the next chapter
- define scene progression
- decide tension and reveal beats
- define expected state delta
- define candidate choices

Output:

- structured planner result

### 5. Chapter writing

Input:

- `StoryConfig`
- `StoryBible`
- current `StoryState`
- short history summary
- last chapter
- selected choice
- planner result

Tasks:

- write chapter title and chapter text
- write available choices
- produce post-chapter state summary
- follow continuity and tone rules

Output:

- structured writer result

### 6. State update

Input:

- previous `StoryState`
- selected `ChoiceResolution` if any
- planner result
- writer result

Tasks:

- increment chapter number
- apply state delta
- refresh current summary
- mark used choice
- replace available choices with new ones

Output:

- updated `StoryState`
- `ChoiceResolution`
- new `Chapter`

### 7. Persistence

Input:

- updated `StoryAggregate`

Tasks:

- save aggregate atomically
- keep chapter history
- keep available choices
- keep choice history

Output:

- stored aggregate

## Two-Step Generation

FanStory should move toward a **Planner -> Writer** generation flow.

## Planner

### Planner receives

- `StoryConfig`
- `StoryBible`
- current `StoryState`
- short history summary
- last chapter
- selected choice

### Planner returns

Structured output such as:

- `target_chapter_number`
- `scene_goal`
- `main_conflict`
- `beat_outline`
- `continuity_constraints`
- `expected_state_delta`
- `candidate_choices`

Planner should not write polished prose. It should prepare the logic and narrative intent for the next chapter.

## Writer

### Writer receives

- `StoryConfig`
- `StoryBible`
- current `StoryState`
- short history summary
- last chapter
- selected choice
- planner result

### Writer returns

Structured output such as:

- `chapter_title`
- `chapter_text`
- `choices`
- `state_summary`

Writer should produce readable prose, but remain constrained by planner output and continuity context.

## Model Context

The model context for chapter generation should include:

- `StoryConfig`
- `StoryBible`
- current `StoryState`
- short history summary
- last chapter
- selected choice

Rules:

- do not send the full raw history forever
- prefer compressed history summary over unbounded chapter replay
- send only the last chapter text when it is needed for immediate continuity
- send `selected choice` explicitly by `choice_id`, not by display index

## State Update Rules

After every new chapter:

- `chapter_number` must increase by exactly 1
- the chosen `choice_id` must be recorded in `choice_history`
- `current_state_summary` must be refreshed
- old `available_choices` must be replaced with the new chapter choices
- unresolved threads may be closed, continued or split, but must stay explicit in state
- bible-level facts must not drift unless the story explicitly changes them
- the chapter text and state summary must agree semantically

## Choice Validation Rules

Choices must satisfy all of the following:

- there must be **3 or 4** choices
- each choice must have a stable `choice_id`
- each choice label must be distinct
- each choice must describe an actionable next step
- choices must be grounded in the current chapter and current state
- choices must not be trivial duplicates
- choices must be valid for the protagonist and current situation

Additional rule:

- the engine must validate and store `choice_id`, not trust UI order

## Failure Cases

### Invalid structured output

Examples:

- missing fields
- wrong field types
- extra unsupported fields

Expected handling:

- reject generation result
- log provider error
- return `502` or `500` depending on failure source

### Missing choices

Examples:

- model returns fewer than 3 choices
- model returns no choices

Expected handling:

- mark generation invalid
- do not persist incomplete chapter as canonical state

### Wrong chapter numbering

Examples:

- planner says chapter 5 after chapter 1
- writer output conflicts with expected chapter number

Expected handling:

- reject generation result
- keep previous aggregate unchanged

### Invalid `choice_id`

Examples:

- selected `choice_id` does not exist in `available_choices`
- duplicate `choice_id`

Expected handling:

- reject request with `400`
- do not call writer
- do not mutate state

### State not updated

Examples:

- new chapter is generated but summary did not change
- selected choice produced no trace in the updated state

Expected handling:

- treat result as inconsistent
- reject persistence
- surface as generation failure or continuity failure

## Creation vs Continuation

### Story creation

Creation flow uses:

- normalized `StoryConfig`
- initial `StoryBible`
- initial `StoryState`
- no selected choice yet

### Story continuation

Continuation flow uses:

- existing `StoryAggregate`
- chosen `choice_id`
- current `StoryState`
- short history summary
- last chapter

This distinction should stay explicit in future use-case code.
