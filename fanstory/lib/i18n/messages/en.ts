const enMessages = {
  metadata: {
    title: "FanStory",
    description:
      "Interactive AI stories with wallet, saves, chapter access, subscriptions and Google-only authentication.",
  },
  common: {
    appName: "FanStory",
    language: {
      label: "Language",
      english: "English",
      russian: "Russian",
      switchTo: "Switch language",
    },
    actions: {
      createStory: "Create story",
      startStory: "Start a story",
      openDashboard: "Open dashboard",
      openReader: "Open reader",
      openStory: "Open story",
      viewAll: "View all",
      browseStories: "Browse stories",
      backToStories: "Back to stories",
      saveProgress: "Save progress",
      unlockNextChapter: "Unlock next chapter",
      addDemoCredits: "Add demo credits",
      activateMockPlan: "Activate mock plan",
      continueWithGoogle: "Continue with Google",
      signIn: "Sign in",
      signOut: "Sign out",
      newStory: "New story",
      generateFirstChapter: "Generate first chapter",
    },
    states: {
      noActiveSubscription: "No active subscription",
      noActivePlan: "No active plan",
      free: "Free",
      premium: "Premium",
      active: "Active",
      yes: "Yes",
      no: "No",
    },
    enums: {
      accessReason: {
        FREE: "free",
        PURCHASED: "purchased",
        SUBSCRIPTION: "subscription",
        LOCKED: "locked",
      },
      chapterAccessMode: {
        FREE: "Free",
        PAY_PER_CHAPTER: "Premium",
        SUBSCRIPTION: "Subscription",
      },
      storyLanguage: {
        en: "English",
        ru: "Russian",
      },
      subscriptionInterval: {
        MONTHLY: "Monthly",
        YEARLY: "Yearly",
        LIFETIME: "Lifetime",
      },
      walletTransactionType: {
        STARTER_GRANT: "Starter grant",
        CREDIT_TOP_UP: "Credit top-up",
        CHAPTER_PURCHASE: "Chapter purchase",
        SUBSCRIPTION_PURCHASE: "Subscription purchase",
        REFUND: "Refund",
        ADJUSTMENT: "Adjustment",
      },
      subscriptionStatus: {
        ACTIVE: "Active",
        CANCELED: "Canceled",
        EXPIRED: "Expired",
        TRIALING: "Trialing",
        PAST_DUE: "Past due",
      },
    },
    loading: {
      title: "Loading FanStory",
      description:
        "Preparing the next screen, current language and product workspace.",
    },
    errors: {
      title: "Something went wrong",
      description:
        "The request could not be completed. Try refreshing the page or return to the dashboard.",
      reset: "Try again",
      goHome: "Go to home",
    },
    empty: {
      title: "Nothing here yet",
      description: "This section will populate as the product data grows.",
    },
    labels: {
      chapter: "Chapter",
      updated: "updated",
      created: "created",
      status: "Status",
      account: "Account",
      subscription: "Subscription",
      recentStories: "Recent stories",
      recentSaves: "Recent saves",
      wallet: "Wallet",
      ledger: "Ledger",
      profile: "Profile",
      stories: "Stories",
      saves: "Saves",
      balance: "Balance",
      premiumAccess: "Premium access",
      currentStoryState: "Current story state",
      decisionHistory: "Decision history",
      chapterTimeline: "Chapter timeline",
      currentSubscription: "Current subscription",
      saveCheckpoint: "Create a save",
      nextChapterAccess: "Next chapter access",
      chooseNextMove: "Choose the next move",
      storyLibrary: "Story library",
      storyLanguage: "Story language",
    },
    relative: {
      ago: "{value} ago",
    },
  },
  navigation: {
    dashboard: "Dashboard",
    stories: "Stories",
    saves: "Saves",
    wallet: "Wallet",
    subscriptions: "Subscriptions",
    productNote: "Product note",
    productNoteDescription:
      "Chapters, subscriptions, wallet and generation are already separated in the server layer, so payment and AI providers can evolve without rewriting UI routes.",
    workspaceEyebrow: "Interactive AI storytelling",
    workspaceTitle: "Command center",
  },
  landing: {
    badge: "Final-product foundation for interactive AI fiction",
    title: "FanStory turns branching AI fiction into a real product surface.",
    description:
      "Google sign-in, profile-centric UX, wallet and chapter access, story saves, subscription-ready entitlements, and a provider layer prepared for OpenAI or another generation backend.",
    heroPrimary: "Start building stories",
    heroSecondary: "Open dashboard",
    architectureTitle: "Product-ready architecture, not a one-shot demo",
    architectureCards: [
      {
        title: "Dedicated access service",
        description:
          "Premium chapter gating is evaluated in a dedicated access service.",
      },
      {
        title: "Wallet-ledger split",
        description:
          "Wallet and purchase ledger are separate from components and forms.",
      },
      {
        title: "Provider abstraction",
        description:
          "Provider abstraction is ready to swap mock generation for a live model.",
      },
    ],
    pillars: [
      {
        title: "Interactive story engine",
        description:
          "Chapters are generated as a coherent run with structured state, choice history and a provider abstraction ready for real AI backends.",
      },
      {
        title: "Profile as control center",
        description:
          "Stories, saves, balance, purchases and subscription status live under one dashboard instead of being scattered across temporary pages.",
      },
      {
        title: "Monetization foundations",
        description:
          "Wallet, purchase and subscription access are modeled server-side, so future payment providers can be integrated without rewriting core UI flows.",
      },
    ],
  },
  signIn: {
    badge: "Google-only access",
    title: "Enter FanStory",
    description:
      "Authentication is intentionally constrained to Google. Once the account is created, the user lands in a profile-driven workspace with stories, saves, balance and access data.",
    foundation: "Auth.js + Prisma adapter + protected routes",
  },
  dashboard: {
    eyebrow: "Profile",
    title: "Welcome back, {name}",
    description:
      "Your profile is the operational center for stories, saves, purchases, balance and subscription status.",
    metrics: {
      stories: {
        label: "Stories",
        hint: "Interactive narratives currently owned by this account.",
      },
      saves: {
        label: "Saves",
        hint: "Checkpoints available for reader resume and future branching.",
      },
      balance: {
        label: "Balance",
        hint: "Wallet is managed server-side, separate from UI actions.",
      },
      premiumAccess: {
        label: "Premium access",
      },
    },
    recentStories: {
      title: "Recent stories",
      description: "Latest story activity and current chapter progress.",
      item: "{chapterLabel} {chapterNumber} • {updatedLabel} {updatedAt}",
      emptyTitle: "No stories yet",
      emptyDescription:
        "Create the first story to populate the dashboard, wallet flows and reader mode.",
    },
    profileStatus: {
      title: "Profile status",
      recentSavesEmpty:
        "Saves will appear after the first reader checkpoint is created.",
      recentSaveItem: "{storyTitle} • {chapterLabel} {chapterNumber}",
    },
  },
  stories: {
    list: {
      eyebrow: "Stories",
      title: "Story library",
      description:
        "All generated stories for the authenticated user. Each story owns its chapters, run state and entitlement checks.",
      synopsisFallback: "Story set in {universe}.",
      emptyTitle: "No stories generated",
      emptyDescription:
        "Use the new story flow to create a story aggregate, initial chapter and first choice set.",
      cardUpdated:
        "{updatedLabel} {updatedAt} • {chapterCount} generated chapters",
    },
    create: {
      eyebrow: "Story generation",
      title: "Create a new story",
      description:
        "A new story creates a persisted aggregate with config, first chapter, choices and a run-state snapshot.",
      formTitle: "Create a new interactive story",
      formDescription:
        "This form writes into the story-generation service, not directly into UI state. The first chapter is generated immediately through the provider abstraction.",
      fields: {
        contentLanguage: "Story language",
        title: "Story title",
        synopsis: "Synopsis",
        universe: "Universe",
        protagonist: "Protagonist",
        theme: "Theme",
        genre: "Genre",
        tone: "Tone",
      },
      hints: {
        contentLanguage:
          "Controls the language of generated chapters, state summaries and choices. It is independent from the UI locale.",
      },
      placeholders: {
        title: "The House Behind the Signal",
        synopsis:
          "A compact promise of the world, conflict and emotional direction.",
        universe: "Neo-Victorian megacity",
        protagonist: "A disgraced archivist",
        theme: "Memory manipulation",
        genre: "Speculative mystery",
        tone: "Tense, intimate, cinematic",
      },
    },
    detail: {
      eyebrow: "Story detail",
      descriptionFallback: "Interactive story metadata and current run state.",
      currentStateTitle: "Current story state",
      activeGoals: "Active goals",
      tensions: "Tensions",
      knownFacts: "Known facts",
      decisionHistory: "Decision history",
      noDecisions:
        "No decisions resolved yet. The first chapter is ready in reader mode.",
      decisionItem: "{chapterLabel} {chapterNumber}: {selectedLabel}",
      chapterTimeline: "Chapter timeline",
    },
    reader: {
      eyebrow: "Reader",
      description:
        "Play mode for the current story run, including entitlement checks and save checkpoints.",
      chapterBadge: "{chapterLabel} {chapterNumber}",
      chooseTitle: "Choose the next move",
      chooseDescription:
        "Choices are stored server-side and the next chapter is generated only after access control confirms entitlement.",
      lockedChoices:
        "Unlock the next chapter first. Choice forms stay disabled until access is granted by either chapter purchase or an active subscription.",
      checkpointPlaceholder: "Checkpoint label",
      saveDescription:
        "Existing saves: {count}. Saves store the run snapshot and chapter pointer for future resume and branching work.",
      accessDescription:
        "Access is evaluated in a dedicated service layer. UI only reflects the decision.",
      accessAllowed: "Next chapter is already available via {reason} access.",
      accessLocked:
        "{chapterLabel} {chapterNumber} is locked. Unlock for {price} or cover it with a subscription.",
    },
  },
  saves: {
    eyebrow: "Saves",
    title: "Saved checkpoints",
    description:
      "Saves are persisted snapshots that can later support richer resume and branching behavior.",
    emptyTitle: "No saves yet",
    emptyDescription:
      "Open the reader and create a checkpoint. Saved snapshots are ready for richer restore and branching mechanics later.",
    cardMeta: "{storyTitle} • {chapterLabel} {chapterNumber}",
    button: "Open save",
  },
  wallet: {
    eyebrow: "Wallet",
    title: "Balance and ledger",
    description:
      "Credits, ledger history and placeholder top-up flow live in a dedicated wallet service.",
    descriptionCard:
      "Wallet balance is updated through a dedicated service and transaction ledger, not with UI-local state. Real payment integration can replace the demo top-up action without changing page components.",
    ledgerTitle: "Ledger",
    table: {
      type: "Type",
      description: "Description",
      amount: "Amount",
      balanceAfter: "Balance after",
      when: "When",
    },
    transactionDescriptions: {
      STARTER_GRANT: "Starter credits granted on first sign-in.",
      CREDIT_TOP_UP:
        "Demo credits added for local development and purchase testing.",
      CHAPTER_PURCHASE: "Credits spent to unlock a premium chapter.",
      SUBSCRIPTION_PURCHASE: "Credits spent on subscription access.",
      REFUND: "Credits returned to the wallet.",
      ADJUSTMENT: "Manual wallet adjustment.",
    },
  },
  subscriptions: {
    eyebrow: "Subscriptions",
    title: "Subscription access layer",
    description:
      "Subscription logic is modeled separately from UI so premium access can later be driven by a billing provider, webhooks and entitlement sync.",
    currentTitle: "Current subscription",
    noActive:
      "No active plan. Subscription architecture is already wired into chapter access, purchases and reader gating.",
    statusLine: "Status: {status}{endsAt}",
    statusEndsAt: " • ends {date}",
    unlimitedPremiumAccess: "Unlimited premium access: {value}",
    chapterDiscount: "Chapter discount: {value}%",
    integrationReady:
      "Foundation ready for future payment and webhook integration",
    planDescriptions: {
      "fanstory-plus-monthly":
        "Unlimited premium chapter access while active, prioritized generation queue, and subscription-based gating foundation.",
      "fanstory-pro-yearly":
        "Long-term plan for heavy users with yearly billing placeholder and room for future payment provider integration.",
    },
  },
  userMenu: {
    fallbackName: "FanStory User",
  },
} as const;

export default enMessages;
