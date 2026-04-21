# FanStory

FanStory is a clean-slate Next.js foundation for an interactive AI-story product.

This codebase is intentionally **not a refactor of the old MVP structure**. The previous prototype was used only as a logic reference for the story loop. The application, database schema, server boundaries, and UI flows in this folder were rebuilt from scratch as a modular monolith oriented toward a final product foundation.

## Project Structure

```text
fanstory/
  app/
    (marketing)/
    (auth)/sign-in/
    (app)/
      dashboard/
      stories/
      saves/
      wallet/
      subscriptions/
    api/auth/[...nextauth]/
  components/
    layout/
    shared/
    ui/
  entities/
    monetization/
    story/
    save/
    wallet/
    purchase/
    subscription/
    user/
  features/
    auth/
    i18n/
    profile/
    stories/
    story-reader/
    saves/
    wallet/
    subscriptions/
  lib/
    db/
    env/
    i18n/
    validations/
  prisma/
    schema.prisma
    seed.ts
  server/
    access/
    auth/
    monetization/
    profile/
    purchases/
    saves/
    stories/
    story-generation/
    story-reader/
    subscriptions/
    wallet/
  docs/
```

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Prisma 7
- PostgreSQL
- Auth.js / NextAuth with Google login
- Zod
- Server Actions
- ESLint + Prettier

## What Is Implemented

- Landing page
- Google-only sign-in page
- Protected application routes via `proxy.ts`
- Dashboard / profile center
- Story list page
- New story generation flow
- Story detail page
- Reader / play mode
- Save creation and save listing
- Chapter entitlement economy with a server-side ledger
- Welcome grant on first protected access
- Chapter pack purchase flow
- Subscription daily quota flow
- Rewarded ad mock/dev unlock flow
- Provider abstraction for AI generation with both mock and OpenAI providers
- Prisma schema for users, auth, stories, runs, chapters, saves, purchases, products, entitlements, subscriptions, rewarded ads, and generation logs
- Seed script for monetization products

## Domain Model

Core persisted models:

- `User`
- `Account`
- `Session`
- `VerificationToken`
- `Authenticator`
- `Story`
- `StoryRun`
- `StoryChapter`
- `StoryChoice`
- `StoryDecision`
- `Save`
- `MonetizationProduct`
- `ChapterEntitlementLedger`
- `RewardedAdGrant`
- `Wallet`
- `WalletTransaction`
- `Purchase`
- `SubscriptionPlan`
- `Subscription`
- `GenerationLog`

Important product rules already encoded in the server layer:

- unauthenticated users do not reach dashboard/product routes
- Google login creates a persisted account through the Auth.js Prisma adapter
- the profile is the center of user operations
- chapter access is evaluated outside UI in `server/access`
- monetization is sourced from the entitlement ledger, not from React state
- subscriptions are a separate access layer, not a UI flag
- rereading existing chapters and opening saves never consumes chapter access

## Architecture

### 1. Modular monolith

The app is one Next.js deployment, but the code is split by responsibility:

- `features/*` for product-facing UI slices
- `entities/*` for view models and domain-facing types
- `server/*` for use cases, access rules, mutations and orchestration
- `lib/*` for environment, Prisma and shared validation

### 2. Provider abstraction for AI

The story engine never imports a provider inside components.

Current flow:

- `server/story-generation/types.ts` defines provider contracts
- `server/story-generation/mock-provider.ts` implements a working provider
- `server/story-generation/openai-provider.ts` implements the real OpenAI provider through the official SDK
- `server/story-generation/provider.ts` resolves the active provider

Supported contracts:

- `generateInitialStory`
- `applyChoice`
- `generateNextChapter`

The UI remains provider-agnostic. All provider selection, prompting, structured validation, and diagnostics stay inside `server/story-generation`.

### 3. Access and monetization

Chapter access is not hardcoded in React components.

Instead:

- `server/monetization/catalog.ts` defines the product catalog and shared constants
- `server/monetization/entitlement.service.ts` owns welcome grants, daily subscription grants, balance calculation, and consumption order
- `server/purchases/purchase.service.ts` grants pack-based chapter credits
- `server/subscriptions/subscription.service.ts` activates subscription products and daily quota coverage
- `server/monetization/rewarded-ad.service.ts` grants one-chapter ad unlocks through a provider abstraction
- `server/access/access.service.ts` exposes reader-friendly next-chapter access state

Consumption order:

1. Welcome grant
2. Daily subscription quota
3. Purchased chapter packs
4. Rewarded ad unlocks

### 4. Story state

The current story run stores structured state on `StoryRun`:

- `currentStateSummary`
- `activeGoals`
- `unresolvedTensions`
- `knownFacts`

This is the foundation for evolving the reader into a richer state-driven engine instead of treating prose as the only source of truth.

### 5. i18n architecture

Localization is implemented as an application foundation, not as scattered UI conditionals.

