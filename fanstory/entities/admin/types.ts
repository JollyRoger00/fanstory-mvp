export type AdminPagination = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type AdminOverviewView = {
  totalUsers: number;
  newUsersLast24Hours: number;
  totalStories: number;
  totalPayments: number;
  successfulPayments: number;
  activeSubscriptions: number;
  generationErrorsLast24Hours: number;
};

export type AdminUserListItem = {
  id: string;
  email: string | null;
  name: string | null;
  createdAt: Date;
  emailVerified: Date | null;
  role: "USER" | "ADMIN";
  effectiveAdmin: boolean;
  adminAccessSource: "ROLE" | "ENV" | null;
  walletBalance: number;
  availableChapters: number;
  storiesCount: number;
  purchasesCount: number;
  activeSubscription: {
    id: string;
    name: string;
    endsAt: Date | null;
  } | null;
};

export type AdminUsersListView = {
  items: AdminUserListItem[];
  pagination: AdminPagination;
  query: string;
};

export type AdminWalletTransactionItem = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: Date;
};

export type AdminChapterLedgerItem = {
  id: string;
  source: string;
  eventType: string;
  quantity: number;
  createdAt: Date;
  description: string | null;
};

export type AdminPurchaseItem = {
  id: string;
  type: string;
  status: string;
  amount: number;
  description: string | null;
  productName: string | null;
  paymentStatus: string | null;
  createdAt: Date;
};

export type AdminSubscriptionItem = {
  id: string;
  status: string;
  productName: string | null;
  startsAt: Date;
  endsAt: Date | null;
  renewsAt: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
};

export type AdminStorySummaryItem = {
  id: string;
  title: string;
  universe: string;
  genre: string;
  currentChapterNumber: number;
  chapterCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminGenerationLogItem = {
  id: string;
  userId: string;
  userEmail: string | null;
  storyId: string;
  storyTitle: string;
  storyRunId: string | null;
  provider: string;
  model: string | null;
  eventType: string;
  status: string;
  errorMessage: string | null;
  promptVersion: string | null;
  createdAt: Date;
};

export type AdminUserDetailView = {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    role: "USER" | "ADMIN";
    effectiveAdmin: boolean;
    adminAccessSource: "ROLE" | "ENV" | null;
    emailVerified: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  wallet: {
    id: string | null;
    balance: number;
    currency: string;
  };
  chapterBalances: {
    total: number;
    welcome: number;
    subscriptionDaily: number;
    purchased: number;
    rewardedAd: number;
  };
  activeSubscription: {
    id: string;
    name: string;
    status: string;
    endsAt: Date | null;
  } | null;
  availableSubscriptionProducts: Array<{
    id: string;
    name: string;
    code: string;
    interval: string | null;
    dailyChapterLimit: number | null;
  }>;
  walletTransactions: AdminWalletTransactionItem[];
  chapterLedger: AdminChapterLedgerItem[];
  purchases: AdminPurchaseItem[];
  subscriptions: AdminSubscriptionItem[];
  stories: AdminStorySummaryItem[];
  generationLogs: AdminGenerationLogItem[];
  canManageRoles: boolean;
};

export type AdminPaymentItem = {
  id: string;
  purchaseId: string;
  userId: string;
  userEmail: string | null;
  amount: number;
  currency: string;
  provider: string;
  providerPaymentId: string | null;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
};

export type AdminPaymentsListView = {
  items: AdminPaymentItem[];
  pagination: AdminPagination;
};

export type AdminStoryListItem = {
  id: string;
  title: string;
  userId: string;
  userEmail: string | null;
  universe: string;
  genre: string;
  chapterCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminStoriesListView = {
  items: AdminStoryListItem[];
  pagination: AdminPagination;
  query: string;
};

export type AdminStoryDetailView = {
  story: {
    id: string;
    title: string;
    synopsis: string | null;
    status: string;
    userId: string;
    userEmail: string | null;
    universe: string;
    protagonist: string;
    theme: string;
    genre: string;
    tone: string;
    createdAt: Date;
    updatedAt: Date;
  };
  storyRun: {
    id: string;
    status: string;
    provider: string;
    promptVersion: string;
    currentChapterNumber: number;
    currentStateSummary: string;
    lastChoiceSummary: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  chapters: Array<{
    id: string;
    number: number;
    title: string;
    summary: string;
    createdAt: Date;
    choices: Array<{
      id: string;
      key: string;
      label: string;
      outcomeHint: string | null;
      position: number;
    }>;
  }>;
  decisions: Array<{
    id: string;
    chapterNumber: number;
    selectedLabel: string;
    resolutionSummary: string;
    createdAt: Date;
  }>;
  generationLogs: AdminGenerationLogItem[];
};

export type AdminGenerationLogsListView = {
  items: AdminGenerationLogItem[];
  pagination: AdminPagination;
  status: string;
  provider: string;
};

export type AdminAuditLogItem = {
  id: string;
  adminUserId: string;
  adminEmail: string | null;
  adminName: string | null;
  targetUserId: string | null;
  targetUserEmail: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  reason: string | null;
  createdAt: Date;
};

export type AdminAuditLogsListView = {
  items: AdminAuditLogItem[];
  pagination: AdminPagination;
};
