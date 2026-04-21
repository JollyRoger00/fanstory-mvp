# FanStory Architecture

## Intent

FanStory is structured as a modular monolith on top of Next.js App Router.

The objective is not to split into microservices early, but to keep hard business boundaries visible so the product can grow without turning into route-driven spaghetti.

## Layers

### `app/*`

Route composition, server components, layouts and top-level page assembly.

Rules:

- no direct entitlement math
- no entitlement decisions
- no provider-specific generation logic

### `features/*`

Product-facing UI sections grouped by user task:

- auth
- profile
- stories
- story-reader
- saves
- wallet
- subscriptions

Rules:

- can render data and forms
- can call server actions
- cannot own core business rules

### `entities/*`

Typed view models and domain-facing shapes consumed by features.

These keep the UI decoupled from Prisma return shapes.

### `server/*`

The main application layer.

This is where the real product logic lives:

- story creation
- story continuation
- chapter access evaluation
- chapter pack purchase flow
- entitlement ledger updates
- rewarded ad grants
- subscription coverage
- dashboard aggregation
- save creation

### `lib/*`

Cross-cutting foundations:

- Prisma client
- env parsing
- validation schemas
- generic helpers

## Story Domain Design

### `Story`

Stable user-owned content container.

Stores:

- title
- universe
- protagonist
- theme
- genre
- tone
- synopsis

### `StoryRun`

Current interactive progression state for a story.

Stores:

- current chapter pointer
- current state summary
- structured state arrays
- provider metadata

This is the product-ready place to grow branching, restore or replay logic.

### `StoryChapter`

Persisted chapter artifact for a run.

Stores:

- title
- summary
- full content

Generated chapters are rereadable for free. Monetization gates the next generation step, not the already-persisted chapter content.

### `StoryChoice`

Selectable continuation option for the latest chapter.

Identity is modeled explicitly and never inferred from list order.

### `StoryDecision`

Persisted record of which choice was used and what state shift it caused.

This is the history spine for future analytics, recap and branching support.

## Monetization Design

### Product catalog

`MonetizationProduct` is the server-owned catalog for:

- chapter packs
- subscription plans

Prices and quotas are seeded centrally and never hardcoded inside UI components.

### Entitlements

`ChapterEntitlementLedger` is the auditable source of truth for chapter access.

It stores append-only grants and consumes for:

- welcome access
- daily subscription access
- purchased packs
- rewarded ads

The access service uses one predictable order:

1. welcome grant
2. daily subscription quota
3. purchased chapter packs
4. rewarded ad unlocks

### Purchases

`Purchase` is the commerce event. It can point to either a chapter pack or a subscription product.

Purchases grant ledger entries. The reader never mutates balances or grants access directly.

### Subscriptions

`Subscription` is modeled separately from the chapter UI.

The reader only asks the access service whether the next chapter is available. It does not know whether the source is:

- welcome chapters
- daily subscription chapters
- chapter packs
- rewarded ad unlocks

## AI Provider Abstraction

All generation-related code is behind `StoryGenerationProvider`.

Current methods:

- `generateInitialStory`
- `applyChoice`
- `generateNextChapter`

Current implementations:

- `MockStoryGenerationProvider`
- `OpenAIStoryGenerationProvider`

This keeps provider concerns isolated inside `server/story-generation` while the rest of the product stays unaware of the active AI backend.

## Auth and Route Protection

Google sign-in is the only authentication method.

Protection happens at two levels:

- `proxy.ts` blocks anonymous access to app routes
- `requireUser()` in the protected layout enforces server-side authorization again

This avoids relying on the client for access control.

## Why This Shape Scales

The important part is not the number of files. The important part is that future work has a clear home:

- OpenAI integration goes into `server/story-generation`
- billing provider integration goes into `server/purchases` and `server/subscriptions`
- branching saves go into `server/saves` and `server/story-reader`
- catalog/community features can add new features and routes without rewriting current ownership or access rules
