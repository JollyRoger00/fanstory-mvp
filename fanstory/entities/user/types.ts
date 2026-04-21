export type DashboardView = {
  userName: string | null;
  userEmail: string | null;
  storyCount: number;
  saveCount: number;
  balance: number;
  purchasedChapterCount: number;
  activeSubscriptionName: string | null;
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