Main pieces:

- `lib/i18n/config.ts` defines supported locales and the locale cookie
- `lib/i18n/messages/*` stores dictionaries for `en` and `ru`
- `lib/i18n/translator.ts` resolves string keys and interpolation
- `lib/i18n/server.ts` resolves the effective locale from cookie or `Accept-Language`
- `lib/i18n/actions.ts` persists the selected language
- `features/i18n/components/language-switcher.tsx` switches locale without touching domain services

Rules:

- no business logic was moved into UI for localization
- `app/*` still only composes routes and screens
- `server/*` remains focused on use cases, not UI copy
- components consume translations via the shared i18n layer, not `if (language === ...)`

Persistence:

- current language is stored in the `fanstory-locale` cookie
- Prisma `User` now has an optional `preferredLanguage` field as a future-ready place for account-level persistence
- the current implementation still prefers lightweight cookie-based locale selection to avoid coupling auth/session flow to UI localization too early

## Local Run

### 1. Install

```bash
npm install
```

### 2. Configure env

Copy the example file and replace placeholders:

```bash
cp .env.example .env
```

Required envs:

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_TRUST_HOST`
- `NEXT_PUBLIC_APP_URL`
- `STORY_PROVIDER`
- `OPENAI_API_KEY` when `STORY_PROVIDER=openai`
- `OPENAI_MODEL` when `STORY_PROVIDER=openai`
- `ENABLE_DEV_BILLING_TOOLS` for local-only mock purchases and mock subscription activation

### 3. Generate Prisma client

```bash
npm run db:generate
```

### 4. Apply schema and seed data

Make sure PostgreSQL is running, then:

```bash
npm run db:push
npm run db:seed
```

### 5. Start the app

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Useful Commands

```bash
npm run check
npm run lint
npm run typecheck
npm run build
npm run format
npm run db:studio
```

## Production Notes

- `STORY_PROVIDER=mock` is intentionally rejected in `NODE_ENV=production`.
- Mock chapter pack purchases and mock subscription activation are disabled by default and require `ENABLE_DEV_BILLING_TOOLS=true` in non-production environments.
- Rewarded ads currently run through a mock provider in non-production environments only.
- Subscription daily quota resets on UTC midnight in v1.
- Sign-in callback redirects are sanitized to internal paths only.
- The app ships with baseline security headers via `next.config.ts`.
- `.github/workflows/ci.yml` runs `npm run check` on pushes and pull requests.

## Seed Data

`prisma/seed.ts` creates the monetization catalog:

- `chapter-pack-10` for 200 RUB
- `chapter-pack-50` with temporary linear placeholder pricing
- `chapter-pack-100` with temporary linear placeholder pricing
- `subscription-monthly` for 1499 RUB
- `subscription-yearly` for 5999 RUB

These are enough to exercise pack purchases, subscription activation, and access coverage during development.

## Current Product Flow

1. User signs in with Google.
2. Auth.js persists `User` + `Account` data.
3. The first protected request ensures a one-time welcome grant of 10 chapters.
4. User creates a story.
5. Story service calls the active generation provider and persists:
   - `Story`
   - `StoryRun`
   - first `StoryChapter`
   - first `StoryChoice[]`
   - `GenerationLog`
6. Reader shows the latest chapter and the next choices.
7. Access service decides whether the next chapter will consume welcome chapters, daily subscription quota, purchased pack chapters, or a rewarded ad unlock.
8. If no access is left, the user can buy a chapter pack, activate a subscription, or claim one ad unlock.
9. Reader progression stores `StoryDecision`, consumes one chapter entitlement only after successful generation, and appends the new chapter.
10. Save flow persists checkpoints in `Save`.

## Extension Points

### AI providers

The production path now supports `STORY_PROVIDER=openai` with:

- official OpenAI SDK
- Responses API structured output parsing
- Zod schema validation
- stage-specific prompts for initial story, choice resolution, and next chapter
- diagnostic server logs with request IDs and generation stage metadata

The mock provider remains available for local development or offline work.

### Real payments

Replace mock pack purchases and mock subscription activation with:

- payment intent creation
- provider webhooks
- purchase reconciliation against `ChapterEntitlementLedger`
- subscription renewal / expiration sync

The current architecture already separates these concerns from the UI.

### Real rewarded ads

Replace the mock rewarded ad provider with:

- client ad SDK callbacks
- server-side verification tokens
- provider-specific fraud checks
- durable verification references on `RewardedAdGrant`

The reader flow and entitlement service do not need to change for that swap.

### Richer save/branch mechanics

`Save.snapshot` already stores serialized run state. This can evolve into:

- restore-to-run
- branch creation
- alternate timeline tracking

### Catalog / public stories

The current product is profile-centric. Public catalog or shareable story routes can be added without changing the internal ownership model.

## Verification

Verified locally in this workspace:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run db:push`
- `npm run db:seed`
