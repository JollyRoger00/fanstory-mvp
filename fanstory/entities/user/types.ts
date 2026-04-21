export type DashboardView = {
  userName: string | null;
  userEmail: string | null;
  storyCount: number;
  saveCount: number;
  availableChapters: number;
  purchasedChapterBalance: number;
  welcomeChapterBalance: number;
  subscriptionRemainingToday: number;
  activeSubscriptionName: string | null;
  dailyResetAt: Date;
  recentStories: {
    id: string;
    title: string;
    currentChapterNumber: number;
    updatedAt: Date;
  }[];
  recentSaves: {
    id: string;
    label: string;
    storyTitle: string;
    chapterNumber: number;
    createdAt: Date;
  }[];
};
