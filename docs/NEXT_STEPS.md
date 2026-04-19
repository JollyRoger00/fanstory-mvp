# Next Steps

This file lists only the next three recommended stages.

## Stage 1: Boundary And Documentation Cleanup

Goal:
- make the current codebase easier to maintain without changing behavior

Why it is needed:
- the MVP loop works, but some module boundaries and naming are still pragmatic
- tightening boundaries now reduces risk before deeper engine work

What is included:
- align transport DTO placement with the documented architecture
- normalize endpoint error wording and casing where safe
- tighten README and docs so they match the code exactly
- clarify which modules are public API boundary vs internal engine code

What is not included:
- no new endpoints
- no API shape changes
- no frontend redesign
- no new product functionality

## Stage 2: State And Continuation Hardening

Goal:
- make continuation safer and more deterministic without changing the public loop

Why it is needed:
- story continuation already works, but the current state model is still minimal
- stronger state rules reduce continuity drift and broken aggregate updates

What is included:
- enrich internal `StoryState` and `ChoiceResolution` fields where safe
- strengthen validation around chapter increments, state updates, and choice transitions
- add more tests for continuation edge cases and invalid generation outputs
- improve internal consistency between planner output, writer output, and stored aggregate

What is not included:
- no new story mechanics
- no free-text actions
- no major planner/writer redesign
- no new frontend screens

## Stage 3: Persistence Preparation

Goal:
- prepare the repository layer for durable storage without changing the current API contract

Why it is needed:
- in-memory storage is acceptable for the prototype but not for any serious usage
- persistence preparation should happen behind the repository abstraction, not through API changes

What is included:
- define persistence-ready aggregate serialization
- add repository tests that are independent from the in-memory implementation
- prepare a migration path from in-memory storage to durable storage
- decide the minimal persistence shape needed for story sessions

What is not included:
- no public product features
- no auth rollout
- no public catalog
- no infrastructure-heavy production setup in the same step
