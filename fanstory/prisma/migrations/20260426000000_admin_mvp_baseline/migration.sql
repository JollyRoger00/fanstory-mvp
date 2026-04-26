-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AppLocale" AS ENUM ('en', 'ru');

-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StoryContentLanguage" AS ENUM ('en', 'ru');

-- CreateEnum
CREATE TYPE "StoryRunStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ChapterStatus" AS ENUM ('PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChapterAccessMode" AS ENUM ('FREE', 'PAY_PER_CHAPTER', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "PurchaseType" AS ENUM ('CHAPTER', 'CHAPTER_PACK', 'SUBSCRIPTION', 'CREDIT_TOP_UP', 'MANUAL_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('STARTER_GRANT', 'CREDIT_TOP_UP', 'CHAPTER_PURCHASE', 'SUBSCRIPTION_PURCHASE', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "SubscriptionPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SubscriptionInterval" AS ENUM ('MONTHLY', 'YEARLY', 'LIFETIME');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'EXPIRED', 'TRIALING', 'PAST_DUE');

-- CreateEnum
CREATE TYPE "MonetizationProductType" AS ENUM ('CHAPTER_PACK', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "MonetizationProductStatus" AS ENUM ('ACTIVE', 'DRAFT', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ChapterEntitlementEventType" AS ENUM ('GRANT', 'CONSUME');

-- CreateEnum
CREATE TYPE "ChapterEntitlementSource" AS ENUM ('WELCOME', 'SUBSCRIPTION_DAILY', 'PURCHASE_PACK', 'REWARDED_AD');

-- CreateEnum
CREATE TYPE "RewardedAdProvider" AS ENUM ('MOCK', 'YAN');

-- CreateEnum
CREATE TYPE "RewardedAdGrantStatus" AS ENUM ('GRANTED', 'CONSUMED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('YOOKASSA');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'WAITING_FOR_CAPTURE', 'SUCCEEDED', 'CANCELED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentApplyStatus" AS ENUM ('PENDING', 'APPLIED');

-- CreateEnum
CREATE TYPE "PaymentWebhookEventStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED');

-- CreateEnum
CREATE TYPE "GenerationProvider" AS ENUM ('MOCK', 'OPENAI');

-- CreateEnum
CREATE TYPE "GenerationEventType" AS ENUM ('STORY_CREATED', 'CHOICE_APPLIED', 'CHAPTER_GENERATED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "preferredLanguage" "AppLocale",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "targetUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sessionToken")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "Authenticator" (
    "credentialID" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId","credentialID")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'CREDITS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purchaseId" TEXT,
    "type" "WalletTransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "synopsis" TEXT,
    "universe" TEXT NOT NULL,
    "protagonist" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "contentLanguage" "StoryContentLanguage" NOT NULL DEFAULT 'en',
    "status" "StoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "accessPrice" INTEGER NOT NULL DEFAULT 15,
    "provider" "GenerationProvider" NOT NULL DEFAULT 'MOCK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryRun" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "StoryRunStatus" NOT NULL DEFAULT 'ACTIVE',
    "provider" "GenerationProvider" NOT NULL DEFAULT 'MOCK',
    "promptVersion" TEXT NOT NULL DEFAULT 'mock-v1',
    "currentChapterNumber" INTEGER NOT NULL DEFAULT 1,
    "currentStateSummary" TEXT NOT NULL,
    "activeGoals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "unresolvedTensions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "knownFacts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastChoiceSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryChapter" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "storyRunId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ChapterStatus" NOT NULL DEFAULT 'PUBLISHED',
    "accessMode" "ChapterAccessMode" NOT NULL DEFAULT 'PAY_PER_CHAPTER',
    "priceCredits" INTEGER NOT NULL DEFAULT 15,
    "generatedBy" "GenerationProvider" NOT NULL DEFAULT 'MOCK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryChoice" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "outcomeHint" TEXT,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryDecision" (
    "id" TEXT NOT NULL,
    "storyRunId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "storyChapterId" TEXT NOT NULL,
    "storyChoiceId" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "selectedLabel" TEXT NOT NULL,
    "resolutionSummary" TEXT NOT NULL,
    "resultingStateSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Save" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "storyRunId" TEXT NOT NULL,
    "storyChapterId" TEXT,
    "label" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "stateSummary" TEXT NOT NULL,
    "snapshot" JSONB,
    "lastOpenedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Save_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonetizationProduct" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "MonetizationProductType" NOT NULL,
    "status" "MonetizationProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceRubles" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "interval" "SubscriptionInterval",
    "chapterAmount" INTEGER,
    "dailyChapterLimit" INTEGER,
    "isPriceFinal" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonetizationProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "SubscriptionPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "interval" "SubscriptionInterval" NOT NULL DEFAULT 'MONTHLY',
    "priceCredits" INTEGER NOT NULL DEFAULT 0,
    "chapterDiscountPercent" INTEGER NOT NULL DEFAULT 100,
    "unlimitedPremiumAccess" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "productId" TEXT,
    "purchaseId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "renewsAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT,
    "storyId" TEXT,
    "subscriptionPlanId" TEXT,
    "productId" TEXT,
    "type" "PurchaseType" NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "chapterNumber" INTEGER,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "providerPaymentId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "applyStatus" "PaymentApplyStatus" NOT NULL DEFAULT 'PENDING',
    "amountRubles" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "idempotenceKey" TEXT NOT NULL,
    "confirmationUrl" TEXT,
    "returnUrl" TEXT,
    "failureReason" TEXT,
    "providerPayload" JSONB,
    "paidAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "lastWebhookAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentWebhookEvent" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT,
    "provider" "PaymentProvider" NOT NULL,
    "eventType" TEXT NOT NULL,
    "providerObjectId" TEXT NOT NULL,
    "dedupKey" TEXT NOT NULL,
    "status" "PaymentWebhookEventStatus" NOT NULL DEFAULT 'RECEIVED',
    "remoteIp" TEXT,
    "payload" JSONB NOT NULL,
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchasedChapterAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "storyRunId" TEXT,
    "storyChapterId" TEXT,
    "purchaseId" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchasedChapterAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardedAdGrant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "RewardedAdProvider" NOT NULL DEFAULT 'MOCK',
    "status" "RewardedAdGrantStatus" NOT NULL DEFAULT 'GRANTED',
    "verificationKey" TEXT NOT NULL,
    "grantQuantity" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "consumedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardedAdGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterEntitlementLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purchaseId" TEXT,
    "subscriptionId" TEXT,
    "rewardedAdGrantId" TEXT,
    "eventType" "ChapterEntitlementEventType" NOT NULL,
    "source" "ChapterEntitlementSource" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "storyId" TEXT,
    "storyRunId" TEXT,
    "chapterNumber" INTEGER,
    "effectiveDate" TIMESTAMP(3),
    "dedupKey" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChapterEntitlementLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "storyRunId" TEXT,
    "provider" "GenerationProvider" NOT NULL,
    "eventType" "GenerationEventType" NOT NULL,
    "status" TEXT NOT NULL,
    "promptVersion" TEXT,
    "latencyMs" INTEGER,
    "input" JSONB,
    "output" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AdminAuditLog_adminUserId_createdAt_idx" ON "AdminAuditLog"("adminUserId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AdminAuditLog_targetUserId_createdAt_idx" ON "AdminAuditLog"("targetUserId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AdminAuditLog_action_createdAt_idx" ON "AdminAuditLog"("action", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AdminAuditLog_entityType_entityId_createdAt_idx" ON "AdminAuditLog"("entityType", "entityId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "Authenticator"("credentialID");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "WalletTransaction_walletId_createdAt_idx" ON "WalletTransaction"("walletId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Story_slug_key" ON "Story"("slug");

-- CreateIndex
CREATE INDEX "Story_userId_createdAt_idx" ON "Story"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "StoryRun_userId_updatedAt_idx" ON "StoryRun"("userId", "updatedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "StoryRun_storyId_userId_key" ON "StoryRun"("storyId", "userId");

-- CreateIndex
CREATE INDEX "StoryChapter_storyRunId_number_idx" ON "StoryChapter"("storyRunId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "StoryChapter_storyId_number_key" ON "StoryChapter"("storyId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "StoryChoice_chapterId_key_key" ON "StoryChoice"("chapterId", "key");

-- CreateIndex
CREATE INDEX "StoryDecision_storyRunId_createdAt_idx" ON "StoryDecision"("storyRunId", "createdAt");

-- CreateIndex
CREATE INDEX "Save_userId_createdAt_idx" ON "Save"("userId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "MonetizationProduct_code_key" ON "MonetizationProduct"("code");

-- CreateIndex
CREATE INDEX "MonetizationProduct_type_status_priceRubles_idx" ON "MonetizationProduct"("type", "status", "priceRubles");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_code_key" ON "SubscriptionPlan"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_purchaseId_key" ON "Subscription"("purchaseId");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");

-- CreateIndex
CREATE INDEX "Subscription_productId_idx" ON "Subscription"("productId");

-- CreateIndex
CREATE INDEX "Purchase_userId_createdAt_idx" ON "Purchase"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Purchase_productId_idx" ON "Purchase"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_purchaseId_key" ON "Payment"("purchaseId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_providerPaymentId_key" ON "Payment"("providerPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotenceKey_key" ON "Payment"("idempotenceKey");

-- CreateIndex
CREATE INDEX "Payment_userId_createdAt_idx" ON "Payment"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Payment_provider_status_createdAt_idx" ON "Payment"("provider", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Payment_productId_createdAt_idx" ON "Payment"("productId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentWebhookEvent_dedupKey_key" ON "PaymentWebhookEvent"("dedupKey");

-- CreateIndex
CREATE INDEX "PaymentWebhookEvent_paymentId_createdAt_idx" ON "PaymentWebhookEvent"("paymentId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "PaymentWebhookEvent_provider_providerObjectId_createdAt_idx" ON "PaymentWebhookEvent"("provider", "providerObjectId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PurchasedChapterAccess_userId_storyId_chapterNumber_key" ON "PurchasedChapterAccess"("userId", "storyId", "chapterNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RewardedAdGrant_verificationKey_key" ON "RewardedAdGrant"("verificationKey");

-- CreateIndex
CREATE INDEX "RewardedAdGrant_userId_status_createdAt_idx" ON "RewardedAdGrant"("userId", "status", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ChapterEntitlementLedger_dedupKey_key" ON "ChapterEntitlementLedger"("dedupKey");

-- CreateIndex
CREATE INDEX "ChapterEntitlementLedger_userId_createdAt_idx" ON "ChapterEntitlementLedger"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ChapterEntitlementLedger_userId_source_createdAt_idx" ON "ChapterEntitlementLedger"("userId", "source", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ChapterEntitlementLedger_userId_effectiveDate_source_idx" ON "ChapterEntitlementLedger"("userId", "effectiveDate", "source");

-- CreateIndex
CREATE INDEX "GenerationLog_storyId_createdAt_idx" ON "GenerationLog"("storyId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryRun" ADD CONSTRAINT "StoryRun_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryRun" ADD CONSTRAINT "StoryRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryChapter" ADD CONSTRAINT "StoryChapter_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryChapter" ADD CONSTRAINT "StoryChapter_storyRunId_fkey" FOREIGN KEY ("storyRunId") REFERENCES "StoryRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryChoice" ADD CONSTRAINT "StoryChoice_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "StoryChapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryDecision" ADD CONSTRAINT "StoryDecision_storyRunId_fkey" FOREIGN KEY ("storyRunId") REFERENCES "StoryRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryDecision" ADD CONSTRAINT "StoryDecision_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryDecision" ADD CONSTRAINT "StoryDecision_storyChapterId_fkey" FOREIGN KEY ("storyChapterId") REFERENCES "StoryChapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryDecision" ADD CONSTRAINT "StoryDecision_storyChoiceId_fkey" FOREIGN KEY ("storyChoiceId") REFERENCES "StoryChoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Save" ADD CONSTRAINT "Save_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Save" ADD CONSTRAINT "Save_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Save" ADD CONSTRAINT "Save_storyRunId_fkey" FOREIGN KEY ("storyRunId") REFERENCES "StoryRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Save" ADD CONSTRAINT "Save_storyChapterId_fkey" FOREIGN KEY ("storyChapterId") REFERENCES "StoryChapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_productId_fkey" FOREIGN KEY ("productId") REFERENCES "MonetizationProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_productId_fkey" FOREIGN KEY ("productId") REFERENCES "MonetizationProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "MonetizationProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentWebhookEvent" ADD CONSTRAINT "PaymentWebhookEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasedChapterAccess" ADD CONSTRAINT "PurchasedChapterAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasedChapterAccess" ADD CONSTRAINT "PurchasedChapterAccess_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasedChapterAccess" ADD CONSTRAINT "PurchasedChapterAccess_storyRunId_fkey" FOREIGN KEY ("storyRunId") REFERENCES "StoryRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasedChapterAccess" ADD CONSTRAINT "PurchasedChapterAccess_storyChapterId_fkey" FOREIGN KEY ("storyChapterId") REFERENCES "StoryChapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasedChapterAccess" ADD CONSTRAINT "PurchasedChapterAccess_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardedAdGrant" ADD CONSTRAINT "RewardedAdGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterEntitlementLedger" ADD CONSTRAINT "ChapterEntitlementLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterEntitlementLedger" ADD CONSTRAINT "ChapterEntitlementLedger_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterEntitlementLedger" ADD CONSTRAINT "ChapterEntitlementLedger_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterEntitlementLedger" ADD CONSTRAINT "ChapterEntitlementLedger_rewardedAdGrantId_fkey" FOREIGN KEY ("rewardedAdGrantId") REFERENCES "RewardedAdGrant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationLog" ADD CONSTRAINT "GenerationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationLog" ADD CONSTRAINT "GenerationLog_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationLog" ADD CONSTRAINT "GenerationLog_storyRunId_fkey" FOREIGN KEY ("storyRunId") REFERENCES "StoryRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

